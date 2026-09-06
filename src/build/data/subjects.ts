export interface SubjectCategory {
  id: string;
  name: string;
  subcategories: string[];
}

export const SUBJECT_CATEGORIES: SubjectCategory[] = [
  {
    id: 'sciences-stem',
    name: 'Sciences & STEM',
    subcategories: [
      'Renewable Energy Technologies in Africa',
      'Solar & Geothermal Energy Systems',
      'Biology & African Ecosystems',
      'Chemistry & Mineral Processing',
      'Physics & Mechanics',
      'Computer Science & Software Development',
      'Environmental & Marine Science',
      'Agricultural Sciences & Soil Conservation',
    ],
  },
  {
    id: 'history-geography',
    name: 'History & Geography',
    subcategories: [
      'The Kingdom of Mali & Mansa Musa',
      'The Great Rift Valley Geography & Ecology',
      'Kingdom of Kush & Nubian Pyramids at Meroë',
      'Great Zimbabwe & Shona Architecture',
      'Swahili Coast Trading Empires',
      'African Independence Movements',
      'Climate Zones & Geography of Africa',
      'Ancient Egypt & Nile River Civilizations',
    ],
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    subcategories: [
      'Algebra & Functions',
      'Geometry & Trigonometry',
      'Financial Mathematics & Economics',
      'Calculus & Analytical Methods',
      'Statistics & Probability',
      'Ethnomathematics & African Fractal Geometry',
      'Data Analysis & Modeling',
    ],
  },
  {
    id: 'languages-literature',
    name: 'Languages & Literature',
    subcategories: [
      'African Literature & Oral Traditions',
      'Grammar, Syntax & Critical Reading',
      'Creative Writing & Essay Crafting',
      'Poetry & Pan-African Verse',
      'Indigenous African Language Studies',
    ],
  },
  {
    id: 'business-economics',
    name: 'Business & Economics',
    subcategories: [
      'African Continental Free Trade Area (AfCFTA)',
      'Entrepreneurship & African Tech Startups',
      'Macroeconomics & African Trade Policies',
      'Financial Literacy & Investment',
      'Agricultural Economics & Supply Chains',
    ],
  },
  {
    id: 'arts-culture',
    name: 'Arts & Culture',
    subcategories: [
      'African Visual Arts & Sculpture',
      'Traditional & Contemporary African Music',
      'Indigenous Knowledge Systems & Philosophy',
      'Theatre, Film & Performance Arts',
      'Fashion, Textiles & Kente Craftsmanship',
    ],
  },
];

export const GRADE_LEVELS = [
  'Primary School (Grades 1-5)',
  'Junior Secondary / Middle School (Grades 6-8)',
  'Senior Secondary / High School (Grades 9-12)',
  'CAPS Matriculation (Grade 12 / IEB)',
  'Tertiary & University Undergraduate',
  'Professional & Vocational Training',
];

export const DIFFICULTY_LEVELS = [
  'Foundation / Beginner',
  'Intermediate',
  'Advanced / Rigorous',
  'Olympiad / Honors Level',
];
