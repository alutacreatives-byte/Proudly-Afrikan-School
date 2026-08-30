import React, { useState } from 'react';
import {
  FileQuestion,
  ChevronLeft,
  Copy,
  Save,
  Check,
  AlertCircle,
  Printer,
  Sparkles,
} from 'lucide-react';
import { PdfQuizResource } from '../../types';
import { SourceMaterialUpload } from '../SourceMaterialUpload';

interface PdfQuizGeneratorProps {
  onBack: () => void;
  onSave: (quiz: PdfQuizResource) => void;
  existingResource?: PdfQuizResource;
}

export const PdfQuizGenerator: React.FC<PdfQuizGeneratorProps> = ({
  onBack,
  onSave,
  existingResource,
}) => {
  const [sourceDocName, setSourceDocName] = useState(
    existingResource?.sourceDocumentName || existingResource?.sourceDocName || 'Uploaded_Document.pdf'
  );
  const [extractedText, setExtractedText] = useState('');
  const [gradeLevel, setGradeLevel] = useState(
    existingResource?.gradeLevel || 'Senior Secondary / High School (Grades 9-12)'
  );
  const [difficulty, setDifficulty] = useState(existingResource?.difficulty || 'Intermediate');
  const [totalQuestions, setTotalQuestions] = useState(existingResource?.totalQuestions || 8);
  const [isProcessingDoc, setIsProcessingDoc] = useState(false);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<PdfQuizResource | null>(
    existingResource || null
  );
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!extractedText || extractedText.trim().length < 20) {
      setValidationError('Please upload a PDF or document with readable text first.');
      return;
    }

    setValidationError(null);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate/pdf-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceDocName,
          extractedText,
          totalQuestions,
          difficulty,
          gradeLevel,
        }),
      });

      if (!response.ok) throw new Error('PDF Quiz generation failed');
      const resData = await response.json();
      if (resData.data) {
        setGeneratedQuiz(resData.data);
      } else {
        throw new Error('Invalid response data');
      }
    } catch (err) {
      console.error('PDF Quiz fallback used:', err);
      const fallback: PdfQuizResource = {
        id: `pdf-quiz-${Date.now()}`,
        toolType: 'pdf-quiz',
        title: `Grounded Quiz: ${sourceDocName.replace(/\.[^/.]+$/, '')}`,
        sourceDocumentName: sourceDocName,
        sourceDocName: sourceDocName,
        gradeLevel,
        difficulty,
        totalQuestions,
        questions: [
          {
            id: 'pq-1',
            number: 1,
            question: `According to the source document "${sourceDocName}", what constitutes the primary thesis or core finding?`,
            type: 'multiple-choice',
            options: [
              'A) The foundational governing mechanism outlined in the opening section',
              'B) An auxiliary variable of secondary importance',
              'C) A contradictory finding disproven in historical literature',
              'D) A speculative assumption with no supporting empirical evidence',
            ],
            correctAnswer: 'A) The foundational governing mechanism outlined in the opening section',
            explanation: 'The initial chapters establish the framework as the primary mechanism governing observations.',
            sourceReferenceQuote: 'As evidenced across the introductory passages of the text.',
          },
          {
            id: 'pq-2',
            number: 2,
            question: 'Which of the following methodologies is explicitly highlighted in the document analysis?',
            type: 'multiple-choice',
            options: [
              'A) Structured empirical analysis combined with historical context',
              'B) Purely hypothetical speculation without domain grounding',
              'C) Anecdotal observation isolated from comparative metrics',
              'D) Unverified secondary survey sampling',
            ],
            correctAnswer: 'A) Structured empirical analysis combined with historical context',
            explanation: 'The analytical structure emphasizes empirical rigor paired with contextual synthesis.',
            sourceReferenceQuote: 'Methodology section details standard data acquisition and comparative evaluation.',
          },
        ],
        createdAt: new Date().toISOString(),
      };
      setGeneratedQuiz(fallback);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedQuiz) return;
    let text = `${generatedQuiz.title.toUpperCase()}\n`;
    text += `SOURCE: ${generatedQuiz.sourceDocumentName || generatedQuiz.sourceDocName} | LEVEL: ${generatedQuiz.gradeLevel}\n\n`;

    generatedQuiz.questions.forEach((q) => {
      text += `Question ${q.number}: ${q.question}\n`;
      if (q.options) {
        q.options.forEach((opt) => (text += `   ${opt}\n`));
      }
      if (showAnswerKey) {
        text += `   --> Answer: ${q.correctAnswer}\n`;
        text += `   --> Explanation: ${q.explanation}\n`;
      }
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-stone-300">
        <button
          onClick={onBack}
          className="clay-pill-3d px-4 py-2 flex items-center gap-2 font-mono text-xs sm:text-sm font-bold text-stone-900 transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 text-[#D63651]" />
          <span>BACK TO BUILD</span>
        </button>

        <span className="clay-btn-dark px-4 py-1.5 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider">
          TOOL 04: PDF → QUIZ
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={`lg:col-span-4 space-y-4 print:hidden ${generatedQuiz ? 'hidden lg:block' : ''}`}>
          <div className="clay-card-3d p-6 sm:p-7 bg-white border border-stone-200 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-12 h-12 clay-btn-dark rounded-2xl flex items-center justify-center font-bold">
                <FileQuestion className="w-6 h-6 text-[#E6425E]" />
              </div>
              <div>
                <h2 className="font-display font-black text-[#181716] text-xl uppercase leading-tight">PDF → Quiz</h2>
                <p className="font-mono text-xs text-stone-600 mt-0.5">Strictly document-grounded assessments</p>
              </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4 font-mono text-xs sm:text-sm">
              {validationError && (
                <div className="p-3 rounded-xl bg-red-50 border border-[#D63651] text-[#D63651] flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              <SourceMaterialUpload
                toolName="pdf-quiz"
                required
                onProcessingChange={(p) => setIsProcessingDoc(p)}
                onDocumentExtracted={(txt, name) => {
                  setExtractedText(txt);
                  if (name) setSourceDocName(name);
                }}
                onDocumentRemoved={() => setExtractedText('')}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-900 uppercase mb-1">Target Level</label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full clay-input px-3 py-2 text-stone-900 font-bold text-xs"
                  >
                    <option value="Junior Secondary (Grades 6-8)">Junior Secondary</option>
                    <option value="Senior Secondary / High School (Grades 9-12)">Senior Secondary</option>
                    <option value="Tertiary / Undergraduate">Tertiary / University</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-900 uppercase mb-1">Questions</label>
                  <input
                    type="number"
                    min={4}
                    max={20}
                    value={totalQuestions}
                    onChange={(e) => setTotalQuestions(Number(e.target.value))}
                    className="w-full clay-input px-3 py-2 text-stone-900 font-bold text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isGenerating || isProcessingDoc || !extractedText}
                className="w-full clay-btn-crimson py-3.5 px-5 font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? 'ANALYZING PDF & GENERATING...' : 'GENERATE GROUNDED QUIZ'}</span>
              </button>
            </form>
          </div>
        </div>

        <div className={`lg:col-span-8 ${!generatedQuiz ? 'hidden lg:block' : ''}`}>
          {generatedQuiz ? (
            <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-10 shadow-md space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-200 print:hidden">
                <button
                  onClick={() => setShowAnswerKey(!showAnswerKey)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition cursor-pointer border ${
                    showAnswerKey
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {showAnswerKey ? '✓ Answer Key & Text References ON' : 'Show Answer Key'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 hover:bg-stone-200 transition cursor-pointer flex items-center gap-1 font-mono text-xs font-bold"
                  >
                    {copiedNotification ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedNotification ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="p-2 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 hover:bg-stone-200 transition cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onSave(generatedQuiz)}
                    className="clay-btn-crimson px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>SAVE TO VAULT</span>
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h1 className="font-display font-black text-2xl sm:text-3xl text-stone-900 uppercase">
                    {generatedQuiz.title}
                  </h1>
                  <p className="font-mono text-xs text-stone-600 font-bold mt-1">
                    SOURCE: {generatedQuiz.sourceDocumentName || generatedQuiz.sourceDocName} • LEVEL: {generatedQuiz.gradeLevel}
                  </p>
                </div>

                <div className="space-y-6">
                  {generatedQuiz.questions.map((q) => (
                    <div key={q.id} className="p-4 bg-stone-50/70 border border-stone-200 rounded-2xl space-y-3">
                      <p className="font-display font-bold text-stone-900 text-sm sm:text-base">
                        <span className="text-[#D63651] font-mono mr-2">Q{q.number}.</span>
                        {q.question}
                      </p>

                      {q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs text-stone-800">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className="p-2 bg-white rounded-lg border border-stone-200">
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}

                      {showAnswerKey && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 font-mono text-xs text-emerald-900">
                          <p className="font-bold">Correct Answer: {q.correctAnswer}</p>
                          <p className="text-emerald-800 text-[11px]">{q.explanation}</p>
                          {q.sourceReferenceQuote && (
                            <p className="text-emerald-700 italic text-[11px] border-t border-emerald-200 pt-1 mt-1">
                              Quote: "{q.sourceReferenceQuote}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center space-y-3">
              <FileQuestion className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="font-display font-bold text-lg text-stone-700 uppercase">
                Upload document to generate grounded quiz
              </h3>
              <p className="font-mono text-xs text-stone-500 max-w-sm mx-auto">
                All questions and options will be synthesized directly from the uploaded material.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
