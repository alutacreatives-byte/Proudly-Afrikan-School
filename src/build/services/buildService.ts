import { 
  ExamPaper, 
  WorksheetData, 
  LessonPlanData, 
  PdfStudyPackData, 
  PresentationDeck, 
  CourseSyllabus, 
  LearningPathData 
} from '../types';

export async function generateExamApi(params: {
  subject: string;
  topic: string;
  gradeLevel?: string;
  difficulty?: string;
  questionCount?: number;
  durationMinutes?: number;
  questionTypes?: string[];
  totalMarks?: number;
  instructions?: string;
  sourceMaterial?: string;
}): Promise<ExamPaper> {
  const response = await fetch('/api/generate/exam', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate exam paper.');
  }
  return response.json();
}

export async function generateWorksheetApi(params: {
  subject: string;
  topic: string;
  gradeLevel?: string;
  activityTypes?: string[];
  itemCount?: number;
  includeAnswerKey?: boolean;
  sourceMaterial?: string;
}): Promise<WorksheetData> {
  const response = await fetch('/api/generate/worksheet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate worksheet.');
  }
  return response.json();
}

export async function generateLessonPlanApi(params: {
  subject: string;
  topic: string;
  gradeLevel?: string;
  durationMinutes?: number;
  pedagogyStyle?: string;
  sourceMaterial?: string;
}): Promise<LessonPlanData> {
  const response = await fetch('/api/generate/lesson-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate lesson plan.');
  }
  return response.json();
}

export async function generatePdfStudyPackApi(params: {
  documentName?: string;
  sourceMaterial: string;
}): Promise<PdfStudyPackData> {
  const response = await fetch('/api/generate/pdf-studypack', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate study pack.');
  }
  return response.json();
}

export async function generateCourseApi(params: {
  subject: string;
  topic: string;
  targetLevel?: string;
  moduleCount?: number;
  sourceMaterial?: string;
}): Promise<CourseSyllabus> {
  const response = await fetch('/api/generate/course', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to architect course.');
  }
  return response.json();
}

export async function generatePresentationApi(params: {
  subject: string;
  topic: string;
  targetAudience?: string;
  slideCount?: number;
  sourceMaterial?: string;
}): Promise<PresentationDeck> {
  const response = await fetch('/api/generate/presentation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate presentation deck.');
  }
  return response.json();
}

export async function generateLearningPathApi(params: {
  subject: string;
  topic: string;
  goal: string;
  timeframeMonths?: number;
}): Promise<LearningPathData> {
  const response = await fetch('/api/generate/learning-path', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate learning path.');
  }
  return response.json();
}
