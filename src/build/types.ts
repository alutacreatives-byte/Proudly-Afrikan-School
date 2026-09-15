export type BuildToolType =
  | 'lessonplan'
  | 'lesson-plan'
  | 'rubric'
  | 'syllabus'
  | 'worksheet'
  | 'activity'
  | 'assessment'
  | 'discussion'
  | 'curriculum'
  | 'course'
  | 'course-builder'
  | 'classroompack'
  | 'exam'
  | 'mindmap'
  | 'mind-map'
  | 'presentation'
  | 'study-guide'
  | 'flashcards'
  | 'quiz'
  | 'essay-grader'
  | 'pdf-quiz'
  | 'tutor-chat'
  | 'learning-path'
  | 'search-result'
  | 'custom'
  | string;

export interface SavedResource {
  id: string;
  toolType: BuildToolType;
  title: string;
  subject?: string;
  topic?: string;
  gradeLevel?: string;
  createdAt: string;
  data: any;
  documentName?: string;
  sourceSnippet?: string;
}
