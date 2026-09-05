export type BuildToolType = 
  | 'course-builder' 
  | 'course' 
  | 'exam' 
  | 'worksheet' 
  | 'mind-map' 
  | 'lesson-plan' 
  | 'pdf-studypack' 
  | 'presentation' 
  | 'learning-path';

export type CourseResource = any;
export type PresentationResource = any;
export type MindMapResource = any;
export type LearningPathResource = any;
export type WorksheetResource = any;
export type ExamResource = any;
export type LessonPlanResource = any;
export type PdfStudyPackResource = any;

export interface SavedResource {
  id: string;
  toolType: BuildToolType | string;
  title: string;
  subject?: string;
  topic?: string;
  gradeLevel?: string;
  createdAt: string;
  data: any;
  sourceSnippet?: string;
  documentName?: string;
}

export interface ExamQuestion {
  id?: string;
  questionNumber: number;
  type: 'multiple-choice' | 'short-answer' | 'essay' | 'problem-solving' | string;
  marks: number;
  questionText: string;
  options?: string[];
  correctAnswer?: string | number;
  explanation?: string;
  markingGuide?: string;
}

export interface ExamSection {
  sectionTitle: string;
  instructions: string;
  marks: number;
  questions: ExamQuestion[];
}

export interface ExamPaper {
  id?: string;
  title: string;
  institutionHeader?: string;
  subject: string;
  topic: string;
  gradeLevel: string;
  durationMinutes: number;
  totalMarks: number;
  instructions: string[];
  sections: ExamSection[];
  markingScheme?: {
    totalMarks: number;
    criteriaNotes: string[];
    answerKeys: { questionNumber: number; answer: string; markDistribution: string }[];
  };
}

export interface WorksheetExercise {
  title: string;
  type: 'fill-blank' | 'matching' | 'short-response' | 'multiple-choice' | 'application';
  instructions: string;
  items: {
    prompt: string;
    answer?: string;
    options?: string[];
    hint?: string;
  }[];
}

export interface WorksheetData {
  id?: string;
  title: string;
  subject: string;
  topic: string;
  gradeLevel: string;
  estimatedMinutes: number;
  objectives: string[];
  exercises: WorksheetExercise[];
  answerKey: {
    exerciseTitle: string;
    answers: string[];
  }[];
  teacherNotes?: string;
}

export interface LessonPlanPhase {
  phaseName: string;
  durationMinutes: number;
  teacherActivity: string;
  studentActivity: string;
  assessmentStrategy: string;
  resourcesNeeded: string[];
}

export interface LessonPlanData {
  id?: string;
  title: string;
  subject: string;
  topic: string;
  gradeLevel: string;
  totalDurationMinutes: number;
  learningObjectives: string[];
  priorKnowledge: string[];
  materialsRequired: string[];
  phases: LessonPlanPhase[];
  homeworkOrExtension: string;
  reflectionPrompt: string;
}

export interface PdfStudyPackData {
  id?: string;
  title: string;
  documentName?: string;
  summary: string;
  keyPillars: {
    title: string;
    description: string;
    bulletPoints: string[];
  }[];
  vocabularyGlossary: {
    term: string;
    definition: string;
    context: string;
  }[];
  criticalThinkingQuestions: string[];
  quickReviewPoints: string[];
}

export interface PresentationSlide {
  slideNumber: number;
  title: string;
  bullets: string[];
  speakerNotes: string;
}

export interface PresentationDeck {
  id?: string;
  title: string;
  subject: string;
  topic: string;
  targetAudience: string;
  slides: PresentationSlide[];
}

export interface CourseModuleLesson {
  lessonTitle: string;
  objectives: string[];
  activities: string[];
  assessment: string;
}

export interface CourseModule {
  moduleNumber: number;
  title: string;
  durationWeeks?: number;
  overview: string;
  learningOutcomes: string[];
  lessons: CourseModuleLesson[];
}

export interface CourseSyllabus {
  id?: string;
  title: string;
  subject: string;
  topic: string;
  targetLevel: string;
  courseOverview: string;
  prerequisites: string[];
  modules: CourseModule[];
  capstoneProject?: {
    title: string;
    description: string;
    deliverables: string[];
  };
}

export interface LearningStage {
  stageNumber: number;
  stageName: string;
  description: string;
  competencies: string[];
  suggestedProjects: string[];
}

export interface LearningPathData {
  id?: string;
  title: string;
  subject: string;
  goal: string;
  estimatedMonths: number;
  stages: LearningStage[];
}
