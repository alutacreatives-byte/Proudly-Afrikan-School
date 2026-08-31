export interface SubjectCategory {
  id: string;
  name: string;
  subtopics: string[];
}

export const SUBJECT_CATEGORIES: SubjectCategory[] = [
  {
    id: 'history-geography',
    name: 'History & Geography',
    subtopics: [
      'The Kingdom of Mali & Mansa Musa',
      'Ancient Kemet / Egypt & Imhotep Story',
      'The Kingdom of Kush & Nubian Dynasties',
      'The Great Zimbabwe & Monomotapa Empire',
      'The Kingdom of Aksum & Ge\'ez Civilization',
      'Trans-Saharan Trade & Caravans',
      'African Liberation Movements & Pan-Africanism',
      'Physical Geography of Africa (Rift Valley, Congo Basin, Sahara)',
      'World History & Global Civilizations',
    ],
  },
  {
    id: 'science-stem',
    name: 'Sciences & STEM',
    subtopics: [
      'Cell Biology & Genetics',
      'Photosynthesis & Ecosystem Energy Flow',
      'Chemical Bonding & Periodic Table',
      'Organic Chemistry & Carbon Compounds',
      'Newtonian Mechanics & Gravitation',
      'Electromagnetism & Circuits',
      'Thermodynamics & Energy Transfer',
      'Human Anatomy & Physiology',
      'Environmental Science & Climate Systems',
    ],
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    subtopics: [
      'Algebraic Expressions & Quadratic Equations',
      'Calculus: Derivatives & Integrals',
      'Geometry, Theorems & Trigonometric Proofs',
      'Probability, Statistics & Data Analysis',
      'Financial Mathematics & Compound Interest',
      'Vectors & Linear Transformations',
      'Number Theory & Discrete Mathematics',
    ],
  },
  {
    id: 'languages-literature',
    name: 'Languages & Literature',
    subtopics: [
      'African Literature (Chinua Achebe, Ngũgĩ wa Thiong\'o, Wole Soyinka)',
      'English Language & Academic Essay Structure',
      'Poetry Analysis, Meter & Literary Devices',
      'Critical Reading Comprehension & Rhetoric',
      'African Indigenous Linguistics & Syntax',
      'French as a Second Language',
    ],
  },
  {
    id: 'business-economics',
    name: 'Business & Economics',
    subtopics: [
      'Microeconomics: Supply, Demand & Market Equilibrium',
      'Macroeconomics: Fiscal Policy, Inflation & GDP',
      'AfCFTA & Intra-African Trade Dynamics',
      'Entrepreneurship & Venture Creation in Africa',
      'Financial Accounting Principles & Balance Sheets',
      'Marketing Fundamentals & Digital Strategy',
    ],
  },
  {
    id: 'technology-computer-science',
    name: 'Technology & Computer Science',
    subtopics: [
      'Python Programming Fundamentals',
      'Data Structures & Algorithm Design',
      'Web Development (HTML, CSS, JavaScript, React)',
      'Artificial Intelligence & Machine Learning Basics',
      'Relational Databases & SQL Querying',
      'Cybersecurity & Network Protocols',
      'Mobile Application Architecture',
    ],
  },
  {
    id: 'philosophy-social-studies',
    name: 'Philosophy & Social Studies',
    subtopics: [
      'Ubuntu Philosophy & African Ethics',
      'Governance, Constitutional Law & Democracy in Africa',
      'Sociology: Community, Kinship & Urbanization',
      'Critical Thinking & Socratic Logic',
      'Development Studies & Sustainable Goals (SDGs)',
    ],
  },
];

export const GRADE_LEVELS = [
  'Primary School (Grades 1-5)',
  'Junior Secondary / Middle School (Grades 6-8)',
  'Senior Secondary / High School (Grades 9-12)',
  'Tertiary / Undergraduate',
  'Postgraduate / Advanced Research',
  'Professional & Vocational Certification',
];

export const DIFFICULTY_LEVELS = [
  'Foundational / Beginner',
  'Intermediate',
  'Advanced / Honors',
  'Mastery / Olympiad',
];

export const EXAM_PAGE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const WORKSHEET_PAGE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const STUDY_PACK_FORMATS = [
  'High-Yield Executive Summary & Revision Points',
  'Comprehensive Syllabus Breakdown & Deep Dive',
  'Exam Revision Flashpoints & Formula Sheet',
  'Conceptual Mastery & Taxonomy Guide',
];
