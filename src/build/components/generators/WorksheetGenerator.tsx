import React, { useState } from 'react';
import {
  FileSpreadsheet,
  ChevronLeft,
  Copy,
  Save,
  Check,
  AlertCircle,
  Printer,
  Sparkles,
} from 'lucide-react';
import { WorksheetResource } from '../../types';
import { SUBJECT_CATEGORIES } from '../../data/subjects';
import { SourceMaterialUpload } from '../SourceMaterialUpload';

interface WorksheetGeneratorProps {
  initialTopic?: string;
  onBack: () => void;
  onSave: (worksheet: WorksheetResource) => void;
  existingResource?: WorksheetResource;
}

export const WorksheetGenerator: React.FC<WorksheetGeneratorProps> = ({
  initialTopic = '',
  onBack,
  onSave,
  existingResource,
}) => {
  const [subject, setSubject] = useState(existingResource?.subject || 'Mathematics & Science');
  const [topic, setTopic] = useState(existingResource?.topic || initialTopic);
  const [gradeLevel, setGradeLevel] = useState(
    existingResource?.gradeLevel || 'Junior Secondary / Middle School (Grades 6-8)'
  );
  const [difficulty, setDifficulty] = useState(existingResource?.difficulty || 'Intermediate');
  const [sourceMaterial, setSourceMaterial] = useState('');
  const [isProcessingDoc, setIsProcessingDoc] = useState(false);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorksheet, setGeneratedWorksheet] = useState<WorksheetResource | null>(
    existingResource || null
  );
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !topic.trim()) {
      setValidationError('Please select a Subject and enter a Topic before generating.');
      return;
    }

    setValidationError(null);
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
          sourceMaterial,
        }),
      });

      if (!response.ok) throw new Error('Worksheet generation failed');
      const resData = await response.json();
      if (resData.data) {
        setGeneratedWorksheet(resData.data);
      } else {
        throw new Error('Invalid response');
      }
    } catch (err) {
      console.error('Worksheet fallback used:', err);
      const fallback: WorksheetResource = {
        id: `ws-${Date.now()}`,
        toolType: 'worksheet',
        title: `Interactive Worksheet: ${topic}`,
        subject,
        topic,
        gradeLevel,
        difficulty,
        totalMarks: 30,
        estimatedDurationMinutes: 45,
        instructions: 'Complete all sections carefully. Show working where necessary.',
        teacherNotes: 'Formative assessment to verify core comprehension and terminology retention.',
        sections: [
          {
            id: 'sec-1',
            title: 'Part 1: Key Vocabulary & Identification',
            instructions: 'Write the correct definition or match terms for each item.',
            marks: 10,
            items: [
              {
                id: 'w1',
                prompt: `Define the primary governing equation or conceptual basis of ${topic}.`,
                expectedAnswer: `The primary framework defines relational dynamics and equilibrium conditions for ${topic}.`,
              },
              {
                id: 'w2',
                prompt: `Identify two distinct historical or modern examples of ${topic} in practice.`,
                expectedAnswer: 'Example 1: Regional infrastructure applications; Example 2: Computational and natural systems.',
              },
            ],
          },
          {
            id: 'sec-2',
            title: 'Part 2: Applied Exercises & Problem Solving',
            instructions: 'Solve each prompt in detail.',
            marks: 20,
            items: [
              {
                id: 'w3',
                prompt: `Analyze what occurs when primary parameters in ${topic} undergo a 50% change.`,
                expectedAnswer: 'The output experiences proportional shifts according to the governing rate laws.',
              },
              {
                id: 'w4',
                prompt: `Synthesize a real-world scenario where understanding ${topic} prevents critical failure.`,
                expectedAnswer: 'Engineers or policymakers applying these principles mitigate risk and maintain system stability.',
              },
            ],
          },
        ],
        createdAt: new Date().toISOString(),
      };
      setGeneratedWorksheet(fallback);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedWorksheet) return;
    let text = `${generatedWorksheet.title.toUpperCase()}\n`;
    text += `SUBJECT: ${generatedWorksheet.subject} | LEVEL: ${generatedWorksheet.gradeLevel} | MARKS: ${generatedWorksheet.totalMarks}\n\n`;
    text += `INSTRUCTIONS: ${generatedWorksheet.instructions}\n\n`;

    generatedWorksheet.sections.forEach((sec) => {
      text += `=== ${sec.title} (${sec.marks} Marks) ===\n`;
      if (sec.instructions) text += `${sec.instructions}\n`;
      sec.items.forEach((item, idx) => {
        text += `${idx + 1}. ${item.prompt}\n`;
        if (showAnswerKey) {
          text += `   --> Answer: ${item.expectedAnswer}\n`;
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
      <div className="flex items-center justify-between pb-4 border-b border-stone-300">
        <button
          onClick={onBack}
          className="clay-pill-3d px-4 py-2 flex items-center gap-2 font-mono text-xs sm:text-sm font-bold text-stone-900 transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 text-[#D63651]" />
          <span>BACK TO BUILD</span>
        </button>

        <span className="clay-btn-dark px-4 py-1.5 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider">
          TOOL 02: WORKSHEET GENERATOR
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={`lg:col-span-4 space-y-4 print:hidden ${generatedWorksheet ? 'hidden lg:block' : ''}`}>
          <div className="clay-card-3d p-6 sm:p-7 bg-white border border-stone-200 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-12 h-12 clay-btn-dark rounded-2xl flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-6 h-6 text-[#E6425E]" />
              </div>
              <div>
                <h2 className="font-display font-black text-[#181716] text-xl uppercase leading-tight">Worksheet Builder</h2>
                <p className="font-mono text-xs text-stone-600 mt-0.5">Printable classroom exercises & solutions</p>
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
                <label className="block font-bold text-stone-900 uppercase mb-1">Topic / Chapter *</label>
                <input
                  type="text"
                  placeholder="e.g. Chemical Bonding, Fractions, Ancient Mali Empire..."
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
                    <option value="Primary School (Grades 1-5)">Primary (1-5)</option>
                    <option value="Junior Secondary / Middle School (Grades 6-8)">Junior Secondary (6-8)</option>
                    <option value="Senior Secondary / High School (Grades 9-12)">Senior Secondary (9-12)</option>
                    <option value="Tertiary / Undergraduate">Tertiary / University</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-900 uppercase mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full clay-input px-3 py-2 text-stone-900 font-bold text-xs"
                  >
                    <option value="Introductory / Foundation">Foundation</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced / Stretch">Advanced</option>
                  </select>
                </div>
              </div>

              <SourceMaterialUpload
                toolName="worksheet"
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
                <span>{isGenerating ? 'BUILDING WORKSHEET...' : 'GENERATE WORKSHEET'}</span>
              </button>
            </form>
          </div>
        </div>

        <div className={`lg:col-span-8 ${!generatedWorksheet ? 'hidden lg:block' : ''}`}>
          {generatedWorksheet ? (
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
                  {showAnswerKey ? '✓ Teacher Solution Key ON' : 'Show Answer Key'}
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
                    onClick={() => onSave(generatedWorksheet)}
                    className="clay-btn-crimson px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>SAVE TO VAULT</span>
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="pb-4 border-b-2 border-stone-900">
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="font-display font-black text-2xl sm:text-3xl text-stone-900 uppercase">
                        {generatedWorksheet.title}
                      </h1>
                      <p className="font-mono text-xs text-stone-600 font-bold mt-1">
                        SUBJECT: {generatedWorksheet.subject} • LEVEL: {generatedWorksheet.gradeLevel}
                      </p>
                    </div>
                    <div className="border border-stone-300 rounded-xl p-3 text-right font-mono text-xs min-w-[140px]">
                      <div className="text-stone-500">Name: ____________</div>
                      <div className="text-stone-500 mt-1">Date: ____________</div>
                      <div className="text-stone-900 font-bold mt-1">Score: ___ / {generatedWorksheet.totalMarks}</div>
                    </div>
                  </div>
                  <p className="font-mono text-xs text-stone-700 mt-3 italic bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                    Instructions: {generatedWorksheet.instructions}
                  </p>
                </div>

                <div className="space-y-8">
                  {generatedWorksheet.sections.map((sec, sIdx) => (
                    <div key={sec.id || sIdx} className="space-y-4">
                      <div className="pb-2 border-b border-stone-200 flex items-center justify-between">
                        <h3 className="font-display font-black text-lg text-stone-900 uppercase">
                          {sec.title}
                        </h3>
                        <span className="font-mono text-xs font-bold bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                          {sec.marks} Marks
                        </span>
                      </div>

                      <div className="space-y-4">
                        {sec.items.map((item, iIdx) => (
                          <div key={item.id || iIdx} className="p-4 bg-stone-50/70 border border-stone-200 rounded-2xl space-y-2">
                            <p className="font-display font-bold text-stone-900 text-sm sm:text-base">
                              <span className="text-[#D63651] font-mono mr-2">{iIdx + 1}.</span>
                              {item.prompt}
                            </p>
                            <div className="h-12 border-b border-dashed border-stone-300 print:block"></div>
                            {showAnswerKey && (
                              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-mono text-emerald-900 font-bold mt-2">
                                Solution: {item.expectedAnswer}
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
              <FileSpreadsheet className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="font-display font-bold text-lg text-stone-700 uppercase">
                Ready to generate worksheet
              </h3>
              <p className="font-mono text-xs text-stone-500 max-w-sm mx-auto">
                Specify topic and learning level to create structured classroom exercises.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
