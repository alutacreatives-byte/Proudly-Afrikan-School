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
  Bell,
  Check,
  Pause,
  AlertCircle
} from 'lucide-react';
import { StorageService } from '../study/services/storageService';
import { StudySet, StudyConcept } from '../study/types';
import { Quiz } from '../quiz/types';
import { getRecentQuizzes } from '../quiz/utils/quizShare';

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
  },
  {
    id: 'block-3',
    title: 'Great Zimbabwe Architecture & Trade Routes',
    subject: 'African History',
    durationMinutes: 20,
    scheduledTime: '02:00 PM',
    dayOfWeek: 'Today',
    mode: 'quiz',
    isCompleted: false,
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
  const [schedule, setSchedule] = useState<PlannedBlock[]>(() => {
    try {
      const raw = localStorage.getItem('proudly_afrikan_planner_schedule_v2');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return DEFAULT_SCHEDULE;
  });

  const [studySets, setStudySets] = useState<StudySet[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Time-boxing Active Timer State
  const [selectedDuration, setSelectedDuration] = useState<number>(25);
  const [activeSessionBlock, setActiveSessionBlock] = useState<PlannedBlock | null>(null);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Form State for new plan
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
      localStorage.setItem('proudly_afrikan_planner_schedule_v2', JSON.stringify(schedule));
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
      onStartStudySet(set, block.mode);
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
    };

    setSchedule((prev) => [block, ...prev]);
    setIsAddModalOpen(false);
    setNewTitle('');
  };

  const completedCount = schedule.filter((b) => b.isCompleted).length;
  const totalMinutesPlanned = schedule.reduce((sum, b) => sum + b.durationMinutes, 0);

  return (
    <div className="min-h-screen bg-[#FAF7F0] py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Hero */}
        <div className="bg-white border-2 border-[#1A1A1A] rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[4px_4px_0px_#1A1A1A] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#D92B8A]">
              <Calendar className="w-4 h-4" />
              <span>CENTRALISED LEARNING PLANNER</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-black tracking-tight text-[#161616] uppercase">
              STUDY & REVISION PLANNER
            </h1>
            <p className="text-stone-600 text-sm sm:text-base max-w-2xl font-body">
              Time-box your study sessions, schedule active recall reviews, and keep your curriculum progress on track with integrated Pomodoro and deep-focus timers.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="tactile-btn bg-[#161616] text-white hover:bg-stone-800 font-display font-black text-xs px-5 py-3 rounded-xl flex items-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              <Plus className="w-4 h-4 text-[#D92B8A]" />
              <span>+ SCHEDULE SESSION</span>
            </button>
          </div>
        </div>

        {/* Active Focus Time-Box Bar */}
        <div className="bg-gradient-to-r from-[#18181B] to-[#27272A] border-2 border-[#161616] rounded-2xl p-6 text-white shadow-[4px_4px_0px_#D92B8A]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase text-[#D92B8A] tracking-wider">
                <Clock className="w-4 h-4 animate-pulse" />
                <span>TIME-BOXED FOCUS ENGINE</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-black tracking-tight">
                {activeSessionBlock ? activeSessionBlock.title : 'Ready for a Focused Study Block'}
              </h2>
              <p className="text-stone-400 text-xs font-mono">
                {activeSessionBlock
                  ? `Active session in ${activeSessionBlock.subject} • ${activeSessionBlock.mode.toUpperCase()} MODE`
                  : 'Select a time preset below or launch any scheduled session directly.'}
              </p>
            </div>

            {/* Timer & Controls */}
            <div className="flex items-center gap-4">
              <div className="bg-black/50 border border-stone-700 px-5 py-2.5 rounded-2xl">
                <div className="text-[10px] font-mono uppercase text-stone-400 font-bold">Focus Timer</div>
                <div className="text-3xl font-mono font-black tracking-widest text-[#D92B8A]">
                  {formatTimer(timerSecondsLeft)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`p-3.5 rounded-2xl border-2 border-white/20 transition-all cursor-pointer font-bold ${
                    isTimerRunning ? 'bg-amber-500 hover:bg-amber-600 text-black' : 'bg-[#D92B8A] hover:bg-[#BF1E75] text-white'
                  }`}
                  title={isTimerRunning ? 'Pause' : 'Start Focus'}
                >
                  {isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                </button>
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSecondsLeft(selectedDuration * 60);
                  }}
                  className="p-3.5 rounded-2xl border-2 border-white/20 bg-stone-800 hover:bg-stone-700 text-stone-300 transition-all cursor-pointer"
                  title="Reset"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="mt-6 pt-5 border-t border-stone-800 flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-mono text-stone-400 uppercase font-bold mr-2">Quick Presets:</span>
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                  selectedDuration === preset.mins
                    ? 'bg-[#D92B8A] text-white border-[#D92B8A]'
                    : 'bg-stone-800/80 text-stone-300 border-stone-700 hover:bg-stone-700'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white border-2 border-[#1A1A1A] p-4 rounded-2xl shadow-[2.5px_2.5px_0px_#1A1A1A]">
            <div className="text-[11px] font-mono font-bold text-stone-500 uppercase">Sessions Planned</div>
            <div className="text-2xl sm:text-3xl font-display font-black text-[#161616] mt-1">{schedule.length}</div>
          </div>
          <div className="bg-[#FAF7F0] border-2 border-[#1A1A1A] p-4 rounded-2xl shadow-[2.5px_2.5px_0px_#1A1A1A]">
            <div className="text-[11px] font-mono font-bold text-[#D92B8A] uppercase">Completed Today</div>
            <div className="text-2xl sm:text-3xl font-display font-black text-[#161616] mt-1">{completedCount}</div>
          </div>
          <div className="bg-[#FAF7F0] border-2 border-[#1A1A1A] p-4 rounded-2xl shadow-[2.5px_2.5px_0px_#1A1A1A]">
            <div className="text-[11px] font-mono font-bold text-amber-600 uppercase">Planned Time</div>
            <div className="text-2xl sm:text-3xl font-display font-black text-[#161616] mt-1">{totalMinutesPlanned}m</div>
          </div>
          <div className="bg-[#FAF7F0] border-2 border-[#1A1A1A] p-4 rounded-2xl shadow-[2.5px_2.5px_0px_#1A1A1A]">
            <div className="text-[11px] font-mono font-bold text-emerald-600 uppercase">Study Streak</div>
            <div className="text-2xl sm:text-3xl font-display font-black text-[#161616] mt-1 flex items-center gap-1">
              <span>7 Days</span>
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            </div>
          </div>
        </div>

        {/* Schedule List */}
        <div className="bg-white border-2 border-[#1A1A1A] rounded-2xl p-6 shadow-[3px_3px_0px_#1A1A1A] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-black text-lg text-[#161616] uppercase tracking-tight">
              YOUR STUDY TIMETABLE & TASKS
            </h3>
            <span className="text-xs font-mono font-bold text-stone-500">
              {completedCount} OF {schedule.length} COMPLETED
            </span>
          </div>

          <div className="space-y-3">
            {schedule.map((block) => (
              <div
                key={block.id}
                className={`border-2 rounded-2xl p-4 sm:p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  block.isCompleted
                    ? 'bg-stone-50 border-stone-200 opacity-60'
                    : 'bg-white border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] hover:shadow-[4px_4px_0px_#1A1A1A]'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Completion Checkbox */}
                  <button
                    onClick={() => handleToggleComplete(block.id)}
                    className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                      block.isCompleted
                        ? 'bg-emerald-500 border-emerald-600 text-white'
                        : 'border-[#1A1A1A] bg-white hover:bg-stone-100'
                    }`}
                  >
                    {block.isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-stone-100 border border-stone-300 text-stone-700">
                        {block.dayOfWeek} • {block.scheduledTime}
                      </span>
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#FDEAF4] text-[#D92B8A] border border-[#F7B5D8]">
                        {block.subject}
                      </span>
                      <span className="text-[10px] font-mono font-bold uppercase text-stone-500">
                        {block.durationMinutes} MINS
                      </span>
                    </div>

                    <h4 className={`font-display font-black text-base ${block.isCompleted ? 'line-through text-stone-400' : 'text-[#161616]'}`}>
                      {block.title}
                    </h4>
                  </div>
                </div>

                {/* Right Action Button */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleLaunchBlock(block)}
                    className="tactile-btn bg-[#FAF7F0] hover:bg-[#FDEAF4] text-[#161616] text-xs font-display font-black px-4 py-2 rounded-xl flex items-center gap-1.5 uppercase cursor-pointer"
                  >
                    <Play className="w-3 h-3 text-[#D92B8A] fill-current" />
                    <span>START ({block.mode})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Add Plan Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#1A1A1A] rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-[6px_6px_0px_#1A1A1A] space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-display font-black text-lg uppercase text-[#161616]">
                Schedule New Study Block
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-800 font-mono font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBlock} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-stone-700 mb-1">
                  Session Topic or Goal
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Great Zimbabwe architecture & stone masonry"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#FAF7F0] border-2 border-[#1A1A1A] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-[#161616] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-stone-700 mb-1">
                    Subject Domain
                  </label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full bg-[#FAF7F0] border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#161616] focus:outline-none cursor-pointer"
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
                  <label className="block text-xs font-mono font-bold uppercase text-stone-700 mb-1">
                    Duration (Minutes)
                  </label>
                  <select
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full bg-[#FAF7F0] border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#161616] focus:outline-none cursor-pointer"
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
                  <label className="block text-xs font-mono font-bold uppercase text-stone-700 mb-1">
                    Target Day
                  </label>
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value)}
                    className="w-full bg-[#FAF7F0] border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#161616] focus:outline-none cursor-pointer"
                  >
                    <option value="Today">Today</option>
                    <option value="Tomorrow">Tomorrow</option>
                    <option value="This Week">This Week</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-stone-700 mb-1">
                    Learning Mode
                  </label>
                  <select
                    value={newMode}
                    onChange={(e) => setNewMode(e.target.value as any)}
                    className="w-full bg-[#FAF7F0] border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#161616] focus:outline-none cursor-pointer"
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
                  <label className="block text-xs font-mono font-bold uppercase text-stone-700 mb-1">
                    Attach Study Set (Optional)
                  </label>
                  <select
                    value={selectedSetId}
                    onChange={(e) => setSelectedSetId(e.target.value)}
                    className="w-full bg-[#FAF7F0] border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-xs font-mono text-[#161616] focus:outline-none cursor-pointer"
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
                  className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-mono font-bold text-stone-600 hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tactile-btn bg-[#161616] text-white px-5 py-2 rounded-xl text-xs font-display font-black uppercase cursor-pointer"
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
