import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  Play, 
  Plus, 
  BookOpen, 
  GraduationCap, 
  Layers, 
  Target, 
  TrendingUp, 
  ChevronRight, 
  RotateCcw,
  Check,
  Pause,
  AlertCircle,
  Zap,
  BarChart3,
  RefreshCw,
  Award,
  ArrowRight,
  FolderOpen
} from 'lucide-react';
import { StorageService } from '../study/services/storageService';
import { StudySet } from '../study/types';
import { Quiz } from '../quiz/types';
import { getRecentQuizzes } from '../quiz/utils/quizShare';

export type PlannerFlowStep = 'PLAN' | 'SCHEDULE' | 'STUDY' | 'TRACK' | 'REVIEW';

export interface PlannedBlock {
  id: string;
  title: string;
  subject: string;
  durationMinutes: number;
  scheduledTime: string;
  dayOfWeek: string;
  mode: 'study' | 'flashcards' | 'quiz' | 'practice';
  isCompleted: boolean;
  linkedSetId?: string;
  linkedQuizId?: string;
  notes?: string;
  reviewStatus?: 'mastered' | 'reviewing' | 'needs-work';
}

const DEFAULT_SCHEDULE: PlannedBlock[] = [
  {
    id: 'block-1',
    title: 'Mansa Musa & Mali Empire Active Recall',
    subject: 'African History',
    durationMinutes: 25,
    scheduledTime: '09:00 AM',
    dayOfWeek: 'Today',
    mode: 'flashcards',
    isCompleted: false,
    reviewStatus: 'reviewing',
  },
  {
    id: 'block-2',
    title: 'Swahili Grammatical Structure & Pronouns',
    subject: 'African Languages',
    durationMinutes: 15,
    scheduledTime: '11:30 AM',
    dayOfWeek: 'Today',
    mode: 'study',
    isCompleted: false,
    reviewStatus: 'needs-work',
  },
  {
    id: 'block-3',
    title: 'Great Zimbabwe Architecture & Trade Routes',
    subject: 'African History',
    durationMinutes: 20,
    scheduledTime: '02:00 PM',
    dayOfWeek: 'Today',
    mode: 'quiz',
    isCompleted: true,
    reviewStatus: 'mastered',
  },
  {
    id: 'block-4',
    title: 'African Geography & Major River Basins',
    subject: 'Geography',
    durationMinutes: 30,
    scheduledTime: '04:30 PM',
    dayOfWeek: 'Tomorrow',
    mode: 'practice',
    isCompleted: false,
    reviewStatus: 'reviewing',
  },
  {
    id: 'block-5',
    title: 'Ancient Nubia & Kingdom of Kush',
    subject: 'African History',
    durationMinutes: 45,
    scheduledTime: '10:00 AM',
    dayOfWeek: 'This Week',
    mode: 'study',
    isCompleted: false,
    reviewStatus: 'needs-work',
  },
];

interface CentralPlannerViewProps {
  onStartStudySet: (set: StudySet, mode?: 'study' | 'flashcards' | 'practice') => void;
  onStartQuiz: (quiz: Quiz) => void;
  onExploreSets: () => void;
}

