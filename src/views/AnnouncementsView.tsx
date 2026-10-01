import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { Announcement } from '../types';

export const AnnouncementsView: React.FC = () => {
  const { announcements, showToast } = useGym();
  const [announcementsList, setAnnouncementsList] = useState<Announcement[]>(announcements);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAudience, setFilterAudience] = useState<string>('all');

  // Composer Modal state
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Announcement['category']>('Urgent Alert');
  const [newContent, setNewContent] = useState('');
  const [newAudience, setNewAudience] = useState<Announcement['targetAudience']>('All Members');
  const [sendWhatsApp, setSendWhatsApp] = useState(true);

  const filteredAnnouncements = announcementsList.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAudience = filterAudience === 'all' || a.targetAudience === filterAudience;
    return matchesSearch && matchesAudience;
  });

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    const newAnnouncement: Announcement = {
      id: `ann-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      content: newContent,
      date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      targetAudience: newAudience,
      sentViaWhatsApp: sendWhatsApp,
      author: 'Front Desk Admin',
    };

    const updated = [newAnnouncement, ...announcementsList];
    setAnnouncementsList(updated);
    try {
      localStorage.setItem('gymos_announcements', JSON.stringify(updated));
    } catch {}

    showToast(
      'Announcement Broadcasted',
      `"${newTitle}" sent to ${newAudience}${sendWhatsApp ? ' via WhatsApp Business API & In-App' : ' in-app only'}.`,
      'success'
    );

    setIsComposerOpen(false);
    setNewTitle('');
    setNewContent('');
  };

  const handleLoadTemplate = (template: {
    title: string;
    category: Announcement['category'];
    content: string;
    targetAudience: Announcement['targetAudience'];
  }) => {
    setNewTitle(template.title);
    setNewCategory(template.category);
    setNewContent(template.content);
    setNewAudience(template.targetAudience);
    setIsComposerOpen(true);
  };

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e50914]/10 text-[#e50914] uppercase tracking-wider font-mono">
              CORE MODULE 11 • BROADCAST DESK
            </span>
            <span className="text-on-surface-variant">• WhatsApp &amp; In-App Notifications</span>
          </div>
          <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tight">
            Announcements &amp; Broadcasts
          </h1>
          <p className="text-xs text-on-surface-variant max-w-2xl mt-1">
            Keep members and trainers informed with instant WhatsApp alerts and in-app notifications for festival timings, bootcamp events, biometric turnstile updates, and membership notices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsComposerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e50914] hover:bg-[#b80710] text-white font-semibold text-xs transition-colors shadow-lg shadow-red-600/20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">campaign</span>
            <span>+ New WhatsApp Broadcast</span>
          </button>
        </div>
      </div>

      {/* Quick Indian Broadcast Templates Bar */}
      <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase text-on-surface-variant tracking-wider">
            Quick Broadcast Templates (Indian Gym Operations)
          </span>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">bolt</span>
            1-Click Populate
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() =>
              handleLoadTemplate({
                title: 'Independence Day Morning Mega Workout & Pull-Up Slam',
                category: 'Urgent Alert',
                content: 'Special celebration batch this Friday 07:00 AM! Pull-up challenge, desi akhada stamina complex, and complimentary whey smoothies for all attendees.',
                targetAudience: 'All Members',
              })
            }
            className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/20 text-left transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-bold text-amber-500 uppercase font-mono">Festival Special</div>
            <div className="font-headline font-bold text-xs text-on-surface group-hover:text-[#e50914] transition-colors mt-0.5">
              Independence Day Bootcamp
            </div>
            <div className="text-[10px] text-on-surface-variant mt-1 line-clamp-1">Special morning batch &amp; protein cafe prizes</div>
          </button>

          <button
            onClick={() =>
              handleLoadTemplate({
                title: 'Diwali & Festival Week Revised Floor Timings',
                category: 'Festival Timings',
                content: 'Gym will operate in single morning shift (06:00 AM to 12:00 PM) on Diwali day. Evening shift closed for celebrations. Regular dual shifts resume next morning.',
                targetAudience: 'All Members',
              })
            }
            className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/20 text-left transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-bold text-emerald-400 uppercase font-mono">Holiday Hours</div>
            <div className="font-headline font-bold text-xs text-on-surface group-hover:text-[#e50914] transition-colors mt-0.5">
              Festival Revised Timings
            </div>
            <div className="text-[10px] text-on-surface-variant mt-1 line-clamp-1">Morning shift only on holiday date</div>
          </button>

          <button
            onClick={() =>
              handleLoadTemplate({
                title: 'eSSL & Mantra Turnstile Gateway Firmware Sync',
                category: 'Maintenance',
                content: 'Tripod access gate relay sync scheduled tonight at 11:30 PM. Offline checks cached locally without front-desk delays.',
                targetAudience: 'Trainers',
              })
            }
            className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/20 text-left transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-bold text-blue-400 uppercase font-mono">Hardware Alert</div>
            <div className="font-headline font-bold text-xs text-on-surface group-hover:text-[#e50914] transition-colors mt-0.5">
              Biometric Turnstile Sync
            </div>
            <div className="text-[10px] text-on-surface-variant mt-1 line-clamp-1">Nightly firmware sync advisory</div>
          </button>

          <button
            onClick={() =>
              handleLoadTemplate({
                title: 'Authentic Whey Isolate & Pre-Workout Fresh Stock',
                category: 'Promotion',
                content: 'Fresh batch of lab-certified whey isolate, unflavored creatine, and BCAA energy tubs arrived at front desk counter. 10% instant discount for annual members.',
                targetAudience: 'All Members',
              })
            }
            className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/20 text-left transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-bold text-purple-400 uppercase font-mono">Store Offer</div>
            <div className="font-headline font-bold text-xs text-on-surface group-hover:text-[#e50914] transition-colors mt-0.5">
              Whey Cafe Stock Arrival
            </div>
            <div className="text-[10px] text-on-surface-variant mt-1 line-clamp-1">10% off for active gym members</div>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-container p-3 rounded-2xl border border-outline-variant/30">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
          <span className="material-symbols-outlined text-on-surface-variant text-[18px] ml-1">search</span>
          <input
            type="text"
            placeholder="Search broadcasts by title, content, or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-on-surface focus:outline-hidden placeholder:text-on-surface-variant/60"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterAudience}
            onChange={(e) => setFilterAudience(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-surface-container-high border border-outline-variant/30 text-xs text-on-surface font-medium cursor-pointer"
          >
            <option value="all">All Audiences</option>
            <option value="All Members">All Members</option>
            <option value="Trainers">Trainers &amp; Staff</option>
            <option value="VIP Members">VIP Members</option>
            <option value="Morning Batch">Morning Batch</option>
          </select>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-3 transition-all hover:border-outline-variant/60 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2.5">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                    item.category === 'Urgent Alert'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : item.category === 'Festival Timings'
                      ? 'bg-amber-500/20 text-amber-400'
                      : item.category === 'Class Update'
                      ? 'bg-blue-500/20 text-blue-400'
                      : item.category === 'Promotion'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {item.category}
                </span>

                <span className="text-[11px] text-on-surface-variant font-mono">
                  Target: <strong className="text-on-surface">{item.targetAudience}</strong>
                </span>

                {item.sentViaWhatsApp && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-mono">
                    <span className="material-symbols-outlined text-[13px]">chat</span>
                    WhatsApp Delivered
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-on-surface-variant font-mono">
                <span>By {item.author}</span>
                <span>•</span>
                <span>{item.date}</span>
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-headline font-bold text-on-surface">
              {item.title}
            </h3>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              {item.content}
            </p>

            <div className="pt-2 flex items-center justify-between text-xs border-t border-outline-variant/15">
              <div className="flex items-center gap-2 text-[11px] text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
                <span>Delivered to 384 active recipient devices</span>
              </div>

              <button
                onClick={() => {
                  showToast('Broadcast Resent', `Nudge alert resent to ${item.targetAudience} via WhatsApp.`, 'success');
                }}
                className="px-3 py-1 rounded-lg bg-surface-container-high hover:bg-emerald-600 hover:text-white text-on-surface text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span>
                <span>Resend Nudge</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Composer Modal */}
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-surface-container-high border border-outline-variant/40 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#e50914] font-bold uppercase">
                  WHATSAPP BROADCAST COMPOSER
                </span>
                <h3 className="font-headline font-bold text-lg text-on-surface">
                  Publish Announcement
                </h3>
              </div>
              <button
                onClick={() => setIsComposerOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-on-surface-variant uppercase font-mono mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface"
                  >
                    <option value="Urgent Alert">Urgent Alert</option>
                    <option value="Festival Timings">Festival Timings</option>
                    <option value="Class Update">Class Update</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Promotion">Promotion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-on-surface-variant uppercase font-mono mb-1">
                    Target Recipient Audience
                  </label>
                  <select
                    value={newAudience}
                    onChange={(e) => setNewAudience(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface"
                  >
                    <option value="All Members">All Members (384)</option>
                    <option value="Trainers">Trainers &amp; Coaches (12)</option>
                    <option value="VIP Members">VIP Annual Members (86)</option>
                    <option value="Morning Batch">Morning Batch 06-09 AM (140)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant uppercase font-mono mb-1">
                  Broadcast Headline
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Independence Day Special Workout &amp; Festival Schedule"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant uppercase font-mono mb-1">
                  Message Body
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type announcement message here... WhatsApp emojis and timings supported."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface"
                />
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-emerald-400 text-[18px]">chat</span>
                    <span>Send via WhatsApp Business API</span>
                  </div>
                  <div className="text-[10px] text-on-surface-variant">
                    Instant push to verified member mobile numbers
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={sendWhatsApp}
                  onChange={(e) => setSendWhatsApp(e.target.checked)}
                  className="w-4 h-4 accent-[#e50914] cursor-pointer"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsComposerOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-surface-container text-on-surface font-semibold hover:bg-surface-container-high transition-colors text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#e50914] text-white font-bold text-xs hover:bg-[#b80710] shadow-md shadow-red-600/20"
                >
                  Send Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
