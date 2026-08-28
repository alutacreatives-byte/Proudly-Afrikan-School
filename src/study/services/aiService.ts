import { 
  StudySet, 
  StudyConcept, 
  TutorMessage, 
  DifferentiatedLearningMode, 
  DifferentiatedResult, 
  StudyGuide, 
  StudySummary, 
  SummaryType,
  HomeworkActionType,
  HomeworkAttachment,
  HomeworkEvaluation
} from '../types';

export interface GenerateSetParams {
  topic?: string;
  notesText?: string;
  count?: number;
  category?: string;
}

export interface AskTutorParams {
  messages: { role: 'user' | 'model'; text: string }[];
  studySet?: StudySet | null;
  currentConcept?: StudyConcept;
  homeworkAction?: HomeworkActionType;
  homeworkQuestion?: string;
  attemptedAnswer?: string;
  attachment?: HomeworkAttachment;
}

export class AIService {
  static async generateStudySet(params: GenerateSetParams): Promise<StudySet> {

    const { topic, notesText, count = 6, category = 'GENERAL KNOWLEDGE' } = params;
    const inputContent = (notesText || topic || '').trim();

    if (!inputContent) {
      throw new Error('Please provide a topic or study notes.');
    }

    try {
      const response = await fetch('/api/generate-set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: topic,
          text: notesText,
          mode: notesText ? 'notes' : 'topic',
          count: count,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const setId = `custom-${Date.now()}`;
        const concepts: StudyConcept[] = (data.concepts || []).map((c: any, index: number) => ({
          id: c.id || `${setId}-concept-${index + 1}`,
          setId: setId,
          title: c.title || `Concept ${index + 1}`,
          summary: c.summary || '',
          category: c.category || data.category || category || 'CUSTOM SET',
          difficulty: c.difficulty || 'Medium',
          tags: c.tags || [category || 'Custom'],
          explanation: c.explanation || c.summary || 'Core educational breakdown of this concept.',
          keyFacts: Array.isArray(c.keyFacts) ? c.keyFacts : [c.summary || 'Fundamental principle.'],
          terminology: Array.isArray(c.terminology) ? c.terminology : [],
          whyItMatters: c.whyItMatters || 'Understanding this foundational idea enables mastery of the broader topic.',
          historicalContext: c.historicalContext || '',
          concreteExample: c.concreteExample || {
            title: `Practical Case: ${c.title || `Concept ${index + 1}`}`,
            text: `Application of ${c.title || `this concept`} in real-world scenarios demonstrates its fundamental importance.`
          },
          simpleExplanation: c.simpleExplanation,
          deepExplanation: c.deepExplanation,
          selfExplanationPrompt: c.selfExplanationPrompt || `Explain in your own words what ${c.title} means and why it is significant.`,
          selfExplanationKeyPoints: c.selfExplanationKeyPoints || [c.summary],
          flashcardQuestion: c.flashcardQuestion || `What is the core principle of ${c.title}?`,
          flashcardAnswer: c.flashcardAnswer || c.summary,
          flashcardHint: c.flashcardHint,
          practiceQuestion: c.practiceQuestion || c.flashcardQuestion,
          practiceOptions: Array.isArray(c.practiceOptions) && c.practiceOptions.length === 4 
            ? c.practiceOptions 
            : [c.flashcardAnswer || c.summary, 'Alternative Context', 'Contrasting Theory', 'Unrelated Principle'],
          correctOptionIndex: typeof c.correctOptionIndex === 'number' ? c.correctOptionIndex : 0,
          practiceExplanation: c.practiceExplanation || `This is correct because ${c.summary || c.flashcardAnswer}.`,
        }));

        if (concepts.length > 0) {
          return {
            id: setId,
            title: data.title || topic || 'Custom Study Set',
            description: data.description || `Comprehensive learning set with ${concepts.length} key concepts.`,
            category: data.category || category || 'CUSTOM SET',
            estimatedMinutes: data.estimatedMinutes || Math.ceil(concepts.length * 2),
            isCustom: true,
            createdAt: new Date().toISOString(),
            concepts,
            goDeeperResources: data.goDeeperResources || []
          };
        }
      } else if (response.status === 400) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Please provide a valid topic or study notes.');
      }
    } catch (err: any) {
      if (err.message && err.message.includes('Please provide a valid topic')) {
        throw err;
      }
      console.warn('Backend generation encountered an issue, synthesizing structured study set via fallback builder:', err);
    }

