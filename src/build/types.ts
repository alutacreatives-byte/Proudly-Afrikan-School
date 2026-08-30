export type ToolType =
  | 'exam'
  | 'worksheet'
  | 'lesson-plan'
  | 'pdf-quiz'
  | 'pdf-studypack'
  | 'presentation'
  | 'course-builder'
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
  instructions?: string;
  totalMarks: number;
  questions: ExamQuestion[];
}

export interface ExamResource {
  id: string;
  toolType?: 'exam';
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
  createdAt: string;
}

export interface WorksheetItem {
  id: string;
  prompt: string;
  expectedAnswer: string;
  options?: string[];
  matchingPairs?: Array<{ left: string; right: string }>;
}

export interface WorksheetSection {
  id: string;
  title: string;
  instructions?: string;
  marks: number;
  items: WorksheetItem[];
}

export interface WorksheetResource {
  id: string;
  toolType?: 'worksheet';
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
  createdAt: string;
}

export interface LessonPlanPhase {
  phase: string;
  durationMinutes: number;
  teacherActivity: string;
  studentActivity: string;
  formativeCheck?: string;
}

export interface LessonPlanResource {
  id: string;
  toolType?: 'lesson-plan';
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
  createdAt: string;
}

export interface PdfQuizQuestion {
  id: string;
  number: number;
  question: string;
  type: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  sourceReferenceQuote?: string;
}

export interface PdfQuizResource {
  id: string;
  toolType?: 'pdf-quiz';
  title: string;
  sourceDocumentName?: string;
  sourceDocName?: string;
  gradeLevel: string;
  difficulty: string;
  totalQuestions: number;
  questions: PdfQuizQuestion[];
  createdAt: string;
}

export interface GlossaryEntry {
  term: string;
  definition: string;
  context?: string;
}

export interface SelfCheckQuestion {
  question: string;
  answer: string;
  hint?: string;
}

export interface PdfStudyPackResource {
  id: string;
  toolType?: 'pdf-studypack';
  title: string;
  sourceDocumentName?: string;
  sourceDocName?: string;
  overview?: string;
  documentOverview?: string;
  gradeLevel: string;
  highYieldTakeaways?: string[];
  highYieldRevisionPoints?: string[];
  essentialGlossary: GlossaryEntry[];
  selfCheckQuestions: SelfCheckQuestion[];
  createdAt: string;
}

export interface SlideItem {
  id: string;
  slideNumber: number;
  title: string;
  subtitle?: string;
  bulletPoints: string[];
  speakerNotes?: string;
  suggestedVisualOrDiagram?: string;
  discussionOrEngagementPrompt?: string;
}

export interface PresentationResource {
  id: string;
  toolType?: 'presentation';
  title: string;
  subtitle?: string;
  subject: string;
  topic: string;
  targetAudience?: string;
  gradeLevel?: string;
  themeOrColorMood?: string;
  slidesCount: number;
  slides: SlideItem[];
  createdAt: string;
}

export interface CourseLesson {
  id: string;
  lessonTitle: string;
  learningObjective: string;
  recommendedActivity?: string;
}

export interface CourseModule {
  id: string;
  moduleNumber: number;
  title: string;
  estimatedHours: number;
  lessons: CourseLesson[];
}

export interface CourseWeeklyModule {
  weekNumber: number;
  title: string;
  description: string;
  lectureTopics: string[];
  requiredReadings?: string[];
  assignmentOrMilestone?: string;
}

export interface CourseGradingItem {
  item: string;
  percentage: number;
}

export interface CourseResource {
  id: string;
  toolType?: 'course-builder';
  title: string;
  courseCode?: string;
  subject: string;
  topic?: string;
  gradeLevel?: string;
  targetAudience?: string;
  prerequisites?: string[];
  courseOverview?: string;
  description?: string;
  durationWeeks?: number;
  totalWeeks?: number;
  learningOutcomes?: string[];
  modules?: CourseModule[];
  weeklySyllabus?: CourseWeeklyModule[];
  gradingCriteria?: CourseGradingItem[];
  createdAt: string;
}

export type CourseBuilderResource = CourseResource;

export interface LearningMilestone {
  milestoneNumber: number;
  phaseName: string;
  targetWeeks: string;
  keyObjectives: string[];
  recommendedResources?: string[];
  milestoneProject?: string | { title?: string; deliverableDescription?: string };
}

export interface LearningPathResource {
  id: string;
  toolType?: 'learning-path';
  title: string;
  subject: string;
  goal: string;
  startingLevel: string;
  targetLevel: string;
  estimatedTotalWeeks: number;
  milestones: LearningMilestone[];
  createdAt: string;
}

export type BuildResourceData =
  | ExamResource
  | WorksheetResource
  | LessonPlanResource
  | PdfQuizResource
  | PdfStudyPackResource
  | PresentationResource
  | CourseResource
  | LearningPathResource;

export interface SavedResource {
  id: string;
  title: string;
  toolType: ToolType;
  subject: string;
  topic: string;
  gradeLevel: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  data: BuildResourceData;
  isFavorite?: boolean;
}
