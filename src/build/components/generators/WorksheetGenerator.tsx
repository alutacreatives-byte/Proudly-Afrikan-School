import React, { useState } from 'react';
import { 
  Layers, 
  Sparkles, 
  Printer, 
  Copy, 
  Bookmark, 
  Check, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  GraduationCap,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { WorksheetResource, WorksheetSection, WorksheetItem } from '../../types';
import { SUBJECT_CATEGORIES, GRADE_LEVELS, DIFFICULTY_LEVELS, WORKSHEET_PAGE_OPTIONS } from '../../data/subjects';
import { SourceMaterialUpload } from '../SourceMaterialUpload';
import { saveResourceToStorage } from '../../utils/storage';
import { useAuthCredit } from '../../../context/AuthCreditContext';

interface WorksheetGeneratorProps {
  onBack: () => void;
  onSaved?: () => void;
  existingResource?: WorksheetResource;
}

export const WorksheetGenerator: React.FC<WorksheetGeneratorProps> = ({
  onBack,
  onSaved,
  existingResource,
}) => {
  const { consumeCredits, openAuthModal, user } = useAuthCredit();

  // Form State
  const [subject, setSubject] = useState<string>(existingResource?.subject || 'Sciences & STEM');
  const [topic, setTopic] = useState<string>(existingResource?.topic || 'Photosynthesis & Ecosystem Energy Flow');
  const [gradeLevel, setGradeLevel] = useState<string>(existingResource?.gradeLevel || 'Junior Secondary / Middle School (Grades 6-8)');
  const [difficulty, setDifficulty] = useState<string>(existingResource?.difficulty || 'Intermediate');
  const [pagesCount, setPagesCount] = useState<number>(existingResource?.pagesCount || 2);
  const [totalMarks, setTotalMarks] = useState<number>(existingResource?.totalMarks || 30);
  const [durationMinutes, setDurationMinutes] = useState<number>(existingResource?.estimatedDurationMinutes || 45);
  const [activityTypes, setActivityTypes] = useState<string[]>([
    'matching',
    'fill-in-blanks',
    'structured-questions',
    'critical-thinking',
  ]);
  const [additionalInstructions, setAdditionalInstructions] = useState<string>(existingResource?.instructions || '');
  const [sourceMaterial, setSourceMaterial] = useState<string>(existingResource?.sourceMaterial || '');
  const [sourceFileName, setSourceFileName] = useState<string>(existingResource?.sourceDocName || '');

  // UI States
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [worksheet, setWorksheet] = useState<WorksheetResource | null>(existingResource || null);
  const [showAnswerKey, setShowAnswerKey] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCategoryObj = SUBJECT_CATEGORIES.find(c => c.name === subject) || SUBJECT_CATEGORIES[0];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please provide a worksheet topic or unit name.');
      return;
    }

    const creditCheck = await consumeCredits('WORKSHEET', `Generated Worksheet: ${topic.slice(0, 30)}`);
    if (!creditCheck.success) {
      if (!user) {
        openAuthModal();
      } else {
        setError(creditCheck.error || 'Insufficient credits. Please upgrade or refill credits.');
      }
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate/worksheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          topic,
          gradeLevel,
          difficulty,
          pagesCount,
          totalMarks,
          estimatedDurationMinutes: durationMinutes,
          activityTypes,
          additionalInstructions,
          sourceMaterial,
          sourceDocName: sourceFileName,
        }),
      });

      const json = await response.json();
      if (json.success && json.data) {
        const generatedWorksheet: WorksheetResource = {
          ...json.data,
          toolType: 'worksheet',
          pagesCount: pagesCount || 2,
          sourceDocName: sourceFileName,
        };
        setWorksheet(generatedWorksheet);
        saveResourceToStorage(generatedWorksheet);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        throw new Error(json.error || 'Failed to generate worksheet.');
      }
    } catch (err: any) {
      console.error('Worksheet Generation Error:', err);
      setError(err.message || 'An error occurred while building the worksheet.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!worksheet) return;
    saveResourceToStorage(worksheet);
    setSaved(true);
    if (onSaved) onSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCopy = () => {
    if (!worksheet) return;
    let fullText = `PROUDLY AFRIKAN EDUCATION\n`;
    fullText += `${worksheet.title.toUpperCase()}\n`;
    fullText += `Subject: ${worksheet.subject} | Grade: ${worksheet.gradeLevel} | Pages: ${worksheet.pagesCount} | Total Marks: ${worksheet.totalMarks} | Time: ${worksheet.estimatedDurationMinutes} Mins\n\n`;
    fullText += `STUDENT NAME: ____________________  DATE: __________  CLASS: __________\n\n`;
    fullText += `INSTRUCTIONS: ${worksheet.instructions}\n\n`;

    worksheet.sections.forEach((sec) => {
      fullText += `========================================\n`;
      fullText += `${sec.title.toUpperCase()} [${sec.marks} Marks]\n`;
      fullText += `${sec.instructions}\n\n`;
      sec.items.forEach((item, idx) => {
        fullText += `${idx + 1}. ${item.prompt}\n`;
        fullText += `   _________________________________________________________________\n\n`;
      });
    });

    if (showAnswerKey) {
      fullText += `========================================\n`;
      fullText += `TEACHER ANSWER KEY & SOLUTIONS\n`;
      fullText += `========================================\n\n`;
      worksheet.sections.forEach((sec) => {
        fullText += `[${sec.title}]\n`;
        sec.items.forEach((item, idx) => {
          fullText += `Q${idx + 1}: Expected Answer: ${item.expectedAnswer || item.answerKey || 'See notes'}\n`;
          if (item.explanation) fullText += `   Explanation: ${item.explanation}\n`;
        });
        fullText += `\n`;
      });
    }

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleActivity = (act: string) => {
    if (activityTypes.includes(act)) {
      if (activityTypes.length > 1) {
        setActivityTypes(activityTypes.filter(a => a !== act));
      }
    } else {
      setActivityTypes([...activityTypes, act]);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Breadcrumb Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-white hover:bg-stone-50 border border-[#E5E0D8] rounded-full text-xs font-mono font-bold uppercase tracking-wider text-[#161616] flex items-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Build
        </button>

        <div className="px-4 py-1.5 bg-[#161616] text-white rounded-full text-[11px] font-mono font-bold uppercase tracking-widest shadow-xs">
          Tool 02: Worksheet Generator
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form */}
        <div className="lg:col-span-5 bg-white border border-[#E5E0D8] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center gap-3.5 pb-2">
            <div className="w-11 h-11 rounded-2xl bg-[#161616] text-[#D92B8A] flex items-center justify-center shadow-xs shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl tracking-tight text-[#161616] uppercase">
                Build A Worksheet
              </h2>
              <p className="font-mono text-xs text-stone-600">
                Printable activities with solutions
              </p>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold tracking-wider text-[#161616] uppercase mb-1.5">
                Subject Category *
              </label>
              <select
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  const found = SUBJECT_CATEGORIES.find(c => c.name === e.target.value);
                  if (found && found.subtopics[0]) {
                    setTopic(found.subtopics[0]);
                  }
                }}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-sans text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
              >
                {SUBJECT_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold tracking-wider text-[#161616] uppercase mb-1.5">
                Worksheet Topic *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Cellular Respiration & ATP Cycle"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-sans text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
                required
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {selectedCategoryObj.subtopics.slice(0, 3).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setTopic(st)}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border transition-all ${
                      topic === st
                        ? 'bg-[#161616] text-white border-[#161616]'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border-stone-200'
                    }`}
                  >
                    {st.length > 25 ? `${st.slice(0, 25)}...` : st}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono font-bold tracking-wider text-[#161616] uppercase mb-1.5">
                  Grade Level
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-sans text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
                >
                  {GRADE_LEVELS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold tracking-wider text-[#161616] uppercase mb-1.5">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-sans text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
                >
                  {DIFFICULTY_LEVELS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Metric Inputs: Number of Pages (1 to 10), Marks, Mins */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div>
                <label className="block text-[11px] font-mono font-bold tracking-wider text-[#161616] uppercase mb-1 text-center">
                  Pages *
                </label>
                <select
                  value={pagesCount}
                  onChange={(e) => setPagesCount(Number(e.target.value))}
                  className="w-full py-2 px-1 text-center bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono font-bold text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
                >
                  {WORKSHEET_PAGE_OPTIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold tracking-wider text-[#161616] uppercase mb-1 text-center">
                  Total Marks
                </label>
                <input
                  type="number"
                  min={10}
                  max={100}
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(Number(e.target.value))}
                  className="w-full py-2 px-1 text-center bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono font-bold text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold tracking-wider text-[#161616] uppercase mb-1 text-center">
                  Duration (Min)
                </label>
                <input
                  type="number"
                  min={15}
                  max={120}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full py-2 px-1 text-center bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono font-bold text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
                />
              </div>
            </div>

            {/* Activity Format Pills */}
            <div>
              <label className="block text-xs font-mono font-bold tracking-wider text-[#161616] uppercase mb-1.5">
                Activity Types
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'matching', label: 'Matching' },
                  { id: 'fill-in-blanks', label: 'Fill in Blanks' },
                  { id: 'structured-questions', label: 'Short Questions' },
                  { id: 'critical-thinking', label: 'Critical Inquiry' },
                  { id: 'diagram-analysis', label: 'Diagram/Data' },
                ].map((act) => {
                  const active = activityTypes.includes(act.id);
                  return (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => toggleActivity(act.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-sans font-semibold border transition-all cursor-pointer ${
                        active
                          ? 'bg-[#161616] text-white border-[#161616]'
                          : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border-stone-300'
                      }`}
                    >
                      {act.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold tracking-wider text-[#161616] uppercase mb-1.5">
                Custom Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                placeholder="e.g. Include a case study on renewable energy in Africa..."
                className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-sans text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#D92B8A] resize-none"
              />
            </div>

            <SourceMaterialUpload
              label="Source Material"
              optionalTag="OPTIONAL"
              currentFileName={sourceFileName}
              onTextExtracted={(text, name) => {
                setSourceMaterial(text);
                setSourceFileName(name);
              }}
              onClear={() => {
                setSourceMaterial('');
                setSourceFileName('');
              }}
            />

            {error && (
              <p className="text-xs text-red-600 font-sans p-2 rounded-xl bg-red-50 border border-red-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#D92B8A] to-[#E05A2B] hover:from-[#c22079] hover:to-[#cb4e22] text-white font-display font-black text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Worksheet...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Build Worksheet ↗</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Preview */}
        <div className="lg:col-span-7 space-y-4">
          {worksheet ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1 print:hidden">
                <button
                  type="button"
                  onClick={() => setShowAnswerKey(!showAnswerKey)}
                  className="px-4 py-2 rounded-full bg-[#161616] hover:bg-stone-800 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  {showAnswerKey ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-[#D92B8A]" />
                      Hide Teacher Solutions
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-[#D92B8A]" />
                      Show Teacher Solutions
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3.5 py-2 rounded-full bg-white hover:bg-stone-50 border border-stone-300 text-[#161616] font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-3.5 py-2 rounded-full bg-white hover:bg-stone-50 border border-stone-300 text-[#161616] font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-[#D92B8A] to-[#E05A2B] hover:from-[#c22079] hover:to-[#cb4e22] text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    {saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                    {saved ? 'Saved' : 'Save to My Builds ↗'}
                  </button>
                </div>
              </div>

              {/* Printable Worksheet Card */}
              <div className="bg-white border border-[#E5E0D8] rounded-3xl p-7 sm:p-10 shadow-sm space-y-7 print:border-none print:shadow-none print:p-0">
                <div className="text-center space-y-2.5 pb-2 border-b border-stone-200 pb-5">
                  <p className="text-xs font-mono font-black uppercase tracking-[0.2em] text-[#D92B8A]">
                    PROUDLY AFRIKAN ACADEMIC WORKSHEET
                  </p>
                  <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#161616] leading-tight">
                    {worksheet.title.replace(/^Interactive Worksheet:\s*/i, '')}
                  </h1>

                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <span className="px-3 py-1 bg-stone-100 border border-stone-200 rounded-full text-xs font-sans font-bold text-stone-800">
                      Subject: {worksheet.subject}
                    </span>
                    <span className="px-3 py-1 bg-stone-100 border border-stone-200 rounded-full text-xs font-sans font-bold text-stone-800">
                      Grade: {worksheet.gradeLevel}
                    </span>
                    <span className="px-3 py-1 bg-pink-50 border border-pink-200 text-[#D92B8A] rounded-full text-xs font-mono font-bold">
                      Marks: {worksheet.totalMarks}
                    </span>
                    <span className="px-3 py-1 bg-stone-100 border border-stone-200 rounded-full text-xs font-mono font-bold text-stone-800">
                      Pages: {worksheet.pagesCount || pagesCount}
                    </span>
                    <span className="px-3 py-1 bg-stone-100 border border-stone-200 rounded-full text-xs font-mono font-bold text-stone-800">
                      Time: ~{worksheet.estimatedDurationMinutes} Mins
                    </span>
                  </div>
                </div>

                <div className="bg-[#FAF7F0] border border-[#E5E0D8] rounded-2xl p-4 text-xs font-mono text-stone-800">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-bold mb-2">
                    <div>NAME: <span className="font-normal text-stone-400">_____________________</span></div>
                    <div>DATE: <span className="font-normal text-stone-400">___________</span></div>
                    <div>CLASS: <span className="font-normal text-stone-400">___________</span></div>
                  </div>
                  <p className="text-stone-600 font-sans pt-1 border-t border-stone-200">
                    <strong>Instructions:</strong> {worksheet.instructions}
                  </p>
                </div>

                {/* Worksheet Activities */}
                <div className="space-y-6">
                  {worksheet.sections.map((sec, sIdx) => (
                    <div key={sec.id || sIdx} className="space-y-3">
                      <div className="bg-[#FAF7F0] border border-[#E5E0D8] rounded-2xl p-3.5 flex items-center justify-between">
                        <div>
                          <h3 className="font-display font-black text-sm uppercase tracking-wide text-[#161616]">
                            {sec.title}
                          </h3>
                          <p className="font-sans text-xs text-stone-600 mt-0.5">
                            {sec.instructions}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-white border border-stone-300 rounded-xl text-xs font-mono font-bold text-[#161616] shrink-0">
                          [{sec.marks} Marks]
                        </span>
                      </div>

                      <div className="space-y-3 pl-1">
                        {sec.items.map((item, iIdx) => (
                          <div 
                            key={item.id || iIdx}
                            className="bg-white border border-stone-200 rounded-2xl p-4 space-y-2.5 shadow-2xs"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-[#161616] text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                                {iIdx + 1}
                              </div>
                              <p className="font-sans text-xs sm:text-sm text-[#161616] leading-relaxed">
                                {item.prompt}
                              </p>
                            </div>
                            <div className="border-b border-dashed border-stone-300 py-3 text-stone-300 text-xs font-mono select-none">
                              Answer: ____________________________________________________________________________________
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Answers Placed at End */}
                {showAnswerKey && (
                  <div className="mt-8 pt-6 border-t-2 border-dashed border-stone-300 space-y-4">
                    <div className="bg-[#161616] text-white rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#D92B8A]" />
                        <h4 className="font-display font-black text-sm uppercase tracking-wider">
                          Teacher Solutions & Answer Key
                        </h4>
                      </div>
                      <span className="text-xs font-mono text-stone-400">
                        CONFIDENTIAL
                      </span>
                    </div>

                    <div className="space-y-3">
                      {worksheet.sections.map((sec, sIdx) => (
                        <div key={sIdx} className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2 text-xs font-mono">
                          <p className="font-bold text-[#D92B8A] uppercase">
                            {sec.title}
                          </p>
                          <div className="space-y-2 divide-y divide-stone-200">
                            {sec.items.map((item, iIdx) => (
                              <div key={iIdx} className="pt-2 first:pt-0">
                                <span className="font-bold text-[#161616]">Item {iIdx + 1}: </span>
                                <span className="text-emerald-700 font-medium">{item.expectedAnswer || item.answerKey || 'Expected answer in syllabus.'}</span>
                                {item.explanation && (
                                  <p className="text-stone-500 text-[11px] mt-0.5">Note: {item.explanation}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#E5E0D8] rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm min-h-[500px]">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 text-stone-400 flex items-center justify-center">
                <Layers className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1.5">
                <h3 className="font-display font-black text-lg text-[#161616] uppercase">
                  Worksheet Canvas Preview
                </h3>
                <p className="font-sans text-xs text-stone-500 leading-relaxed">
                  Configure pages (1 to 10), subject, and activity types on the left to build a classroom worksheet with student workspace and teacher solutions.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
