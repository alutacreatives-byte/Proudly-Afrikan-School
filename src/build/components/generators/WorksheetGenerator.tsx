import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Sparkles, 
  Printer, 
  Copy, 
  Bookmark, 
  Check, 
  ArrowLeft,
  Download,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Presentation
} from 'lucide-react';
import { WorksheetData, SavedResource } from '../../types';
import { generateWorksheetApi } from '../../services/buildService';
import { saveResourceToStorage } from '../../utils/storage';
import { SourceMaterialUpload } from '../SourceMaterialUpload';
import { exportWorksheetToPdf, exportWorksheetToPptx } from '../../../utils/exportHelpers';
import { useAuthCredit } from '../../../context/AuthCreditContext';
import { GlobalNavigationButtons } from '../../../components/GlobalNavigationButtons';

interface WorksheetGeneratorProps {
  onBack: () => void;
  onGoHome?: () => void;
  initialResource?: SavedResource | null;
}

export const WorksheetGenerator: React.FC<WorksheetGeneratorProps> = ({
  onBack,
  onGoHome,
  initialResource,
}) => {
  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Form State
  const [topic, setTopic] = useState<string>(initialResource?.topic || initialResource?.title || '');
  const [subject, setSubject] = useState<string>(initialResource?.subject || 'Sciences & STEM');
  const [gradeLevel, setGradeLevel] = useState<string>(initialResource?.gradeLevel || 'Junior Secondary (Grades 6-8)');
  const [itemCount, setItemCount] = useState<number>(8);
  const [includeAnswerKey, setIncludeAnswerKey] = useState<boolean>(true);
  const [sourceMaterial, setSourceMaterial] = useState<string>(initialResource?.sourceSnippet || '');
  const [sourceFileName, setSourceFileName] = useState<string>(initialResource?.documentName || '');

  // Active Result State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [result, setResult] = useState<WorksheetData | null>(initialResource?.data || null);
  const [showAnswerKey, setShowAnswerKey] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [isExportingPptx, setIsExportingPptx] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialResource?.data) {
      setResult(initialResource.data);
    }
  }, [initialResource]);

  const handleGenerate = async () => {
    if (!topic.trim() && !sourceMaterial.trim()) {
      setError('Please enter a worksheet topic or attach course notes.');
      return;
    }

    if (!canAfford('EXAM_WORKSHEET')) {
      setError('Insufficient credits for Worksheet generation. Please upgrade your plan or top up.');
      openAuthModal('signup');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const data = await generateWorksheetApi({
        subject,
        topic: topic.trim() || 'Classroom Practice Worksheet',
        gradeLevel,
        itemCount,
        includeAnswerKey,
        sourceMaterial: sourceMaterial.trim() || undefined,
      });

      setResult(data);
      await consumeCredits('EXAM_WORKSHEET', `Generated Worksheet: ${data.title}`);

      // Smooth scroll to generated worksheet
      setTimeout(() => {
        const el = document.getElementById('generated-worksheet-result');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Worksheet generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    saveResourceToStorage({
      id: result.id || `worksheet-${Date.now()}`,
      toolType: 'worksheet',
      title: result.title,
      subject: result.subject || subject,
      topic: result.topic || topic,
      gradeLevel: result.gradeLevel || gradeLevel,
      createdAt: new Date().toISOString(),
      data: result,
      sourceSnippet: sourceMaterial ? sourceMaterial.slice(0, 300) : undefined,
      documentName: sourceFileName || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDownloadPdf = () => {
    if (!result) return;
    try {
      setIsExportingPdf(true);
      exportWorksheetToPdf(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadPptx = async () => {
    if (!result) return;
    try {
      setIsExportingPptx(true);
      await exportWorksheetToPptx(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExportingPptx(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    let text = `# ${result.title}\nSubject: ${result.subject} | Grade: ${result.gradeLevel}\n\n`;
    if (result.objectives && result.objectives.length > 0) {
      text += `OBJECTIVES:\n${result.objectives.map((o) => `• ${o}`).join('\n')}\n\n`;
    }

    (result.exercises || []).forEach((ex, idx) => {
      text += `### Activity ${idx + 1}: ${ex.title}\n${ex.instructions}\n\n`;
      (ex.items || []).forEach((item, i) => {
        text += `${i + 1}. ${item.prompt}\n`;
      });
      text += '\n';
    });

    if (result.answerKey && result.answerKey.length > 0) {
      text += `\n=== ANSWER KEY ===\n`;
      result.answerKey.forEach((k) => {
        text += `${k.exerciseTitle}:\n${(k.answers || []).map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\n`;
      });
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200/80">
          <div className="flex items-center gap-3">
            <GlobalNavigationButtons onBack={onBack} onGoHome={onGoHome} />
            <div>
              <span className="font-mono text-base font-bold text-[#E63956] uppercase tracking-wider block">
                BUILD TOOL 03 • PRACTICE & EXERCISES
              </span>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-[#161616] uppercase tracking-tight">
                WORKSHEET GENERATOR
              </h1>
            </div>
          </div>

          {result && (
            <div className="flex items-center gap-2 flex-wrap">
              {/* PDF Download */}
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
                className="px-4 py-2.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-base font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#E63956]" />
                <span>{isExportingPdf ? 'Saving PDF...' : 'Download PDF'}</span>
              </button>

              {/* PPTX Download */}
              <button
                type="button"
                onClick={handleDownloadPptx}
                disabled={isExportingPptx}
                className="px-4 py-2.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-base font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Presentation className="w-4 h-4 text-orange-600" />
                <span>{isExportingPptx ? 'Saving PPTX...' : 'Download PPTX'}</span>
              </button>

              {/* Toggle Answer Key */}
              <button
                type="button"
                onClick={() => setShowAnswerKey(!showAnswerKey)}
                className={`px-4 py-2.5 rounded-xl border font-mono text-base font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer ${
                  showAnswerKey 
                    ? 'bg-emerald-600 text-white border-emerald-600' 
                    : 'bg-white border-stone-200 text-stone-800 hover:bg-stone-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{showAnswerKey ? 'Show Blank Worksheet' : 'Show Answer Key'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-base font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-base font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2.5 rounded-xl bg-[#E63956] hover:bg-[#D32F4C] text-white font-mono text-base font-bold uppercase flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Bookmark className="w-4 h-4" />
                <span>{saved ? 'Saved' : 'Save Worksheet'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Form */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 sm:p-7 rounded-[2rem] bg-white border border-stone-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.05)] space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                <Sparkles className="w-5 h-5 text-[#E63956]" />
                <h2 className="font-display font-black text-lg uppercase text-[#161616] tracking-wider">
                  Worksheet Config
                </h2>
              </div>

              <div>
                <label className="block font-mono text-base font-bold text-stone-800 uppercase mb-2">
                  Topic / Concept Focus *
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Photosynthesis & Cellular Respiration"
                  className="w-full px-4 py-3.5 rounded-xl border border-stone-200 focus:border-[#E63956] focus:ring-1 focus:ring-[#E63956] bg-stone-50 text-base font-medium outline-hidden"
                />
              </div>

              <div>
                <label className="block font-mono text-base font-bold text-stone-800 uppercase mb-2">
                  Subject Domain
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-stone-200 focus:border-[#E63956] bg-stone-50 text-base font-medium outline-hidden"
                >
                  <option value="Sciences & STEM">Sciences & STEM</option>
                  <option value="History & Geography">History & Geography</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Languages & Literature">Languages & Literature</option>
                  <option value="Civics & Economics">Civics & Economics</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-base font-bold text-stone-800 uppercase mb-2">
                    Target Grade
                  </label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-stone-200 focus:border-[#E63956] bg-stone-50 text-base font-medium outline-hidden"
                  >
                    <option value="Primary / Elementary (Grades 1-5)">Primary (1-5)</option>
                    <option value="Junior Secondary (Grades 6-8)">Junior Sec (6-8)</option>
                    <option value="Senior Secondary (Grades 9-12)">Senior Sec (9-12)</option>
                    <option value="Tertiary / College">College / Tertiary</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-base font-bold text-stone-800 uppercase mb-2">
                    Item Count
                  </label>
                  <select
                    value={itemCount}
                    onChange={(e) => setItemCount(Number(e.target.value))}
                    className="w-full px-3 py-3 rounded-xl border border-stone-200 focus:border-[#E63956] bg-stone-50 text-base font-medium outline-hidden"
                  >
                    <option value={6}>6 Items (Quick)</option>
                    <option value={8}>8 Items (Standard)</option>
                    <option value={12}>12 Items (Extended)</option>
                    <option value={16}>16 Items (Full Unit)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-base font-bold text-stone-800 uppercase mb-2">
                  Optional Source Material (PDF / DOC)
                </label>
                <SourceMaterialUpload
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
              </div>

              {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-base font-mono">
                  {error}
                </div>
              )}

              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerate}
                className="w-full py-4 rounded-xl bg-[#E63956] hover:bg-[#D32F4C] disabled:bg-stone-300 text-white font-display font-black text-base uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-98"
              >
                <Sparkles className="w-5 h-5" />
                <span>{isGenerating ? 'WORKSHEET LOADING…' : 'Generate Worksheet →'}</span>
              </button>
            </div>
          </div>

          {/* Right Output */}
          <div className="lg:col-span-8" id="generated-worksheet-result">
            {isGenerating ? (
              <div className="min-h-[460px] p-12 rounded-[2rem] bg-white border border-stone-200/90 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#E63956]/10 text-[#E63956] flex items-center justify-center animate-bounce">
                  <Layers className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-black text-2xl text-[#161616] uppercase tracking-tight">
                    WORKSHEET LOADING…
                  </h3>
                  <p className="text-stone-600 text-base font-normal max-w-md">
                    Crafting student exercises, fill-in-blanks, practice challenges, and answer keys.
                  </p>
                </div>
              </div>
            ) : result ? (
              <div className="space-y-6">
                
                {/* Worksheet Sheet Paper */}
                <div className="p-8 sm:p-12 rounded-[2rem] bg-white border-2 border-stone-300/80 shadow-[0_15px_40px_rgba(0,0,0,0.06)] space-y-8">
                  
                  {/* Header */}
                  <div className="border-b-2 border-stone-800 pb-6 text-center space-y-2">
                    <span className="font-mono text-base font-black tracking-[0.25em] text-[#E63956] uppercase block">
                      PROUDLY AFRIKAN SCHOOL • CLASSROOM WORKSHEET
                    </span>
                    <h2 className="font-display font-black text-2xl sm:text-3xl text-stone-900 uppercase tracking-tight">
                      {result.title}
                    </h2>
                    
                    <div className="flex flex-wrap items-center justify-center gap-4 text-base font-mono text-stone-700 pt-2">
                      <span><strong>SUBJECT:</strong> {result.subject}</span>
                      <span>•</span>
                      <span><strong>GRADE:</strong> {result.gradeLevel}</span>
                      <span>•</span>
                      <span><strong>TIME:</strong> {result.estimatedMinutes} MIN</span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-stone-200 flex flex-col sm:flex-row justify-between text-base font-mono text-stone-600">
                      <span>STUDENT NAME: ____________________________</span>
                      <span>DATE: _______________</span>
                    </div>
                  </div>

                  {/* Objectives */}
                  {result.objectives && result.objectives.length > 0 && (
                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-base text-stone-800 space-y-1">
                      <strong className="block text-stone-900 font-mono uppercase text-base">Key Learning Objectives:</strong>
                      <ul className="list-disc list-inside space-y-1 pl-1">
                        {result.objectives.map((obj, i) => (
                          <li key={i}>{obj}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Exercises */}
                  <div className="space-y-8">
                    {(result.exercises || []).map((ex, exIdx) => (
                      <div key={exIdx} className="space-y-4">
                        <div className="bg-stone-100 p-3 rounded-xl flex items-center justify-between">
                          <h3 className="font-display font-black text-lg text-stone-900 uppercase tracking-wide">
                            Activity {exIdx + 1}: {ex.title}
                          </h3>
                        </div>
                        {ex.instructions && (
                          <p className="text-stone-700 text-base italic font-serif">
                            {ex.instructions}
                          </p>
                        )}

                        <div className="space-y-4 pt-1">
                          {(ex.items || []).map((item, itIdx) => (
                            <div key={itIdx} className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-3">
                              <p className="text-stone-900 text-base sm:text-lg font-medium leading-relaxed">
                                <strong>{itIdx + 1}.</strong> {item.prompt}
                              </p>

                              {/* Blank lines for answering */}
                              <div className="border-b border-dashed border-stone-400 pt-6"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Answer Key View */}
                  {showAnswerKey && result.answerKey && (
                    <div className="mt-8 pt-6 border-t-2 border-emerald-500 bg-emerald-50/70 p-6 rounded-2xl space-y-4">
                      <div className="flex items-center gap-2 font-display font-black text-xl text-emerald-950 uppercase tracking-wide">
                        <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                        <span>Teacher Answer Key & Solutions</span>
                      </div>
                      
                      <div className="space-y-4">
                        {result.answerKey.map((key, kIdx) => (
                          <div key={kIdx} className="space-y-1 text-base font-mono">
                            <strong className="text-emerald-900 uppercase block">{key.exerciseTitle}:</strong>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2">
                              {(key.answers || []).map((ans, aIdx) => (
                                <div key={aIdx} className="text-emerald-800">
                                  <span>{aIdx + 1}.</span> {ans}
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
              <div className="min-h-[460px] p-12 rounded-[2rem] bg-white border border-dashed border-stone-300 flex flex-col items-center justify-center text-center space-y-4 text-stone-500">
                <FileSpreadsheet className="w-12 h-12 text-stone-300" />
                <div className="space-y-1">
                  <h3 className="font-display font-black text-xl text-stone-700 uppercase">
                    No Worksheet Active
                  </h3>
                  <p className="text-base text-stone-500 max-w-sm">
                    Configure your practice exercise parameters or upload curriculum notes to generate printable worksheets.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