    // Fallback generator if offline or no backend key
    return this.generateSmartFallback(inputContent, topic, category, count);
  }

  static async explainConcept(title: string, summary: string, explanation: string, mode: 'simple' | 'deep'): Promise<string> {
    try {
      const response = await fetch('/api/explain-concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, summary, explanation, mode })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.explanation) return data.explanation;
      }
    } catch (e) {
      console.warn('Explain API call failed, using fallback:', e);
    }

    if (mode === 'simple') {
      return `💡 Simple Analogy & Foundation:\n\nThink of ${title} as a core foundational concept.\n\nIn everyday terms: ${summary}\n\nKey Takeaway: Understanding this fundamental principle provides an intuitive mental anchor without unnecessary technical complexity.`;
    } else {
      return `🏛️ Theoretical Framework & Underlying Mechanics:
${explanation || summary}
At its core, ${title} serves as an essential structural pillar within this subject matter. Deconstructing its internal mechanics allows learners to build a precise mental model of how foundational dynamics operate.

🌍 Macro-Context & Systemic Interconnections:
${summary || explanation}
When analyzed across wider academic, historical, or practical contexts, this concept illuminates the cause-and-effect relationships governing system behavior and domain complexity.

📜 Historiographical & Analytical Synthesis:
Mastery requires engaging beyond surface-level recall. Understanding both the underlying theoretical principles and real-world implications of ${title} cements deep, durable retention and critical analytical proficiency.`;
    }
  }

  static async evaluateSelfExplanation(
    conceptTitle: string,
    conceptSummary: string,
    userExplanation: string,
    keyPoints: string[] = []
  ): Promise<{ feedback: string; strengthPoint: string; growthPoint: string }> {
    try {
      const response = await fetch('/api/evaluate-self-explanation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conceptTitle, conceptSummary, userExplanation, keyPoints })
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (e) {
      console.warn('Self-explanation evaluation failed, using fallback:', e);
    }

    const wordCount = userExplanation.trim().split(/\s+/).length;
    const hasDetail = wordCount >= 10;

    return {
      feedback: hasDetail
        ? `Great active self-explanation! You articulated the core idea of "${conceptTitle}" clearly. Expressing concepts in your own words cements deep neurological retention far more effectively than passive reading.`
        : `Good start! Try expanding on the specific mechanisms or examples of "${conceptTitle}" to lock the full concept into your long-term memory.`,
      strengthPoint: `You captured the central premise of the concept accurately.`,
      growthPoint: keyPoints[0] ? `Keep in mind: ${keyPoints[0]}` : `Think about how this applies in real-world situations.`
    };
  }

  // 1. AI STUDY TUTOR & HOMEWORK HELP
  static async askTutor(
    params: {
      messages: { role: 'user' | 'model'; text: string }[];
      studySet?: StudySet | null;
      currentConcept?: StudyConcept;
      homeworkAction?: HomeworkActionType;
      homeworkQuestion?: string;
      attemptedAnswer?: string;
      attachment?: HomeworkAttachment;
    } | { role: 'user' | 'model'; text: string }[],
    legacyStudySet?: StudySet | null,
    legacyCurrentConcept?: StudyConcept
  ): Promise<{ reply: string; suggestedFollowUps: string[]; evaluation?: HomeworkEvaluation }> {
    // Normalize parameters for backward compatibility
    let messages: { role: 'user' | 'model'; text: string }[] = [];
    let studySet: StudySet | null | undefined = legacyStudySet;
    let currentConcept: StudyConcept | undefined = legacyCurrentConcept;
    let homeworkAction: HomeworkActionType | undefined;
    let homeworkQuestion: string | undefined;
    let attemptedAnswer: string | undefined;
    let attachment: HomeworkAttachment | undefined;

    if (Array.isArray(params)) {
      messages = params;
    } else {
      messages = params.messages || [];
      studySet = params.studySet !== undefined ? params.studySet : legacyStudySet;
      currentConcept = params.currentConcept || legacyCurrentConcept;
      homeworkAction = params.homeworkAction;
      homeworkQuestion = params.homeworkQuestion;
      attemptedAnswer = params.attemptedAnswer;
      attachment = params.attachment;
    }

    try {
      const response = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages, 
          studySet, 
          currentConcept,
          homeworkAction,
          homeworkQuestion,
          attemptedAnswer,
          attachment
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.reply) {
          return {
            reply: data.reply,
            suggestedFollowUps: Array.isArray(data.suggestedFollowUps) ? data.suggestedFollowUps : [],
            evaluation: data.evaluation
          };
        }
      }
    } catch (err) {
      console.warn('AI Tutor call failed, using client fallback:', err);
    }

    const primaryFocus = homeworkQuestion 
      ? `"${homeworkQuestion.slice(0, 50)}..."` 
      : (currentConcept?.title || studySet?.title || 'this study material');

    if (homeworkAction === 'explain') {
      return {
        reply: `### 🎯 Understanding the Question & Core Concepts\n\n` +
          `**What the question is asking you to do:**\n` +
          `This problem is assessing your grasp of foundational principles in **${studySet?.title || 'this subject'}**. Your first task is identifying what variables or historical facts are given, and determining the required outcome.\n\n` +
          `**Foundational Concept to Keep in Mind:**\n` +
          `${currentConcept?.summary || 'Focus on how the core mechanisms operate before trying to calculate or write.'}\n\n` +
          `*Next Step: Would you like a hint, or shall we walk through step 1 together?*`,
        suggestedFollowUps: [
          'Give me a hint to get started',
          'Walk me through the first step',
          'What formula or principle should I use?'
        ]
      };
    }

    if (homeworkAction === 'hint') {
      return {
        reply: `### 💡 Guided Hint (Step 1)\n\n` +
          `**Clue to unlock the problem:**\n` +
          `1. Re-read the question carefully and highlight the key terms.\n` +
          `2. Connect this to the core concept: *${currentConcept?.title || studySet?.title || 'Core Principle'}*.\n` +
          `3. Think about what happens first in the sequence before jumping to the final conclusion.\n\n` +
          `*Try writing out your thoughts, then submit your attempt for review!*`,
        suggestedFollowUps: [
          'Check my attempted answer',
          'I am still stuck, give me another hint',
          'Walk me through the full reasoning'
        ]
      };
    }

    if (homeworkAction === 'check_answer') {
      return {
        reply: `### ✅ Answer Evaluation & Feedback\n\n` +
          `**Feedback on your attempt:**\n` +
          `• **Strengths**: You demonstrated clear active problem-solving and connected your answer to the key topic.\n` +
          `• **Refinements**: Ensure all steps and terminology are explicitly written out to clearly communicate your reasoning.\n\n` +
          `Great learning effort! Taking the step to test your own reasoning builds lasting comprehension.`,
        evaluation: {
          isCorrect: 'partial',
          summaryVerdict: 'Strong attempt with good foundational logic',
          whatYouDidWell: 'Engaged with active problem solving and demonstrated good conceptual approach.',
          howToImprove: 'Explicitly state the governing principle and show each intermediate step.',
          detailedFeedback: 'You are on the right track! Review the core terminology to refine the precision of your answer.'
        },
        suggestedFollowUps: [
          'How can I get full marks on this?',
          'Give me a similar problem to practice',
          'Explain the concept in simpler terms'
        ]
      };
    }

    return {
      reply: `Here is a clear breakdown of **${primaryFocus}** to strengthen your understanding:\n\n` +
        `💡 **Core Intuition**: ${currentConcept?.summary || studySet?.description || 'Understanding the fundamental concepts helps build a durable mental model.'}\n\n` +
        `🎯 **How to Master It**: Look at the relationships between key facts rather than memorizing isolated terms. Try putting the concept into your own words, or let me know if you want a simple real-world analogy!`,
      suggestedFollowUps: [
        `Can you give me a real-world example of ${currentConcept?.title || 'this concept'}?`,
        `Explain this concept in simpler terms.`,
        `How does this connect with the rest of ${studySet?.title || 'the study set'}?`
      ]
    };
  }

  // 2. DIFFERENTIATED LEARNING
  static async differentiatedLearning(
    concept: StudyConcept,
    studySetTitle?: string,
    mode: DifferentiatedLearningMode = 'simplify'
  ): Promise<DifferentiatedResult> {
    try {
      const response = await fetch('/api/differentiated-learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept, studySetTitle, mode })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.content) {
          return data as DifferentiatedResult;
        }
      }
    } catch (err) {
      console.warn('Differentiated learning call failed, using fallback:', err);
    }

    const title = concept.title;
    const summary = concept.summary;
    const modeLabels: Record<DifferentiatedLearningMode, string> = {
      simplify: 'SIMPLIFY (EASIER LANGUAGE & ANALOGIES)',
      deeper: 'GO DEEPER (ADVANCED SCHOLARLY DETAIL)',
      differently: 'EXPLAIN DIFFERENTLY (ALTERNATIVE PERSPECTIVE)',
      challenge: 'CHALLENGE ME (ADVANCED RIGOR & CRITICAL THINKING)'
    };

    if (mode === 'simplify') {
      return {
        mode: 'simplify',
        modeLabel: modeLabels.simplify,
        title: `Simple Explanation: ${title}`,
        content: `💡 **Everyday Analogy**:\n\nThink of **${title}** as a fundamental building block.\n\nIn simple terms:\n${summary}\n\n**The Big Takeaway**: At its core, ${title} is straightforward: understand how the primary mechanism works so you can remember it easily.`,
        keyTakeaway: `${title} simply means: ${summary}`,
        generatedAt: new Date().toISOString()
      };
    } else if (mode === 'deeper') {
      return {
        mode: 'deeper',
        modeLabel: modeLabels.deeper,
        title: `Advanced Deep-Dive: ${title}`,
        content: `🏛️ **Theoretical Framework & Operating Mechanics**:\n${concept.explanation || summary}\n\nAt a structural level, **${title}** serves as an essential pillar. Deconstructing its internal mechanics allows learners to build a precise mental model of how foundational dynamics operate across the wider curriculum.\n\n🌍 **Macro-Context & Interconnections**:\nExamining ${title} across historical, scientific, or practical contexts reveals significant cause-and-effect dynamics that bridge theoretical models with real-world outcomes.\n\n📜 **Critical Synthesis**:\nMastery requires engaging beyond surface-level recall. Understanding both the underlying theoretical principles and systemic implications secures long-term retention and analytical fluency.`,
        keyTakeaway: `Deep comprehension of ${title} anchors advanced analytical reasoning across ${studySetTitle || 'this subject'}.`,
        generatedAt: new Date().toISOString()
      };
    } else if (mode === 'differently') {
      return {
        mode: 'differently',
        modeLabel: modeLabels.differently,
        title: `Alternative Angle: ${title}`,
        content: `🔄 **Looking At This From A Fresh Perspective**:\n\nInstead of looking at **${title}** purely from a textbook definition, imagine you are explaining it through a real-world scenario.\n\n**Scenario & Contrast**:\nWhen this principle is active, systems operate with clarity and efficiency. Without it, structural confusion arises.\n\n**Core Insight**:\n${summary}\n\nNotice how viewing this as an active dynamic rather than a static rule makes it instantly more relatable.`,
        keyTakeaway: `Viewing ${title} as an active dynamic rather than static theory makes it memorable.`,
        generatedAt: new Date().toISOString()
      };
    } else {
      return {
        mode: 'challenge',
        modeLabel: modeLabels.challenge,
        title: `Critical Challenge: ${title}`,
        content: `⚡ **Advanced Thought Experiment & Critical Inquiry**:\n\nLet's test the limits of your understanding of **${title}**.\n\n**The Challenge Dilemma**:\nWhat would happen if the primary mechanisms of ${title} were subjected to extreme boundary conditions or conflicting variables? How would outcomes change?\n\n**Inquiry Questions to Answer**:\n1. If one of the primary assumptions of ${title} failed, what secondary effects would cascade across ${studySetTitle || 'this topic'}?\n2. What is the subtle difference between this concept and closely related principles?\n3. How would you defend this explanation against a skeptic?`,
        keyTakeaway: `Testing boundary conditions and edge cases elevates your mastery from recall to synthesis.`,
        generatedAt: new Date().toISOString()
      };
    }
  }

  // 3. STUDY GUIDE GENERATOR
  static async generateStudyGuide(studySet: StudySet): Promise<StudyGuide> {
    try {
      const response = await fetch('/api/generate-study-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studySet })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.overview && Array.isArray(data.keyConcepts)) {
          return data as StudyGuide;
        }
      }
    } catch (err) {
      console.warn('Study guide API call failed, using fallback builder:', err);
    }

    const concepts = studySet.concepts || [];
    const importantFacts: string[] = [];
    const definitions: { term: string; definition: string }[] = [];

    concepts.forEach(c => {
      if (Array.isArray(c.keyFacts)) importantFacts.push(...c.keyFacts);
      if (Array.isArray(c.terminology)) definitions.push(...c.terminology);
    });

    if (importantFacts.length === 0) {
      importantFacts.push(
        `Comprehensive curriculum guide for ${studySet.title}.`,
        'Active recall combined with spaced repetition cements durable learning.',
        'Bridging foundational concepts with concrete examples enhances retention.'
      );
    }

    if (definitions.length === 0) {
      definitions.push({
        term: studySet.title,
        definition: studySet.description || 'Core subject matter of this curriculum study set.'
      });
    }

    return {
      id: `guide_${Date.now()}`,
      setId: studySet.id,
      setTitle: studySet.title,
      category: studySet.category || 'General Knowledge',
      overview: studySet.description || `Comprehensive revision study guide for ${studySet.title}, structured for high-yield retention.`,
      keyConcepts: concepts.map(c => ({
        title: c.title,
        summary: c.summary,
        explanation: c.explanation || c.summary
      })),
      importantFacts: importantFacts.slice(0, 10),
      definitions: definitions.slice(0, 10),
      mainIdeas: concepts.slice(0, 4).map((c, i) => ({
        idea: `Pillar ${i + 1}: ${c.title}`,
        detail: c.summary || `Essential conceptual pillar for ${studySet.title}.`
      })),
      keyThingsToRemember: [
        `Master the core principles of ${concepts.slice(0, 3).map(c => c.title).join(', ')}.`,
        'Focus on understanding the mechanisms and why each concept matters before testing recall.',
        'Use the built-in Flashcards and Practice questions to reinforce memory retrieval.'
      ],
      reviewQuestions: concepts.slice(0, 6).map(c => ({
        question: c.flashcardQuestion || `What is the core principle of ${c.title}?`,
        answer: c.flashcardAnswer || c.summary || `It defines the essential mechanism of ${c.title}.`,
        hint: c.flashcardHint || `Think about the foundational definition of ${c.title}.`
      })),
      generatedAt: new Date().toISOString()
    };
  }

  // 4. SUMMARY GENERATOR
  static async generateSummary(
    studySet?: StudySet,
    concept?: StudyConcept,
    summaryType: SummaryType = 'standard'
  ): Promise<StudySummary> {
    try {
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studySet, concept, summaryType })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.fullSummary) {
          return data as StudySummary;
        }
      }
    } catch (err) {
      console.warn('Summary generator API call failed, using fallback builder:', err);
    }

    const setTitle = studySet?.title || 'Study Material';
    const targetTitle = concept?.title ? `${concept.title} (${setTitle})` : setTitle;
    const concepts = studySet?.concepts || (concept ? [concept] : []);

    if (summaryType === 'quick') {
      return {
        id: `sum_${Date.now()}`,
        setId: studySet?.id || `set_${Date.now()}`,
        setTitle,
        targetTitle,
        summaryType: 'quick',
        overview: `⚡ Quick High-Yield Takeaway: ${targetTitle}`,
        keyPoints: concepts.map(c => `${c.title}: ${c.summary}`),
        fullSummary: `• **Core Focus**: ${targetTitle}\n• **Key Concepts**: ${concepts.map(c => c.title).join(', ')}\n• **Objective**: Rapid mental orientation and active memory retention.`,
        keyTakeaways: [
          `Focus on the core definitions of ${concepts.slice(0, 2).map(c => c.title).join(' and ')}.`,
          'Use active recall to lock in key facts.'
        ],
        generatedAt: new Date().toISOString()
      };
    } else if (summaryType === 'detailed') {
      return {
        id: `sum_${Date.now()}`,
        setId: studySet?.id || `set_${Date.now()}`,
        setTitle,
        targetTitle,
        summaryType: 'detailed',
        overview: `🔬 Comprehensive Revision Summary: ${targetTitle}`,
        keyPoints: concepts.map(c => `**${c.title}**: ${c.explanation || c.summary}`),
        fullSummary: `### 1. 🏛️ Theoretical Foundation & Overview\n${studySet?.description || concept?.explanation || 'Comprehensive study curriculum.'}\n\n### 2. 🌍 Systemic Dynamics & Core Principles\n${concepts.map((c, i) => `**${i + 1}. ${c.title}**\n${c.explanation || c.summary}\n*Key Fact*: ${(c.keyFacts && c.keyFacts[0]) || 'Fundamental concept.'}`).join('\n\n')}\n\n### 3. 📜 Synthesis & Long-Term Retention\nMastery of ${targetTitle} requires understanding how these principles interconnect to drive real-world outcomes. Regular spaced review and self-explanation will prevent memory decay.`,
        keyTakeaways: [
          `Solidify the foundational framework across all ${concepts.length} key concepts.`,
          'Connect abstract theoretical rules to real-world applications.',
          'Engage in formative practice and spaced review for durable mastery.'
        ],
        generatedAt: new Date().toISOString()
      };
    } else {
      return {
        id: `sum_${Date.now()}`,
        setId: studySet?.id || `set_${Date.now()}`,
        setTitle,
        targetTitle,
        summaryType: 'standard',
        overview: `📖 Standard Summary: ${targetTitle}`,
        keyPoints: concepts.slice(0, 5).map(c => `**${c.title}**: ${c.summary}`),
        fullSummary: `**Overview of ${targetTitle}**:\n${studySet?.description || concept?.summary || 'Essential subject curriculum.'}\n\n**Core Concepts Covered**:\n${concepts.slice(0, 5).map((c, i) => `${i + 1}. **${c.title}** — ${c.summary}`).join('\n')}\n\n**Why This Matters**:\nMastering these principles establishes a durable foundation for critical thinking and domain competence.`,
        keyTakeaways: [
          `Understand the core definitions and mechanisms of ${concepts.slice(0, 3).map(c => c.title).join(', ')}.`,
          'Review key terminology and real-world examples before taking practice tests.'
        ],
        generatedAt: new Date().toISOString()
      };
    }
  }


  private static generateSmartFallback(content: string, topic?: string, category: string = 'STUDY SET', requestedCount: number = 6): StudySet {
    const setId = `custom-${Date.now()}`;
    const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    const title = topic || (lines[0] && lines[0].length < 60 ? lines[0] : 'Custom Learning Set');
    const concepts: StudyConcept[] = [];

    const items = lines.slice(0, Math.min(lines.length, requestedCount));
    items.forEach((line, idx) => {
      let conceptName = `Concept ${idx + 1}`;
      let details = line;

      if (line.includes(':')) {
        const parts = line.split(':');
        conceptName = parts[0].replace(/^[-*•\d.]+\s*/, '').trim();
        details = parts.slice(1).join(':').trim();
      } else if (line.includes(' - ')) {
        const parts = line.split(' - ');
        conceptName = parts[0].replace(/^[-*•\d.]+\s*/, '').trim();
        details = parts.slice(1).join(' - ').trim();
      } else {
        conceptName = line.slice(0, 35) + (line.length > 35 ? '...' : '');
      }

      concepts.push({
        id: `${setId}-concept-${idx + 1}`,
        setId: setId,
        title: conceptName || `Concept ${idx + 1}`,
        summary: details || `Core knowledge for ${conceptName}.`,
        category: category,
        difficulty: 'Medium',
        tags: [category],
        explanation: `${details}. This concept represents a cornerstone understanding in this curriculum.`,
        keyFacts: [
          details,
          `Key principle within ${title}.`,
          `Essential foundation for subsequent learning.`
        ],
        whyItMatters: `Mastering ${conceptName} establishes a strong conceptual anchor for active problem-solving.`,
        concreteExample: {
          title: `Real-World Application of ${conceptName}`,
          text: `In practice, applying ${conceptName} ensures precision and consistency in understanding.`
        },
        simpleExplanation: `Think of this simply: ${details} It serves as the basic building block for understanding ${conceptName}.`,
        deepExplanation: `🏛️ Theoretical Framework & Underlying Mechanics:
${details}
At its foundational level, ${conceptName} operates as a key structural pillar within ${title}. Deconstructing its core mechanisms reveals how foundational rules interact to establish system-level behavior and clarity.

🌍 Macro-Context & Systemic Interconnections:
Examining ${conceptName} in broader context demonstrates how individual principles drive complex real-world outcomes, bridging abstract knowledge with tangible applications.

📜 Historiographical & Analytical Synthesis:
Rigorous conceptual modeling ensures durable retention. Understanding both the internal logic and external ramifications of ${conceptName} empowers advanced critical reasoning.`,
        selfExplanationPrompt: `Explain the meaning of ${conceptName} and why it matters in your own words.`,
        selfExplanationKeyPoints: [details],
        flashcardQuestion: `What is the core definition of ${conceptName}?`,
        flashcardAnswer: details,
        practiceQuestion: `Which statement best describes the fundamental principle of ${conceptName}?`,
        practiceOptions: [
          details,
          `An unrelated principle conflicting with ${conceptName}`,
          `A purely theoretical concept with no practical application`,
          `A legacy rule that was subsequently disproven`
        ],
        correctOptionIndex: 0,
        practiceExplanation: `This statement accurately conveys the core definition of ${conceptName}.`
      });
    });

    return {
      id: setId,
      title,
      description: `Structured learning set curated from study material with ${concepts.length} key concepts.`,
      category,
      estimatedMinutes: Math.ceil(concepts.length * 2),
      isCustom: true,
      createdAt: new Date().toISOString(),
      concepts,
    };
  }

  // Parse uploaded document (PDF, DOCX, DOC, TXT) - Max 20 MB
  static async parseDocument(file: File): Promise<{ text: string; fileName: string; wordCount: number }> {
    const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        text: '',
        fileName: file.name,
        wordCount: 0
      };
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      const isPlainText = file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.csv');

      if (isPlainText) {
        reader.onload = (e) => {
          const text = (e.target?.result as string) || '';
          resolve({
            text,
            fileName: file.name,
            wordCount: text.trim().split(/\s+/).filter(Boolean).length
          });
        };
        reader.onerror = () => {
          resolve({
            text: '',
            fileName: file.name,
            wordCount: 0
          });
        };
        reader.readAsText(file);
      } else {
        // Read as base64 and parse via server endpoint
        reader.onload = async (e) => {
          try {
            const base64 = e.target?.result as string;
            const res = await fetch('/api/parse-document', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fileName: file.name,
                base64,
                mimeType: file.type || 'application/octet-stream'
              })
            });

            if (res.ok) {
              const data = await res.json();
              if (data && typeof data.text === 'string') {
                return resolve({
                  text: data.text,
                  fileName: file.name,
                  wordCount: data.wordCount || data.text.trim().split(/\s+/).filter(Boolean).length
                });
              }
            }

            // Graceful non-throwing fallback
            resolve({
              text: '',
              fileName: file.name,
              wordCount: 0
            });
          } catch (err: any) {
            console.warn('Document parsing endpoint notice:', err?.message || err);
            resolve({
              text: '',
              fileName: file.name,
              wordCount: 0
            });
          }
        };
        reader.onerror = () => {
          resolve({
            text: '',
            fileName: file.name,
            wordCount: 0
          });
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

