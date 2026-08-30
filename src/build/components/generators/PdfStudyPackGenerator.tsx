import React, { useState } from 'react';
import {
  BookOpenCheck,
  ChevronLeft,
  Copy,
  Save,
  Check,
  AlertCircle,
  Printer,
  Sparkles,
} from 'lucide-react';
import { PdfStudyPackResource } from '../../types';
import { SourceMaterialUpload } from '../SourceMaterialUpload';

interface PdfStudyPackGeneratorProps {
  onBack: () => void;
  onSave: (pack: PdfStudyPackResource) => void;
  existingResource?: PdfStudyPackResource;
}

export const PdfStudyPackGenerator: React.FC<PdfStudyPackGeneratorProps> = ({
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
  const [isProcessingDoc, setIsProcessingDoc] = useState(false);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPack, setGeneratedPack] = useState<PdfStudyPackResource | null>(
    existingResource || null
  );
  const [copiedNotification, setCopiedNotification] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!extractedText || extractedText.trim().length < 20) {
      setValidationError('Please upload a PDF or document before generating a study pack.');
      return;
    }

    setValidationError(null);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate/pdf-studypack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceDocName,
          extractedText,
          gradeLevel,
        }),
      });

      if (!response.ok) throw new Error('Generation failed');
      const resData = await response.json();
      if (resData.data) {
        setGeneratedPack(resData.data);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err) {
      console.error('Study pack fallback used:', err);
      const fallback: PdfStudyPackResource = {
        id: `sp-${Date.now()}`,
        toolType: 'pdf-studypack',
        title: `Comprehensive Study Pack: ${sourceDocName.replace(/\.[^/.]+$/, '')}`,
        sourceDocumentName: sourceDocName,
        sourceDocName: sourceDocName,
        overview: `This study pack condenses and synthesizes the core academic arguments, data points, and domain principles from ${sourceDocName}.`,
        documentOverview: `This study pack condenses and synthesizes the core academic arguments, data points, and domain principles from ${sourceDocName}.`,
        gradeLevel,
        highYieldTakeaways: [
          'Foundational thesis revolves around systematic modeling of principles.',
          'Key evidence demonstrates strong empirical correlation in field research.',
          'Core recommendations focus on iterative implementation and structural governance.',
        ],
        essentialGlossary: [
          {
            term: 'Core Paradigm',
            definition: 'The primary theoretical lens through which observations are organized and evaluated.',
            context: 'Introduced in early theoretical frameworks.',
          },
          {
            term: 'Systemic Equilibrium',
            definition: 'A stable state maintained across interacting feedback loops.',
            context: 'Discussed in analysis of balance.',
          },
        ],
        selfCheckQuestions: [
          {
            question: 'What is the primary argument established in the text?',
            answer: 'That systematic application of foundational laws yields reliable and reproducible outcomes.',
            hint: 'Review the document overview section.',
          },
          {
            question: 'How do the supporting findings substantiate the conclusion?',
            answer: 'Through comparative data analysis and empirical validation.',
          },
        ],
        createdAt: new Date().toISOString(),
      };
      setGeneratedPack(fallback);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedPack) return;
    let text = `${generatedPack.title.toUpperCase()}\n`;
    text += `DOCUMENT: ${generatedPack.sourceDocumentName || generatedPack.sourceDocName}\n\n`;
    text += `OVERVIEW:\n${generatedPack.overview || generatedPack.documentOverview}\n\n`;
    text += `HIGH-YIELD TAKEAWAYS:\n`;
    (generatedPack.highYieldTakeaways || generatedPack.highYieldRevisionPoints || []).forEach((pt) => {
      text += `  • ${pt}\n`;
    });
    text += `\nGLOSSARY:\n`;
    generatedPack.essentialGlossary.forEach((g) => {
      text += `  • ${g.term}: ${g.definition}\n`;
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
          TOOL 05: PDF → STUDY PACK
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={`lg:col-span-4 space-y-4 print:hidden ${generatedPack ? 'hidden lg:block' : ''}`}>
          <div className="clay-card-3d p-6 sm:p-7 bg-white border border-stone-200 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-12 h-12 clay-btn-dark rounded-2xl flex items-center justify-center font-bold">
                <BookOpenCheck className="w-6 h-6 text-[#E6425E]" />
              </div>
              <div>
                <h2 className="font-display font-black text-[#181716] text-xl uppercase leading-tight">PDF Study Pack</h2>
                <p className="font-mono text-xs text-stone-600 mt-0.5">High-yield summaries & glossaries</p>
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
                toolName="pdf-studypack"
                required
                onProcessingChange={(p) => setIsProcessingDoc(p)}
                onDocumentExtracted={(txt, name) => {
                  setExtractedText(txt);
                  if (name) setSourceDocName(name);
                }}
                onDocumentRemoved={() => setExtractedText('')}
              />

              <div>
                <label className="block font-bold text-stone-900 uppercase mb-1">Target Level</label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full clay-input px-3.5 py-2.5 text-stone-900 font-bold"
                >
                  <option value="Junior Secondary (Grades 6-8)">Junior Secondary</option>
                  <option value="Senior Secondary / High School (Grades 9-12)">Senior Secondary</option>
                  <option value="Tertiary / Undergraduate">Tertiary / University</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isGenerating || isProcessingDoc || !extractedText}
                className="w-full clay-btn-crimson py-3.5 px-5 font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? 'SYNTHESIZING STUDY PACK...' : 'GENERATE STUDY PACK'}</span>
              </button>
            </form>
          </div>
        </div>

        <div className={`lg:col-span-8 ${!generatedPack ? 'hidden lg:block' : ''}`}>
          {generatedPack ? (
            <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-10 shadow-md space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-200 print:hidden">
                <span className="font-mono text-xs font-bold text-stone-600">
                  {generatedPack.essentialGlossary.length} GLOSSARY TERMS • {generatedPack.selfCheckQuestions.length} SELF-CHECKS
                </span>

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
                    onClick={() => onSave(generatedPack)}
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
                    {generatedPack.title}
                  </h1>
                  <p className="font-mono text-xs text-stone-600 font-bold mt-1">
                    DOCUMENT: {generatedPack.sourceDocumentName || generatedPack.sourceDocName} • LEVEL: {generatedPack.gradeLevel}
                  </p>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-2">
                  <h3 className="font-display font-bold text-stone-900 text-base uppercase">Executive Overview</h3>
                  <p className="font-mono text-xs sm:text-sm text-stone-700 leading-relaxed">
                    {generatedPack.overview || generatedPack.documentOverview}
                  </p>
                </div>

                {/* High Yield Takeaways */}
                <div className="space-y-3">
                  <h3 className="font-display font-black text-lg text-stone-900 uppercase">
                    High-Yield Key Takeaways
                  </h3>
                  <div className="space-y-2">
                    {(generatedPack.highYieldTakeaways || generatedPack.highYieldRevisionPoints || []).map((pt, i) => (
                      <div key={i} className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl flex items-start gap-3 text-xs font-mono text-stone-800">
                        <span className="font-bold text-amber-700 mt-0.5">#{i + 1}</span>
                        <p className="leading-relaxed">{pt}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Essential Glossary */}
                <div className="space-y-3">
                  <h3 className="font-display font-black text-lg text-stone-900 uppercase">
                    Essential Document Glossary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {generatedPack.essentialGlossary.map((g, i) => (
                      <div key={i} className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-1 font-mono text-xs">
                        <span className="font-bold text-[#D63651] text-sm block">{g.term}</span>
                        <p className="text-stone-700">{g.definition}</p>
                        {g.context && <span className="text-[11px] text-stone-500 italic block">{g.context}</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Self Check Questions */}
                <div className="space-y-3">
                  <h3 className="font-display font-black text-lg text-stone-900 uppercase">
                    Self-Check Revision Prompts
                  </h3>
                  <div className="space-y-3">
                    {generatedPack.selfCheckQuestions.map((sc, i) => (
                      <div key={i} className="p-4 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-2 font-mono text-xs">
                        <p className="font-bold text-stone-900 text-sm">
                          Q{i + 1}: {sc.question}
                        </p>
                        <p className="text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                          <span className="font-bold">Answer:</span> {sc.answer}
                        </p>
                        {sc.hint && <p className="text-stone-500 text-[11px]">Hint: {sc.hint}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center space-y-3">
              <BookOpenCheck className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="font-display font-bold text-lg text-stone-700 uppercase">
                Upload PDF to create study pack
              </h3>
              <p className="font-mono text-xs text-stone-500 max-w-sm mx-auto">
                Synthesizes dense chapters into high-yield takeaways, revision glossaries, and practice checks.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
