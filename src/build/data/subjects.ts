export interface SubjectCategory {
  id: string;
  name: string;
  subcategories?: string[];
}

export const SUBJECT_CATEGORIES: SubjectCategory[] = [
  {
    id: 'math-science',
    name: 'Mathematics & Science',
    subcategories: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Environmental Science', 'Astronomy'],
  },
  {
    id: 'tech-cs',
    name: 'Technology & Computer Science',
    subcategories: ['Software Engineering', 'Artificial Intelligence', 'Data Science', 'Web Development', 'Cybersecurity'],
  },
  {
    id: 'african-studies',
    name: 'African History & Culture',
    subcategories: ['African Civilizations', 'Pan-African Movements', 'African Literature', 'African Philosophy', 'Indigenous Knowledge'],
  },
  {
    id: 'languages-humanities',
    name: 'Languages & Humanities',
    subcategories: ['English Literature', 'Swahili', 'Yoruba', 'Zulu', 'Philosophy', 'World History'],
  },
  {
    id: 'business-economics',
    name: 'Business & Economics',
    subcategories: ['African Economics', 'Entrepreneurship', 'Financial Accounting', 'Marketing', 'Commerce'],
  },
  {
    id: 'health-medicine',
    name: 'Health & Medical Sciences',
    subcategories: ['Public Health', 'Human Anatomy', 'Nutrition', 'Pharmacology', 'Nursing Fundamentals'],
  },
  {
    id: 'law-civics',
    name: 'Law, Politics & Society',
    subcategories: ['Constitutional Law', 'International Relations', 'Civic Education', 'Human Rights', 'Public Policy'],
  },
  {
    id: 'creative-arts',
    name: 'Arts, Design & Media',
    subcategories: ['Visual Arts', 'African Music & Ethnomusicology', 'Graphic Design', 'Architecture', 'Creative Writing'],
  },
];
