export type BuildToolType = 
  | 'exam' 
  | 'worksheet' 
  | 'mind-map' 
  | 'lesson-plan' 
  | 'pdf-studypack' 
  | 'presentation' 
  | 'course-builder' 
  | 'learning-path';

export interface BaseResource {
  id: string;
  title: string;
  subject?: string;
  topic?: string;
  gradeLevel?: string;
  createdAt: string;
  sourceDocName?: string;
  toolType: BuildToolType;
}

// 1. Exam Types
export interface ExamOption {
  letter: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface ExamQuestion {
  id: string;
  questionNumber: number;
  type: 'multiple-choice' | 'short-answer' | 'problem-solving' | 'essay' | 'true-false';
  prompt: string;
  marks: number;
  options?: string[]; // e.g. ["A) ...", "B) ...", "C) ...", "D) ..."]
  correctAnswer?: string;
  markingGuidance?: string;
  rubricCriteria?: string[];
  pageNumber?: number;
}

export interface ExamSection {
  id: string;
  title: string;
  instructions: string;
  marks: number;
  totalMarks?: number;
  questions: ExamQuestion[];
}

export interface ExamPaper extends BaseResource {
  toolType: 'exam';
  institutionHeader: string;
  difficulty: string;
  durationMinutes: number;
  totalMarks: number;
  pagesCount: number;
  generalInstructions: string[];
  sections: ExamSection[];
  overallMarkingNotes?: string;
  specialInstructions?: string;
  sourceMaterial?: string;
}

// 2. Worksheet Types
export interface WorksheetItem {
  id: string;
  prompt: string;
  expectedAnswer?: string;
  answerKey?: string;
  explanation?: string;
  marks?: number;
}

export interface WorksheetSection {
  id: string;
  title: string;
  instructions: string;
  marks: number;
  type?: 'matching' | 'fill-in-blanks' | 'structured-questions' | 'critical-thinking' | 'diagram-analysis';
  items: WorksheetItem[];
}

export interface WorksheetResource extends BaseResource {
  toolType: 'worksheet';
  difficulty: string;
  totalMarks: number;
  estimatedDurationMinutes: number;
  pagesCount: number;
  instructions: string;
  teacherNotes?: string;
  sections: WorksheetSection[];
  learningObjectives?: string[];
  sourceMaterial?: string;
}

// 3. Mind Map Types
export interface MindMapNode {
  id: string;
  label: string;
  notes?: string;
  color?: string;
  children?: MindMapNode[];
  isCollapsed?: boolean;
}

export interface MindMapResource extends BaseResource {
  toolType: 'mind-map';
  summary?: string;
  rootNode: MindMapNode;
  sourceMaterial?: string;
}

// 4. PDF Study Pack Types
export interface ConceptualPillar {
  title: string;
  content: string;
  subPoints?: string[];
}

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

export interface StudyPackResource extends BaseResource {
  toolType: 'pdf-studypack';
  sourceDocumentName: string;
  overview: string;
  format?: string;
  focusArea?: string;
  conceptualPillars?: ConceptualPillar[];
  highYieldTakeaways: string[];
  highYieldRevisionPoints?: string[];
  essentialGlossary: GlossaryTerm[];
  selfCheckQuestions: SelfCheckQuestion[];
  extractedText?: string;
}

// 5. Lesson Plan Types
export interface LessonPhase {
  phase: string;
  durationMinutes: number;
  teacherActivity: string;
  studentActivity: string;
  keyQuestionsOrCheckpoints?: string[];
  materialsNeeded?: string[];
}

export interface LessonPlanResource extends BaseResource {
  toolType: 'lesson-plan';
  durationMinutes: number;
  objectives: string[];
  materialsNeeded: string[];
  phases: LessonPhase[];
  assessmentStrategy: string;
  differentiation: {
    support: string;
    extension: string;
  };
}

// 6. Presentation Deck Types
export interface SlideItem {
  id: string;
  slideNumber: number;
  title: string;
  subtitle?: string;
  bulletPoints: string[];
  speakerNotes: string;
  suggestedVisualOrDiagram?: string;
  discussionOrEngagementPrompt?: string;
}

export interface PresentationResource extends BaseResource {
  toolType: 'presentation';
  subtitle: string;
  targetAudience: string;
  themeOrColorMood: string;
  slidesCount: number;
  slides: SlideItem[];
}

// 7. Course Builder Types
export interface CourseLesson {
  id: string;
  lessonTitle: string;
  learningObjective: string;
  recommendedActivity: string;
  estimatedMinutes?: number;
}

export interface CourseModule {
  id: string;
  moduleNumber: number;
  title: string;
  estimatedHours: number;
  overview?: string;
  lessons: CourseLesson[];
}

export interface CourseResource extends BaseResource {
  toolType: 'course-builder';
  description: string;
  targetAudience: string;
  durationWeeks: number;
  learningOutcomes: string[];
  modules: CourseModule[];
}

// 8. Learning Path Types
export interface MilestonePhase {
  milestoneNumber: number;
  phaseName: string;
  targetWeeks: string;
  keyObjectives: string[];
  milestoneProject: string;
}

export interface LearningPathResource extends BaseResource {
  toolType: 'learning-path';
  targetGoal: string;
  estimatedTotalWeeks: number;
  milestones: MilestonePhase[];
}

// Unified Saved Resource
export type SavedResource = 
  | ExamPaper 
  | WorksheetResource 
  | MindMapResource 
  | StudyPackResource 
  | LessonPlanResource 
  | PresentationResource 
  | CourseResource 
  | LearningPathResource;
