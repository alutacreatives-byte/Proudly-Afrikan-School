export type BuildToolType = 
  | 'exam' 
  | 'worksheet' 
  | 'presentation' 
  | 'syllabus' 
  | 'lesson-plan' 
  | 'rubric' 
  | 'flashcards' 
  | 'study-guide' 
  | 'case-study' 
  | 'cheat-sheet' 
  | 'summary' 
  | 'vocabulary' 
  | 'practice-problems';

export interface SavedResource {
  id: string;
  toolType: BuildToolType | string;
  title: string;
  subject: string;
  topic: string;
  gradeLevel?: string;
  data: any;
  createdAt: string;
  previewText?: string;
}
