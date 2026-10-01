import React, { useState } from 'react';
import { Member, GymifyReferral, GymifyPointsHistory } from '../types';
import { useGym } from '../context/GymContext';

interface GymifyPointsWidgetProps {
  member: Member;
}

export const GymifyPointsWidget: React.FC<GymifyPointsWidgetProps> = ({ member }) => {
  const { awardGymifyPoints, addMemberReferral, redeemGymifyReward, showToast } = useGym();

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'referrals' | 'history'>('overview');
  const [showReferralModal, setShowReferralModal] = useState<boolean>(false);
  const [showRedeemModal, setShowRedeemModal] = useState<boolean>(false);

  // Referral form state
  const [refName, setRefName] = useState<string>('');
  const [refPhone, setRefPhone] = useState<string>('');
  const [refNotes, setRefNotes] = useState<string>('');

  const currentPoints = member.gymifyPoints ?? 140;
  const currentTier = member.gymifyTier || 'Bronze';
  const referralsList: GymifyReferral[] = member.referralsList || [];
  const pointsHistory: GymifyPointsHistory[] = member.pointsHistory || [];

  // Determine next milestone
  const milestones = [
    { target: 250, label: 'Free Protein Smoothie', tier: 'Silver' },
    { target: 500, label: 'Free 1-on-1 PT Session', tier: 'Silver' },
    { target: 750, label: 'Gold Club Tier Status', tier: 'Gold' },
    { target: 1000, label: '15% Membership Renewal Discount', tier: 'Gold' },
    { target: 1500, label: 'Platinum Lounge Access', tier: 'Platinum' },
    { target: 3000, label: 'VIP Diamond Lifetime Access', tier: 'Diamond' },
  ];

  const nextMilestone = milestones.find(m => m.target > currentPoints) || milestones[milestones.length - 1];
  const prevMilestoneTarget = milestones.filter(m => m.target <= currentPoints).pop()?.target || 0;
  const pointsNeeded = Math.max(0, nextMilestone.target - currentPoints);

  const progressPercent = Math.min(
    100,
    Math.max(8, Math.round(((currentPoints - prevMilestoneTarget) / (nextMilestone.target - prevMilestoneTarget)) * 100))
  );

  // Tier Colors & Icons
  const tierConfig: Record<string, { bg: string; text: string; border: string; icon: string }> = {
    Bronze: { bg: 'bg-amber-950/20 text-amber-500', text: 'text-amber-500', border: 'border-amber-600/30', icon: 'military_tech' },
    Silver: { bg: 'bg-slate-300/15 text-slate-300', text: 'text-slate-300', border: 'border-slate-400/30', icon: 'workspace_premium' },
    Gold: { bg: 'bg-amber-400/20 text-amber-400', text: 'text-amber-400', border: 'border-amber-500/40', icon: 'stars' },
    Platinum: { bg: 'bg-cyan-400/20 text-cyan-400', text: 'text-cyan-400', border: 'border-cyan-500/40', icon: 'diamond' },
    Diamond: { bg: 'bg-purple-400/20 text-purple-400', text: 'text-purple-400', border: 'border-purple-500/40', icon: 'auto_awesome' },
  };

  const currentTierStyle = tierConfig[currentTier] || tierConfig.Bronze;

  // Calculate Breakdown: Attendance vs Referrals vs Streaks
  const attendanceVisits = member.totalCheckIns || 0;
  const referralCount = referralsList.length || member.referralsCount || 0;

  const historyAttendancePoints = pointsHistory
    .filter(p => p.type === 'attendance')
    .reduce((sum, p) => sum + p.points, 0);

  const historyReferralPoints = pointsHistory
    .filter(p => p.type === 'referral')
    .reduce((sum, p) => sum + p.points, 0);

  const attendancePoints = historyAttendancePoints > 0
    ? historyAttendancePoints
    : Math.max(0, Math.min(currentPoints, attendanceVisits * 20));

  const referralPoints = historyReferralPoints > 0
    ? historyReferralPoints
    : Math.max(0, Math.min(currentPoints - attendancePoints, referralCount * 250));

  const streakBonusPoints = Math.max(0, currentPoints - attendancePoints - referralPoints);

  const totalCalculated = Math.max(1, attendancePoints + referralPoints + streakBonusPoints);
  const attendancePercent = Math.round((attendancePoints / totalCalculated) * 100);
  const referralPercent = Math.round((referralPoints / totalCalculated) * 100);
  const streakPercent = Math.max(0, 100 - attendancePercent - referralPercent);

  const handleCreateReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refName.trim() || !refPhone.trim()) {
      showToast('Missing Details', 'Please enter referred friend\'s name and phone number.', 'error');
      return;
    }

    addMemberReferral(member.id, {
      name: refName.trim(),
      phone: refPhone.trim(),
      notes: refNotes.trim()
    });

    setRefName('');
    setRefPhone('');
    setRefNotes('');
    setShowReferralModal(false);
  };

  const handleClaimReward = (rewardTitle: string, cost: number) => {
    const success = redeemGymifyReward(member.id, rewardTitle, cost);
    if (success) {
      setShowRedeemModal(false);
    }
  };

  return (
    <div className="bg-surface-container rounded-2xl p-4 border border-outline-variant/30 space-y-4 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header & Tier Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[18px]">loyalty</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-headline font-bold text-on-surface">Gymify Points &amp; Rewards</span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${currentTierStyle.bg} ${currentTierStyle.border}`}>
                {currentTier.toUpperCase()} TIER
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant">Earn points via daily biometric attendance and member referrals</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-headline font-extrabold text-amber-400 font-mono tracking-tight flex items-baseline justify-end gap-1">
            <span>{currentPoints.toLocaleString('en-IN')}</span>
            <span className="text-xs font-semibold text-on-surface-variant font-sans">PTS</span>
          </div>
        </div>
      </div>

      {/* Milestone Progress Bar Widget */}
      <div className="space-y-1.5 bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-on-surface flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-amber-400">flag</span>
            <span>Next Reward: {nextMilestone.label}</span>
          </span>
          <span className="font-mono text-primary font-bold text-[11px]">
            {pointsNeeded > 0 ? `${pointsNeeded} pts to unlock` : 'Unlocked!'}
          </span>
        </div>

        {/* Progress Track */}
        <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-on-surface-variant font-mono">
          <span>{currentPoints} / {nextMilestone.target} PTS</span>
          <span>{progressPercent}% Complete</span>
        </div>
      </div>

      {/* Visual Points Source Breakdown: Attendance vs Referrals */}
      <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-on-surface flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-primary">pie_chart</span>
            <span>Points Origin Breakdown</span>
          </span>
          <span className="text-[10px] font-mono text-on-surface-variant">Attendance vs Referrals</span>
        </div>

        {/* Multi-Segment Stacked Progress Bar */}
        <div className="space-y-1">
          <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden flex shadow-inner">
            <div
              className="bg-emerald-500 hover:bg-emerald-400 transition-all duration-500"
              style={{ width: `${attendancePercent}%` }}
              title={`Attendance: ${attendancePoints} PTS (${attendancePercent}%)`}
            ></div>
            <div
              className="bg-amber-500 hover:bg-amber-400 transition-all duration-500"
              style={{ width: `${referralPercent}%` }}
              title={`Referrals: ${referralPoints} PTS (${referralPercent}%)`}
            ></div>
            {streakBonusPoints > 0 && (
              <div
                className="bg-cyan-400 hover:bg-cyan-300 transition-all duration-500"
                style={{ width: `${streakPercent}%` }}
                title={`Streaks: ${streakBonusPoints} PTS (${streakPercent}%)`}
              ></div>
            )}
          </div>

          {/* Segment Legend */}
          <div className="flex items-center justify-between text-[10px] font-mono text-on-surface-variant pt-0.5">
            <div className="flex items-center gap-1.5 text-emerald-500 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Attendance: {attendancePoints} pts ({attendancePercent}%)</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-500 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Referrals: {referralPoints} pts ({referralPercent}%)</span>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Metric Cards */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          {/* Attendance Points Card */}
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">event_available</span>
                <span>Attendance</span>
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                {attendancePercent}%
              </span>
            </div>
            <div className="font-mono font-extrabold text-base text-emerald-400">
              +{attendancePoints} <span className="text-[10px] font-sans font-semibold">PTS</span>
            </div>
            <div className="text-[10px] text-on-surface-variant">
              {attendanceVisits} biometric check-ins (+20 pts each)
            </div>
          </div>

          {/* Referrals Points Card */}
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">group_add</span>
                <span>Referrals</span>
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold">
                {referralPercent}%
              </span>
            </div>
            <div className="font-mono font-extrabold text-base text-amber-400">
              +{referralPoints} <span className="text-[10px] font-sans font-semibold">PTS</span>
            </div>
            <div className="text-[10px] text-on-surface-variant">
              {referralCount} friends joined (+250 pts each)
            </div>
          </div>
        </div>
      </div>

      {/* Earn Rates Matrix Pills */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2 bg-surface-container-low rounded-xl border border-outline-variant/20">
          <div className="font-mono font-bold text-emerald-500 text-sm">+20 PTS</div>
          <div className="text-[10px] text-on-surface-variant mt-0.5">Per Check-in</div>
        </div>
        <div className="p-2 bg-surface-container-low rounded-xl border border-outline-variant/20">
          <div className="font-mono font-bold text-amber-500 text-sm">+250 PTS</div>
          <div className="text-[10px] text-on-surface-variant mt-0.5">Per Referral</div>
        </div>
        <div className="p-2 bg-surface-container-low rounded-xl border border-outline-variant/20">
          <div className="font-mono font-bold text-cyan-400 text-sm">+50 PTS</div>
          <div className="text-[10px] text-on-surface-variant mt-0.5">7-Day Streak</div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowReferralModal(true)}
          className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-amber-500/20 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">person_add</span>
          <span>Log Referral (+250 Pts)</span>
        </button>

        <button
          type="button"
          onClick={() => setShowRedeemModal(true)}
          className="py-2 px-3 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-semibold text-xs transition-all border border-outline-variant/30 flex items-center gap-1.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px] text-amber-400">redeem</span>
          <span>Redeem Perks</span>
        </button>

        <button
          type="button"
          onClick={() => awardGymifyPoints(member.id, 20, 'Manual Attendance Check-in Bonus', 'attendance')}
          className="p-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-primary border border-outline-variant/30 transition-all cursor-pointer"
          title="Award Attendance (+20 Pts)"
        >
          <span className="material-symbols-outlined text-[16px]">add_task</span>
        </button>
      </div>

      {/* Sub Tabs: Referrals List vs Points History */}
      <div className="border-t border-outline-variant/20 pt-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setActiveSubTab('overview')}
              className={`font-semibold pb-1 border-b-2 transition-all cursor-pointer ${
                activeSubTab === 'overview'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Summary
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('referrals')}
              className={`font-semibold pb-1 border-b-2 transition-all cursor-pointer ${
                activeSubTab === 'referrals'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Referrals ({referralsList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('history')}
              className={`font-semibold pb-1 border-b-2 transition-all cursor-pointer ${
                activeSubTab === 'history'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Points Ledger ({pointsHistory.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Overview Summary */}
        {activeSubTab === 'overview' && (
          <div className="text-xs space-y-1.5 text-on-surface-variant bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/15">
            <div className="flex justify-between">
              <span>Total Member Referrals:</span>
              <span className="font-semibold text-on-surface font-mono">{referralsList.length} Friends Joined</span>
            </div>
            <div className="flex justify-between">
              <span>Total Points from Referrals:</span>
              <span className="font-semibold text-amber-500 font-mono">+{referralsList.length * 250} PTS</span>
            </div>
            <div className="flex justify-between">
              <span>Total Facility Check-ins:</span>
              <span className="font-semibold text-on-surface font-mono">{member.totalCheckIns} Visits (+{member.totalCheckIns * 20} PTS)</span>
            </div>
          </div>
        )}

        {/* Tab 2: Referrals Roster */}
        {activeSubTab === 'referrals' && (
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {referralsList.length === 0 ? (
              <div className="text-center p-3 text-xs text-on-surface-variant/70 italic bg-surface-container-low rounded-xl">
                No referrals logged yet. Click "Log Referral" to invite friends and earn +250 PTS each!
              </div>
            ) : (
              referralsList.map((ref) => (
                <div
                  key={ref.id}
                  className="bg-surface-container-low p-2 rounded-xl border border-outline-variant/20 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-on-surface">{ref.referredName}</div>
                    <div className="text-[10px] text-on-surface-variant font-mono">{ref.referredPhone} • {ref.date}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                      +{ref.pointsAwarded} PTS
                    </span>
                    <div className="text-[9px] text-emerald-500 font-medium mt-0.5">{ref.status}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Points Ledger History */}
        {activeSubTab === 'history' && (
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {pointsHistory.length === 0 ? (
              <div className="text-center p-3 text-xs text-on-surface-variant/70 italic bg-surface-container-low rounded-xl">
                No points history recorded yet.
              </div>
            ) : (
              pointsHistory.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface-container-low p-2 rounded-xl border border-outline-variant/20 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-[16px] ${
                      item.points > 0 ? 'text-emerald-500' : 'text-amber-500'
                    }`}>
                      {item.type === 'referral' ? 'group_add' : item.type === 'streak_bonus' ? 'local_fire_department' : item.type === 'redemption' ? 'redeem' : 'check_circle'}
                    </span>
                    <div>
                      <div className="text-on-surface font-medium">{item.description}</div>
                      <div className="text-[10px] text-on-surface-variant font-mono">{item.timestamp}</div>
                    </div>
                  </div>
                  <div className={`font-mono font-bold text-xs ${item.points > 0 ? 'text-emerald-500' : 'text-amber-400'}`}>
                    {item.points > 0 ? `+${item.points}` : item.points} PTS
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal: Log New Referral */}
      {showReferralModal && (
        <div className="fixed inset-0 bg-surface-dim/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-surface-container-high border border-outline-variant/40 rounded-2xl w-full max-w-sm p-5 shadow-2xl relative">
            <button
              onClick={() => setShowReferralModal(false)}
              className="absolute top-3 right-3 text-on-surface-variant hover:text-on-surface p-1 rounded cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[18px]">person_add</span>
              </div>
              <div>
                <h4 className="font-headline font-bold text-sm text-on-surface">Log Friend Referral</h4>
                <p className="text-[11px] text-on-surface-variant">Awards +250 Gymify Points to {member.name}</p>
              </div>
            </div>

            <form onSubmit={handleCreateReferral} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-on-surface mb-1">
                  Friend Full Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={refName}
                  onChange={(e) => setRefName(e.target.value)}
                  placeholder="e.g. Yashvardhan Singhania"
                  className="w-full bg-surface-container text-on-surface px-3 py-2 rounded-xl border border-outline-variant/40 focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">
                  WhatsApp Mobile Number <span className="text-error">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={refPhone}
                  onChange={(e) => setRefPhone(e.target.value)}
                  placeholder="+91 98201 55432"
                  className="w-full bg-surface-container text-on-surface px-3 py-2 rounded-xl border border-outline-variant/40 focus:border-primary outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">
                  Notes / Fitness Goal (Optional)
                </label>
                <input
                  type="text"
                  value={refNotes}
                  onChange={(e) => setRefNotes(e.target.value)}
                  placeholder="e.g. Interested in morning strength classes"
                  className="w-full bg-surface-container text-on-surface px-3 py-2 rounded-xl border border-outline-variant/40 focus:border-primary outline-none"
                />
              </div>

              <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-[11px] text-amber-500 flex items-center gap-1.5 font-medium">
                <span className="material-symbols-outlined text-[16px]">stars</span>
                <span>Immediate Reward: +250 Points deposited upon logging!</span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReferralModal(false)}
                  className="px-3 py-1.5 rounded-xl text-on-surface-variant hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold shadow-md shadow-amber-500/20"
                >
                  Confirm &amp; Award +250 Pts
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Redeem Rewards */}
      {showRedeemModal && (
        <div className="fixed inset-0 bg-surface-dim/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-surface-container-high border border-outline-variant/40 rounded-2xl w-full max-w-sm p-5 shadow-2xl relative">
            <button
              onClick={() => setShowRedeemModal(false)}
              className="absolute top-3 right-3 text-on-surface-variant hover:text-on-surface p-1 rounded cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[18px]">redeem</span>
              </div>
              <div>
                <h4 className="font-headline font-bold text-sm text-on-surface">Redeem Perks &amp; Rewards</h4>
                <p className="text-[11px] text-on-surface-variant">Available balance: {currentPoints} PTS</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { title: 'Free Whey Protein Shake / Smoothie', cost: 250, icon: 'blender', desc: 'Barista juice bar coupon' },
                { title: '1-on-1 PT Coaching Session', cost: 500, icon: 'fitness_center', desc: '60 min private training with Senior Coach' },
                { title: '15% Membership Renewal Discount', cost: 1000, icon: 'percent', desc: 'Applied directly to next billing invoice' },
                { title: 'VIP Gymify Pro Duffle Bag & Shaker', cost: 2500, icon: 'shopping_bag', desc: 'Exclusive club branded merchandise' },
              ].map((perk, i) => {
                const canAfford = currentPoints >= perk.cost;

                return (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all ${
                      canAfford
                        ? 'bg-surface-container hover:border-amber-500/50 border-outline-variant/20'
                        : 'bg-surface-container/40 opacity-50 border-outline-variant/10'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="material-symbols-outlined text-amber-500 text-[18px]">{perk.icon}</span>
                      <div>
                        <div className="font-semibold text-on-surface truncate">{perk.title}</div>
                        <div className="text-[10px] text-on-surface-variant">{perk.desc}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => handleClaimReward(perk.title, perk.cost)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] shrink-0 font-mono transition-all cursor-pointer ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-600 text-neutral-950'
                          : 'bg-surface-container-high text-on-surface-variant/50 cursor-not-allowed'
                      }`}
                    >
                      {perk.cost} PTS
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
