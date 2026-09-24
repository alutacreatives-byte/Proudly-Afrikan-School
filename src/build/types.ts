export type BuildToolType = 
  | 'study-guide'
  | 'flashcards'
  | 'learning-path'
  | 'essay-grader'
  | 'pdf-quiz'
  | 'focus-quest'
  | 'course';

export interface SavedResource {
  id: string;
  toolType: BuildToolType | string;
  title: string;
  subject?: string;
  topic?: string;
  gradeLevel?: string;
  createdAt: string;
  data: any;
  itemCount?: number;
  itemCountLabel?: string;
}
