export type PlanTier = 'FREE' | 'STUDENT' | 'SCHOLAR' | 'SCHOOL';

export interface PlanDetails {
  id: PlanTier;
  name: string;
  priceZar: number;
  monthlyCredits: number;
  isOnceOff?: boolean;
  isPopular?: boolean;
  tagline: string;
  description: string;
  features: string[];
  color: string;
  accentBg: string;
  borderColor: string;
  buttonLabel: string;
}

export const PLANS: Record<PlanTier, PlanDetails> = {
  FREE: {
    id: 'FREE',
    name: 'FREE',
    priceZar: 0,
    monthlyCredits: 400,
    isOnceOff: true,
    tagline: 'Start learning with AI',
    description: 'Perfect for exploring African-centered learning sets and testing all AI generation tools.',
    features: [
      '400 once-off AI credits on sign up',
      'Unlimited access to Study, Quiz & Planner',
      'Full access to My Sets library',
      'Standard AI generation speed',
      'Single user personal account',
    ],
    color: '#161616',
    accentBg: '#F3F4F6',
    borderColor: '#161616',
    buttonLabel: 'Get Started Free',
  },
  STUDENT: {
    id: 'STUDENT',
    name: 'STUDENT',
    priceZar: 49,
    monthlyCredits: 1500,
    tagline: 'Essential revision & assignments',
    description: 'For active students needing weekly study guides, flashcards, and homework preparation.',
    features: [
      '1,500 AI credits every month',
      'Credits refresh on your billing cycle',
      'All AI generation tools enabled',
      'PDF Document & Source Material parsing',
      'Export worksheets and exams to PDF & DOCX',
      'Standard customer support',
    ],
    color: '#059669',
    accentBg: '#ECFDF5',
    borderColor: '#059669',
    buttonLabel: 'Select Student Plan',
  },
  SCHOLAR: {
    id: 'SCHOLAR',
    name: 'SCHOLAR',
    priceZar: 99,
    monthlyCredits: 4000,
    isPopular: true,
    tagline: 'High-volume mastery & exam prep',
    description: 'Our most popular plan for intensive learners, tutors, and top-performing scholars.',
    features: [
      '4,000 AI credits every month',
      'Most Popular for South African curricula',
      'Priority AI generation processing',
      'Long-form course & learning path builders',
      'Deep study pack & comprehensive exams',
      'Rollover support & priority assistance',
    ],
    color: '#D92B8A',
    accentBg: '#FDF2F8',
    borderColor: '#D92B8A',
    buttonLabel: 'Select Scholar Plan',
  },
  SCHOOL: {
    id: 'SCHOOL',
    name: 'SCHOOL',
    priceZar: 249,
    monthlyCredits: 12000,
    tagline: 'Educators, institutions & departments',
    description: 'For teachers, lecturers, schools, and educational creators producing curriculum content.',
    features: [
      '12,000 AI credits every month',
      'High-throughput curriculum builder',
      'Complete term lesson plans & scheme of work',
      'Multi-section exam paper & rubric generator',
      'Custom institutional branding on exports',
      'Dedicated support: support@proudlyafrikan.org',
    ],
    color: '#7C3AED',
    accentBg: '#F5F3FF',
    borderColor: '#7C3AED',
    buttonLabel: 'Select School Plan',
  },
};

export const AI_CREDIT_COSTS = {
  QUIZ_FLASHCARDS: 10,
  STUDY_GUIDE: 15,
  WORKSHEET: 25,
  EXAM: 30,
  LESSON_PLAN: 30,
  PDF_STUDY_PACK: 40,
  PRESENTATION: 50,
  COURSE: 75,
  LEARNING_PATH: 75,
} as const;

export type AiActionType = keyof typeof AI_CREDIT_COSTS;

export const AI_ACTION_LABELS: Record<AiActionType, string> = {
  QUIZ_FLASHCARDS: 'Quiz / Flashcards Generation',
  STUDY_GUIDE: 'Study Guide Generation',
  WORKSHEET: 'Worksheet Generation',
  EXAM: 'Exam & Rubric Paper',
  LESSON_PLAN: 'Lesson Plan Generation',
  PDF_STUDY_PACK: 'PDF Study Pack Analysis',
  PRESENTATION: 'Presentation Slide Deck',
  COURSE: 'Course Curriculum Blueprint',
  LEARNING_PATH: 'Career / Learning Path',
};

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'cancelled' | 'free_tier';

export interface SubscriptionInfo {
  id: string;
  userId: string;
  planId: PlanTier;
  status: SubscriptionStatus;
  provider: 'paypal' | 'none';
  paypalSubscriptionId?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  monthlyCreditAllocation: number;
  autoRenew: boolean;
}

export type CreditTransactionType = 'deduction' | 'allocation' | 'bonus' | 'refund' | 'initial_grant';

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number; // positive for addition, negative for deduction
  type: CreditTransactionType;
  actionType?: AiActionType | string;
  description: string;
  timestamp: string;
  balanceAfter: number;
}

export interface CreditState {
  availableCredits: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  lastRefreshedAt: string;
  transactions: CreditTransaction[];
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  subscription: SubscriptionInfo;
  credits: CreditState;
}

export interface PayPalOrderRequest {
  planId: PlanTier;
  userId: string;
  customerEmail: string;
}
