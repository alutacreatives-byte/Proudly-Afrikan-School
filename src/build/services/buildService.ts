import {
  ExamResult,
  WorksheetResult,
  LessonPlanResult,
  PdfQuizBuildResult,
  PdfStudyPackResult,
  PresentationBuildResult,
  CourseBuildResult,
  LearningPathBuildResult,
} from '../types';

async function postJson<T>(url: string, body: Record<string, any>): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Failed to generate build resource (${response.status})`;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.error) errorMessage = parsed.error;
    } catch {}
    throw new Error(errorMessage);
  }

  const json = await response.json();
  if (json.data) {
    return json.data as T;
  }
  return json as T;
}

export async function generateExam(params: {
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
  institutionHeader?: string;
}): Promise<ExamResult> {
  const data = await postJson<ExamResult>('/api/generate/exam', params);
  data.toolType = 'exam';
  if (!data.id) data.id = `exam-${Date.now()}`;
  return data;
}

export async function generateWorksheet(params: {
  subject: string;
  topic: string;
  gradeLevel?: string;
  difficulty?: string;
  learningObjectives?: string[];
  activityTypes?: string[];
  sourceMaterial?: string;
  additionalInstructions?: string;
}): Promise<WorksheetResult> {
  const data = await postJson<WorksheetResult>('/api/generate/worksheet', params);
  data.toolType = 'worksheet';
  if (!data.id) data.id = `worksheet-${Date.now()}`;
  return data;
}

export async function generateLessonPlan(params: {
  subject: string;
  topic: string;
  gradeLevel?: string;
  durationMinutes?: number;
  learningObjectives?: string[];
  keyConcepts?: string;
  assessmentApproach?: string;
  requiredResources?: string;
  sourceMaterial?: string;
}): Promise<LessonPlanResult> {
  const data = await postJson<LessonPlanResult>('/api/generate/lesson-plan', params);
  data.toolType = 'lesson-plan';
  if (!data.id) data.id = `lesson-plan-${Date.now()}`;
  return data;
}

export async function generatePdfQuiz(params: {
  sourceDocName?: string;
  extractedText: string;
  totalQuestions?: number;
  difficulty?: string;
  questionType?: string;
  gradeLevel?: string;
}): Promise<PdfQuizBuildResult> {
  const data = await postJson<PdfQuizBuildResult>('/api/generate/pdf-quiz', params);
  data.toolType = 'pdf-quiz';
  if (!data.id) data.id = `pdf-quiz-${Date.now()}`;
  return data;
}

export async function generatePdfStudyPack(params: {
  sourceDocName?: string;
  extractedText: string;
  gradeLevel?: string;
}): Promise<PdfStudyPackResult> {
  const data = await postJson<PdfStudyPackResult>('/api/generate/pdf-studypack', params);
  data.toolType = 'pdf-studypack';
  if (!data.id) data.id = `pdf-studypack-${Date.now()}`;
  return data;
}

export async function generatePresentation(params: {
  subject: string;
  topic: string;
  audienceLevel?: string;
  slidesCount?: number;
  presentationStyle?: string;
  keyPoints?: string;
  learningObjectives?: string[];
  sourceMaterial?: string;
}): Promise<PresentationBuildResult> {
  const data = await postJson<PresentationBuildResult>('/api/generate/presentation', params);
  data.toolType = 'presentation';
  if (!data.id) data.id = `presentation-${Date.now()}`;
  return data;
}

export async function generateCourse(params: {
  title?: string;
  topic?: string;
  subject?: string;
  gradeLevel?: string;
  targetAudience?: string;
  description?: string;
  courseObjectives?: string[];
  moduleCount?: number;
  courseDuration?: string;
  pedagogicalStyle?: string;
  assessmentStrategy?: string;
  prerequisites?: string;
  customFocus?: string;
  sourceMaterial?: string;
}): Promise<CourseBuildResult> {
  const data = await postJson<CourseBuildResult>('/api/generate/course', params);
  data.toolType = 'course';
  if (!data.id) data.id = `course-${Date.now()}`;
  return data;
}

export async function generateLearningPath(params: {
  title?: string;
  subject?: string;
  targetGoal?: string;
  estimatedWeeks?: number;
  sourceMaterial?: string;
}): Promise<LearningPathBuildResult> {
  const data = await postJson<LearningPathBuildResult>('/api/generate/learning-path', params);
  data.toolType = 'learning-path';
  if (!data.id) data.id = `learning-path-${Date.now()}`;
  return data;
}
