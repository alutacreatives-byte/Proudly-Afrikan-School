import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  Download, 
  ArrowLeft, 
  ArrowRight, 
  FileSpreadsheet, 
  Check,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Presentation as PresentationIcon,
  Printer,
  Edit3,
  Save,
  Eye,
  Layers
} from 'lucide-react';
import { GlobalNavigationButtons } from '../../components/GlobalNavigationButtons';
import { callAIAndParseJson } from '../../study/services/aiService';
import { saveResourceToStorage } from '../utils/storage';
import { SavedResource } from '../types';
import { SourceMaterialUpload } from './SourceMaterialUpload';
import { exportItem, getCleanWorksheetTitle, downloadPresentationHtml } from '../../utils/exportUtils';
import { BuildToolsMenu, BUILD_TOOLS_LIST } from './BuildToolsMenu';
import { useScrollToResult } from '../../utils/useScrollToResult';

interface BuildGeneratorViewProps {
  activeTool: string;
  onSelectTool: (toolId: string) => void;
  onBack: () => void;
  onGoHome?: () => void;
  initialTopic?: string;
  initialResource?: SavedResource | null;
  onResourceSaved?: (resource: SavedResource) => void;
}

function generateClientPresentationFallback(params: {
  topic: string;
  subject: string;
  gradeLevel: string;
  slideCount: number;
  theme: string;
  format: string;
  keyPoints?: string;
}) {
  const { topic, subject, gradeLevel, slideCount, theme, format } = params;
  const count = Math.max(5, Math.min(slideCount || 8, 20));
  const slides = [];

  // Slide 1: Title
  slides.push({
    id: 's-1',
    slideNumber: 1,
    slideType: 'title',
    title: topic.toUpperCase(),
    subtitle: `${format} • Curriculum Level: ${gradeLevel}`,
    bulletPoints: [
      `Foundational exploration and critical inquiry into ${topic}.`,
      `Pedagogical framework designed for ${gradeLevel} learners.`,
      `Contextualized through African scholarship and empirical analysis.`
    ],
    suggestedVisualOrDiagram: `Hero title layout featuring an authentic archival map or diagram representing ${topic}.`,
    discussionOrEngagementPrompt: `Hook question: What prior knowledge or everyday assumptions do we bring to our study of ${topic}?`,
    speakerNotes: `Welcome the group. Establish the lesson objectives, framing ${topic} not as isolated facts, but as an interconnected conceptual inquiry.`
  });

  // Slide 2: Roadmap & Core Inquiries
  slides.push({
    id: 's-2',
    slideNumber: 2,
    slideType: 'roadmap',
    title: 'INQUIRY ROADMAP & KEY OBJECTIVES',
    subtitle: 'What We Will Discover & Analyze',
    bulletPoints: [
      `Deconstruct core mechanisms and theoretical definitions of ${topic}.`,
      `Analyze historical and contemporary evidence across authentic case contexts.`,
      `Engage in collaborative inquiry and hands-on conceptual evaluation.`,
      `Formulate synthesized conclusions applicable to examination and real-world dilemmas.`
    ],
    suggestedVisualOrDiagram: 'Four-stage chronological or concept flow diagram illustrating the learning pathway.',
    discussionOrEngagementPrompt: 'Which of these inquiry questions seems most challenging or unexpected to you?',
    speakerNotes: 'Walk students through the roadmap so they understand the mental model and progression of ideas today.'
  });

  // Middle slides
  const middleCount = Math.max(1, count - 3);
  const slideTemplates = [
    {
      type: 'concept',
      title: `FOUNDATIONAL PRINCIPLES OF ${topic.toUpperCase()}`,
      sub: 'Core Definitions & Governing Principles',
      bullets: [
        `Primary theoretical framework establishes how key variables interact within ${topic}.`,
        `Direct observation demonstrates clear cause-and-effect relationships.`,
        `Scholarly consensus highlights the systemic nature of these foundational processes.`
      ],
      visual: `High-resolution infographic contrasting the primary definitions and key components of ${topic}.`,
      prompt: `In your own words, how would you distinguish between the primary mechanism and secondary influences here?`,
      notes: `Emphasize precise terminology. Model how to construct a concise scholarly definition without oversimplification.`
    },
    {
      type: 'deep-dive',
      title: `STRUCTURAL MECHANICS & PROCESS ANALYSIS`,
      sub: 'How the System Functions in Practice',
      bullets: [
        `Step 1: Baseline conditions and input parameters that initiate the phenomenon.`,
        `Step 2: Dynamic interactions, reactions, and intermediate states.`,
        `Step 3: Measurable outputs, structural transformations, and long-term equilibrium.`
      ],
      visual: 'Detailed cyclic flowchart or annotated structural blueprint demonstrating operational dynamics.',
      prompt: 'If one of the foundational input variables were altered by 50%, what cascading consequences would you anticipate?',
      notes: 'Encourage learners to trace each step logically rather than jumping straight to the conclusion.'
    },
    {
      type: 'case-study',
      title: `AUTHENTIC EVIDENCE & CASE APPLICATION`,
      sub: 'Empirical Verification in the African Context',
      bullets: [
        `Fieldwork data and primary records demonstrating concrete manifestations of ${topic}.`,
        `Comparative analysis between regional applications and international benchmarks.`,
        `Critical examination of variables that accelerate or constrain expected outcomes.`
      ],
      visual: 'Comparative data table or annotated geographic map highlighting regional case studies and historical evidence.',
      prompt: 'How does examining authentic regional evidence challenge generalized textbook assumptions?',
      notes: 'Highlight local and continental agency. Ask students to cite specific evidence from the case study.'
    },
    {
      type: 'comparison',
      title: `COMPARATIVE ANALYSIS & CRITICAL DEBATE`,
      sub: 'Contrasting Perspectives & Competing Models',
      bullets: [
        `Perspective A: Focuses on materialist and deterministic structural drivers.`,
        `Perspective B: Emphasizes human agency, cultural paradigms, and environmental adaptation.`,
        `Synthesis: Modern scholarship integrates both frameworks for a holistic understanding.`
      ],
      visual: 'Side-by-side split screen visual contrasting two major perspectives with evidence callouts.',
      prompt: 'Which argument presents more resilient empirical evidence? Defend your position.',
      notes: 'Facilitate a structured 3-minute mini-debate. Ensure students cite reasoning rather than mere opinion.'
    },
    {
      type: 'activity',
      title: `COLLABORATIVE INQUIRY & PROBLEM SOLVING`,
      sub: 'Classroom Application Exercise',
      bullets: [
        `Pair-share prompt: Apply the principles learned to solve an authentic scenario dilemma.`,
        `Document your working step-by-step using standard analytical notation.`,
        `Prepare to present your solution framework and defend key diagnostic assumptions.`
      ],
      visual: 'Scenario challenge briefing box with time indicator and step-by-step rubric checklist.',
      prompt: 'Work with your partner: What is your primary intervention strategy and how will you evaluate success?',
      notes: 'Circulate around the classroom. Provide differentiated hints to groups needing scaffolding.'
    }
  ];

  for (let i = 0; i < middleCount; i++) {
    const tmpl = slideTemplates[i % slideTemplates.length];
    slides.push({
      id: `s-${slides.length + 1}`,
      slideNumber: slides.length + 1,
      slideType: tmpl.type,
      title: tmpl.title,
      subtitle: tmpl.sub,
      bulletPoints: tmpl.bullets,
      suggestedVisualOrDiagram: tmpl.visual,
      discussionOrEngagementPrompt: tmpl.prompt,
      speakerNotes: tmpl.notes
    });
  }

  // Final Slide: Summary & Exit Ticket
  slides.push({
    id: `s-${slides.length + 1}`,
    slideNumber: slides.length + 1,
    slideType: 'summary',
    title: 'SYNTHESIS & CRITICAL TAKEAWAYS',
    subtitle: 'Consolidating Core Concepts & Next Steps',
    bulletPoints: [
      `Key Takeaway 1: ${topic} represents a cohesive system governed by verifiable principles.`,
      `Key Takeaway 2: Empirical evidence confirms significant real-world and historical impact.`,
      `Key Takeaway 3: Critical thinking requires interrogating both assumptions and evidence.`,
      `Exit Challenge: Formulate one evaluative question connecting today's learning to future lessons.`
    ],
    suggestedVisualOrDiagram: 'Visual summary icon grid capturing the central pillars of the lesson with an Exit Ticket badge.',
    discussionOrEngagementPrompt: 'Exit reflection: What is the single most important concept from today that shifts your thinking?',
    speakerNotes: 'Conclude the presentation. Collect exit tickets or student reflections. Assign targeted review readings.'
  });

  return {
    title: `Presentation: ${topic.toUpperCase()}`,
    subtitle: `${format} Masterclass Deck`,
    subject,
    topic,
    gradeLevel,
    targetAudience: gradeLevel,
    themeOrColorMood: theme,
    presentationStyle: format,
    slidesCount: slides.length,
    slides,
    speakerGuideOverview: `Comprehensive ${slides.length}-slide instructional presentation deck on ${topic}, crafted for ${gradeLevel} instruction.`
  };
}

