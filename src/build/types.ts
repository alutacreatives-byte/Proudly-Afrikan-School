export * from '../study/types';
export * from '../study/utils/storage';

export type BuildToolType =
  | 'exam'
  | 'worksheet'
  | 'lesson-plan'
  | 'pdf-quiz'
  | 'pdf-studypack'
  | 'presentation'
  | 'course'
  | 'learning-path';

export interface ExamQuestion {
  id: string;
  questionNumber: number;
  type: string;
  prompt: string;
  marks: number;
  options?: string[];
  correctAnswer?: string;
  markingGuidance?: string;
  rubricCriteria?: string[];
}

export interface ExamSection {
  id: string;
  title: string;
  instructions: string;
  totalMarks: number;
  questions: ExamQuestion[];
}

export interface ExamResult {
  id: string;
  title: string;
  institutionHeader?: string;
  subject: string;
  topic: string;
  gradeLevel: string;
  difficulty: string;
  durationMinutes: number;
  totalMarks: number;
  generalInstructions: string[];
  sections: ExamSection[];
  overallMarkingNotes?: string;
  toolType: 'exam';
  createdAt: string;
  sourceSnippet?: string;
  documentName?: string;
}

export interface WorksheetItem {
  id: string;
  prompt: string;
  expectedAnswer: string;
}

export interface WorksheetSection {
  id: string;
  title: string;
  instructions: string;
  marks: number;
  items: WorksheetItem[];
}

export interface WorksheetResult {
  id: string;
  title: string;
  subject: string;
  topic: string;
  gradeLevel: string;
  difficulty: string;
  totalMarks: number;
  estimatedDurationMinutes: number;
  instructions: string;
  teacherNotes?: string;
  sections: WorksheetSection[];
  toolType: 'worksheet';
  createdAt: string;
  sourceSnippet?: string;
  documentName?: string;
}

export interface LessonPlanPhase {
  phase: string;
  durationMinutes: number;
  teacherActivity: string;
  studentActivity: string;
}

export interface LessonPlanResult {
  id: string;
  title: string;
  subject: string;
  topic: string;
  gradeLevel: string;
  durationMinutes: number;
  objectives: string[];
  materialsNeeded: string[];
  phases: LessonPlanPhase[];
  assessmentStrategy: string;
  differentiation: {
    support: string;
    extension: string;
  };
  toolType: 'lesson-plan';
  createdAt: string;
  sourceSnippet?: string;
  documentName?: string;
}

export interface PdfQuizBuildQuestion {
  id: string;
  number: number;
  question: string;
  type: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  sourceReferenceQuote?: string;
}

export interface PdfQuizBuildResult {
  id: string;
  title: string;
  sourceDocumentName?: string;
  sourceDocName?: string;
  gradeLevel: string;
  difficulty: string;
  totalQuestions: number;
  questions: PdfQuizBuildQuestion[];
  toolType: 'pdf-quiz';
  createdAt: string;
  sourceSnippet?: string;
  documentName?: string;
}

export interface PdfStudyPackResult {
  id: string;
  title: string;
  sourceDocumentName?: string;
  sourceDocName?: string;
  overview: string;
  documentOverview?: string;
  gradeLevel: string;
  highYieldTakeaways: string[];
  highYieldRevisionPoints?: string[];
  essentialGlossary: Array<{
    term: string;
    definition: string;
    context?: string;
  }>;
  selfCheckQuestions: Array<{
    question: string;
    answer: string;
    hint?: string;
  }>;
  toolType: 'pdf-studypack';
  createdAt: string;
  sourceSnippet?: string;
  documentName?: string;
}

export interface PresentationBuildSlide {
  id: string;
  slideNumber: number;
  title: string;
  subtitle?: string;
  bulletPoints: string[];
  speakerNotes: string;
  suggestedVisualOrDiagram?: string;
  discussionOrEngagementPrompt?: string;
}

export interface PresentationBuildResult {
  id: string;
  title: string;
  subtitle?: string;
  subject: string;
  topic: string;
  targetAudience: string;
  gradeLevel?: string;
  themeOrColorMood?: string;
  slidesCount: number;
  slides: PresentationBuildSlide[];
  toolType: 'presentation';
  createdAt: string;
  sourceSnippet?: string;
  documentName?: string;
}

export interface CourseBuildLesson {
  lessonTitle: string;
  learningObjective: string;
  recommendedActivity: string;
}

export interface CourseBuildModule {
  moduleNumber: number;
  title: string;
  description: string;
  estimatedHours: number;
  keyTopics: string[];
  learningOutcomes: string[];
  practicalProjectOrTask: string;
  lessons: CourseBuildLesson[];
}

export interface CourseBuildResult {
  id: string;
  title: string;
  subject: string;
  targetAudience: string;
  courseOverview: string;
  totalWeeksOrHours: string;
  pedagogicalStyle: string;
  assessmentStrategy: string;
  prerequisites: string[];
  learningOutcomes: string[];
  modules: CourseBuildModule[];
  capstoneProject: string;
  toolType: 'course';
  createdAt: string;
  sourceSnippet?: string;
  documentName?: string;
}

export interface LearningPathBuildStage {
  stageNumber: number;
  stageTitle: string;
  estimatedWeeksOrHours: string;
  description: string;
  coreCompetencies: string[];
  suggestedMilestoneProject: string;
  certificationOrExitCriteria: string;
}

export interface LearningPathBuildResult {
  id: string;
  title: string;
  subject: string;
  targetGoal: string;
  estimatedWeeks: number;
  overview: string;
  stages: LearningPathBuildStage[];
  recommendedResources: string[];
  toolType: 'learning-path';
  createdAt: string;
  sourceSnippet?: string;
  documentName?: string;
}

export type AnyBuildResult =
  | ExamResult
  | WorksheetResult
  | LessonPlanResult
  | PdfQuizBuildResult
  | PdfStudyPackResult
  | PresentationBuildResult
  | CourseBuildResult
  | LearningPathBuildResult;

