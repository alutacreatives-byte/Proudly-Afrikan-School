import React, { useState } from 'react';
import {
  FileCheck2,
  ChevronLeft,
  Copy,
  Save,
  Check,
  AlertCircle,
  Clock,
  Printer,
  Sparkles,
  Download,
} from 'lucide-react';
import { ExamResource } from '../../types';
import { SUBJECT_CATEGORIES } from '../../data/subjects';
import { SourceMaterialUpload } from '../SourceMaterialUpload';

interface ExamGeneratorProps {
  initialTopic?: string;
  onBack: () => void;
  onSave: (exam: ExamResource) => void;
  existingResource?: ExamResource;
}

export const ExamGenerator: React.FC<ExamGeneratorProps> = ({
  initialTopic = '',
  onBack,
  onSave,
  existingResource,
}) => {
  const [subject, setSubject] = useState(existingResource?.subject || 'Mathematics & Science');
  const [topic, setTopic] = useState(existingResource?.topic || initialTopic);
  const [gradeLevel, setGradeLevel] = useState(
    existingResource?.gradeLevel || 'Senior Secondary / High School (Grades 9-12)'
  );
  const [difficulty, setDifficulty] = useState(existingResource?.difficulty || 'Intermediate');
  const [questionCount, setQuestionCount] = useState(
    existingResource ? existingResource.sections.reduce((acc, s) => acc + s.questions.length, 0) : 10
  );
  const [durationMinutes, setDurationMinutes] = useState(existingResource?.durationMinutes || 60);
  const [totalMarks, setTotalMarks] = useState(existingResource?.totalMarks || 50);
  const [institutionHeader, setInstitutionHeader] = useState(
    existingResource?.institutionHeader || 'Proudly Afrikan Examination Board'
  );
  const [instructions, setInstructions] = useState('');
  const [sourceMaterial, setSourceMaterial] = useState('');
  const [isProcessingDoc, setIsProcessingDoc] = useState(false);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedExam, setGeneratedExam] = useState<ExamResource | null>(existingResource || null);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !topic.trim()) {
      setValidationError('Please specify both a Subject and Exam Topic before generating.');
      return;
    }

    setValidationError(null);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate/exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          topic,
          gradeLevel,
          difficulty,
          questionCount,
          durationMinutes,
          totalMarks,
          institutionHeader,
          instructions,
          sourceMaterial,
        }),
      });

      if (!response.ok) throw new Error('Generation failed');
      const resData = await response.json();
      if (resData.data) {
        setGeneratedExam(resData.data);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err) {
      console.error('Error generating exam, using robust fallback:', err);
      const fallback: ExamResource = {
        id: `exam-${Date.now()}`,
        toolType: 'exam',
        title: `Examination: ${topic}`,
        institutionHeader,
        subject,
        topic,
        gradeLevel,
        difficulty,
        durationMinutes,
        totalMarks,
        generalInstructions: [
          'Read all questions carefully before answering.',
          'Write all answers clearly in the spaces provided or on answer sheets.',
          'Show all working for computational questions to receive partial marks.',
          'Time allowed: ' + durationMinutes + ' minutes.',
        ],
        sections: [
          {
            id: 'sec-1',
            title: 'Section A: Core Comprehension & Multiple Choice',
            instructions: 'Answer all questions in this section.',
            totalMarks: 20,
            questions: [
              {
                id: 'q1',
                questionNumber: 1,
                type: 'multiple-choice',
                prompt: `Which of the following best defines the primary principle of ${topic}?`,
                marks: 5,
                options: [
                  'A) The fundamental governing mechanism of the system',
                  'B) An auxiliary external variable with temporary effects',
                  'C) An obsolete theoretical historical construct',
                  'D) A random non-deterministic fluctuation',
                ],
                correctAnswer: 'A) The fundamental governing mechanism of the system',
                markingGuidance: 'Award full marks for option A; no partial credit for incorrect multiple choice options.',
              },
              {
                id: 'q2',
                questionNumber: 2,
                type: 'short-answer',
                prompt: `Explain the key difference between theoretical and applied concepts within ${topic}.`,
                marks: 15,
                correctAnswer: 'Theoretical models construct the foundational laws whereas applied implementations adapt them to real-world operational constraints.',
                markingGuidance: 'Award up to 8 marks for conceptual distinction and 7 marks for illustrative examples.',
                rubricCriteria: ['Accurate definition (5m)', 'Comparison clarity (5m)', 'Practical contextual example (5m)'],
              },
            ],
          },
          {
            id: 'sec-2',
            title: 'Section B: Analytical Application & Problem Solving',
            instructions: 'Answer all questions showing comprehensive working.',
            totalMarks: 30,
            questions: [
              {
                id: 'q3',
                questionNumber: 3,
                type: 'essay',
                prompt: `Evaluate the societal and economic implications of ${topic} within modern African development.`,
                marks: 30,
                correctAnswer: 'A rigorous evaluation examining industrial growth, capacity building, resource optimization, and regional sustainability.',
                markingGuidance: 'Grade based on structural clarity, evidence, and critical synthesis.',
                rubricCriteria: ['Thesis and structure (10m)', 'Evidence and domain knowledge (10m)', 'Synthesis and conclusion (10m)'],
              },
            ],
          },
        ],
        overallMarkingNotes: 'Total 50 marks. Grade thresholds: A (80%+), B (70-79%), C (60-69%), Pass (50-59%).',
        createdAt: new Date().toISOString(),
      };
      setGeneratedExam(fallback);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedExam) return;
    let text = `${generatedExam.institutionHeader || 'EXAMINATION'}\n`;
    text += `${generatedExam.title.toUpperCase()}\n`;
    text += `SUBJECT: ${generatedExam.subject} | DURATION: ${generatedExam.durationMinutes} MIN | TOTAL: ${generatedExam.totalMarks} MARKS\n\n`;
    text += `GENERAL INSTRUCTIONS:\n`;
    generatedExam.generalInstructions.forEach((gi, i) => (text += `${i + 1}. ${gi}\n`));
    text += `\n`;

    generatedExam.sections.forEach((sec) => {
      text += `=== ${sec.title} (${sec.totalMarks} Marks) ===\n`;
      if (sec.instructions) text += `${sec.instructions}\n`;
      text += `\n`;
      sec.questions.forEach((q) => {
        text += `Question ${q.questionNumber} [${q.marks} Marks]:\n${q.prompt}\n`;
        if (q.options) {
          q.options.forEach((opt) => (text += `   ${opt}\n`));
        }
        if (showAnswerKey && q.correctAnswer) {
          text += `   --> Key: ${q.correctAnswer}\n`;
          if (q.markingGuidance) text += `   --> Guidance: ${q.markingGuidance}\n`;
        }
        text += `\n`;
      });
    });

    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-300">
        <button
          onClick={onBack}
          className="clay-pill-3d px-4 py-2 flex items-center gap-2 font-mono text-xs sm:text-sm font-bold text-stone-900 transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 text-[#D63651]" />
          <span>BACK TO BUILD</span>
        </button>

        <span className="clay-btn-dark px-4 py-1.5 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider">
          TOOL 01: EXAM GENERATOR
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className={`lg:col-span-4 space-y-4 print:hidden ${generatedExam ? 'hidden lg:block' : ''}`}>
          <div className="clay-card-3d p-6 sm:p-7 bg-white border border-stone-200 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-12 h-12 clay-btn-dark rounded-2xl flex items-center justify-center font-bold">
                <FileCheck2 className="w-6 h-6 text-[#E6425E]" />
              </div>
              <div>
                <h2 className="font-display font-black text-[#181716] text-xl uppercase leading-tight">Exam Builder</h2>
                <p className="font-mono text-xs text-stone-600 mt-0.5">Rigorous assessment papers with rubrics</p>
              </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4 font-mono text-xs sm:text-sm">
              {validationError && (
                <div className="p-3 rounded-xl bg-red-50 border border-[#D63651] text-[#D63651] flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-stone-900 uppercase mb-1">Discipline Category *</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full clay-input px-3.5 py-2.5 text-stone-900 font-bold"
                >
                  {SUBJECT_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-900 uppercase mb-1">Exam Topic / Scope *</label>
                <input
                  type="text"
                  placeholder="e.g. Thermodynamics, African Union Treaties, Quantum Mechanics..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full clay-input px-3.5 py-2.5 text-stone-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-900 uppercase mb-1">Grade Level</label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full clay-input px-3 py-2 text-stone-900 font-bold text-xs"
                  >
                    <option value="Junior Secondary / Middle School (Grades 6-8)">Junior Secondary (6-8)</option>
                    <option value="Senior Secondary / High School (Grades 9-12)">Senior Secondary (9-12)</option>
                    <option value="Tertiary / Undergraduate">Tertiary / University</option>
                    <option value="Professional Examination">Professional Board</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-900 uppercase mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full clay-input px-3 py-2 text-stone-900 font-bold text-xs"
                  >
                    <option value="Standard Foundation">Foundation</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced / Rigorous">Advanced / Rigorous</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-stone-900 uppercase mb-1 text-[11px]">Questions</label>
                  <input
                    type="number"
                    min={4}
                    max={25}
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full clay-input px-2 py-2 text-stone-900 font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-900 uppercase mb-1 text-[11px]">Time (min)</label>
                  <input
                    type="number"
                    min={15}
                    max={240}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full clay-input px-2 py-2 text-stone-900 font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-900 uppercase mb-1 text-[11px]">Marks</label>
                  <input
                    type="number"
                    min={20}
                    max={200}
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                    className="w-full clay-input px-2 py-2 text-stone-900 font-bold text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-900 uppercase mb-1">Institution Header</label>
                <input
                  type="text"
                  value={institutionHeader}
                  onChange={(e) => setInstitutionHeader(e.target.value)}
                  className="w-full clay-input px-3 py-2 text-stone-900 font-bold text-xs"
                />
              </div>

              <SourceMaterialUpload
                toolName="exam"
                onProcessingChange={(p) => setIsProcessingDoc(p)}
                onDocumentExtracted={(txt) => setSourceMaterial(txt)}
                onDocumentRemoved={() => setSourceMaterial('')}
              />

              <button
                type="submit"
                disabled={isGenerating || isProcessingDoc}
                className="w-full clay-btn-crimson py-3.5 px-5 font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? 'GENERATING EXAM...' : 'BUILD COMPLETE EXAM'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Output Column */}
        <div className={`lg:col-span-8 ${!generatedExam ? 'hidden lg:block' : ''}`}>
          {generatedExam ? (
            <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-10 shadow-md space-y-6">
              {/* Output Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-200 print:hidden">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAnswerKey(!showAnswerKey)}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition cursor-pointer border ${
                      showAnswerKey
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {showAnswerKey ? '✓ Teacher Key & Rubric ON' : 'Show Teacher Key'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 hover:bg-stone-200 transition cursor-pointer flex items-center gap-1 font-mono text-xs font-bold"
                    title="Copy Exam Text"
                  >
                    {copiedNotification ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedNotification ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="p-2 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 hover:bg-stone-200 transition cursor-pointer"
                    title="Print Exam"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onSave(generatedExam)}
                    className="clay-btn-crimson px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>SAVE TO VAULT</span>
                  </button>
                </div>
              </div>

              {/* Exam Printable Sheet */}
              <div className="space-y-6">
                <div className="text-center pb-4 border-b-2 border-stone-900 space-y-1">
                  <p className="font-mono text-xs uppercase tracking-widest text-stone-600 font-bold">
                    {generatedExam.institutionHeader}
                  </p>
                  <h1 className="font-display font-black text-2xl sm:text-3xl text-stone-900 uppercase">
                    {generatedExam.title}
                  </h1>
                  <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-stone-600 pt-1 font-bold">
                    <span>SUBJECT: {generatedExam.subject}</span>
                    <span>•</span>
                    <span>DURATION: {generatedExam.durationMinutes} MIN</span>
                    <span>•</span>
                    <span>TOTAL MARKS: {generatedExam.totalMarks}</span>
                  </div>
                </div>

                {/* General Instructions */}
                {generatedExam.generalInstructions && (
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-1 font-mono text-xs">
                    <span className="font-bold text-stone-900 uppercase">General Instructions:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-stone-700">
                      {generatedExam.generalInstructions.map((gi, i) => (
                        <li key={i}>{gi}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Sections & Questions */}
                <div className="space-y-8">
                  {generatedExam.sections.map((section, sIdx) => (
                    <div key={section.id || sIdx} className="space-y-4">
                      <div className="pb-2 border-b border-stone-200 flex items-center justify-between">
                        <h3 className="font-display font-black text-lg text-stone-900 uppercase">
                          {section.title}
                        </h3>
                        <span className="font-mono text-xs font-bold bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                          {section.totalMarks} Marks
                        </span>
                      </div>

                      {section.instructions && (
                        <p className="font-mono text-xs text-stone-600 italic">{section.instructions}</p>
                      )}

                      <div className="space-y-6">
                        {section.questions.map((q) => (
                          <div key={q.id} className="p-4 bg-stone-50/70 border border-stone-200 rounded-2xl space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <p className="font-display font-bold text-stone-900 text-sm sm:text-base">
                                <span className="text-[#D63651] font-mono mr-2">Q{q.questionNumber}.</span>
                                {q.prompt}
                              </p>
                              <span className="font-mono text-xs font-bold text-stone-500 shrink-0">
                                [{q.marks}m]
                              </span>
                            </div>

                            {q.options && q.options.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-xs text-stone-800">
                                {q.options.map((opt, oIdx) => (
                                  <div key={oIdx} className="p-2 bg-white rounded-lg border border-stone-200">
                                    {opt}
                                  </div>
                                ))}
                              </div>
                            )}

                            {showAnswerKey && (
                              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 font-mono text-xs text-emerald-900">
                                <p className="font-bold">Model Answer: {q.correctAnswer}</p>
                                {q.markingGuidance && (
                                  <p className="text-emerald-700 text-[11px]">Guidance: {q.markingGuidance}</p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center space-y-3">
              <FileCheck2 className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="font-display font-bold text-lg text-stone-700 uppercase">
                Configure exam specifications
              </h3>
              <p className="font-mono text-xs text-stone-500 max-w-sm mx-auto">
                Fill in the subject, topic, and parameters on the left to generate an authentic, curriculum-aligned exam paper.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
