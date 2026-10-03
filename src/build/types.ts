export interface SavedResource {
  id: string;
  title: string;
  type?: 'presentation' | 'study_guide' | 'quiz' | 'lesson_plan' | 'summary' | string;
  subject?: string;
  createdAt: string;
  content?: string;
  data?: any;
  toolType?: string;
  topic?: string;
  gradeLevel?: string;
  difficulty?: string;
}

export type BuildToolId = string;
