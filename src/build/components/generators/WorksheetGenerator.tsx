import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Sparkles,
  Printer,
  Copy,
  Bookmark,
  Check,
  ArrowLeft,
  Clock,
  Award,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import { WorksheetResult } from '../../types';
import { generateWorksheet } from '../../services/buildService';
import { SourceMaterialUpload } from '../SourceMaterialUpload';
import { saveResourceToStorage } from '../../utils/storage';
import { useAuthCredit } from '../../../context/AuthCreditContext';
import { GlobalNavigationButtons } from '../../../components/GlobalNavigationButtons';

interface WorksheetGeneratorProps {
  onBack: () => void;
  onGoHome?: () => void;
  onSaved?: () => void;
  existingResource?: WorksheetResult;
}

export const WorksheetGenerator: React.FC<WorksheetGeneratorProps> = ({
  onBack,
  onGoHome,
  onSaved,
  existingResource,
}) => {
  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Form State
  const [subject, setSubject] = useState<string>(existingResource?.subject || 'PHYSICAL SCIENCES');
  const [topic, setTopic] = useState<string>(existingResource?.topic || existingResource?.title || '');
  const [gradeLevel, setGradeLevel] = useState<string>(existingResource?.gradeLevel || 'Junior Secondary / Middle School (Grades 6-8)');
  const [difficulty, setDifficulty] = useState<string>(existingResource?.difficulty || 'Intermediate');
  const [learningObjectives, setLearningObjectives] = useState<string>('');
  const [activityTypes, setActivityTypes] = useState<string[]>([
    'matching',
    'fill-in-blanks',
    'structured-questions',
    'critical-thinking',
  ]);
  const [additionalInstructions, setAdditionalInstructions] = useState<string>('');
  const [sourceMaterial, setSourceMaterial] = useState<string>(existingResource?.sourceSnippet || '');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.documentName || '');

  // Result & View State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [worksheet, setWorksheet] = useState<WorksheetResult | null>(
    existingResource && Array.isArray(existingResource.sections) && existingResource.sections.length > 0
      ? existingResource
      : null
  );
  const [showSolutions, setShowSolutions] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const toggleActivityType = (type: string) => {
    if (activityTypes.includes(type)) {
      if (activityTypes.length > 1) {
        setActivityTypes(activityTypes.filter((t) => t !== type));
      }
    } else {
      setActivityTypes([...activityTypes, type]);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim() && !sourceMaterial.trim()) {
      setError('Please provide a worksheet topic or upload curriculum source material.');
      return;
    }

    if (!canAfford('WORKSHEET')) {
      setError('Insufficient credits for Worksheet generation. Please upgrade your plan or top up.');
      openAuthModal('signup');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const objectivesList = learningObjectives
        .split('\n')
        .map((o) => o.trim())
        .filter(Boolean);

      const result = await generateWorksheet({
        subject,
        topic: topic.trim() || 'Core Curriculum Practice',
        gradeLevel,
        difficulty,
        learningObjectives: objectivesList.length > 0 ? objectivesList : undefined,
        activityTypes,
        additionalInstructions,
        sourceMaterial: sourceMaterial.trim() || undefined,
      });

      setWorksheet(result);
      await consumeCredits('WORKSHEET', `Generated Worksheet: ${result.title}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Worksheet generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!worksheet) return;
    saveResourceToStorage({
      id: worksheet.id || `worksheet-${Date.now()}`,
      toolType: 'worksheet',
      title: worksheet.title,
      subject: worksheet.subject || subject,
      topic: worksheet.topic || topic,
      createdAt: new Date().toISOString(),
      data: worksheet,
      sourceSnippet: sourceMaterial ? sourceMaterial.slice(0, 300) : undefined,
      documentName: sourceFileName || undefined,
    });
    setSaved(true);
    if (onSaved) onSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCopy = () => {
    if (!worksheet) return;
    let text = `${worksheet.title.toUpperCase()}\n`;
    text += `Subject: ${worksheet.subject} | Grade Level: ${worksheet.gradeLevel}\n`;
    text += `Estimated Time: ${worksheet.estimatedDurationMinutes} mins | Total Marks: ${worksheet.totalMarks}\n`;
    text += `Instructions: ${worksheet.instructions}\n\n`;

    (worksheet.sections || []).forEach((sec) => {
      text += `--- ${sec.title.toUpperCase()} [${sec.marks} Marks] ---\n`;
      text += `${sec.instructions}\n\n`;
      (sec.items || []).forEach((item, idx) => {
        text += `${idx + 1}. ${item.prompt}\n`;
        if (showSolutions && item.expectedAnswer) {
          text += `   [SOLUTION]: ${item.expectedAnswer}\n`;
        }
      });
      text += `\n`;
    });

    if (showSolutions && worksheet.teacherNotes) {
      text += `TEACHER NOTES & RUBRIC:\n${worksheet.teacherNotes}\n`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8 print:py-0 print:px-0">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5 print:hidden">
        <GlobalNavigationButtons onBack={onBack} onGoHome={onGoHome} />
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E05A2B]/10 text-[#E05A2B] font-mono text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>25 Credits / Worksheet</span>
          </span>
          <span className="font-mono text-xs text-stone-500 uppercase">
            Build • Classroom Tools
          </span>
        </div>
      </div>

      {/* Title block */}
      <div className="space-y-2 print:hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181B] text-white text-xs font-mono font-bold uppercase">
          <FileSpreadsheet className="w-3.5 h-3.5 text-[#E05A2B]" />
          <span>Classroom Exercises</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-stone-900">
          Classroom Mastery Worksheet Generator
        </h1>
        <p className="text-stone-600 text-sm max-w-2xl leading-relaxed">
          Create structured, printable classroom activity sheets with concept matching, fill-in-the-blanks, problem solving, student header fields, and an automated teacher solution key.
        </p>
      </div>

      {/* Configuration Form (Hidden when printing) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6 print:hidden">
        <h2 className="font-display font-black text-lg uppercase tracking-wider text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
          <Sparkles className="w-5 h-5 text-[#E05A2B]" />
          <span>Configure Worksheet Parameters</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
              Subject *
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]"
            >
              <option value="PHYSICAL SCIENCES">Physical Sciences & Physics</option>
              <option value="LIFE SCIENCES">Life Sciences & Biology</option>
              <option value="MATHEMATICS">Mathematics & Geometry</option>
              <option value="AFRICAN HISTORY">African History & Social Sciences</option>
              <option value="GEOGRAPHY">Geography & Climatology</option>
              <option value="BUSINESS STUDIES">Economics & Business Studies</option>
              <option value="ENGLISH & LITERATURE">English & Literary Devices</option>
              <option value="TECHNOLOGY">Digital Literacy & Coding</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
              Worksheet Topic *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Newton's Third Law & Momentum Conservation"
              className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
              Grade Level
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]"
            >
              <option value="Primary School (Grades 4-5)">Primary School (Grades 4-5)</option>
              <option value="Junior Secondary / Middle School (Grades 6-8)">Junior Secondary (Grades 6-8)</option>
              <option value="Senior Secondary / High School (Grades 9-12)">Senior Secondary (Grades 9-12)</option>
              <option value="Undergraduate Level">Undergraduate Level</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
              Difficulty Tier
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]"
            >
              <option value="Foundational">Foundational (Accessible Reinforcement)</option>
              <option value="Intermediate">Intermediate (Core Grade Competency)</option>
              <option value="Challenging">Challenging (Critical Thinking & Extension)</option>
            </select>
          </div>
        </div>

        {/* Activity Types selector */}
        <div className="space-y-2">
          <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
            Included Activity Sections
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'matching', label: 'Matching Definitions' },
              { id: 'fill-in-blanks', label: 'Fill-in-Blanks' },
              { id: 'structured-questions', label: 'Structured Questions' },
              { id: 'critical-thinking', label: 'Critical Inquiry' },
            ].map((act) => {
              const active = activityTypes.includes(act.id);
              return (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => toggleActivityType(act.id)}
                  className={`p-3 rounded-xl text-xs font-display font-bold uppercase tracking-wider text-center border transition-all cursor-pointer ${
                    active
                      ? 'bg-[#18181B] text-white border-[#18181B]'
                      : 'bg-[#FAF8F5] text-stone-600 border-stone-200 hover:border-stone-400'
                  }`}
                >
                  {act.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Learning objectives (Optional) */}
        <div className="space-y-1.5">
          <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
            Key Learning Outcomes (Optional, one per line)
          </label>
          <textarea
            rows={2}
            value={learningObjectives}
            onChange={(e) => setLearningObjectives(e.target.value)}
            placeholder="e.g. State the relationship between action and reaction forces;&#10;Calculate momentum in isolated systems."
            className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A2B]"
          />
        </div>

        {/* Source Material Upload */}
        <div className="space-y-2">
          <label className="font-display font-bold text-xs uppercase tracking-wider text-stone-700">
            Source Material / Textbook Passages (Optional)
          </label>
          <SourceMaterialUpload
            sourceMaterial={sourceMaterial}
            sourceFileName={sourceFileName}
            onTextExtracted={(text, filename) => {
              setSourceMaterial(text);
              if (filename) setSourceFileName(filename);
            }}
            onClear={() => {
              setSourceMaterial('');
              setSourceFileName('');
            }}
          />
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-4 rounded-2xl bg-[#E05A2B] hover:bg-[#c94d22] text-white font-display font-black text-sm uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Building Classroom Worksheet...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Worksheet (25 Credits)</span>
            </>
          )}
        </button>
      </div>

      {/* Worksheet Output Sheet */}
      {worksheet && (
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-stone-200 shadow-sm print:hidden">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSolutions(!showSolutions)}
                className={`px-4 py-2 rounded-xl text-xs font-display font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  showSolutions
                    ? 'bg-[#18181B] text-white shadow-sm'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                }`}
              >
                {showSolutions ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showSolutions ? 'Hide Teacher Solutions' : 'Show Teacher Solutions'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-display font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-display font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Worksheet</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-[#E05A2B] hover:bg-[#c94d22] text-white text-xs font-display font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                {saved ? <CheckCircle2 className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                <span>{saved ? 'Saved' : 'Save Worksheet'}</span>
              </button>
            </div>
          </div>

          {/* Printable Classroom Sheet */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-300 shadow-md space-y-8 print:border-none print:shadow-none print:p-0">
            {/* Student Header Fillable Box */}
            <div className="border border-stone-800 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono font-bold uppercase text-stone-900">
              <div className="border-b border-stone-400 pb-1">NAME: </div>
              <div className="border-b border-stone-400 pb-1">DATE: </div>
              <div className="border-b border-stone-400 pb-1">CLASS / GRADE: </div>
              <div className="border-b border-stone-400 pb-1">SCORE: ______ / {worksheet.totalMarks}</div>
            </div>

            {/* Header Title */}
            <div className="text-center space-y-1 border-b border-stone-200 pb-5">
              <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-stone-900">
                {worksheet.title}
              </h2>
              <div className="font-mono text-xs text-stone-600 font-bold uppercase">
                {worksheet.subject} • {worksheet.gradeLevel} • {worksheet.estimatedDurationMinutes} MINS • {worksheet.totalMarks} MARKS
              </div>
              {worksheet.instructions && (
                <p className="text-xs text-stone-700 italic pt-2 max-w-xl mx-auto">
                  {worksheet.instructions}
                </p>
              )}
            </div>

            {/* Sections */}
            <div className="space-y-8">
              {(worksheet.sections || []).map((section, sIdx) => (
                <div key={section.id || sIdx} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-1.5">
                    <h3 className="font-display font-black text-base sm:text-lg uppercase text-stone-900">
                      {section.title}
                    </h3>
                    <span className="font-mono text-xs font-bold text-stone-700">
                      [{section.marks} Marks]
                    </span>
                  </div>
                  {section.instructions && (
                    <p className="text-xs text-stone-600 italic">
                      {section.instructions}
                    </p>
                  )}

                  <div className="space-y-4 pt-1">
                    {(section.items || []).map((item, idx) => (
                      <div key={item.id || idx} className="space-y-2 text-sm text-stone-900">
                        <div className="flex items-start gap-3">
                          <span className="font-mono font-bold text-xs text-stone-600 shrink-0">
                            {idx + 1}.
                          </span>
                          <span className="leading-relaxed font-medium">
                            {item.prompt}
                          </span>
                        </div>

                        {/* Blank answer writing space for student printout */}
                        <div className="pl-6 print:block">
                          <div className="h-7 border-b border-stone-300 border-dashed w-full max-w-xl" />
                        </div>

                        {/* Teacher Solution (Toggled) */}
                        {showSolutions && item.expectedAnswer && (
                          <div className="ml-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-medium animate-fadeIn">
                            <strong>Solution:</strong> {item.expectedAnswer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Teacher Notes & Rubric (Visible when solutions toggled) */}
            {showSolutions && worksheet.teacherNotes && (
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="font-display font-black text-xs uppercase tracking-wider text-amber-900">
                  Teacher Facilitation & Solution Notes
                </div>
                <p className="text-xs text-amber-950 leading-relaxed font-medium">
                  {worksheet.teacherNotes}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
