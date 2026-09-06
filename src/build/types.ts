export type BuildToolType =
  | 'exam'
  | 'worksheet'
  | 'lesson-plan'
  | 'mind-map'
  | 'presentation'
  | 'course'
  | 'course-builder'
  | 'learning-path'
  | 'pdf-studypack'
  | 'pdf-quiz';

// 1. Exam Generator Types
export interface ExamQuestion {
  id: string;
  questionNumber: number;
  type: 'multiple-choice' | 'short-answer' | 'essay' | 'problem-solving' | 'true-false';
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

export interface ExamPaper {
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
  sourceDocName?: string;
  createdAt: string;
  toolType: 'exam';
  data?: any;
}

export type ExamResult = ExamPaper;

// 2. Worksheet Generator Types
export interface WorksheetItem {
  id: string;
  prompt: string;
  expectedAnswer?: string;
  options?: string[];
  blankCount?: number;
  pairingPairs?: { left: string; right: string }[];
}

export interface WorksheetSection {
  id: string;
  title: string;
  instructions: string;
  marks: number;
  items: WorksheetItem[];
}

export interface WorksheetResource {
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
  sourceDocName?: string;
  createdAt: string;
  toolType: 'worksheet';
  data?: any;
}

export type WorksheetResult = WorksheetResource;

// 3. Lesson Plan Types
export interface LessonPhase {
  phase: string;
  durationMinutes: number;
  teacherActivity: string;
  studentActivity: string;
}

export interface LessonPlanResource {
  id: string;
  title: string;
  subject: string;
  topic: string;
  gradeLevel: string;
  durationMinutes: number;
  objectives: string[];
  materialsNeeded: string[];
  phases: LessonPhase[];
  assessmentStrategy: string;
  differentiation?: {
    support: string;
    extension: string;
  };
  sourceDocName?: string;
  createdAt: string;
  toolType: 'lesson-plan';
  data?: any;
}

export type LessonPlanResult = LessonPlanResource;

// 4. Mind Map Types
export interface MindMapNode {
  id: string;
  label: string;
  notes?: string;
  children?: MindMapNode[];
}

export interface MindMapResource {
  id: string;
  title: string;
  subject: string;
  topic: string;
  gradeLevel: string;
  rootNode: MindMapNode;
  summary?: string;
  sourceDocName?: string;
  createdAt: string;
  toolType: 'mind-map';
}

export type MindMapResult = MindMapResource;

// 5. Presentation / Slide Deck Types
export interface PresentationSlide {
  slideNumber: number;
  title: string;
  bullets: string[];
  speakerNotes?: string;
  visualCue?: string;
}

export interface PresentationResource {
  id: string;
  title: string;
  subject: string;
  topic: string;
  audienceLevel: string;
  slides: PresentationSlide[];
  summary?: string;
  sourceDocName?: string;
  createdAt: string;
  toolType: 'presentation';
  data?: any;
}

export type PresentationBuildResult = PresentationResource;
export type PresentationBuildSlide = PresentationSlide;

// 6. Course Builder Types
export interface CourseLessonItem {
  lessonTitle: string;
  learningObjective?: string;
  recommendedActivity?: string;
}

export interface CourseModule {
  moduleNumber: number;
  title: string;
  description: string;
  estimatedHours?: number;
  learningOutcomes: string[];
  keyTopics: string[];
  practicalProjectOrTask?: string;
  lessons?: CourseLessonItem[];
}

export interface CourseResource {
  id: string;
  title: string;
  subject: string;
  topic: string;
  targetAudience: string;
  courseOverview: string;
  totalWeeksOrHours: string;
  pedagogicalStyle?: string;
  assessmentStrategy?: string;
  modules: CourseModule[];
  prerequisites?: string[];
  capstoneProject?: string;
  sourceDocName?: string;
  createdAt: string;
  toolType: 'course' | 'course-builder';
  data?: any;
}

export type CourseBuildResult = CourseResource;

// 7. Learning Path Builder Types
export interface LearningPathMilestone {
  stepNumber: number;
  title: string;
  description: string;
  estimatedHours: number;
  skillsAcquired: string[];
  suggestedActivities: string[];
  checkpointAssessment: string;
}

export interface LearningPathResource {
  id: string;
  title: string;
  subject: string;
  targetGoal: string;
  startingLevel: string;
  targetLevel: string;
  totalEstimatedWeeks: number;
  milestones: LearningPathMilestone[];
  recommendations: string[];
  sourceDocName?: string;
  createdAt: string;
  toolType: 'learning-path';
  topic?: string;
  data?: any;
}

export type LearningPathBuildResult = LearningPathResource;

// 8. PDF Study Pack Types
export interface GlossaryTerm {
  term: string;
  definition: string;
  context?: string;
}

export interface SelfCheckQuestion {
  question: string;
  answer: string;
  hint?: string;
}

export interface StudyPackResource {
  id: string;
  title: string;
  sourceDocumentName: string;
  sourceDocName?: string;
  overview: string;
  documentOverview?: string;
  gradeLevel: string;
  highYieldTakeaways: string[];
  highYieldRevisionPoints?: string[];
  essentialGlossary: GlossaryTerm[];
  selfCheckQuestions: SelfCheckQuestion[];
  createdAt: string;
  toolType: 'pdf-studypack';
  data?: any;
}

// 9. PDF Quiz Types
export interface PdfQuizBuildQuestion {
  id: string;
  number?: number;
  questionNumber?: number;
  question: string;
  prompt?: string;
  type?: string;
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
  createdAt?: string;
  toolType?: 'pdf-quiz';
  data?: any;
}

export type PdfQuizData = PdfQuizBuildResult;

// Generic Union for Saved Resources
export type SavedResource<T = any> =
  | ExamPaper
  | WorksheetResource
  | LessonPlanResource
  | MindMapResource
  | PresentationResource
  | CourseResource
  | LearningPathResource
  | StudyPackResource
  | PdfQuizBuildResult
  | T;