export const CentralPlannerView: React.FC<CentralPlannerViewProps> = ({
  onStartStudySet,
  onStartQuiz,
  onExploreSets,
}) => {
  // Master Flow Step: PLAN -> SCHEDULE -> STUDY -> TRACK -> REVIEW
  const [currentStep, setCurrentStep] = useState<PlannerFlowStep>('PLAN');

  const [schedule, setSchedule] = useState<PlannedBlock[]>(() => {
    try {
      const raw = localStorage.getItem('proudly_afrikan_planner_schedule_v3');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return DEFAULT_SCHEDULE;
  });

  const [studySets, setStudySets] = useState<StudySet[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Time-boxing Active Timer State
  const [selectedDuration, setSelectedDuration] = useState<number>(25);
  const [activeSessionBlock, setActiveSessionBlock] = useState<PlannedBlock | null>(schedule[0] || null);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [sessionNotes, setSessionNotes] = useState<string>('');

  // Weekly Goal & Plan
  const [weeklyGoalHours, setWeeklyGoalHours] = useState<number>(8);
  const [selectedGoalSubjects, setSelectedGoalSubjects] = useState<string[]>([
    'African History',
    'African Languages',
    'Geography',
  ]);

  // Form State for new plan/schedule
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('African History');
  const [newDuration, setNewDuration] = useState(25);
  const [newTime, setNewTime] = useState('09:00 AM');
  const [newDay, setNewDay] = useState('Today');
  const [newMode, setNewMode] = useState<'study' | 'flashcards' | 'quiz' | 'practice'>('study');
  const [selectedSetId, setSelectedSetId] = useState<string>('');

  useEffect(() => {
    try {
      setStudySets(StorageService.getAllStudySets());
      setQuizzes(getRecentQuizzes());
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('proudly_afrikan_planner_schedule_v3', JSON.stringify(schedule));
    } catch (e) {}
  }, [schedule]);

  // Active Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSecondsLeft]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggleComplete = (id: string) => {
    setSchedule((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isCompleted: !b.isCompleted } : b))
    );
  };

  const handleLaunchBlock = (block: PlannedBlock) => {
    setActiveSessionBlock(block);
    setTimerSecondsLeft(block.durationMinutes * 60);
    setIsTimerRunning(true);
    setCurrentStep('STUDY');

    // Find linked set or fallback
    if (block.mode === 'quiz') {
      const q = quizzes.find((quiz) => quiz.id === block.linkedQuizId) || quizzes[0];
      if (q) {
        onStartQuiz(q);
        return;
      }
    }

    const set = studySets.find((s) => s.id === block.linkedSetId) || studySets[0];
    if (set) {
      const studyMode = block.mode === 'quiz' ? 'study' : block.mode;
      onStartStudySet(set, studyMode);
    }
  };

  const handleCreateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const block: PlannedBlock = {
      id: `block-${Date.now()}`,
      title: newTitle.trim(),
      subject: newSubject,
      durationMinutes: newDuration,
      scheduledTime: newTime,
      dayOfWeek: newDay,
      mode: newMode,
      isCompleted: false,
      linkedSetId: selectedSetId || undefined,
      reviewStatus: 'reviewing',
    };

    setSchedule((prev) => [block, ...prev]);
    setIsAddModalOpen(false);
    setNewTitle('');
  };

  const completedCount = schedule.filter((b) => b.isCompleted).length;
  const totalMinutesPlanned = schedule.reduce((sum, b) => sum + b.durationMinutes, 0);

  const stepsList: { key: PlannerFlowStep; label: string; number: string; desc: string }[] = [
    { key: 'PLAN', number: '01', label: 'PLAN', desc: 'Define goals & topics' },
    { key: 'SCHEDULE', number: '02', label: 'SCHEDULE', desc: 'Timetable & focus blocks' },
    { key: 'STUDY', number: '03', label: 'STUDY', desc: 'Focus timer & materials' },
    { key: 'TRACK', number: '04', label: 'TRACK', desc: 'Curriculum mastery & streak' },
    { key: 'REVIEW', number: '05', label: 'REVIEW', desc: 'Active recall & memory retention' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F0] py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* 1. Header Hero */}
        <div className="bg-[#FDFBF7] border border-[#EAE3D6] rounded-[32px] p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-base font-mono font-bold uppercase tracking-wider text-[#E63956]">
              <Zap className="w-4 h-4 fill-[#E63956]/20" />
              <span>CENTRALISED LEARNING PLANNER</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-[#161616] uppercase">
              STUDY & REVISION PLANNER
            </h1>
            <p className="text-stone-700 text-base max-w-2xl font-normal leading-relaxed">
              Complete 5-stage mastery cycle: Plan your syllabus objectives, schedule time-boxes, engage in focused study, track continental curriculum progress, and review spaced retention.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#1A0B14] hover:bg-[#2A1020] active:scale-95 text-[#F48FB1] hover:text-white border border-[#E63956]/50 rounded-full px-6 py-3.5 font-mono font-bold text-base uppercase tracking-wider shadow-[0_4px_18px_rgba(230,57,86,0.35)] flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5 text-[#E63956]" />
              <span>SCHEDULE SESSION</span>
            </button>
          </div>
        </div>

        {/* 2. Interactive Flow Stepper: PLAN -> SCHEDULE -> STUDY -> TRACK -> REVIEW */}
        <div className="bg-white border border-[#EAE3D6] rounded-[28px] p-3 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
            {stepsList.map((step, idx) => {
              const isActive = currentStep === step.key;
              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => setCurrentStep(step.key)}
                  className={`p-3.5 sm:p-4 rounded-2xl text-left transition-all cursor-pointer relative ${
                    isActive
                      ? 'bg-[#161616] text-white shadow-md'
                      : 'bg-[#FAF7F0] hover:bg-stone-100 text-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`font-mono text-xs font-bold uppercase tracking-widest ${isActive ? 'text-[#E63956]' : 'text-stone-400'}`}>
                      STEP {step.number}
                    </span>
                    {idx < stepsList.length - 1 && (
                      <span className="hidden sm:inline text-stone-400 text-xs font-mono">→</span>
                    )}
                  </div>
                  <div className={`font-display font-black text-base sm:text-lg uppercase tracking-tight ${isActive ? 'text-white' : 'text-[#161616]'}`}>
                    {step.label}
                  </div>
                  <div className={`text-xs sm:text-[13px] font-mono truncate mt-0.5 ${isActive ? 'text-stone-300' : 'text-stone-500'}`}>
                    {step.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. STEP 1: PLAN VIEW */}
        {currentStep === 'PLAN' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Goals & Curriculum Focus */}
              <div className="lg:col-span-7 bg-white border border-[#EAE3D6] rounded-[32px] p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center text-[#E63956]">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-black text-xl text-[#161616] uppercase">
                        CURRICULUM STUDY GOALS
                      </h3>
                      <p className="text-base text-stone-500 font-mono">
                        Define weekly hours and target subjects for this cycle.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-base font-mono font-bold uppercase text-stone-800 mb-2">
                      Weekly Focus Target: {weeklyGoalHours} Hours / Week
                    </label>
                    <input
                      type="range"
                      min={2}
                      max={25}
                      step={1}
                      value={weeklyGoalHours}
                      onChange={(e) => setWeeklyGoalHours(Number(e.target.value))}
                      className="w-full accent-[#E63956] cursor-pointer h-2 bg-stone-200 rounded-lg"
                    />
                    <div className="flex justify-between text-xs font-mono text-stone-500 mt-1">
                      <span>2 hrs (Light)</span>
                      <span>8 hrs (Standard)</span>
                      <span>15 hrs (Intensive)</span>
                      <span>25 hrs (Full Mastery)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-base font-mono font-bold uppercase text-stone-800 mb-2">
                      Target Curriculum Domains
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'African History',
                        'African Languages',
                        'Geography',
                        'STEM & Sciences',
                        'Literature & Arts',
                        'Economics & Trade',
                      ].map((sub) => {
                        const isSelected = selectedGoalSubjects.includes(sub);
                        return (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setSelectedGoalSubjects(selectedGoalSubjects.filter((s) => s !== sub));
                              } else {
                                setSelectedGoalSubjects([...selectedGoalSubjects, sub]);
                              }
                            }}
                            className={`px-4 py-2 rounded-full font-mono text-base font-bold uppercase transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-[#161616] text-white border-[#161616]'
                                : 'bg-[#FAF7F0] text-stone-700 border-stone-200 hover:border-stone-400'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}
                            {sub}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(true)}
                      className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#E63956] hover:bg-[#D92B8A] text-white font-mono font-bold text-base uppercase flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Topic Goal</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentStep('SCHEDULE')}
                      className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#161616] hover:bg-stone-800 text-white font-mono font-bold text-base uppercase flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <span>Proceed to Schedule</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Saved Sets Ready to Plan */}
              <div className="lg:col-span-5 bg-white border border-[#EAE3D6] rounded-[32px] p-6 sm:p-8 space-y-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-[#E63956]" />
                    <h3 className="font-display font-black text-lg text-[#161616] uppercase">
                      STUDY SETS TO MASTER
                    </h3>
                  </div>
                  <button
                    onClick={onExploreSets}
                    className="text-base font-mono font-bold text-[#E63956] hover:underline"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-3">
                  {studySets.slice(0, 4).map((set) => (
                    <div
                      key={set.id}
                      className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-stone-200/80 flex items-center justify-between gap-3 hover:border-[#E63956] transition-all"
                    >
                      <div className="truncate">
                        <div className="font-display font-black text-base text-[#161616] uppercase truncate">
                          {set.title}
                        </div>
                        <div className="text-xs font-mono text-stone-500">
                          {set.concepts?.length || 0} CONCEPTS • {set.category || 'General'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setNewTitle(set.title);
                          setNewSubject(set.category || 'African History');
                          setSelectedSetId(set.id);
                          setIsAddModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 hover:border-[#E63956] text-xs font-mono font-bold text-stone-800 uppercase shrink-0 cursor-pointer"
                      >
                        + Plan Block
                      </button>
                    </div>
                  ))}
                  {studySets.length === 0 && (
                    <div className="text-center py-6 text-stone-500 font-mono text-base">
                      No study sets yet. Create one in the STUDY section!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. STEP 2: SCHEDULE VIEW */}
        {currentStep === 'SCHEDULE' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white border border-[#EAE3D6] rounded-[32px] p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                <div>
                  <h3 className="font-display font-black text-2xl text-[#161616] uppercase tracking-tight">
                    WEEKLY STUDY TIMETABLE & SLOTS
                  </h3>
                  <p className="text-base font-mono text-stone-500">
                    Schedule session times and link each block to active recall or practice tests.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-5 py-2.5 rounded-full bg-[#E63956] text-white font-mono font-bold text-base uppercase flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Schedule Slot</span>
                </button>
              </div>

              <div className="space-y-3">
                {schedule.map((block) => (
                  <div
                    key={block.id}
                    className={`rounded-[24px] p-4 sm:p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 border ${
                      block.isCompleted
                        ? 'bg-stone-50 border-stone-200 opacity-60'
                        : 'bg-[#FDFBF7] border-[#EAE3D6] shadow-xs hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <button
                        onClick={() => handleToggleComplete(block.id)}
                        className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                          block.isCompleted
                            ? 'bg-emerald-500 border-emerald-600 text-white'
                            : 'border-stone-400 bg-white hover:border-stone-600'
                        }`}
                      >
                        {block.isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                      </button>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#EFEBE4] text-stone-700">
                            {block.dayOfWeek} • {block.scheduledTime}
                          </span>
                          <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FCE8F3] text-[#D92B8A]">
                            {block.subject}
                          </span>
                          <span className="text-xs font-mono font-bold uppercase text-stone-500">
                            {block.durationMinutes} MINS
                          </span>
                        </div>

                        <h4 className={`font-display font-black text-lg sm:text-xl uppercase tracking-tight ${block.isCompleted ? 'line-through text-stone-400' : 'text-[#161616]'}`}>
                          {block.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => handleLaunchBlock(block)}
                        className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#E02D68] via-[#D92B8A] to-[#C92255] text-white font-mono font-bold text-base uppercase tracking-wider flex items-center gap-2 shadow-[0_4px_18px_rgba(230,57,86,0.5)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Launch Study ({block.mode.toUpperCase()})</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep('STUDY')}
                  className="px-6 py-3 rounded-full bg-[#161616] hover:bg-stone-800 text-white font-mono font-bold text-base uppercase flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>Proceed to Study Session</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. STEP 3: STUDY VIEW */}
        {currentStep === 'STUDY' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Active Focus Time-Box Engine */}
            <div className="bg-[#0D0D0E] border border-stone-800/80 rounded-[32px] p-6 sm:p-8 text-white shadow-[0_12px_36px_rgba(0,0,0,0.18)] space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-stone-800 pb-6">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-base font-mono font-bold uppercase text-[#E63956] tracking-wider">
                    <Clock className="w-5 h-5" />
                    <span>TIME-BOXED FOCUS ENGINE</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white">
                    {activeSessionBlock ? activeSessionBlock.title : 'Ready for a Focused Study Block'}
                  </h2>
                  <p className="text-stone-400 text-base font-mono">
                    {activeSessionBlock
                      ? `Active session in ${activeSessionBlock.subject} • ${activeSessionBlock.mode.toUpperCase()} MODE`
                      : 'Select a time preset below or launch any scheduled session directly.'}
                  </p>
                </div>

                {/* Focus Timer & Action Buttons */}
                <div className="flex items-center gap-3">
                  <div className="bg-[#202022] border border-stone-700/70 px-6 py-3 rounded-2xl flex flex-col items-center justify-center min-w-[140px]">
                    <div className="text-xs font-mono uppercase text-[#E63956] font-bold">Focus Timer</div>
                    <div className="text-3xl sm:text-4xl font-mono font-bold tracking-widest text-white">
                      {formatTimer(timerSecondsLeft).replace(':', ' : ')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className="w-12 h-12 rounded-full bg-gradient-to-r from-[#E02D68] via-[#D92B8A] to-[#C92255] text-white flex items-center justify-center shadow-[0_0_22px_rgba(230,57,86,0.7)] hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                      title={isTimerRunning ? 'Pause' : 'Start Focus'}
                    >
                      {isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                    </button>
                    <button
                      onClick={() => {
                        setIsTimerRunning(false);
                        setTimerSecondsLeft(selectedDuration * 60);
                      }}
                      className="w-12 h-12 rounded-full bg-[#202022] hover:bg-stone-700 text-stone-300 border border-stone-700/80 flex items-center justify-center transition-all cursor-pointer shrink-0"
                      title="Reset"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-base font-mono text-stone-400 uppercase font-bold mr-2">DURATION PRESETS:</span>
                {[
                  { label: '15 MIN SPRINT', mins: 15 },
                  { label: '25 MIN POMODORO', mins: 25 },
                  { label: '45 MIN DEEP DIVE', mins: 45 },
                  { label: '60 MIN MASTERY', mins: 60 },
                ].map((preset) => (
                  <button
                    key={preset.mins}
                    onClick={() => {
                      setSelectedDuration(preset.mins);
                      setTimerSecondsLeft(preset.mins * 60);
                      setIsTimerRunning(false);
                    }}
                    className={`px-5 py-2 rounded-full text-base font-mono font-bold uppercase transition-all cursor-pointer ${
                      selectedDuration === preset.mins
                        ? 'bg-[#E63956] text-white shadow-[0_0_16px_rgba(230,57,86,0.65)]'
                        : 'bg-[#202022] text-stone-300 border border-stone-700/80 hover:bg-stone-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Active Scratchpad / Key Insights */}
              <div className="bg-[#18181B] border border-stone-800 rounded-2xl p-4 sm:p-5 space-y-2">
                <label className="block text-base font-mono font-bold text-stone-300 uppercase">
                  Session Scratchpad & Key Memorization Notes
                </label>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Record summary concepts, formulae, mnemonic associations, or questions to revisit during review..."
                  className="w-full bg-[#0D0D0E] border border-stone-700 rounded-xl p-3.5 text-base font-mono text-white placeholder-stone-500 focus:outline-none min-h-[100px]"
                />
              </div>

              {/* Navigation Action to Track */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                {activeSessionBlock && (
                  <button
                    type="button"
                    onClick={() => {
                      handleToggleComplete(activeSessionBlock.id);
                      setCurrentStep('TRACK');
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-base uppercase flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
                  >
                    <Check className="w-4 h-4" />
                    <span>Mark Block Completed & Track Progress</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setCurrentStep('TRACK')}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-stone-800 hover:bg-stone-700 text-white font-mono font-bold text-base uppercase flex items-center justify-center gap-2 cursor-pointer transition-all ml-auto"
                >
                  <span>Go to Track Step</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. STEP 4: TRACK VIEW */}
        {currentStep === 'TRACK' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Stats Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-[#EAE3D6] p-6 rounded-[28px] shadow-xs">
                <div className="text-base font-mono font-bold text-stone-500 uppercase tracking-wider">SESSIONS PLANNED</div>
                <div className="text-4xl font-display font-black text-[#161616] mt-1">{schedule.length}</div>
              </div>
              <div className="bg-white border border-[#EAE3D6] p-6 rounded-[28px] shadow-xs">
                <div className="text-base font-mono font-bold text-stone-500 uppercase tracking-wider">COMPLETED TODAY</div>
                <div className="text-4xl font-display font-black text-[#161616] mt-1 text-emerald-600">{completedCount}</div>
              </div>
              <div className="bg-white border border-[#EAE3D6] p-6 rounded-[28px] shadow-xs">
                <div className="text-base font-mono font-bold text-stone-500 uppercase tracking-wider">PLANNED TIME</div>
                <div className="text-4xl font-display font-black text-[#161616] mt-1">{totalMinutesPlanned}m</div>
              </div>
              <div className="bg-white border border-[#EAE3D6] p-6 rounded-[28px] shadow-xs">
                <div className="text-base font-mono font-bold text-stone-500 uppercase tracking-wider">STUDY STREAK</div>
                <div className="text-4xl font-display font-black text-[#161616] mt-1 flex items-center gap-2">
                  <span>7 Days</span>
                  <Flame className="w-7 h-7 text-orange-500 fill-orange-500" />
                </div>
              </div>
            </div>

            {/* Subject Mastery Progress Tracking */}
            <div className="bg-white border border-[#EAE3D6] rounded-[32px] p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-6 h-6 text-[#E63956]" />
                  <h3 className="font-display font-black text-2xl text-[#161616] uppercase">
                    CURRICULUM MASTERY & RETENTION PROGRESS
                  </h3>
                </div>
                <span className="font-mono text-base text-stone-500 font-bold uppercase">
                  {Math.round((completedCount / (schedule.length || 1)) * 100)}% ON TRACK
                </span>
              </div>

              <div className="space-y-4">
                {[
                  { name: 'African History (Mansa Musa, Great Zimbabwe, Kush)', pct: 85, color: 'bg-[#E63956]' },
                  { name: 'African Languages (Swahili, Yoruba grammar)', pct: 60, color: 'bg-indigo-600' },
                  { name: 'Continental Geography (Rift Valley, Congo Basin)', pct: 45, color: 'bg-emerald-600' },
                  { name: 'Sciences & STEM (Solar energy, indigenous botany)', pct: 30, color: 'bg-amber-600' },
                ].map((track) => (
                  <div key={track.name} className="space-y-1.5">
                    <div className="flex justify-between text-base font-mono font-bold text-stone-800">
                      <span>{track.name}</span>
                      <span>{track.pct}%</span>
                    </div>
                    <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                      <div className={`h-full ${track.color} rounded-full transition-all duration-500`} style={{ width: `${track.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep('REVIEW')}
                  className="px-6 py-3 rounded-full bg-[#161616] hover:bg-stone-800 text-white font-mono font-bold text-base uppercase flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>Proceed to Review & Spaced Recall</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 7. STEP 5: REVIEW VIEW */}
        {currentStep === 'REVIEW' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white border border-[#EAE3D6] rounded-[32px] p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <RefreshCw className="w-6 h-6 text-[#E63956]" />
                  <div>
                    <h3 className="font-display font-black text-2xl text-[#161616] uppercase">
                      SPACED REPETITION REVIEW QUEUE
                    </h3>
                    <p className="text-base font-mono text-stone-500">
                      Combat memory decay by reviewing past study blocks at 1-day, 3-day, and 7-day intervals.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep('PLAN')}
                  className="px-6 py-3 rounded-full bg-[#E63956] hover:bg-[#D92B8A] text-white font-mono font-bold text-base uppercase flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Loop Back to Plan</span>
                </button>
              </div>

              <div className="space-y-4">
                {schedule.map((block) => (
                  <div
                    key={block.id}
                    className="p-5 rounded-2xl bg-[#FAF7F0] border border-stone-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-white text-stone-700 border border-stone-200">
                          {block.subject}
                        </span>
                        <span className={`text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          block.reviewStatus === 'mastered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : block.reviewStatus === 'needs-work'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {block.reviewStatus === 'mastered' ? '★ Mastered' : block.reviewStatus === 'needs-work' ? '⚠ Needs Review' : '● In Progress'}
                        </span>
                      </div>
                      <h4 className="font-display font-black text-lg text-[#161616] uppercase">
                        {block.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSchedule((prev) =>
                            prev.map((b) => (b.id === block.id ? { ...b, reviewStatus: 'needs-work' } : b))
                          );
                        }}
                        className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold uppercase border cursor-pointer ${
                          block.reviewStatus === 'needs-work'
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-white text-stone-700 border-stone-300 hover:bg-rose-50'
                        }`}
                      >
                        Needs Work
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSchedule((prev) =>
                            prev.map((b) => (b.id === block.id ? { ...b, reviewStatus: 'reviewing' } : b))
                          );
                        }}
                        className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold uppercase border cursor-pointer ${
                          block.reviewStatus === 'reviewing'
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-white text-stone-700 border-stone-300 hover:bg-amber-50'
                        }`}
                      >
                        Reviewing
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSchedule((prev) =>
                            prev.map((b) => (b.id === block.id ? { ...b, reviewStatus: 'mastered' } : b))
                          );
                        }}
                        className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold uppercase border cursor-pointer ${
                          block.reviewStatus === 'mastered'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-stone-700 border-stone-300 hover:bg-emerald-50'
                        }`}
                      >
                        Mastered
                      </button>

                      <button
                        type="button"
                        onClick={() => handleLaunchBlock(block)}
                        className="ml-2 px-4 py-1.5 rounded-xl bg-[#161616] text-white font-mono text-xs font-bold uppercase cursor-pointer"
                      >
                        Practice →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Add Plan / Schedule Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F0] border border-[#EAE3D6] rounded-[32px] p-6 sm:p-8 max-w-lg w-full shadow-[0_20px_50px_rgba(0,0,0,0.2)] space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-display font-black text-xl uppercase text-[#161616]">
                Schedule New Study Block
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-stone-200 text-stone-600 flex items-center justify-center font-mono font-bold text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBlock} className="space-y-4">
              <div>
                <label className="block text-base font-mono font-bold uppercase text-stone-700 mb-1">
                  Session Topic or Goal
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Great Zimbabwe architecture & stone masonry"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white border-2 border-[#1A1A1A] rounded-xl px-3.5 py-2.5 text-base font-mono text-[#161616] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-base font-mono font-bold uppercase text-stone-700 mb-1">
                    Subject Domain
                  </label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full bg-white border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-base font-mono font-bold text-[#161616] focus:outline-none cursor-pointer"
                  >
                    <option value="African History">African History</option>
                    <option value="African Languages">African Languages</option>
                    <option value="Geography">Geography</option>
                    <option value="STEM & Sciences">STEM & Sciences</option>
                    <option value="Arts & Culture">Arts & Culture</option>
                    <option value="Business & Trade">Business & Trade</option>
                  </select>
                </div>

                <div>
                  <label className="block text-base font-mono font-bold uppercase text-stone-700 mb-1">
                    Duration
                  </label>
                  <select
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full bg-white border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-base font-mono font-bold text-[#161616] focus:outline-none cursor-pointer"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={25}>25 Minutes (Pomodoro)</option>
                    <option value={45}>45 Minutes (Deep Focus)</option>
                    <option value={60}>60 Minutes (Mastery)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-base font-mono font-bold uppercase text-stone-700 mb-1">
                    Target Day
                  </label>
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value)}
                    className="w-full bg-white border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-base font-mono font-bold text-[#161616] focus:outline-none cursor-pointer"
                  >
                    <option value="Today">Today</option>
                    <option value="Tomorrow">Tomorrow</option>
                    <option value="This Week">This Week</option>
                  </select>
                </div>

                <div>
                  <label className="block text-base font-mono font-bold uppercase text-stone-700 mb-1">
                    Learning Mode
                  </label>
                  <select
                    value={newMode}
                    onChange={(e) => setNewMode(e.target.value as any)}
                    className="w-full bg-white border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-base font-mono font-bold text-[#161616] focus:outline-none cursor-pointer"
                  >
                    <option value="study">Deep Study Hub</option>
                    <option value="flashcards">Tactile Flashcards</option>
                    <option value="quiz">Interactive Quiz</option>
                    <option value="practice">Scenario Practice</option>
                  </select>
                </div>
              </div>

              {/* Link Existing Set Option */}
              {studySets.length > 0 && (
                <div>
                  <label className="block text-base font-mono font-bold uppercase text-stone-700 mb-1">
                    Attach Study Set (Optional)
                  </label>
                  <select
                    value={selectedSetId}
                    onChange={(e) => setSelectedSetId(e.target.value)}
                    className="w-full bg-white border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-base font-mono text-[#161616] focus:outline-none cursor-pointer"
                  >
                    <option value="">-- No specific set --</option>
                    {studySets.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title} ({s.concepts.length} concepts)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 text-base font-mono font-bold text-stone-600 hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#161616] hover:bg-stone-800 text-white px-6 py-2.5 rounded-xl text-base font-display font-black uppercase cursor-pointer"
                >
                  Add to Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
