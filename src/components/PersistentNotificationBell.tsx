import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useGym } from '../context/GymContext';
import { ScreenId } from '../types';

export interface HeaderAlertItem {
  id: string;
  type: 'expiring_membership' | 'pending_complaint' | 'upcoming_class';
  title: string;
  description: string;
  metaBadge: string;
  timestamp: string;
  isUrgent: boolean;
  actionLabel: string;
  targetScreen: ScreenId;
  icon: string;
  iconColor: string;
  iconBg: string;
  itemPayload?: any;
}

export const PersistentNotificationBell: React.FC = () => {
  const {
    members,
    complaints,
    classes,
    setActiveScreen,
    openModal,
    showToast,
    theme,
  } = useGym();

  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'expiring' | 'complaints' | 'classes'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Persistent read and dismissed alert IDs in localStorage
  const [readAlertIds, setReadAlertIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gymos_read_alerts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gymos_dismissed_alerts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save read alerts to localStorage
  const markAsRead = (id: string) => {
    setReadAlertIds((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      try {
        localStorage.setItem('gymos_read_alerts', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const markAllAsRead = () => {
    const allIds = allAlerts.map((a) => a.id);
    setReadAlertIds(allIds);
    try {
      localStorage.setItem('gymos_read_alerts', JSON.stringify(allIds));
    } catch {}
    showToast('Alerts Cleared', 'All current operations alerts marked as read.', 'info');
  };

  const dismissAlert = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedAlertIds((prev) => {
      const updated = [...prev, id];
      try {
        localStorage.setItem('gymos_dismissed_alerts', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Close dropdown on outside click or escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // 1. Expiring Memberships Real-time Alerts
  const expiringAlerts = useMemo<HeaderAlertItem[]>(() => {
    const now = Date.now();
    const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
    const items: HeaderAlertItem[] = [];

    members.forEach((m) => {
      if (m.status === 'expired') {
        items.push({
          id: `alert-exp-${m.id}`,
          type: 'expiring_membership',
          title: `${m.name} - Plan Expired`,
          description: `${m.plan} expired • Phone: ${m.phone}`,
          metaBadge: 'Expired',
          timestamp: 'Immediate renewal due',
          isUrgent: true,
          actionLabel: 'Renew Plan',
          targetScreen: 'memberships',
          icon: 'credit_card_off',
          iconColor: 'text-error',
          iconBg: 'bg-error/15',
          itemPayload: m,
        });
      } else if (m.expiryDate) {
        try {
          const diff = new Date(m.expiryDate).getTime() - now;
          if (diff > 0 && diff <= fourteenDaysMs) {
            const daysLeft = Math.ceil(diff / (24 * 60 * 60 * 1000));
            items.push({
              id: `alert-exp-${m.id}`,
              type: 'expiring_membership',
              title: `${m.name} - Expires in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}`,
              description: `${m.plan} • Renews ${new Date(m.expiryDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`,
              metaBadge: `${daysLeft}d left`,
              timestamp: `${daysLeft} days remaining`,
              isUrgent: daysLeft <= 3,
              actionLabel: 'WhatsApp Nudge',
              targetScreen: 'memberships',
              icon: 'hourglass_top',
              iconColor: daysLeft <= 3 ? 'text-amber-500' : 'text-primary',
              iconBg: daysLeft <= 3 ? 'bg-amber-500/15' : 'bg-primary/15',
              itemPayload: m,
            });
          }
        } catch {}
      }
    });

    // Sort by urgent first
    return items.sort((a, b) => (b.isUrgent ? 1 : 0) - (a.isUrgent ? 1 : 0));
  }, [members]);

  // 2. Pending Complaints Real-time Alerts
  const complaintAlerts = useMemo<HeaderAlertItem[]>(() => {
    return complaints
      .filter((c) => c.status === 'Open' || c.status === 'In Progress')
      .map((c) => {
        const isUrgent = c.priority === 'Urgent' || c.priority === 'High';
        return {
          id: `alert-cmp-${c.id}`,
          type: 'pending_complaint',
          title: `Ticket #${c.ticketNumber}: ${c.category}`,
          description: `${c.subject} (${c.memberName})`,
          metaBadge: `${c.priority} • ${c.status}`,
          timestamp: c.createdAt,
          isUrgent,
          actionLabel: 'Resolve Ticket',
          targetScreen: 'complaints',
          icon: 'report_problem',
          iconColor: isUrgent ? 'text-[#e50914]' : 'text-blue-400',
          iconBg: isUrgent ? 'bg-[#e50914]/15' : 'bg-blue-500/15',
          itemPayload: c,
        };
      });
  }, [complaints]);

  // 3. Upcoming Class Schedules Real-time Alerts
  const classAlerts = useMemo<HeaderAlertItem[]>(() => {
    return classes
      .filter((cls) => cls.status === 'live' || cls.status === 'upcoming')
      .map((cls) => {
        const isFull = cls.enrolled >= cls.capacity;
        const isLive = cls.status === 'live';
        return {
          id: `alert-cls-${cls.id}`,
          type: 'upcoming_class',
          title: `${cls.title} (${cls.timeFormatted})`,
          description: `${cls.studio} • Coach ${cls.trainerName} • ${cls.enrolled}/${cls.capacity} Booked${cls.waitlist > 0 ? ` (${cls.waitlist} on waitlist)` : ''}`,
          metaBadge: isLive ? 'NOW LIVE' : `${cls.enrolled}/${cls.capacity}`,
          timestamp: isLive ? 'In Session' : `Starts at ${cls.timeFormatted}`,
          isUrgent: isLive || isFull,
          actionLabel: 'View Schedule',
          targetScreen: 'classes-pt',
          icon: isLive ? 'fitness_center' : 'calendar_month',
          iconColor: isLive ? 'text-emerald-400' : 'text-purple-400',
          iconBg: isLive ? 'bg-emerald-500/15' : 'bg-purple-500/15',
          itemPayload: cls,
        };
      });
  }, [classes]);

  // Combined Active Alerts (excluding dismissed)
  const allAlerts = useMemo(() => {
    const combined = [...expiringAlerts, ...complaintAlerts, ...classAlerts];
    return combined.filter((a) => !dismissedAlertIds.includes(a.id));
  }, [expiringAlerts, complaintAlerts, classAlerts, dismissedAlertIds]);

  // Filtered by active tab
  const filteredAlerts = useMemo(() => {
    if (activeFilter === 'expiring') {
      return allAlerts.filter((a) => a.type === 'expiring_membership');
    }
    if (activeFilter === 'complaints') {
      return allAlerts.filter((a) => a.type === 'pending_complaint');
    }
    if (activeFilter === 'classes') {
      return allAlerts.filter((a) => a.type === 'upcoming_class');
    }
    return allAlerts;
  }, [allAlerts, activeFilter]);

  // Unread Count
  const unreadCount = useMemo(() => {
    return allAlerts.filter((a) => !readAlertIds.includes(a.id)).length;
  }, [allAlerts, readAlertIds]);

  const hasUrgentAlerts = useMemo(() => {
    return allAlerts.some((a) => a.isUrgent && !readAlertIds.includes(a.id));
  }, [allAlerts, readAlertIds]);

  const handleAlertClick = (alert: HeaderAlertItem) => {
    markAsRead(alert.id);
    setActiveScreen(alert.targetScreen);
    setIsOpen(false);

    if (alert.type === 'expiring_membership') {
      showToast('Membership Selected', `Viewing renewal follow-up for ${alert.itemPayload?.name || 'member'}.`, 'info');
    } else if (alert.type === 'pending_complaint') {
      showToast('Service Desk Ticket', `Opening ticket #${alert.itemPayload?.ticketNumber || 'details'}.`, 'info');
    } else {
      showToast('Class Calendar', `Opening schedule for ${alert.itemPayload?.title || 'session'}.`, 'info');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Persistent Notification Bell Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2.5 rounded-xl border transition-all cursor-pointer relative flex items-center justify-center ${
          isOpen
            ? 'bg-[#e50914] text-white border-[#e50914] shadow-md shadow-red-600/30'
            : unreadCount > 0
            ? 'bg-surface-container hover:bg-surface-container-high text-on-surface border-outline-variant/40 hover:border-[#e50914]/50'
            : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant border-outline-variant/30'
        }`}
        title={`Operations Alerts (${unreadCount} unread: Expiring memberships, Complaints, Classes)`}
        aria-label="Operations Alerts"
      >
        <span className={`material-symbols-outlined text-[20px] transition-transform ${hasUrgentAlerts ? 'text-[#e50914]' : ''}`}>
          notifications
        </span>

        {/* Dynamic Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e50914] px-1 text-[10px] font-mono font-bold text-white shadow-md shadow-red-600/40">
            {hasUrgentAlerts && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e50914] opacity-75"></span>
            )}
            <span className="relative z-10">{unreadCount > 99 ? '99+' : unreadCount}</span>
          </span>
        )}
      </button>

      {/* Popover Alert Drawer */}
      {isOpen && (
        <div className={`absolute right-0 top-13 w-[360px] sm:w-[440px] rounded-2xl border shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[560px] ${
          theme === 'dark'
            ? 'bg-[#141419] border-white/15 text-neutral-200'
            : 'bg-white border-slate-300 text-slate-800'
        }`}>
          {/* Header */}
          <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#e50914]/20 text-[#e50914] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[18px]">notifications_active</span>
              </div>
              <div>
                <h3 className={`font-headline font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  Operations Alerts
                </h3>
                <div className="text-[10px] font-mono text-on-surface-variant flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Live Telemetry • {unreadCount} Unread</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] font-semibold text-[#e50914] hover:underline cursor-pointer px-2 py-0.5 rounded-md hover:bg-[#e50914]/10 transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="px-3 pt-3 pb-2 flex items-center gap-1.5 border-b border-outline-variant/15 overflow-x-auto scrollbar-none text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-lg font-semibold text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-[#e50914] text-white shadow-xs'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              All ({allAlerts.length})
            </button>

            <button
              onClick={() => setActiveFilter('expiring')}
              className={`px-3 py-1 rounded-lg font-semibold text-[11px] whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
                activeFilter === 'expiring'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">credit_card</span>
              <span>Expiring ({expiringAlerts.filter((a) => !dismissedAlertIds.includes(a.id)).length})</span>
            </button>

            <button
              onClick={() => setActiveFilter('complaints')}
              className={`px-3 py-1 rounded-lg font-semibold text-[11px] whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
                activeFilter === 'complaints'
                  ? 'bg-[#e50914] text-white shadow-xs'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">report_problem</span>
              <span>Complaints ({complaintAlerts.filter((a) => !dismissedAlertIds.includes(a.id)).length})</span>
            </button>

            <button
              onClick={() => setActiveFilter('classes')}
              className={`px-3 py-1 rounded-lg font-semibold text-[11px] whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
                activeFilter === 'classes'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">calendar_month</span>
              <span>Classes ({classAlerts.filter((a) => !dismissedAlertIds.includes(a.id)).length})</span>
            </button>
          </div>

          {/* Alerts Scrollable List */}
          <div className="overflow-y-auto p-3 space-y-2.5 max-h-[380px] scrollbar-thin">
            {filteredAlerts.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">verified</span>
                </div>
                <div className="text-xs font-bold text-on-surface">No Pending Alerts</div>
                <p className="text-[11px] text-on-surface-variant max-w-xs mx-auto">
                  All memberships, maintenance tickets, and upcoming schedules in this category are up to date.
                </p>
              </div>
            ) : (
              filteredAlerts.map((alert) => {
                const isRead = readAlertIds.includes(alert.id);
                return (
                  <div
                    key={alert.id}
                    onClick={() => handleAlertClick(alert)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                      !isRead
                        ? theme === 'dark'
                          ? 'bg-[#1c1c24] border-white/20 hover:border-[#e50914]/60'
                          : 'bg-red-50/50 border-red-200 hover:border-red-400'
                        : theme === 'dark'
                        ? 'bg-surface-container border-outline-variant/20 hover:border-outline-variant/40 opacity-80'
                        : 'bg-white border-slate-200 hover:border-slate-300 opacity-85'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Category Icon */}
                      <div className={`w-8 h-8 rounded-xl ${alert.iconBg} ${alert.iconColor} flex items-center justify-center shrink-0 mt-0.5`}>
                        <span className="material-symbols-outlined text-[18px]">
                          {alert.icon}
                        </span>
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                            alert.isUrgent
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-surface-container-high text-on-surface-variant'
                          }`}>
                            {alert.metaBadge}
                          </span>
                          <span className="text-[10px] text-on-surface-variant font-mono">
                            • {alert.timestamp}
                          </span>
                          {!isRead && (
                            <span className="w-2 h-2 rounded-full bg-[#e50914] ml-auto shrink-0"></span>
                          )}
                        </div>

                        <h4 className={`text-xs font-bold leading-snug truncate ${
                          !isRead
                            ? theme === 'dark' ? 'text-white' : 'text-slate-900'
                            : 'text-on-surface'
                        }`}>
                          {alert.title}
                        </h4>

                        <p className="text-[11px] text-on-surface-variant line-clamp-2 mt-0.5 leading-relaxed">
                          {alert.description}
                        </p>

                        {/* Action CTA Pill */}
                        <div className="mt-2.5 pt-2 border-t border-outline-variant/15 flex items-center justify-between text-[11px]">
                          <span className="text-[10px] font-mono text-on-surface-variant uppercase">
                            {alert.type === 'expiring_membership'
                              ? 'Membership Retention'
                              : alert.type === 'pending_complaint'
                              ? 'Service Desk'
                              : 'Group Fitness'}
                          </span>
                          <span className="text-[#e50914] font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            <span>{alert.actionLabel}</span>
                            <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                          </span>
                        </div>
                      </div>

                      {/* Dismiss Cross */}
                      <button
                        onClick={(e) => dismissAlert(alert.id, e)}
                        title="Dismiss alert"
                        className="absolute top-2.5 right-2.5 p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Shortcuts Footer */}
          <div className="p-3 border-t border-outline-variant/20 bg-surface-container-low rounded-b-2xl flex items-center justify-between text-xs">
            <span className="text-[10px] font-mono text-on-surface-variant uppercase">
              Quick Portals
            </span>
            <div className="flex items-center gap-1.5 font-semibold text-[11px]">
              <button
                onClick={() => {
                  setActiveScreen('memberships');
                  setIsOpen(false);
                }}
                className="px-2 py-1 rounded-lg hover:bg-surface-container text-on-surface transition-colors cursor-pointer"
              >
                Memberships
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  setActiveScreen('complaints');
                  setIsOpen(false);
                }}
                className="px-2 py-1 rounded-lg hover:bg-surface-container text-[#e50914] transition-colors cursor-pointer"
              >
                Complaints
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  setActiveScreen('classes-pt');
                  setIsOpen(false);
                }}
                className="px-2 py-1 rounded-lg hover:bg-surface-container text-purple-400 transition-colors cursor-pointer"
              >
                Classes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
