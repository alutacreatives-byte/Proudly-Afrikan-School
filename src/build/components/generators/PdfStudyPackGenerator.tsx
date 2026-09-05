import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  Printer, 
  Copy, 
  Bookmark, 
  Check, 
  ArrowLeft,
  Download,
  BookOpen,
  HelpCircle,
  ListOrdered
} from 'lucide-react';
import { PdfStudyPackData, SavedResource } from '../../types';
import { generatePdfStudyPackApi } from '../../services/buildService';
import { saveResourceToStorage } from '../../utils/storage';
import { SourceMaterialUpload } from '../SourceMaterialUpload';
import { useAuthCredit } from '../../../context/AuthCreditContext';
import { GlobalNavigationButtons } from '../../../components/GlobalNavigationButtons';

interface PdfStudyPackGeneratorProps {
  onBack: () => void;
  onGoHome?: () => void;
  initialResource?: SavedResource | null;
}

export const PdfStudyPackGenerator: React.FC<PdfStudyPackGeneratorProps> = ({
  onBack,
  onGoHome,
  initialResource,
}) => {
  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Form State
  const [sourceMaterial, setSourceMaterial] = useState<string>(initialResource?.sourceSnippet || '');
  const [sourceFileName, setSourceFileName] = useState<string>(initialResource?.documentName || '');

  // Active Result State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [result, setResult] = useState<PdfStudyPackData | null>(initialResource?.data || null);
  const [saved, setSaved] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialResource?.data) {
      setResult(initialResource.data);
    }
  }, [initialResource]);

  const handleGenerate = async () => {
    if (!sourceMaterial.trim()) {
      setError('Please upload a document or paste text to generate the study pack.');
      return;
    }

    if (!canAfford('PDF_STUDY_PACK')) {
      setError('Insufficient credits for PDF Study Pack generation. Please upgrade your plan or top up.');
      openAuthModal('signup');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const data = await generatePdfStudyPackApi({
        documentName: sourceFileName || 'Curriculum Reference Document',
        sourceMaterial: sourceMaterial.trim(),
      });

      setResult(data);
      await consumeCredits('PDF_STUDY_PACK', `Generated Study Pack: ${data.title}`);

      // Smooth scroll to generated study pack
      setTimeout(() => {
        const el = document.getElementById('generated-studypack-result');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Study pack generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    saveResourceToStorage({
      id: result.id || `pack-${Date.now()}`,
      toolType: 'pdf-studypack',
      title: result.title,
      subject: 'Document Synthesis',
      topic: result.title,
      createdAt: new Date().toISOString(),
      data: result,
      sourceSnippet: sourceMaterial ? sourceMaterial.slice(0, 300) : undefined,
      documentName: sourceFileName || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCopy = () => {
    if (!result) return;
    let text = `# ${result.title}\n\n`;
    text += `EXECUTIVE SUMMARY:\n${result.summary}\n\n`;

    (result.keyPillars || []).forEach((pillar, i) => {
      text += `### Pillar ${i + 1}: ${pillar.title}\n${pillar.description}\n`;
      (pillar.bulletPoints || []).forEach((b) => {
        text += `• ${b}\n`;
      });
      text += '\n';
    });

    if (result.vocabularyGlossary && result.vocabularyGlossary.length > 0) {
      text += `GLOSSARY:\n`;
      result.vocabularyGlossary.forEach((v) => {
        text += `• ${v.term}: ${v.definition}\n`;
      });
      text += '\n';
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
                BUILD TOOL 06 • DOCUMENT ANALYSIS
              </span>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-[#161616] uppercase tracking-tight">
                PDF TO STUDY PACK GENERATOR
              </h1>
            </div>
          </div>

          {result && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-base font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
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
                <span>{saved ? 'Saved' : 'Save Study Pack'}</span>
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
                  Document Ingestion
                </h2>
              </div>

              <div>
                <label className="block font-mono text-base font-bold text-stone-800 uppercase mb-2">
                  Upload PDF, DOCX, or Notes *
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

              {sourceMaterial && (
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-base font-mono text-stone-700">
                  <span className="font-bold block text-stone-900 mb-1">Loaded Source Context:</span>
                  <p className="line-clamp-4 text-base">{sourceMaterial}</p>
                </div>
              )}

              {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-base font-mono">
                  {error}
                </div>
              )}

              <button
                type="button"
                disabled={isGenerating || !sourceMaterial.trim()}
                onClick={handleGenerate}
                className="w-full py-4 rounded-xl bg-[#E63956] hover:bg-[#D32F4C] disabled:bg-stone-300 text-white font-display font-black text-base uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-98"
              >
                <Sparkles className="w-5 h-5" />
                <span>{isGenerating ? 'PDF STUDY PACK LOADING…' : 'Synthesize Study Pack →'}</span>
              </button>
            </div>
          </div>

          {/* Right Output */}
          <div className="lg:col-span-8" id="generated-studypack-result">
            {isGenerating ? (
              <div className="min-h-[460px] p-12 rounded-[2rem] bg-white border border-stone-200/90 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#E63956]/10 text-[#E63956] flex items-center justify-center animate-bounce">
                  <FileText className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-black text-2xl text-[#161616] uppercase tracking-tight">
                    PDF STUDY PACK LOADING…
                  </h3>
                  <p className="text-stone-600 text-base font-normal max-w-md">
                    Extracting core pillars, generating executive summary, glossary terms, and discussion questions.
                  </p>
                </div>
              </div>
            ) : result ? (
              <div className="space-y-6">
                
                {/* Study Pack Sheet */}
                <div className="p-8 sm:p-12 rounded-[2rem] bg-white border-2 border-stone-300/80 shadow-[0_15px_40px_rgba(0,0,0,0.06)] space-y-8">
                  
                  {/* Header */}
                  <div className="border-b-2 border-stone-800 pb-6 text-center space-y-2">
                    <span className="font-mono text-base font-black tracking-[0.25em] text-[#E63956] uppercase block">
                      PROUDLY AFRIKAN SCHOOL • EXECUTIVE STUDY PACK
                    </span>
                    <h2 className="font-display font-black text-2xl sm:text-3xl text-stone-900 uppercase tracking-tight">
                      {result.title}
                    </h2>
                    {result.documentName && (
                      <span className="text-base font-mono text-stone-600 block">
                        Source Document: {result.documentName}
                      </span>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                    <strong className="text-stone-900 font-mono text-base uppercase block text-[#E63956]">
                      Executive Curriculum Summary:
                    </strong>
                    <p className="text-stone-800 text-base leading-relaxed font-normal">
                      {result.summary}
                    </p>
                  </div>

                  {/* Key Pillars */}
                  <div className="space-y-4">
                    <h3 className="font-display font-black text-xl text-stone-900 uppercase tracking-wide">
                      Core Academic Pillars
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(result.keyPillars || []).map((pillar, pIdx) => (
                        <div key={pIdx} className="p-5 rounded-2xl border border-stone-200 bg-white space-y-2 shadow-xs">
                          <span className="font-mono text-base font-bold text-[#E63956] block">
                            PILLAR 0{pIdx + 1}
                          </span>
                          <h4 className="font-display font-black text-lg text-stone-900 uppercase">
                            {pillar.title}
                          </h4>
                          <p className="text-stone-700 text-base leading-relaxed">
                            {pillar.description}
                          </p>
                          {pillar.bulletPoints && (
                            <ul className="pt-2 border-t border-stone-100 space-y-1 text-base text-stone-600 list-disc list-inside">
                              {pillar.bulletPoints.map((bp, bIdx) => (
                                <li key={bIdx}>{bp}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Glossary */}
                  {result.vocabularyGlossary && result.vocabularyGlossary.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-display font-black text-xl text-stone-900 uppercase tracking-wide">
                        Key Vocabulary & Terminology
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {result.vocabularyGlossary.map((term, tIdx) => (
                          <div key={tIdx} className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-1 text-base">
                            <strong className="text-stone-900 font-mono uppercase block text-[#E63956]">
                              {term.term}
                            </strong>
                            <p className="text-stone-700 text-base">
                              {term.definition}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Critical Thinking Questions */}
                  {result.criticalThinkingQuestions && result.criticalThinkingQuestions.length > 0 && (
                    <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                      <strong className="text-amber-950 font-mono text-base uppercase block">
                        Discussion & Critical Inquiry Questions:
                      </strong>
                      <ul className="space-y-2 text-base text-amber-900 list-decimal list-inside font-medium">
                        {result.criticalThinkingQuestions.map((q, qIdx) => (
                          <li key={qIdx}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>

              </div>
            ) : (
              <div className="min-h-[460px] p-12 rounded-[2rem] bg-white border border-dashed border-stone-300 flex flex-col items-center justify-center text-center space-y-4 text-stone-500">
                <FileText className="w-12 h-12 text-stone-300" />
                <div className="space-y-1">
                  <h3 className="font-display font-black text-xl text-stone-700 uppercase">
                    No Study Pack Active
                  </h3>
                  <p className="text-base text-stone-500 max-w-sm">
                    Upload a syllabus document, textbook excerpt, or notes on the left to extract an executive study pack.
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