export const BuildGeneratorView: React.FC<BuildGeneratorViewProps> = ({
  activeTool,
  onSelectTool,
  onBack,
  onGoHome,
  initialTopic = '',
  initialResource,
  onResourceSaved,
}) => {
  const [topicInput, setTopicInput] = useState<string>(initialResource?.topic || initialTopic || '');
  const [gradeLevel, setGradeLevel] = useState<string>('Grade 10-12');
  const [sourceText, setSourceText] = useState<string>('');
  const [sourceFileName, setSourceFileName] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number>(activeTool === 'lessonplan' ? 60 : 10);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<any | null>(initialResource?.data || null);
  const [showWorksheetAnswers, setShowWorksheetAnswers] = useState<boolean>(false);
  const [worksheetStudentInputs, setWorksheetStudentInputs] = useState<Record<string, string>>({});

  // Presentation-specific states
  const [presentationSlideCount, setPresentationSlideCount] = useState<number>(8);
  const [presentationTheme, setPresentationTheme] = useState<string>('African Earth & Ochre');
  const [presentationFormat, setPresentationFormat] = useState<string>('Educational Lecture & Discussion');
  const [presentationKeyPoints, setPresentationKeyPoints] = useState<string>('');
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [isFullscreenPresentation, setIsFullscreenPresentation] = useState<boolean>(false);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState<boolean>(true);
  const [isEditingSlide, setIsEditingSlide] = useState<boolean>(false);
  const [editSlideData, setEditSlideData] = useState<{
    title: string;
    subtitle: string;
    bullets: string;
    visualCue: string;
    discussionPrompt: string;
    speakerNotes: string;
  }>({
    title: '',
    subtitle: '',
    bullets: '',
    visualCue: '',
    discussionPrompt: '',
    speakerNotes: '',
  });

  const handleStudentInputChange = (id: string, value: string) => {
    setWorksheetStudentInputs((prev) => ({ ...prev, [id]: value }));
  };

  const resultRef = useScrollToResult(generatedResult, isGenerating);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTool]);

  useEffect(() => {
    if (initialTopic) {
      setTopicInput(initialTopic);
    }
  }, [initialTopic]);

  useEffect(() => {
    if (initialResource?.data) {
      setGeneratedResult(initialResource.data);
      if (initialResource.topic) setTopicInput(initialResource.topic);
    }
  }, [initialResource]);

  // Adjust default count if tool switched to lessonplan
  useEffect(() => {
    if (activeTool === 'lessonplan' && (questionCount < 30 || questionCount > 180)) {
      setQuestionCount(60);
    } else if (activeTool !== 'lessonplan' && (questionCount > 25 || questionCount < 5)) {
      setQuestionCount(10);
    }
  }, [activeTool]);

  // Keep slide edit fields in sync when active slide changes
  useEffect(() => {
    if (generatedResult?.slides && generatedResult.slides[activeSlideIndex]) {
      const s = generatedResult.slides[activeSlideIndex];
      setEditSlideData({
        title: s.title || '',
        subtitle: s.subtitle || '',
        bullets: (s.bulletPoints || s.bullets || []).join('\n'),
        visualCue: s.suggestedVisualOrDiagram || s.visualCue || '',
        discussionPrompt: s.discussionOrEngagementPrompt || '',
        speakerNotes: s.speakerNotes || '',
      });
      setIsEditingSlide(false);
    }
  }, [activeSlideIndex, generatedResult]);

  // Presentation keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isPresentationDeck = activeTool === 'presentation' || Array.isArray(generatedResult?.slides);
      if (!isPresentationDeck || !generatedResult?.slides?.length) return;
      if (isEditingSlide) return;

      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        setActiveSlideIndex((prev) => Math.min(generatedResult.slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setActiveSlideIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Escape') {
        setIsFullscreenPresentation(false);
      } else if (e.key === 'n' || e.key === 'N') {
        setShowSpeakerNotes((prev) => !prev);
      } else if (e.key === 'f' || e.key === 'F') {
        setIsFullscreenPresentation((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTool, generatedResult, isEditingSlide]);

  const currentToolInfo = BUILD_TOOLS_LIST.find((t) => t.id === activeTool) || BUILD_TOOLS_LIST[1];
  const ToolIcon = currentToolInfo.icon;

  const handleGenerate = async () => {
    if (!topicInput.trim() && !sourceText.trim()) {
      setGenerationError('Please enter a topic or upload source material before generating.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    const isLessonPlan = activeTool === 'lessonplan';
    const isWorksheet = activeTool === 'worksheet';
    const isPresentation = activeTool === 'presentation';

    if (isPresentation) {
      try {
        const presentationSubject = (topicInput || sourceFileName || 'Curriculum Subject').trim();
        const res = await fetch('/api/generate/presentation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: presentationSubject,
            topic: topicInput.trim() || presentationSubject,
            audienceLevel: gradeLevel,
            slidesCount: presentationSlideCount,
            presentationStyle: `${presentationFormat} - Theme: ${presentationTheme}`,
            keyPoints: presentationKeyPoints.trim(),
            sourceMaterial: sourceText,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const data = json.data;
            setGeneratedResult(data);
            setActiveSlideIndex(0);
            const newResource: SavedResource = {
              id: 'res-' + Date.now(),
              toolType: 'presentation',
              title: data.title || `Presentation: ${topicInput.trim() || 'Curriculum Subject'}`,
              subject: data.subject || 'Curriculum',
              topic: topicInput || sourceFileName || 'Generated Topic',
              gradeLevel,
              createdAt: new Date().toISOString(),
              data,
            };
            saveResourceToStorage(newResource);
            if (onResourceSaved) onResourceSaved(newResource);
            setIsGenerating(false);
            return;
          }
        }
      } catch (err: any) {
        console.warn('Backend presentation API call failed, generating presentation directly:', err);
      }

      // Robust fallback presentation generator
      const fallbackPresentation = generateClientPresentationFallback({
        topic: topicInput.trim() || 'Curriculum Subject',
        subject: 'Curriculum Studies',
        gradeLevel,
        slideCount: presentationSlideCount,
        theme: presentationTheme,
        format: presentationFormat,
        keyPoints: presentationKeyPoints.trim(),
      });
      setGeneratedResult(fallbackPresentation);
      setActiveSlideIndex(0);
      const newResource: SavedResource = {
        id: 'res-' + Date.now(),
        toolType: 'presentation',
        title: fallbackPresentation.title,
        subject: fallbackPresentation.subject,
        topic: topicInput || 'Curriculum Topic',
        gradeLevel,
        createdAt: new Date().toISOString(),
        data: fallbackPresentation,
      };
      saveResourceToStorage(newResource);
      if (onResourceSaved) onResourceSaved(newResource);
      setIsGenerating(false);
      return;
    }

    let prompt = '';
    if (isLessonPlan) {
      prompt = `Generate a comprehensive pedagogical Lesson Plan for CAPS / African curriculum about "${topicInput || sourceFileName || 'Curriculum Subject'}".
Target Grade Level: ${gradeLevel}.
Lesson Duration: ${questionCount} minutes.
Source Material Excerpt: "${sourceText.substring(0, 1500)}".
Return valid JSON with:
{
  "title": "Lesson Plan: ${topicInput || 'Curriculum Subject'}",
  "subject": "Curriculum / Pedagogy",
  "topic": "${topicInput || 'Core Subject'}",
  "description": "Comprehensive lesson plan featuring structured pedagogical phases, learning outcomes, and assessment strategies.",
  "sections": [
    {"heading": "1. Learning Objectives & Bloom's Taxonomy", "content": "Measurable cognitive and practical learning objectives for this lesson..."},
    {"heading": "2. Hook & Anticipatory Inquiry (10 mins)", "content": "Engaging real-world hook question and activating prior knowledge..."},
    {"heading": "3. Direct Instruction & Concept Modeling (25 mins)", "content": "Key concept breakdown, teacher demonstration, and visual frameworks..."},
    {"heading": "4. Guided & Collaborative Group Practice (15 mins)", "content": "Scaffolded student activities, pair-share exercises, and active problem solving..."},
    {"heading": "5. Formative Assessment & Exit Ticket (10 mins)", "content": "Diagnostic closure check and differentiated extension/support tasks..."}
  ],
  "questions": [
    {
      "question": "Formative Exit Ticket Diagnostic Question on ${topicInput || 'this lesson'}:",
      "options": ["Option A: Accurate core principle demonstration", "Option B: Isolated terminology recall", "Option C: Partial application without reasoning", "Option D: Incorrect assumption"],
      "correctAnswer": "Option A: Accurate core principle demonstration",
      "explanation": "Demonstrates mastery of the lesson's central learning outcome."
    }
  ],
  "answerKey": ["1. Option A"]
}`;
    } else if (isWorksheet) {
      const topicSubjectTitle = (topicInput || sourceFileName || 'Curriculum Subject').trim();
      prompt = `Generate an actual classroom student WORKSHEET (NOT a quiz, NO multiple-choice options) about "${topicSubjectTitle}".
Target Grade Level: ${gradeLevel}.
Activity Count: ${questionCount} exercises/activities.
Source Material Excerpt: "${sourceText.substring(0, 1500)}".

IMPORTANT REQUIREMENTS:
- The worksheet title MUST strictly be the TOPIC / SUBJECT TITLE: "${topicSubjectTitle}" (do NOT prefix with "Worksheet:" or "Interactive Worksheet:").
- This must be an actual printable and interactive student WORKSHEET with diverse activities for students to complete, NOT a quiz!
- DO NOT generate a multiple choice quiz. DO NOT provide options A, B, C, D.
- Include 5 distinct, well-structured student activities:
  1. Vocabulary & Key Terms Match (Column A terms to match with Column B definitions, with write-in bracket).
  2. Fill in the Blanks with a provided Word Bank box.
  3. Structured Conceptual Questions with ruled answer completion lines for students to write explanations.
  4. Practical Scenario & Problem-Solving Application with working space.
  5. Critical Thinking & Reflection Inquiry with space for student response.
- Include a complete Teacher Solutions & Answer Key.

Return valid JSON matching this schema:
{
  "title": "${topicSubjectTitle}",
  "subject": "Curriculum Subject",
  "topic": "${topicSubjectTitle}",
  "gradeLevel": "${gradeLevel}",
  "description": "Comprehensive student classroom worksheet designed for active completion, critical thinking, and concept reinforcement.",
  "instructions": "Read all directions carefully. Complete each activity and write your answers in the designated spaces.",
  "estimatedTimeMinutes": 45,
  "totalMarks": 40,
  "studentHeader": {
    "nameField": "Student Name: ____________________________________",
    "dateField": "Date: ________________________",
    "classField": "Grade / Class: ________________________",
    "scoreField": "Score: _______ / 40"
  },
  "activities": [
    {
      "activityNumber": 1,
      "title": "Activity 1: Vocabulary & Key Terms Match",
      "type": "matching",
      "instructions": "Match each term in Column A with its correct definition in Column B. Write the matching letter in the bracket provided.",
      "items": [
        { "itemNumber": 1, "prompt": "Foundational Concept", "matchTarget": "A. The primary governing framework", "completionSpace": "Write letter: [ _____ ]" },
        { "itemNumber": 2, "prompt": "Operational Mechanism", "matchTarget": "B. Structured procedural process linking inputs to outcomes", "completionSpace": "Write letter: [ _____ ]" },
        { "itemNumber": 3, "prompt": "Practical Application", "matchTarget": "C. Systematic execution in real-world contexts", "completionSpace": "Write letter: [ _____ ]" },
        { "itemNumber": 4, "prompt": "Verification Benchmark", "matchTarget": "D. Measurable criteria confirming accuracy and performance", "completionSpace": "Write letter: [ _____ ]" }
      ]
    },
    {
      "activityNumber": 2,
      "title": "Activity 2: Fill in the Blanks with Word Bank",
      "type": "fill-in-blanks",
      "instructions": "Complete each statement using the appropriate word or phrase from the Word Bank below.",
      "wordBank": ["Mechanism", "Framework", "Empirical", "Application", "Benchmark"],
      "items": [
        { "itemNumber": 1, "prompt": "The primary theoretical ____________________ establishes how concepts interact within this domain.", "completionSpace": "Your Answer: ____________________________________" },
        { "itemNumber": 2, "prompt": "Every observable outcome is driven by an underlying ____________________ that governs cause and effect.", "completionSpace": "Your Answer: ____________________________________" },
        { "itemNumber": 3, "prompt": "Practitioners validate hypotheses through rigorous ____________________ evidence and testing.", "completionSpace": "Your Answer: ____________________________________" }
      ]
    },
    {
      "activityNumber": 3,
      "title": "Activity 3: Structured Conceptual Questions",
      "type": "short-answer",
      "instructions": "Answer each question thoroughly using complete sentences. Explain your reasoning.",
      "items": [
        { "itemNumber": 1, "prompt": "Explain the foundational significance of ${topicInput || 'this concept'} and provide a concrete real-world example.", "completionSpace": "Write your response below:\\n______________________________________________________________________\\n______________________________________________________________________" },
        { "itemNumber": 2, "prompt": "Contrast two primary components or perspectives relevant to ${topicInput || 'this topic'} and explain how they interact.", "completionSpace": "Write your response below:\\n______________________________________________________________________\\n______________________________________________________________________" }
      ]
    },
    {
      "activityNumber": 4,
      "title": "Activity 4: Practical Scenario & Problem-Solving Application",
      "type": "application",
      "instructions": "Read the real-world scenario below and complete the analytical tasks. Show all work and logical reasoning.",
      "scenario": "A community or school initiative requires applying ${topicInput || 'these core concepts'} to resolve a challenging practical dilemma...",
      "items": [
        { "itemNumber": 1, "prompt": "Analyze the scenario and identify the primary variables that must be controlled.", "completionSpace": "Analysis / Working:\\n______________________________________________________________________\\n______________________________________________________________________" },
        { "itemNumber": 2, "prompt": "Formulate a step-by-step action plan to address the situation effectively.", "completionSpace": "Proposed Action Plan:\\n______________________________________________________________________\\n______________________________________________________________________" }
      ]
    },
    {
      "activityNumber": 5,
      "title": "Activity 5: Critical Thinking & Synthesis Reflection",
      "type": "critical-thinking",
      "instructions": "Synthesize what you have learned by addressing the evaluative inquiry prompt below.",
      "items": [
        { "itemNumber": 1, "prompt": "Evaluate how mastery of ${topicInput || 'this topic'} equips individuals to make informed decisions in wider society.", "completionSpace": "Student Reflection:\\n______________________________________________________________________\\n______________________________________________________________________" }
      ]
    }
  ],
  "teacherAnswerKey": [
    { "activityTitle": "Activity 1: Vocabulary & Key Terms Match", "answers": ["1. Foundational Concept -> A", "2. Operational Mechanism -> B", "3. Practical Application -> C", "4. Verification Benchmark -> D"] },
    { "activityTitle": "Activity 2: Fill in the Blanks", "answers": ["1. Framework", "2. Mechanism", "3. Empirical"] },
    { "activityTitle": "Activity 3: Structured Conceptual Questions", "answers": ["1. Exemplar response explaining conceptual mechanisms with authentic domain application.", "2. Model comparison highlighting core distinctions and interconnectedness."] },
    { "activityTitle": "Activity 4: Practical Scenario Application", "answers": ["1. Primary variables include baseline conditions and environmental constraints.", "2. Action plan features diagnostic evaluation, intervention, and verification feedback."] },
    { "activityTitle": "Activity 5: Critical Thinking & Synthesis", "answers": ["1. High-scoring criteria: demonstrates synthesis, real-world context, and coherent argumentation."] }
  ]
}`;
    } else {
      prompt = `Generate a comprehensive ${activeTool} resource about "${topicInput || sourceFileName || 'Curriculum Subject'}".
Target Grade Level: ${gradeLevel}.
Question Count / Items: ${questionCount}.
Source Material Excerpt: "${sourceText.substring(0, 1500)}".
Return valid JSON with:
{
  "title": "Title of the resource",
  "subject": "Subject category",
  "topic": "${topicInput || 'Core Curriculum'}",
  "description": "Brief summary of the generated material",
  "sections": [{"heading": "Section title", "content": "Detailed educational content..."}],
  "questions": [{"question": "Question text...", "options": ["A", "B", "C", "D"], "correctAnswer": "A", "explanation": "Why..."}],
  "answerKey": ["1. A", "2. B"]
}`;
    }

    try {
      const data = await callAIAndParseJson<any>(prompt);
      if (isWorksheet) {
        const topicSubjectTitle = topicInput.trim() || getCleanWorksheetTitle(data.title, data.topic, data.subject);
        data.title = topicSubjectTitle;
        data.topic = topicSubjectTitle;
      }
      setGeneratedResult(data);

      const newResource: SavedResource = {
        id: 'res-' + Date.now(),
        toolType: activeTool,
        title: isWorksheet
          ? (topicInput.trim() || getCleanWorksheetTitle(data.title, data.topic, data.subject))
          : (data.title || `${activeTool.toUpperCase()}: ${topicInput || 'Custom Resource'}`),
        subject: data.subject || 'Curriculum',
        topic: topicInput || sourceFileName || 'Generated Topic',
        createdAt: new Date().toISOString(),
        data,
      };

      saveResourceToStorage(newResource);
      if (onResourceSaved) onResourceSaved(newResource);
    } catch (err: any) {
      let fallbackData: any;
      if (isLessonPlan) {
        fallbackData = {
          title: `Lesson Plan: ${topicInput || 'Curriculum Masterclass'}`,
          subject: 'Educational Pedagogy',
          topic: topicInput || 'Core Subject',
          description: `Pedagogical ${questionCount}-minute lesson plan for ${gradeLevel} students featuring structured phases, Bloom's taxonomy objectives, and formative assessment checks.`,
          sections: [
            { heading: "1. Learning Objectives & Bloom's Taxonomy", content: `By the end of this lesson on ${topicInput || 'the topic'}, learners will be able to analyze foundational concepts, apply problem-solving frameworks, and evaluate authentic case scenarios.` },
            { heading: '2. Hook & Inquiry (10 mins)', content: `Introduce an authentic inquiry prompt connecting ${topicInput || 'the topic'} to real-world applications. Learners engage in a quick pair-share brainstorm.` },
            { heading: '3. Direct Instruction & Guided Modeling (25 mins)', content: `Teacher presents the theoretical framework and demonstrates step-by-step problem solving with guided visual examples.` },
            { heading: '4. Collaborative & Independent Practice (15 mins)', content: `Learners work in small groups on structured problem sets, receiving targeted scaffolding and feedback.` },
            { heading: '5. Formative Assessment & Exit Ticket (10 mins)', content: `Conduct an exit ticket check to verify individual understanding and assign differentiated reinforcement tasks.` }
          ],
          questions: [
            {
              question: `Exit Ticket Diagnostic: Which statement best reflects core mastery of ${topicInput || "today's lesson"}?`,
              options: ['Option A: Accurately explaining the core principle and applying it to a novel problem', 'Option B: Memorizing isolated terminology without understanding context', 'Option C: Skipping foundational definitions', 'Option D: Ignoring practical constraints'],
              correctAnswer: 'Option A: Accurately explaining the core principle and applying it to a novel problem',
              explanation: 'Option A demonstrates conceptual understanding and higher-order application aligned with Bloom\'s taxonomy.'
            }
          ],
          answerKey: ['1. A']
        };
      } else if (isWorksheet) {
        const topicSubjectTitle = topicInput.trim() || 'Curriculum Subject';
        fallbackData = {
          title: topicSubjectTitle,
          subject: 'Educational Studies',
          topic: topicSubjectTitle,
          gradeLevel: gradeLevel,
          description: `Comprehensive student worksheet designed for active classroom completion, critical thinking, and concept reinforcement.`,
          instructions: 'Read all directions carefully. Complete each activity and write your answers in the designated spaces.',
          estimatedTimeMinutes: 45,
          totalMarks: 40,
          studentHeader: {
            nameField: 'Student Name: ____________________________________',
            dateField: 'Date: ________________________',
            classField: 'Grade / Class: ________________________',
            scoreField: 'Score: _______ / 40'
          },
          activities: [
            {
              activityNumber: 1,
              title: 'Activity 1: Vocabulary & Key Terms Match',
              type: 'matching',
              instructions: 'Match each term in Column A with its correct definition in Column B. Write the matching letter in the bracket provided.',
              items: [
                { itemNumber: 1, prompt: `Foundational Principle of ${topicInput || 'the Subject'}`, matchTarget: 'A. The underlying governing rule establishing core operational frameworks.', completionSpace: 'Write letter: [ _____ ]' },
                { itemNumber: 2, prompt: 'Operational Mechanism', matchTarget: 'B. Structured procedural process linking theoretical inputs to observable outcomes.', completionSpace: 'Write letter: [ _____ ]' },
                { itemNumber: 3, prompt: 'Empirical Verification', matchTarget: 'C. Systematic criteria and evidence used to validate real-world results.', completionSpace: 'Write letter: [ _____ ]' },
                { itemNumber: 4, prompt: 'Authentic Application', matchTarget: 'D. Adapting foundational principles to complex real-world challenges.', completionSpace: 'Write letter: [ _____ ]' }
              ]
            },
            {
              activityNumber: 2,
              title: 'Activity 2: Fill in the Blanks with Word Bank',
              type: 'fill-in-blanks',
              instructions: 'Complete each statement using the appropriate term from the Word Bank below.',
              wordBank: ['Mechanism', 'Empirical', 'Framework', 'Application', 'Principles'],
              items: [
                { itemNumber: 1, prompt: `The central theoretical ____________ establishes how concepts interact within this domain.`, completionSpace: 'Your Answer: ____________________________________' },
                { itemNumber: 2, prompt: `Every observable outcome is driven by an underlying ____________ that governs cause and effect.`, completionSpace: 'Your Answer: ____________________________________' },
                { itemNumber: 3, prompt: `Practitioners validate hypotheses through rigorous ____________ evidence and testing.`, completionSpace: 'Your Answer: ____________________________________' },
                { itemNumber: 4, prompt: `Successful real-world ____________ requires adapting core rules to authentic challenges.`, completionSpace: 'Your Answer: ____________________________________' }
              ]
            },
            {
              activityNumber: 3,
              title: 'Activity 3: Structured Conceptual Questions',
              type: 'short-answer',
              instructions: 'Answer each question thoroughly using complete sentences. Explain your reasoning.',
              items: [
                { itemNumber: 1, prompt: `Explain why understanding ${topicInput || 'this topic'} is essential for solving complex challenges in this subject.`, completionSpace: 'Write your response below:\\n______________________________________________________________________\\n______________________________________________________________________' },
                { itemNumber: 2, prompt: `Identify two common misconceptions regarding ${topicInput || 'this topic'} and contrast them with correct conceptual principles.`, completionSpace: 'Write your response below:\\n______________________________________________________________________\\n______________________________________________________________________' }
              ]
            },
            {
              activityNumber: 4,
              title: 'Activity 4: Practical Scenario & Problem-Solving Application',
              type: 'application',
              instructions: 'Read the scenario below and complete the analytical tasks. Show all work and logical deductions.',
              scenario: `A community or academic project needs to implement principles of ${topicInput || 'the subject matter'} to optimize performance and prevent critical errors. You have been asked to analyze the situation and formulate a solution.`,
              items: [
                { itemNumber: 1, prompt: 'Step 1: Identify the primary variables that must be controlled or monitored.', completionSpace: 'Your analysis:\\n______________________________________________________________________\\n______________________________________________________________________' },
                { itemNumber: 2, prompt: 'Step 2: Propose a step-by-step action plan to address the scenario effectively.', completionSpace: 'Your action plan:\\n______________________________________________________________________\\n______________________________________________________________________' }
              ]
            },
            {
              activityNumber: 5,
              title: 'Activity 5: Critical Thinking & Synthesis Reflection',
              type: 'critical-thinking',
              instructions: 'Synthesize what you have learned by completing the reflection inquiry below.',
              items: [
                { itemNumber: 1, prompt: `Evaluate how the core ideas of ${topicInput || 'this topic'} connect to broader themes or contemporary issues in modern society.`, completionSpace: 'Student Reflection:\\n______________________________________________________________________\\n______________________________________________________________________' }
              ]
            }
          ],
          teacherAnswerKey: [
            { activityTitle: 'Activity 1: Vocabulary & Key Terms Match', answers: ['1. Foundational Principle -> A', '2. Operational Mechanism -> B', '3. Empirical Verification -> C', '4. Authentic Application -> D'] },
            { activityTitle: 'Activity 2: Fill in the Blanks', answers: ['1. Framework', '2. Mechanism', '3. Empirical', '4. Application'] },
            { activityTitle: 'Activity 3: Structured Conceptual Questions', answers: ['1. Model Answer: Understanding provides foundational principles that allow learners to predict outcomes and analyze cause-and-effect relationships.', '2. Model Answer: Misconception 1: Concepts operate in isolation. Misconception 2: Memorization equates to conceptual mastery.'] },
            { activityTitle: 'Activity 4: Practical Scenario Application', answers: ['1. Primary variables include initial baseline conditions, operational constraints, and measurement accuracy.', '2. Action plan should feature diagnostic evaluation, targeted intervention, and verification feedback.'] },
            { activityTitle: 'Activity 5: Critical Thinking & Synthesis', answers: ['1. Full marks awarded for linking foundational mechanisms to contemporary societal or technological developments with coherent reasoning.'] }
          ]
        };
      } else {
        fallbackData = {
          title: `${activeTool.toUpperCase()}: ${topicInput || 'Curriculum Masterclass'}`,
          subject: 'Educational Studies',
          topic: topicInput || 'Core Subject',
          description: `Comprehensive ${activeTool} generated for ${gradeLevel} students covering key concepts and applications.`,
          sections: [
            { heading: '1. Core Concepts & Definitions', content: `Fundamental principles regarding ${topicInput || 'the subject matter'} and their theoretical foundation.` },
            { heading: '2. Analysis & Application', content: `Practical methodologies and step-by-step problem-solving frameworks.` }
          ],
          questions: Array.from({ length: Math.min(questionCount, 5) }).map((_, i) => ({
            question: `Sample assessment question #${i + 1} regarding ${topicInput || 'the core topic'}?`,
            options: ['Option A: Primary mechanism', 'Option B: Secondary factor', 'Option C: Alternative hypothesis', 'Option D: Control variable'],
            correctAnswer: 'Option A: Primary mechanism',
            explanation: 'Option A is correct because it directly addresses the governing principle.'
          })),
          answerKey: ['1. A', '2. B', '3. C', '4. D', '5. A']
        };
      }
      setGeneratedResult(fallbackData);
      const fallbackRes: SavedResource = {
        id: 'res-' + Date.now(),
        toolType: activeTool,
        title: fallbackData.title,
        subject: fallbackData.subject,
        topic: topicInput || 'Generated Topic',
        createdAt: new Date().toISOString(),
        data: fallbackData,
      };
      saveResourceToStorage(fallbackRes);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 2. Tool Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200/80">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF7A00] via-[#D09500] to-[#A67A00] text-white flex items-center justify-center shadow-[0_4px_16px_rgba(230,57,86,0.35),inset_0_1px_1px_rgba(255,255,255,0.3)] border border-white/20">
            <ToolIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#FF7A00] uppercase tracking-wider">
                TOOL {currentToolInfo.num} &bull; {currentToolInfo.badge}
              </span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-stone-900">
              {currentToolInfo.title}
            </h1>
          </div>
        </div>

        <GlobalNavigationButtons
          onBack={onBack}
          onGoHome={onGoHome}
          backLabel="Back"
          homeLabel="Home"
        />
      </div>

      {/* 3. Main Stacked Layout: Menu directly ABOVE generation area on mobile, tablet, and desktop */}
      <div className="space-y-8">
        {/* The Tool Menu / Form - Soft UI 3D Design */}
        <div className="w-full">
          <div className="p-6 sm:p-10 rounded-[2.5rem] bg-[#FAF4EC] border border-[#EFE5DA] shadow-[0_2px_10px_rgba(100,80,60,0.04),_0_12px_30px_rgba(100,80,60,0.08),_0_28px_56px_-6px_rgba(100,80,60,0.10),_0_45px_80px_-12px_rgba(100,80,60,0.08)] space-y-6">
            {/* Topic Input */}
            <div className="space-y-2 text-left">
              <label className="block font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider text-stone-600">
                {activeTool === 'presentation'
                  ? 'PRESENTATION TOPIC / LESSON TITLE *'
                  : activeTool === 'lessonplan'
                  ? 'LESSON PLAN TOPIC / SUBJECT TITLE *'
                  : 'TOPIC / SUBJECT TITLE *'}
              </label>
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder={
                  activeTool === 'presentation'
                    ? "e.g. Kingdom of Kush & Meroë Metallurgy"
                    : activeTool === 'lessonplan'
                    ? "e.g. Great Zimbabwe Architecture & Trade"
                    : "e.g. Great Zimbabwe Architecture & Trade"
                }
                className="w-full bg-[#EFE8DE] border border-[#E4DCD0] rounded-2xl p-4 font-mono text-xs sm:text-sm text-stone-900 placeholder-stone-400/80 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.07),_inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-hidden focus:border-[#E62E6B] transition-all"
              />
            </div>

            {/* Grade Level & Item Count / Duration / Slide Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="space-y-2">
                <label className="block font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider text-stone-600">
                  GRADE LEVEL / TARGET AUDIENCE
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full bg-[#EFE8DE] border border-[#E4DCD0] rounded-2xl p-4 font-mono text-xs sm:text-sm text-stone-900 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.07),_inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-hidden focus:border-[#E62E6B] cursor-pointer transition-all"
                >
                  <option value="Grade 8-9">Grade 8-9 (Intermediate)</option>
                  <option value="Grade 10-12">Grade 10-12 (FET / Senior)</option>
                  <option value="Undergraduate">Undergraduate / College</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider text-stone-600">
                  {activeTool === 'presentation'
                    ? 'SLIDE COUNT'
                    : activeTool === 'lessonplan'
                    ? 'LESSON DURATION / PACING'
                    : 'QUESTION / ITEM COUNT'}
                </label>
                {activeTool === 'presentation' ? (
                  <select
                    value={presentationSlideCount}
                    onChange={(e) => setPresentationSlideCount(Number(e.target.value))}
                    className="w-full bg-[#EFE8DE] border border-[#E4DCD0] rounded-2xl p-4 font-mono text-xs sm:text-sm text-stone-900 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.07),_inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-hidden focus:border-[#E62E6B] cursor-pointer transition-all"
                  >
                    <option value={5}>5 Slides (Brief Overview)</option>
                    <option value={8}>8 Slides (Standard Lecture - Recommended)</option>
                    <option value={10}>10 Slides (Comprehensive Masterclass)</option>
                    <option value={12}>12 Slides (Deep-Dive Academic Deck)</option>
                    <option value={15}>15 Slides (Full Unit Course Deck)</option>
                  </select>
                ) : activeTool === 'lessonplan' ? (
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full bg-[#EFE8DE] border border-[#E4DCD0] rounded-2xl p-4 font-mono text-xs sm:text-sm text-stone-900 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.07),_inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-hidden focus:border-[#E62E6B] cursor-pointer transition-all"
                  >
                    <option value={45}>45 Minutes (Single Period)</option>
                    <option value={60}>60 Minutes (Standard Period)</option>
                    <option value={90}>90 Minutes (Block Period)</option>
                    <option value={120}>120 Minutes (Workshop / Double)</option>
                  </select>
                ) : (
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full bg-[#EFE8DE] border border-[#E4DCD0] rounded-2xl p-4 font-mono text-xs sm:text-sm text-stone-900 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.07),_inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-hidden focus:border-[#E62E6B] cursor-pointer transition-all"
                  >
                    <option value={5}>5 Questions / Items</option>
                    <option value={10}>10 Questions / Items</option>
                    <option value={15}>15 Questions / Items</option>
                    <option value={20}>20 Questions / Items</option>
                  </select>
                )}
              </div>
            </div>

            {/* Presentation Specific Options: Theme & Delivery Format */}
            {activeTool === 'presentation' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div className="space-y-2">
                    <label className="block font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider text-stone-600">
                      PRESENTATION THEME & PALETTE
                    </label>
                    <select
                      value={presentationTheme}
                      onChange={(e) => setPresentationTheme(e.target.value)}
                      className="w-full bg-[#EFE8DE] border border-[#E4DCD0] rounded-2xl p-4 font-mono text-xs sm:text-sm text-stone-900 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.07),_inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-hidden focus:border-[#E62E6B] cursor-pointer transition-all"
                    >
                      <option value="African Earth & Ochre">African Earth & Ochre (Charcoal & Warm Gold)</option>
                      <option value="Modern Slate & Emerald">Modern Slate & Emerald (Slate & Vivid Green)</option>
                      <option value="Academic Editorial & Indigo">Academic Editorial & Indigo (Midnight & Indigo)</option>
                      <option value="Vibrant Sunset & Amber">Vibrant Sunset & Amber (Mahogany & Fiery Orange)</option>
                      <option value="Minimalist Ivory & Graphite">Minimalist Ivory & Graphite (Clean Ivory & Slate)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider text-stone-600">
                      PEDAGOGICAL DELIVERY FORMAT
                    </label>
                    <select
                      value={presentationFormat}
                      onChange={(e) => setPresentationFormat(e.target.value)}
                      className="w-full bg-[#EFE8DE] border border-[#E4DCD0] rounded-2xl p-4 font-mono text-xs sm:text-sm text-stone-900 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.07),_inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-hidden focus:border-[#E62E6B] cursor-pointer transition-all"
                    >
                      <option value="Educational Lecture & Discussion">Educational Lecture & Discussion</option>
                      <option value="Interactive Workshop & Activities">Interactive Workshop & Activities</option>
                      <option value="Case Study & Real-World Application">Case Study & Real-World Application</option>
                      <option value="Visual Storytelling & Narrative">Visual Storytelling & Narrative</option>
                      <option value="Executive Summary & Key Takeaways">Executive Summary & Key Takeaways</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <label className="block font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider text-stone-600">
                    CORE INQUIRIES & KEY POINTS (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={presentationKeyPoints}
                    onChange={(e) => setPresentationKeyPoints(e.target.value)}
                    placeholder="e.g. Highlight iron blast furnace technology, Nile trade, and archaeological findings"
                    className="w-full bg-[#EFE8DE] border border-[#E4DCD0] rounded-2xl p-4 font-mono text-xs sm:text-sm text-stone-900 placeholder-stone-400/80 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.07),_inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-hidden focus:border-[#E62E6B] transition-all"
                  />
                </div>
              </>
            )}

            {/* Optional Document / Camera Upload */}
            <div>
              <SourceMaterialUpload
                onContentExtracted={(text, name) => {
                  setSourceText(text);
                  setSourceFileName(name);
                }}
                currentFileName={sourceFileName}
                onClear={() => {
                  setSourceText('');
                  setSourceFileName('');
                }}
                accentColor="#E62E6B"
              />
            </div>

            {generationError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 font-mono text-xs">
                {generationError}
              </div>
            )}

            {/* Generate Button - Soft UI 3D Pink Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-4 bg-[#E62E6B] hover:bg-[#d8245f] text-white font-display text-sm font-black uppercase tracking-wider rounded-full shadow-[0_10px_28px_rgba(230,46,107,0.4)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>
                    {activeTool === 'presentation'
                      ? 'DESIGNING PRESENTATION SLIDES...'
                      : activeTool === 'lessonplan'
                      ? 'SYNTHESIZING LESSON PLAN...'
                      : 'SYNTHESIZING CLASSROOM PACK...'}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>
                    GENERATE {activeTool === 'presentation' ? 'PRESENTATION SLIDES' : activeTool === 'lessonplan' ? 'LESSON PLAN' : 'RESOURCE'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4. Generation Area (smoothly scrolled into view on finish) */}
        <div ref={resultRef} className="w-full scroll-mt-24">
          {isGenerating && !generatedResult && (
            <div className="p-12 rounded-[2rem] bg-white border border-stone-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center gap-4 text-center">
              <Loader2 className="w-10 h-10 text-[#FF7A00] animate-spin" />
              <div className="space-y-1">
                <p className="font-display font-black text-lg uppercase text-stone-900">
                  {activeTool === 'presentation' ? 'Designing Presentation Slide Deck...' : 'Synthesizing CAPS Curriculum Resource...'}
                </p>
                <p className="font-mono text-xs text-stone-500">
                  {activeTool === 'presentation' ? 'Structuring pedagogical slides, visuals, discussion cues, and speaker notes.' : 'Extracting pedagogical frameworks, rubric standards, and interactive components.'}
                </p>
              </div>
            </div>
          )}

          {generatedResult && (
            <div className="space-y-6">
              {/* Specialized Presentation Deck View */}
              {(activeTool === 'presentation' || (Array.isArray(generatedResult?.slides) && generatedResult.slides.length > 0)) ? (
                (() => {
                  const presSlides = (Array.isArray(generatedResult.slides) && generatedResult.slides.length > 0)
                    ? generatedResult.slides
                    : (Array.isArray(generatedResult.sections) && generatedResult.sections.length > 0)
                      ? generatedResult.sections.map((sec: any, idx: number) => ({
                          id: `s-${idx + 1}`,
                          slideNumber: idx + 1,
                          slideType: 'concept',
                          title: sec.heading || `Slide ${idx + 1}`,
                          subtitle: '',
                          bulletPoints: typeof sec.content === 'string' ? sec.content.split('\n').filter(Boolean) : [],
                          speakerNotes: 'Key lecture points for this topic.',
                        }))
                      : [];

                  const currentSlide = presSlides[activeSlideIndex] || presSlides[0] || {};
                  const currentBullets: string[] = currentSlide.bulletPoints || currentSlide.bullets || [];
                  const visualCue = currentSlide.suggestedVisualOrDiagram || currentSlide.visualCue;
                  const discussionPrompt = currentSlide.discussionOrEngagementPrompt;
                  const themeMood = generatedResult.themeOrColorMood || presentationTheme;

                  const handleSaveSlideChanges = () => {
                    const updated = [...presSlides];
                    updated[activeSlideIndex] = {
                      ...updated[activeSlideIndex],
                      title: editSlideData.title,
                      subtitle: editSlideData.subtitle,
                      bulletPoints: editSlideData.bullets.split('\n').filter(Boolean),
                      suggestedVisualOrDiagram: editSlideData.visualCue,
                      discussionOrEngagementPrompt: editSlideData.discussionPrompt,
                      speakerNotes: editSlideData.speakerNotes,
                    };
                    const updatedResult = { ...generatedResult, slides: updated };
                    setGeneratedResult(updatedResult);
                    setIsEditingSlide(false);

                    const updatedResource: SavedResource = {
                      id: initialResource?.id || 'res-' + Date.now(),
                      toolType: 'presentation',
                      title: updatedResult.title || topicInput,
                      subject: updatedResult.subject || 'Curriculum',
                      topic: topicInput,
                      gradeLevel,
                      createdAt: new Date().toISOString(),
                      data: updatedResult,
                    };
                    saveResourceToStorage(updatedResource);
                    if (onResourceSaved) onResourceSaved(updatedResource);
                  };

                  return (
                    <div className="space-y-6 font-sans">
                      {/* Status Banner & Action Buttons */}
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-[#FFF8F0] border-2 border-[#FF7A00]/40 p-6 rounded-[2rem] shadow-xs">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-8 h-8 text-[#FF7A00] shrink-0" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-full bg-[#FF7A00]/20 text-[#B25500] font-mono font-bold text-xs uppercase tracking-wider">
                                {presSlides.length} INTERACTIVE SLIDES
                              </span>
                              <span className="font-mono text-xs text-stone-500 uppercase">
                                &bull; {themeMood}
                              </span>
                            </div>
                            <h3 className="font-display font-black text-xl sm:text-2xl uppercase text-stone-900 mt-1">
                              {generatedResult.title || topicInput || 'Curriculum Presentation Deck'}
                            </h3>
                          </div>
                        </div>

                        {/* Export & Mode Buttons */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => setIsFullscreenPresentation(true)}
                            className="px-4 py-2.5 bg-gradient-to-r from-[#FF7A00] to-[#E65100] hover:brightness-105 text-white rounded-xl font-display font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer transition-all"
                            title="Start Fullscreen Presenter Mode (F)"
                          >
                            <Maximize2 className="w-4 h-4" />
                            <span>PRESENT FULLSCREEN</span>
                          </button>

                          <button
                            onClick={() => downloadPresentationHtml(generatedResult)}
                            className="px-3.5 py-2.5 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl font-mono text-xs font-bold uppercase text-stone-900 flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                            title="Download Standalone Interactive HTML Slides to run offline"
                          >
                            <Download className="w-3.5 h-3.5 text-[#FF7A00]" />
                            <span>HTML DECK</span>
                          </button>

                          <button
                            onClick={() => exportItem(generatedResult, 'doc')}
                            className="px-3.5 py-2.5 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl font-mono text-xs font-bold uppercase text-stone-900 flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                            title="Download Word Document (.doc)"
                          >
                            <Download className="w-3.5 h-3.5 text-[#FF7A00]" />
                            <span>DOC</span>
                          </button>

                          <button
                            onClick={() => exportItem(generatedResult, 'pdf')}
                            className="px-3.5 py-2.5 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl font-mono text-xs font-bold uppercase text-stone-900 flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                            title="Download PDF Document (.pdf)"
                          >
                            <Download className="w-3.5 h-3.5 text-[#FF7A00]" />
                            <span>PDF</span>
                          </button>

                          <button
                            onClick={() => exportItem(generatedResult, 'print')}
                            className="px-3.5 py-2.5 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl font-mono text-xs font-bold uppercase text-stone-900 flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                            title="Print Slide Handouts"
                          >
                            <Printer className="w-3.5 h-3.5 text-stone-700" />
                            <span>PRINT</span>
                          </button>
                        </div>
                      </div>

                      {/* Active Slide Stage Canvas */}
                      <div className="bg-[#18181B] text-white border-2 border-stone-800 rounded-[2.5rem] p-6 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden space-y-6">
                        {/* Subtle theme mood glow */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF7A00]/10 rounded-full blur-3xl pointer-events-none"></div>

                        {/* Top Slide Header */}
                        <div className="flex items-center justify-between text-xs font-mono text-stone-400 pb-4 border-b border-stone-800 relative z-10">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-[#FF7A00]/20 text-[#FF7A00] font-bold tracking-wider uppercase text-[11px]">
                              SLIDE {activeSlideIndex + 1} OF {presSlides.length}
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-stone-800 text-stone-300 text-[11px] uppercase font-bold">
                              {currentSlide.slideType || 'CONCEPT'}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => {
                                if (isEditingSlide) {
                                  setIsEditingSlide(false);
                                } else {
                                  setEditSlideData({
                                    title: currentSlide.title || '',
                                    subtitle: currentSlide.subtitle || '',
                                    bullets: currentBullets.join('\n'),
                                    visualCue: visualCue || '',
                                    discussionPrompt: discussionPrompt || '',
                                    speakerNotes: currentSlide.speakerNotes || '',
                                  });
                                  setIsEditingSlide(true);
                                }
                              }}
                              className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-all"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#FF7A00]" />
                              <span>{isEditingSlide ? 'CANCEL EDIT' : 'EDIT SLIDE'}</span>
                            </button>

                            <button
                              onClick={() => setShowSpeakerNotes(p => !p)}
                              className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-all"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-[#FF7A00]" />
                              <span>{showSpeakerNotes ? 'HIDE NOTES' : 'SHOW NOTES'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Main Slide Content: View or Edit Mode */}
                        {isEditingSlide ? (
                          <div className="space-y-4 relative z-10 bg-stone-900/90 p-5 rounded-2xl border border-stone-700">
                            <div>
                              <label className="block text-xs font-mono text-stone-400 font-bold uppercase mb-1">Slide Title:</label>
                              <input
                                type="text"
                                value={editSlideData.title}
                                onChange={(e) => setEditSlideData({ ...editSlideData, title: e.target.value })}
                                className="w-full bg-stone-950 border border-stone-700 rounded-xl p-3 text-white font-display font-bold text-lg"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-mono text-stone-400 font-bold uppercase mb-1">Slide Subtitle:</label>
                              <input
                                type="text"
                                value={editSlideData.subtitle}
                                onChange={(e) => setEditSlideData({ ...editSlideData, subtitle: e.target.value })}
                                className="w-full bg-stone-950 border border-stone-700 rounded-xl p-3 text-white font-sans text-sm"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-mono text-stone-400 font-bold uppercase mb-1">Bullet Points (one line per bullet):</label>
                              <textarea
                                rows={4}
                                value={editSlideData.bullets}
                                onChange={(e) => setEditSlideData({ ...editSlideData, bullets: e.target.value })}
                                className="w-full bg-stone-950 border border-stone-700 rounded-xl p-3 text-white font-sans text-sm"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-mono text-stone-400 font-bold uppercase mb-1">Suggested Visual Cue:</label>
                                <textarea
                                  rows={2}
                                  value={editSlideData.visualCue}
                                  onChange={(e) => setEditSlideData({ ...editSlideData, visualCue: e.target.value })}
                                  className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-stone-300 font-sans text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-mono text-stone-400 font-bold uppercase mb-1">Discussion Prompt:</label>
                                <textarea
                                  rows={2}
                                  value={editSlideData.discussionPrompt}
                                  onChange={(e) => setEditSlideData({ ...editSlideData, discussionPrompt: e.target.value })}
                                  className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-stone-300 font-sans text-xs"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-mono text-stone-400 font-bold uppercase mb-1">Speaker Notes:</label>
                              <textarea
                                rows={3}
                                value={editSlideData.speakerNotes}
                                onChange={(e) => setEditSlideData({ ...editSlideData, speakerNotes: e.target.value })}
                                className="w-full bg-stone-950 border border-stone-700 rounded-xl p-3 text-stone-300 font-sans text-xs"
                              />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                              <button
                                onClick={() => setIsEditingSlide(false)}
                                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-mono font-bold uppercase cursor-pointer"
                              >
                                CANCEL
                              </button>
                              <button
                                onClick={handleSaveSlideChanges}
                                className="px-5 py-2 bg-[#FF7A00] hover:brightness-110 text-black font-display font-black text-xs uppercase rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                              >
                                <Save className="w-4 h-4" />
                                <span>SAVE SLIDE CHANGES</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-6 relative z-10">
                            <div>
                              <h2 className="font-display font-black text-2xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-white leading-tight">
                                {currentSlide.title}
                              </h2>
                              {currentSlide.subtitle && (
                                <p className="text-base sm:text-lg font-sans text-stone-400 mt-2 font-medium">
                                  {currentSlide.subtitle}
                                </p>
                              )}
                            </div>

                            <ul className="space-y-3.5 pt-2 text-base sm:text-lg font-sans text-stone-200 max-w-4xl">
                              {currentBullets.map((b: string, i: number) => (
                                <li key={i} className="flex items-start gap-3.5 leading-relaxed">
                                  <span className="text-[#FF7A00] font-bold text-lg shrink-0 mt-0.5">❖</span>
                                  <span>{b}</span>
                                </li>
                              ))}
                            </ul>

                            {/* Visual Cue & Discussion Boxes */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                              {visualCue && (
                                <div className="bg-stone-900/90 border-l-4 border-[#10B981] p-3.5 rounded-r-2xl text-xs space-y-1">
                                  <div className="flex items-center gap-1.5 text-[#10B981] font-mono font-bold uppercase tracking-wider text-[11px]">
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>SUGGESTED VISUAL / WHITEBOARD DIAGRAM</span>
                                  </div>
                                  <p className="text-stone-300 font-sans leading-relaxed">{visualCue}</p>
                                </div>
                              )}

                              {discussionPrompt && (
                                <div className="bg-stone-900/90 border-l-4 border-[#38BDF8] p-3.5 rounded-r-2xl text-xs space-y-1">
                                  <div className="flex items-center gap-1.5 text-[#38BDF8] font-mono font-bold uppercase tracking-wider text-[11px]">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span>DISCUSSION & ENGAGEMENT PROMPT</span>
                                  </div>
                                  <p className="text-stone-300 font-sans leading-relaxed">{discussionPrompt}</p>
                                </div>
                              )}
                            </div>

                            {/* Speaker Notes Drawer */}
                            {showSpeakerNotes && currentSlide.speakerNotes && (
                              <div className="pt-4 border-t border-stone-800/80">
                                <div className="bg-stone-950/80 border border-stone-800 p-4 rounded-2xl text-xs space-y-1">
                                  <span className="font-mono font-bold text-[#FF7A00] uppercase tracking-wider block text-[11px]">
                                    SPEAKER / PRESENTER NOTES:
                                  </span>
                                  <p className="text-stone-300 font-sans leading-relaxed">{currentSlide.speakerNotes}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Slide Navigation Controls */}
                        <div className="flex items-center justify-between gap-4 pt-4 border-t border-stone-800 relative z-10">
                          <button
                            onClick={() => setActiveSlideIndex(prev => Math.max(0, prev - 1))}
                            disabled={activeSlideIndex === 0}
                            className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 disabled:opacity-30 rounded-xl text-xs font-mono font-bold uppercase text-white flex items-center gap-1.5 cursor-pointer transition-all"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span>PREVIOUS SLIDE</span>
                          </button>

                          <div className="text-center font-mono text-xs font-bold text-stone-400">
                            Slide {activeSlideIndex + 1} of {presSlides.length}
                          </div>

                          <button
                            onClick={() => setActiveSlideIndex(prev => Math.min(presSlides.length - 1, prev + 1))}
                            disabled={activeSlideIndex === presSlides.length - 1}
                            className="px-5 py-2.5 bg-[#FF7A00] hover:brightness-110 disabled:opacity-30 rounded-xl text-xs font-mono font-bold uppercase text-black flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
                          >
                            <span>NEXT SLIDE</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Slide Thumbnail Quick-Jump Strip */}
                      <div className="space-y-2">
                        <span className="font-mono text-xs font-bold uppercase tracking-wider text-stone-600 block">
                          QUICK JUMP SLIDE DECK (CLICK TO VIEW)
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {presSlides.map((s: any, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => setActiveSlideIndex(idx)}
                              className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                                idx === activeSlideIndex
                                  ? 'bg-[#FF7A00] text-black border-[#FF7A00] font-bold shadow-md scale-[1.02]'
                                  : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-800'
                              }`}
                            >
                              <div className="text-[10px] font-mono uppercase tracking-wider opacity-75">
                                SLIDE {idx + 1} &bull; {s.slideType || 'SLIDE'}
                              </div>
                              <div className="text-xs font-display font-bold uppercase mt-1 truncate">
                                {s.title || `Slide ${idx + 1}`}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Fullscreen Presenter Mode Modal */}
                      {isFullscreenPresentation && (
                        <div className="fixed inset-0 z-50 bg-[#101012] text-white flex flex-col justify-between p-6 sm:p-12 animate-in fade-in duration-200">
                          {/* Fullscreen Topbar */}
                          <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                            <div className="flex items-center gap-3">
                              <span className="px-3.5 py-1 rounded-full bg-[#FF7A00] text-black font-display font-black text-xs uppercase">
                                SLIDE {activeSlideIndex + 1} OF {presSlides.length}
                              </span>
                              <span className="text-xs font-mono uppercase text-stone-400 font-bold">
                                {currentSlide.slideType || 'CONCEPT'} &bull; {generatedResult.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => setShowSpeakerNotes(p => !p)}
                                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-mono font-bold uppercase cursor-pointer"
                              >
                                {showSpeakerNotes ? 'HIDE NOTES [N]' : 'SHOW NOTES [N]'}
                              </button>
                              <button
                                onClick={() => setIsFullscreenPresentation(false)}
                                className="p-2 bg-stone-800 hover:bg-stone-700 text-white rounded-lg cursor-pointer"
                                title="Exit Fullscreen (ESC)"
                              >
                                <Minimize2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>

                          {/* Fullscreen Big Slide Body */}
                          <div className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full py-8 space-y-8">
                            <div>
                              <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-white leading-tight">
                                {currentSlide.title}
                              </h2>
                              {currentSlide.subtitle && (
                                <p className="text-lg sm:text-2xl text-stone-400 font-sans mt-3 font-medium">
                                  {currentSlide.subtitle}
                                </p>
                              )}
                            </div>

                            <ul className="space-y-4 text-xl sm:text-2xl font-sans text-stone-200 max-w-4xl">
                              {currentBullets.map((b: string, i: number) => (
                                <li key={i} className="flex items-start gap-4 leading-relaxed">
                                  <span className="text-[#FF7A00] font-bold text-2xl shrink-0 mt-0.5">❖</span>
                                  <span>{b}</span>
                                </li>
                              ))}
                            </ul>

                            {showSpeakerNotes && currentSlide.speakerNotes && (
                              <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl text-sm font-sans text-stone-300">
                                <strong className="text-[#FF7A00] font-mono uppercase text-xs block mb-1">Speaker Notes:</strong>
                                {currentSlide.speakerNotes}
                              </div>
                            )}
                          </div>

                          {/* Fullscreen Bottom Nav */}
                          <div className="flex items-center justify-between pt-4 border-t border-stone-800">
                            <button
                              onClick={() => setActiveSlideIndex(prev => Math.max(0, prev - 1))}
                              disabled={activeSlideIndex === 0}
                              className="px-6 py-3 bg-stone-800 hover:bg-stone-700 disabled:opacity-30 rounded-xl text-sm font-bold uppercase cursor-pointer"
                            >
                              &larr; PREVIOUS
                            </button>

                            <div className="flex items-center gap-1.5">
                              {presSlides.map((_: any, i: number) => (
                                <span
                                  key={i}
                                  onClick={() => setActiveSlideIndex(i)}
                                  className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
                                    i === activeSlideIndex ? 'bg-[#FF7A00] scale-125' : 'bg-stone-700 hover:bg-stone-500'
                                  }`}
                                />
                              ))}
                            </div>

                            <button
                              onClick={() => setActiveSlideIndex(prev => Math.min(presSlides.length - 1, prev + 1))}
                              disabled={activeSlideIndex === presSlides.length - 1}
                              className="px-6 py-3 bg-[#FF7A00] hover:brightness-105 text-black font-black uppercase rounded-xl text-sm cursor-pointer shadow-md"
                            >
                              NEXT &rarr;
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (activeTool === 'worksheet' || (Array.isArray(generatedResult?.activities) && generatedResult.activities.length > 0)) ? (
                <div className="space-y-6 font-sans">
                  {/* Status Banner & Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#FFF8F0] border-2 border-[#FF7A00]/40 p-6 rounded-[2rem] shadow-xs">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-7 h-7 text-[#FF7A00] shrink-0" />
                      <div>
                        <h3 className="font-display font-black text-[20px] sm:text-[22px] uppercase text-stone-900">
                          {getCleanWorksheetTitle(generatedResult.title, generatedResult.topic || topicInput, generatedResult.subject)}
                        </h3>
                        <p className="font-bold text-[18px] text-[#B25500]">
                          Worksheet ready for student completion & printing!
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        onClick={() => exportItem(generatedResult, 'doc')}
                        className="px-4 py-3 bg-white hover:bg-stone-50 border-2 border-stone-300 rounded-2xl font-bold text-[18px] uppercase text-stone-900 flex items-center gap-2 shadow-xs cursor-pointer transition-all"
                        title="Download Word Document (.doc)"
                      >
                        <Download className="w-5 h-5 text-[#FF7A00]" />
                        <span>DOC</span>
                      </button>
                      <button
                        onClick={() => exportItem(generatedResult, 'pdf')}
                        className="px-4 py-3 bg-white hover:bg-stone-50 border-2 border-stone-300 rounded-2xl font-bold text-[18px] uppercase text-stone-900 flex items-center gap-2 shadow-xs cursor-pointer transition-all"
                        title="Download PDF Document (.pdf)"
                      >
                        <Download className="w-5 h-5 text-[#FF7A00]" />
                        <span>PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* Main Worksheet Document */}
                  <div className="bg-white border-2 border-stone-300 shadow-md rounded-[2.5rem] p-6 sm:p-10 space-y-8">
                    {/* Worksheet Header Box */}
                    <div className="border-b-2 border-stone-200 pb-6 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="font-bold text-[18px] text-[#FF7A00] uppercase tracking-wider">
                          STUDENT CLASSROOM WORKSHEET &bull; {generatedResult.gradeLevel || gradeLevel}
                        </span>
                        <span className="font-bold text-[18px] text-stone-800">
                          {generatedResult.estimatedTimeMinutes ? `Estimated Duration: ${generatedResult.estimatedTimeMinutes} mins` : 'Classroom Exercise'}
                        </span>
                      </div>

                      <h2 className="font-display font-black text-[28px] sm:text-[36px] uppercase text-stone-900 tracking-tight leading-tight">
                        {getCleanWorksheetTitle(generatedResult.title, generatedResult.topic || topicInput, generatedResult.subject)}
                      </h2>

                      {generatedResult.description && (
                        <p className="font-bold text-[18px] sm:text-[19px] text-stone-800 leading-relaxed bg-stone-50 p-5 rounded-2xl border-2 border-stone-200">
                          {generatedResult.description}
                        </p>
                      )}

                      {/* Student Fill-in Info Header */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#FAF7F0] p-5 rounded-2xl border-2 border-stone-200 font-mono font-bold text-[18px] text-stone-900">
                        <div>Name: ______________________</div>
                        <div>Date: ______________________</div>
                        <div>Class: _____________________</div>
                        <div>Score: _____ / {generatedResult.totalMarks || 40}</div>
                      </div>

                      {/* General Instructions */}
                      {generatedResult.instructions && (
                        <div className="bg-amber-50/90 border-2 border-amber-300 p-5 rounded-2xl space-y-1">
                          <span className="font-black text-[20px] uppercase text-amber-950 block">
                            General Instructions:
                          </span>
                          <p className="font-bold text-[18px] text-stone-900 leading-relaxed">
                            {generatedResult.instructions}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Student Activities Section */}
                    <div className="space-y-8">
                      {Array.isArray(generatedResult.activities) && generatedResult.activities.map((activity: any, actIdx: number) => (
                        <div
                          key={actIdx}
                          className="bg-stone-50/70 border-2 border-stone-300 p-6 sm:p-8 rounded-3xl space-y-6"
                        >
                          {/* Activity Title & Instructions */}
                          <div className="border-b-2 border-stone-200 pb-4 space-y-2">
                            <h3 className="font-display font-black text-[22px] sm:text-[26px] uppercase text-stone-900">
                              {activity.title || `Activity ${actIdx + 1}`}
                            </h3>
                            {activity.instructions && (
                              <p className="font-bold text-[18px] text-stone-800 leading-relaxed">
                                {activity.instructions}
                              </p>
                            )}
                          </div>

                          {/* Word Bank if applicable */}
                          {Array.isArray(activity.wordBank) && activity.wordBank.length > 0 && (
                            <div className="bg-indigo-50/90 border-2 border-indigo-200 p-5 rounded-2xl space-y-2">
                              <span className="font-black text-[18px] uppercase text-indigo-950 block">
                                Word Bank:
                              </span>
                              <div className="flex flex-wrap gap-3">
                                {activity.wordBank.map((term: string, tIdx: number) => (
                                  <span
                                    key={tIdx}
                                    className="px-4 py-2 bg-white border-2 border-indigo-300 rounded-xl font-bold text-[18px] text-indigo-950 shadow-xs"
                                  >
                                    {term}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Practical Scenario if applicable */}
                          {activity.scenario && (
                            <div className="bg-amber-50/80 border-2 border-amber-300 p-5 rounded-2xl space-y-2">
                              <span className="font-black text-[18px] uppercase text-amber-950 block">
                                Practical Scenario:
                              </span>
                              <p className="font-bold text-[18px] text-stone-900 leading-relaxed">
                                {activity.scenario}
                              </p>
                            </div>
                          )}

                          {/* Activity Items / Exercises to Complete */}
                          <div className="space-y-6">
                            {Array.isArray(activity.items) && activity.items.map((item: any, itemIdx: number) => {
                              const inputId = `act-${actIdx}-item-${itemIdx}`;
                              return (
                                <div
                                  key={itemIdx}
                                  className="bg-white border-2 border-stone-200 p-5 sm:p-6 rounded-2xl space-y-4"
                                >
                                  {/* Prompt */}
                                  <div className="flex items-start gap-3">
                                    <span className="font-black text-[20px] text-[#FF7A00] shrink-0">
                                      {item.itemNumber || itemIdx + 1}.
                                    </span>
                                    <div className="space-y-3 w-full">
                                      <p className="font-black text-[19px] sm:text-[20px] text-stone-900 leading-snug">
                                        {item.prompt}
                                      </p>

                                      {/* Matching Target / Column B */}
                                      {item.matchTarget && (
                                        <div className="p-4 bg-stone-50 border-2 border-stone-200 rounded-xl font-bold text-[18px] text-stone-800">
                                          {item.matchTarget}
                                        </div>
                                      )}

                                      {/* Interactive Student Completion Area */}
                                      <div className="space-y-2 pt-2">
                                        <label className="block font-black text-[18px] uppercase text-stone-800">
                                          Student Answer / Response:
                                        </label>
                                        <input
                                          type="text"
                                          value={worksheetStudentInputs[inputId] || ''}
                                          onChange={(e) => handleStudentInputChange(inputId, e.target.value)}
                                          placeholder="Type your answer here or write by hand..."
                                          className="w-full px-5 py-4 bg-white border-2 border-stone-300 focus:border-[#FF7A00] rounded-xl font-bold text-[18px] text-stone-900 placeholder:text-stone-400 focus:outline-none"
                                        />
                                        {item.completionSpace && (
                                          <div className="font-bold text-[18px] text-stone-400 select-none whitespace-pre-line pt-1">
                                            {item.completionSpace}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Teacher Answer Key & Solutions Toggle */}
                    {Array.isArray(generatedResult.teacherAnswerKey) && generatedResult.teacherAnswerKey.length > 0 && (
                      <div className="border-t-2 border-stone-200 pt-6 space-y-4">
                        <button
                          onClick={() => setShowWorksheetAnswers(!showWorksheetAnswers)}
                          className="px-6 py-3.5 bg-[#FFF8F0] hover:bg-[#FFF0E0] border-2 border-[#FF7A00]/40 rounded-2xl font-bold text-[18px] text-stone-900 flex items-center gap-3 cursor-pointer transition-all"
                        >
                          <Check className="w-6 h-6 text-[#FF7A00]" />
                          <span>
                            {showWorksheetAnswers ? 'Hide Teacher Answer Key & Solutions' : 'View Teacher Answer Key & Solutions'}
                          </span>
                        </button>

                        {showWorksheetAnswers && (
                          <div className="bg-[#FFF8F0] border-2 border-[#FF7A00]/40 rounded-3xl p-6 sm:p-8 space-y-6">
                            <h3 className="font-display font-black text-[22px] sm:text-[24px] uppercase text-stone-900 border-b-2 border-orange-200 pb-3">
                              Teacher Solutions & Answer Key
                            </h3>
                            <div className="space-y-6">
                              {generatedResult.teacherAnswerKey.map((keySec: any, kIdx: number) => (
                                <div key={kIdx} className="space-y-2">
                                  <h4 className="font-black text-[20px] text-[#B25500]">
                                    {keySec.activityTitle}
                                  </h4>
                                  <ul className="list-disc pl-6 space-y-2 text-[18px] font-bold text-stone-800">
                                    {(keySec.answers || []).map((ans: string, aKeyIdx: number) => (
                                      <li key={aKeyIdx} className="leading-relaxed">
                                        {ans}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Standard Fallback / Non-Worksheet Result Cards */
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#FFF8F0] border border-[#FF7A00]/40 p-5 rounded-[2rem] shadow-xs">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-[#FF7A00] shrink-0" />
                      <div>
                        <h3 className="font-display font-black text-lg uppercase text-stone-900">
                          {generatedResult.title}
                        </h3>
                        <p className="font-mono text-xs font-bold text-[#B25500]">
                          Successfully generated & saved to your workspace library!
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => exportItem(generatedResult, 'doc')}
                        className="px-3 py-2 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                        title="Download Word Document (.doc)"
                      >
                        <Download className="w-3.5 h-3.5 text-[#D92B8A]" />
                        <span>DOC</span>
                      </button>
                      <button
                        onClick={() => exportItem(generatedResult, 'pdf')}
                        className="px-3 py-2 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                        title="Download PDF Document (.pdf)"
                      >
                        <Download className="w-3.5 h-3.5 text-[#D92B8A]" />
                        <span>PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* Main Content Card */}
                  <div className="bg-white border border-stone-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.05)] rounded-[2rem] p-6 sm:p-8 space-y-6">
                    {generatedResult.description && (
                      <p className="text-stone-700 text-sm font-mono leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-200">
                        {generatedResult.description}
                      </p>
                    )}

                    {/* Sections */}
                    {Array.isArray(generatedResult.sections) && generatedResult.sections.map((sec: any, idx: number) => (
                      <div key={idx} className="bg-stone-50/70 p-5 rounded-2xl border border-stone-200/80 space-y-2">
                        <h4 className="font-display font-black text-base uppercase text-stone-900">
                          {sec.heading}
                        </h4>
                        <p className="text-sm text-stone-600 font-mono leading-relaxed whitespace-pre-line">
                          {sec.content}
                        </p>
                      </div>
                    ))}

                    {/* Questions */}
                    {Array.isArray(generatedResult.questions) && generatedResult.questions.map((q: any, idx: number) => (
                      <div key={idx} className="bg-stone-50/70 p-5 rounded-2xl border border-stone-200/80 space-y-3">
                        <h4 className="font-display font-black text-sm uppercase text-stone-900">
                          Q{idx + 1}: {q.question}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {Array.isArray(q.options) && q.options.map((opt: string, oIdx: number) => (
                            <div
                              key={oIdx}
                              className={`p-3 rounded-xl font-mono text-xs border ${
                                opt === q.correctAnswer
                                  ? 'bg-orange-50 border-[#FF7A00]/50 text-stone-900 font-bold'
                                  : 'bg-white border-stone-200 text-stone-700'
                              }`}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                        {q.explanation && (
                          <p className="font-mono text-xs text-stone-500 pt-1">
                            <strong>Explanation:</strong> {q.explanation}
                          </p>
                        )}
                      </div>
                    ))}

                    {/* Answer Key */}
                    {Array.isArray(generatedResult.answerKey) && generatedResult.answerKey.length > 0 && (
                      <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                        <span className="font-mono text-xs font-bold uppercase tracking-wider text-stone-600 block">
                          Quick Answer Key:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {generatedResult.answerKey.map((keyItem: string, kIdx: number) => (
                            <span
                              key={kIdx}
                              className="px-2.5 py-1 bg-white border border-stone-300 rounded-md font-mono text-xs font-bold text-stone-800"
                            >
                              {keyItem}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
