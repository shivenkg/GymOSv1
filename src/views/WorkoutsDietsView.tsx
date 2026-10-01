import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { WorkoutPlan, DietPlan } from '../types';

export const WorkoutsDietsView: React.FC = () => {
  const { workoutPlans, dietPlans, members, showToast, theme } = useGym();
  const [activeTab, setActiveTab] = useState<'workouts' | 'diets' | 'assignments'>('workouts');
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutPlan | null>(workoutPlans[0] || null);
  const [selectedDiet, setSelectedDiet] = useState<DietPlan | null>(dietPlans[0] || null);

  // Assign modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignType, setAssignType] = useState<'workout' | 'diet'>('workout');
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || '');
  const [selectedPlanId, setSelectedPlanId] = useState(workoutPlans[0]?.id || '');
  const [sendWhatsApp, setSendWhatsApp] = useState(true);

  // New Plan modal state
  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);
  const [newPlanType, setNewPlanType] = useState<'workout' | 'diet'>('workout');
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDesc, setNewPlanDesc] = useState('');

  const handleAssignPlan = (e: React.FormEvent) => {
    e.preventDefault();
    const member = members.find((m) => m.id === selectedMemberId);
    const planName =
      assignType === 'workout'
        ? workoutPlans.find((w) => w.id === selectedPlanId)?.name
        : dietPlans.find((d) => d.id === selectedPlanId)?.name;

    showToast(
      'Plan Assigned Successfully',
      `${planName} assigned to ${member?.name || 'Member'}${
        sendWhatsApp ? ' • WhatsApp PDF copy sent to ' + member?.phone : ''
      }`,
      'success'
    );
    setIsAssignModalOpen(false);
  };

  const handleShareWhatsApp = (planTitle: string, type: 'workout' | 'diet') => {
    showToast(
      'WhatsApp Format Copied',
      `Structured ${type === 'workout' ? 'workout routine' : 'nutrition chart'} formatted for instant WhatsApp broadcast to members.`,
      'info'
    );
  };

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e50914]/10 text-[#e50914] uppercase tracking-wider font-mono">
              CORE MODULE 10 • FITNESS &amp; NUTRITION
            </span>
            <span className="text-on-surface-variant">• Indian Regional Diet &amp; Training</span>
          </div>
          <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tight">
            Workout &amp; Diet Plans
          </h1>
          <p className="text-xs text-on-surface-variant max-w-2xl mt-1">
            Build structured resistance routines and authentic Indian macro diets (Veg &amp; Non-Veg). Assign directly to member mobile apps and share via WhatsApp without chaotic chat threads.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setAssignType(activeTab === 'diets' ? 'diet' : 'workout');
              setSelectedPlanId(activeTab === 'diets' ? dietPlans[0]?.id : workoutPlans[0]?.id);
              setIsAssignModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-[16px]">assignment_ind</span>
            <span>Assign to Member</span>
          </button>

          <button
            onClick={() => {
              setNewPlanType(activeTab === 'diets' ? 'diet' : 'workout');
              setIsNewPlanModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e50914] hover:bg-[#b80710] text-white font-semibold text-xs transition-colors shadow-lg shadow-red-600/20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>+ Create Custom Plan</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-3">
        <button
          onClick={() => setActiveTab('workouts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'workouts'
              ? 'bg-[#e50914] text-white shadow-md shadow-red-600/20'
              : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">fitness_center</span>
          <span>Workout Programs ({workoutPlans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('diets')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'diets'
              ? 'bg-[#e50914] text-white shadow-md shadow-red-600/20'
              : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">restaurant</span>
          <span>Indian Nutrition &amp; Diets ({dietPlans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'assignments'
              ? 'bg-[#e50914] text-white shadow-md shadow-red-600/20'
              : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">groups</span>
          <span>Member Allocations (194 Active)</span>
        </button>
      </div>

      {/* TAB 1: WORKOUT PROGRAMS */}
      {activeTab === 'workouts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Workout Plans List */}
          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-xs font-mono font-bold uppercase text-on-surface-variant tracking-wider">
              Select Workout Template
            </h2>
            <div className="space-y-3">
              {workoutPlans.map((plan) => {
                const isSelected = selectedWorkout?.id === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedWorkout(plan)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#e50914]/10 border-[#e50914] shadow-md shadow-red-600/10'
                        : 'bg-surface-container border-outline-variant/30 hover:border-outline-variant/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">
                        {plan.difficulty} • {plan.daysPerWeek} Days/Wk
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">group</span>
                        {plan.assignedMembersCount} enrolled
                      </span>
                    </div>

                    <h3 className="font-headline font-bold text-sm text-on-surface mb-1">
                      {plan.name}
                    </h3>
                    <p className="text-[11px] text-on-surface-variant line-clamp-2 leading-relaxed">
                      {plan.description}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-outline-variant/20 flex items-center justify-between text-[11px]">
                      <span className="font-mono text-on-surface-variant">{plan.durationWeeks} Weeks Cycle</span>
                      <span className="text-[#e50914] font-semibold flex items-center gap-0.5">
                        <span>View Routine</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Desi Training Tip Box */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-amber-500">
                <span className="material-symbols-outlined text-[18px]">sports_kabaddi</span>
                <span>Desi Akhada &amp; Functional Power</span>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Akhada strength mixes traditional Indian Mugdar/Clubbell 360 swings, Hindu pushups (Dands), and deep squats (Baithaks) to build functional core resilience and tendon density alongside modern barbell powerlifting.
              </p>
            </div>
          </div>

          {/* Right: Selected Workout Program Details */}
          {selectedWorkout && (
            <div className="lg:col-span-8 space-y-5">
              <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/20 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#e50914]/20 text-[#e50914]">
                        {selectedWorkout.category}
                      </span>
                      <span className="text-xs text-on-surface-variant font-mono">
                        {selectedWorkout.durationWeeks} Weeks • {selectedWorkout.daysPerWeek} Days/Week
                      </span>
                    </div>
                    <h2 className="text-2xl font-headline font-bold text-on-surface mt-1">
                      {selectedWorkout.name}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleShareWhatsApp(selectedWorkout.name, 'workout')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">send</span>
                      <span>Send via WhatsApp</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPlanId(selectedWorkout.id);
                        setAssignType('workout');
                        setIsAssignModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e50914] text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">person_add</span>
                      <span>Assign</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {selectedWorkout.description}
                </p>

                {/* Day-by-Day Exercises Breakdown */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-mono font-bold uppercase text-on-surface-variant tracking-wider">
                    Routine Breakdown ({selectedWorkout.days.length} Daily Sessions)
                  </h4>

                  <div className="space-y-4">
                    {selectedWorkout.days.map((day, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/25 space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-[#e50914]/20 text-[#e50914] font-mono font-bold text-xs flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="font-headline font-bold text-sm text-on-surface">
                              {day.dayName}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-on-surface-variant font-medium">
                            Focus: <strong className="text-on-surface">{day.focus}</strong>
                          </span>
                        </div>

                        {/* Exercise Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-outline-variant/20 text-[10px] font-mono text-on-surface-variant uppercase">
                                <th className="py-2 px-2.5">Exercise</th>
                                <th className="py-2 px-2.5">Sets</th>
                                <th className="py-2 px-2.5">Reps</th>
                                <th className="py-2 px-2.5">Rest</th>
                                <th className="py-2 px-2.5">Form Cue / Notes</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                              {day.exercises.map((ex, eIdx) => (
                                <tr key={eIdx} className="hover:bg-surface-container-high/40">
                                  <td className="py-2 px-2.5 font-semibold text-on-surface flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#e50914]"></span>
                                    <span>{ex.name}</span>
                                  </td>
                                  <td className="py-2 px-2.5 font-mono font-bold text-primary">{ex.sets}</td>
                                  <td className="py-2 px-2.5 font-mono">{ex.reps}</td>
                                  <td className="py-2 px-2.5 font-mono text-on-surface-variant">{ex.rest}</td>
                                  <td className="py-2 px-2.5 text-[11px] text-on-surface-variant italic">
                                    {ex.notes || 'Full range of motion, control eccentric'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INDIAN DIET & NUTRITION */}
      {activeTab === 'diets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Diet Plans List */}
          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-xs font-mono font-bold uppercase text-on-surface-variant tracking-wider">
              Select Diet Chart (Desi Macros)
            </h2>
            <div className="space-y-3">
              {dietPlans.map((diet) => {
                const isSelected = selectedDiet?.id === diet.id;
                return (
                  <div
                    key={diet.id}
                    onClick={() => setSelectedDiet(diet)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#e50914]/10 border-[#e50914] shadow-md shadow-red-600/10'
                        : 'bg-surface-container border-outline-variant/30 hover:border-outline-variant/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                        {diet.dietType.includes('Veg') ? '🌱 Pure Vegetarian' : '🍗 Non-Vegetarian'}
                      </span>
                      <span className="text-[10px] font-mono text-on-surface-variant font-semibold">
                        {diet.totalCalories} kcal
                      </span>
                    </div>

                    <h3 className="font-headline font-bold text-sm text-on-surface mb-1">
                      {diet.name}
                    </h3>
                    <p className="text-[11px] text-on-surface-variant line-clamp-2 leading-relaxed">
                      {diet.description}
                    </p>

                    {/* Macro pills */}
                    <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2.5 border-t border-outline-variant/20 text-center font-mono text-[10px]">
                      <div className="bg-surface-container-high py-1 rounded-lg">
                        <span className="text-on-surface-variant block text-[9px]">PROTEIN</span>
                        <span className="font-bold text-emerald-400">{diet.proteinGrams}g</span>
                      </div>
                      <div className="bg-surface-container-high py-1 rounded-lg">
                        <span className="text-on-surface-variant block text-[9px]">CARBS</span>
                        <span className="font-bold text-amber-400">{diet.carbsGrams}g</span>
                      </div>
                      <div className="bg-surface-container-high py-1 rounded-lg">
                        <span className="text-on-surface-variant block text-[9px]">FATS</span>
                        <span className="font-bold text-blue-400">{diet.fatsGrams}g</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Indian Diet Realities Note */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Authentic Indian Food Ingredients</span>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Gymify diets reflect practical daily Indian meals: Paneer Bhurji, Chana Sattu drink, Moong Dal Chilla, Toor Dal, Jowar rotis, Curd, Soya Chunks, alongside certified Whey protein options.
              </p>
            </div>
          </div>

          {/* Right: Selected Diet Program Details */}
          {selectedDiet && (
            <div className="lg:col-span-8 space-y-5">
              <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/20 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                        {selectedDiet.dietType}
                      </span>
                      <span className="text-xs text-on-surface-variant font-mono">
                        Target: {selectedDiet.totalCalories} kcal/day
                      </span>
                    </div>
                    <h2 className="text-2xl font-headline font-bold text-on-surface mt-1">
                      {selectedDiet.name}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleShareWhatsApp(selectedDiet.name, 'diet')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">send</span>
                      <span>Send Meal Chart (WhatsApp)</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPlanId(selectedDiet.id);
                        setAssignType('diet');
                        setIsAssignModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e50914] text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">assignment_turned_in</span>
                      <span>Assign</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {selectedDiet.description}
                </p>

                {/* Macro Target Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20 text-center">
                    <div className="text-[10px] font-mono uppercase text-on-surface-variant">Daily Energy</div>
                    <div className="text-xl font-bold font-mono text-on-surface mt-0.5">{selectedDiet.totalCalories} kcal</div>
                  </div>
                  <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20 text-center">
                    <div className="text-[10px] font-mono uppercase text-emerald-400">Daily Protein</div>
                    <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">{selectedDiet.proteinGrams}g</div>
                  </div>
                  <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20 text-center">
                    <div className="text-[10px] font-mono uppercase text-amber-400">Carbohydrates</div>
                    <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">{selectedDiet.carbsGrams}g</div>
                  </div>
                  <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20 text-center">
                    <div className="text-[10px] font-mono uppercase text-blue-400">Healthy Fats</div>
                    <div className="text-xl font-bold font-mono text-blue-400 mt-0.5">{selectedDiet.fatsGrams}g</div>
                  </div>
                </div>

                {/* 5-Meal Indian Schedule */}
                <div className="space-y-4 pt-4">
                  <h4 className="text-xs font-mono font-bold uppercase text-on-surface-variant tracking-wider">
                    Structured 5-Meal Schedule ({selectedDiet.meals.length} Meals Daily)
                  </h4>

                  <div className="space-y-3">
                    {selectedDiet.meals.map((meal, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/25 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[10px] flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="font-headline font-bold text-xs sm:text-sm text-on-surface">
                              {meal.mealName}
                            </span>
                          </div>

                          <ul className="space-y-1 pl-7 text-xs text-on-surface">
                            {meal.items.map((item, iIdx) => (
                              <li key={iIdx} className="flex items-center gap-2 text-[11px] text-on-surface-variant">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-outline-variant/15 text-xs font-mono">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 font-bold">
                            {meal.proteinGrams}g Protein
                          </span>
                          <span className="text-on-surface-variant text-[11px]">
                            {meal.calories} kcal
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MEMBER ALLOCATIONS */}
      {activeTab === 'assignments' && (
        <div className="bg-surface-container rounded-2xl border border-outline-variant/30 overflow-hidden">
          <div className="p-4 border-b border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-headline font-bold text-base text-on-surface">
                Member Program Roster
              </h3>
              <p className="text-xs text-on-surface-variant">
                Overview of current active workout routines and nutrition allocations per member.
              </p>
            </div>
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#e50914] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span className="material-symbols-outlined text-[15px]">add</span>
              <span>Assign New Plan</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-outline-variant/20 text-[10px] font-mono text-on-surface-variant uppercase bg-surface-container-low">
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Active Plan</th>
                  <th className="py-3 px-4">Assigned Workout</th>
                  <th className="py-3 px-4">Assigned Diet</th>
                  <th className="py-3 px-4">Trainer Lead</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                {members.slice(0, 10).map((m, idx) => (
                  <tr key={m.id} className="hover:bg-surface-container-high/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#e50914]/20 text-[#e50914] font-bold text-[10px] flex items-center justify-center font-mono">
                          {m.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-semibold text-on-surface">{m.name}</div>
                          <div className="text-[10px] text-on-surface-variant font-mono">{m.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                        {m.plan || 'Annual Unlimited'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">
                      {idx % 2 === 0 ? 'Push-Pull-Legs (PPL)' : 'Desi Akhada Strength'}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-emerald-400">
                      {idx % 2 === 0 ? 'Indian Veg High-Protein' : 'Indian Non-Veg Shred'}
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant text-[11px]">
                      {m.assignedTrainer || 'Coach Vikramaditya'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          showToast('WhatsApp Sync', `Plan reminders sent to ${m.name} via WhatsApp.`, 'success');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-emerald-600 hover:text-white text-on-surface text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        Nudge Plan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Assign Plan to Member */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface-container-high border border-outline-variant/40 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <h3 className="font-headline font-bold text-lg text-on-surface">
                Assign Plan to Member
              </h3>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAssignPlan} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant uppercase font-mono mb-1">
                  Plan Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAssignType('workout');
                      setSelectedPlanId(workoutPlans[0]?.id || '');
                    }}
                    className={`py-2 rounded-xl font-bold cursor-pointer transition-colors ${
                      assignType === 'workout'
                        ? 'bg-[#e50914] text-white'
                        : 'bg-surface-container text-on-surface'
                    }`}
                  >
                    Workout Routine
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAssignType('diet');
                      setSelectedPlanId(dietPlans[0]?.id || '');
                    }}
                    className={`py-2 rounded-xl font-bold cursor-pointer transition-colors ${
                      assignType === 'diet'
                        ? 'bg-[#e50914] text-white'
                        : 'bg-surface-container text-on-surface'
                    }`}
                  >
                    Indian Diet Plan
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant uppercase font-mono mb-1">
                  Select Member
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.phone}) - {m.memberCode}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant uppercase font-mono mb-1">
                  Select Plan Template
                </label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface"
                >
                  {assignType === 'workout'
                    ? workoutPlans.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} ({w.difficulty} • {w.daysPerWeek}d)
                        </option>
                      ))
                    : dietPlans.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.totalCalories} kcal • {d.proteinGrams}g Protein)
                        </option>
                      ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-on-surface">Auto-Send via WhatsApp</div>
                  <div className="text-[10px] text-on-surface-variant">Instant PDF &amp; daily tracking link to phone</div>
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
                  onClick={() => setIsAssignModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-surface-container text-on-surface font-semibold hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#e50914] text-white font-bold hover:bg-[#b80710] shadow-md shadow-red-600/20"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Create Custom Plan */}
      {isNewPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface-container-high border border-outline-variant/40 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <h3 className="font-headline font-bold text-lg text-on-surface">
                Create New {newPlanType === 'workout' ? 'Workout' : 'Diet'} Template
              </h3>
              <button
                onClick={() => setIsNewPlanModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast(
                  'Custom Template Created',
                  `New template "${newPlanName}" saved to your gym plan library.`,
                  'success'
                );
                setIsNewPlanModalOpen(false);
                setNewPlanName('');
                setNewPlanDesc('');
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant uppercase font-mono mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  required
                  placeholder={newPlanType === 'workout' ? 'e.g. 5-Day Functional Shred' : 'e.g. High Protein Sattu & Paneer Boost'}
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant uppercase font-mono mb-1">
                  Target Objectives &amp; Notes
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe target training outcome, recommended supplements, and client prerequisites..."
                  value={newPlanDesc}
                  onChange={(e) => setNewPlanDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewPlanModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-surface-container text-on-surface font-semibold hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#e50914] text-white font-bold hover:bg-[#b80710] shadow-md shadow-red-600/20"
                >
                  Save to Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
