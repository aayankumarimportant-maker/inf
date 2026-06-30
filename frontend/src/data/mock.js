// Mock data for InfinitySheets clone (frontend-only)

export const EXAM_TRACKS = [
  { id: 'SSLC', name: 'SSLC', title: 'State syllabus mastery', desc: 'Mathematics, science, social science, and English practice for secondary-level exams.' },
  { id: 'CBSE', name: 'CBSE', title: 'NCERT-aligned revision', desc: 'Topic practice across mathematics, sciences, and English for CBSE assessments.' },
  { id: 'ICSE', name: 'ICSE', title: 'Detailed subject practice', desc: 'Broad, rigorous preparation including science, English, and computer applications.' },
  { id: 'IGCSE', name: 'IGCSE', title: 'International exam technique', desc: 'Cambridge-style subject practice with structured and application-focused questions.' },
  { id: 'ASA', name: 'AS & A Level', title: 'Advanced subject depth', desc: 'Focused preparation for Cambridge advanced-level mathematics, sciences, and economics.' },
  { id: 'IB', name: 'IB', title: 'Concept and analysis practice', desc: 'Practice for IB mathematics, sciences, economics, and English coursework.' },
  { id: 'SAT', name: 'SAT', title: 'Timed reasoning practice', desc: 'Reading, writing, and math sets with pacing-focused feedback.' },
  { id: 'JEE', name: 'JEE', title: 'Concept-heavy problem solving', desc: 'Physics, chemistry, and maths sheets built around difficult multi-step questions.' },
  { id: 'NEET', name: 'NEET', title: 'High-volume recall and accuracy', desc: 'Biology-heavy revision plus chemistry and physics practice.' },
];

export const FEATURES = [
  { title: 'Progress Tracking', desc: 'Visual dashboards that show mastery, readiness, completed worksheets, and study streaks.', icon: 'LineChart', tone: 'primary' },
  { title: 'AI Weakness Analysis', desc: 'Automatically discover which concepts need the most attention.', icon: 'Brain', tone: 'secondary' },
  { title: 'Targeted Worksheets', desc: 'Practice exactly what you need, instead of repeating what you already know.', icon: 'Target', tone: 'accent' },
  { title: 'Smart Recommendations', desc: 'Receive personalized study plans based on your performance.', icon: 'Lightbulb', tone: 'success' },
  { title: 'Multiple Curricula', desc: 'Built for IGCSE, IB, AP, SAT, and more.', icon: 'BookOpen', tone: 'primary' },
];

export const HOW_IT_WORKS = [
  { n: '01', title: 'Complete a Worksheet', text: 'Answer AI-generated questions tailored to your syllabus and current ability.' },
  { n: '02', title: 'AI Weakness Analysis', text: 'Our AI identifies the exact topics and skills you need to improve.' },
  { n: '03', title: 'Targeted Worksheets', text: 'Receive new worksheets focused specifically on your weak areas.' },
  { n: '04', title: 'Smart Recommendations', text: 'Know exactly what to study next with personalized revision suggestions.' },
  { n: '05', title: 'Track Your Progress', text: 'Monitor topic mastery, readiness scores, study streaks, and long-term improvement.' },
];

export const WHY_IT_WORKS = [
  'Personalized AI-generated worksheets',
  'Active recall-based learning',
  'Adaptive revision paths',
  'Real-time progress tracking',
  'Instant feedback',
  'Built around how students actually learn',
];

export const RESEARCH_STATS = [
  { num: '2\u00d7', title: 'More effective than passive rereading', desc: 'Retrieval practice consistently outperforms rereading in long-term retention studies.' },
  { num: '89%', title: 'Better long-term retention', desc: 'Students report stronger recall when using active recall techniques over time.' },
  { num: 'Personalized', title: 'Higher engagement & outcomes', desc: 'Adaptive learning leads to improved results compared to one-size-fits-all instruction.' },
];

export const TESTIMONIALS = [
  { quote: 'I finally knew exactly what to study instead of wasting time guessing.', name: 'High school senior', role: 'IB student' },
  { quote: 'The targeted worksheets helped me improve the topics I struggled with the most.', name: 'IGCSE learner', role: 'Year 11' },
  { quote: 'It is like having a personal tutor that understands how I learn.', name: 'SAT prep student', role: 'Grade 12' },
];

export const PRICING = [
  { tag: 'Free', price: '$0', period: 'forever', features: ['Personalized worksheets', 'AI weakness analysis', 'Progress tracking'], cta: 'Start Free', highlight: false },
  { tag: 'Premium', price: '$9', period: 'per month', features: ['Unlimited worksheets', 'Advanced analytics', 'Smart recommendations', 'Priority AI generation', 'Early access to new features'], cta: 'Upgrade', highlight: true },
];

// Subjects per exam track
export const SUBJECTS = {
  SSLC: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Social Science', 'English'],
  CBSE: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Social Science', 'English'],
  ICSE: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Applications', 'English'],
  IGCSE: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Economics', 'English'],
  ASA: ['Mathematics', 'Further Maths', 'Physics', 'Chemistry', 'Economics', 'Biology'],
  IB: ['Mathematics AA', 'Mathematics AI', 'Physics', 'Chemistry', 'Economics', 'English'],
  SAT: ['Math', 'Reading', 'Writing'],
  JEE: ['Physics', 'Chemistry', 'Mathematics'],
  NEET: ['Biology', 'Chemistry', 'Physics'],
};

export const TOPICS = {
  Mathematics: ['Algebra', 'Trigonometry', 'Geometry', 'Calculus', 'Probability', 'Statistics'],
  'Mathematics AA': ['Functions', 'Sequences', 'Calculus', 'Probability'],
  'Mathematics AI': ['Statistics', 'Modelling', 'Geometry'],
  'Further Maths': ['Complex Numbers', 'Matrices', 'Differential Equations'],
  Math: ['Heart of Algebra', 'Problem Solving', 'Advanced Math', 'Geometry'],
  Physics: ['Mechanics', 'Electrostatics', 'Optics', 'Thermodynamics', 'Modern Physics', 'Waves'],
  Chemistry: ['Organic', 'Inorganic', 'Physical', 'Coordination Compounds', 'Equilibrium'],
  Biology: ['Cell Biology', 'Genetics', 'Ecology', 'Human Physiology', 'Plant Physiology'],
  'Social Science': ['History', 'Geography', 'Civics', 'Economics'],
  English: ['Reading Comprehension', 'Grammar', 'Vocabulary', 'Writing'],
  'Computer Applications': ['Java Basics', 'OOP', 'Arrays', 'Strings'],
  Economics: ['Microeconomics', 'Macroeconomics', 'International Trade'],
  Reading: ['Passages', 'Vocabulary in Context'],
  Writing: ['Grammar', 'Rhetoric'],
};

// Question bank for worksheet generation
export const QUESTION_BANK = {
  Mechanics: [
    { q: 'A body moves with a uniform velocity of 10 m/s. What is its acceleration?', options: ['10 m/s\u00b2', '0 m/s\u00b2', '5 m/s\u00b2', '\u22125 m/s\u00b2'], a: 1 },
    { q: 'The SI unit of force is:', options: ['Joule', 'Watt', 'Newton', 'Pascal'], a: 2 },
    { q: 'A ball is dropped from a height of 20 m. Time to reach ground (g = 10 m/s\u00b2)?', options: ['1 s', '2 s', '3 s', '4 s'], a: 1 },
    { q: 'Momentum is the product of:', options: ['Mass and velocity', 'Mass and acceleration', 'Force and time', 'Force and distance'], a: 0 },
  ],
  Electrostatics: [
    { q: 'Coulomb’s law states force is inversely proportional to:', options: ['Distance', 'Distance squared', 'Charge', 'Charge squared'], a: 1 },
    { q: 'The SI unit of electric charge is:', options: ['Volt', 'Coulomb', 'Ampere', 'Ohm'], a: 1 },
    { q: 'Like charges:', options: ['Attract', 'Repel', 'Neither', 'Both'], a: 1 },
    { q: 'Electric field at the center of a uniformly charged ring is:', options: ['Maximum', 'Zero', 'Infinite', 'Half'], a: 1 },
  ],
  Optics: [
    { q: 'A convex lens has a focal length of:', options: ['Negative', 'Positive', 'Zero', 'Infinity'], a: 1 },
    { q: 'Speed of light in vacuum is approximately:', options: ['3\u00d710\u2078 m/s', '3\u00d710\u2076 m/s', '3\u00d710\u00b9\u2070 m/s', '3\u00d710\u2074 m/s'], a: 0 },
  ],
  Thermodynamics: [
    { q: 'First law of thermodynamics is based on conservation of:', options: ['Charge', 'Energy', 'Mass', 'Momentum'], a: 1 },
  ],
  'Modern Physics': [
    { q: 'Photoelectric effect was explained by:', options: ['Newton', 'Einstein', 'Bohr', 'Planck'], a: 1 },
  ],
  Waves: [
    { q: 'Sound waves are:', options: ['Transverse', 'Longitudinal', 'Both', 'None'], a: 1 },
  ],
  Algebra: [
    { q: 'Solve: 2x + 6 = 14', options: ['x = 2', 'x = 4', 'x = 6', 'x = 8'], a: 1 },
    { q: 'Roots of x\u00b2 \u2212 5x + 6 = 0', options: ['1, 6', '2, 3', '\u22122, \u22123', '\u22121, \u22126'], a: 1 },
  ],
  Trigonometry: [
    { q: 'sin\u00b2\u03b8 + cos\u00b2\u03b8 equals:', options: ['0', '1', '2', '\u03b8'], a: 1 },
    { q: 'tan(45\u00b0) equals:', options: ['0', '1', '\u221a3', '1/\u221a3'], a: 1 },
  ],
  Geometry: [
    { q: 'Sum of interior angles of a triangle:', options: ['90\u00b0', '180\u00b0', '270\u00b0', '360\u00b0'], a: 1 },
  ],
  Calculus: [
    { q: 'd/dx(x\u00b2) equals:', options: ['x', '2x', 'x\u00b2', '2'], a: 1 },
  ],
  Probability: [
    { q: 'Probability of an impossible event is:', options: ['0', '1', '0.5', 'Undefined'], a: 0 },
  ],
  Statistics: [
    { q: 'Median of 2, 3, 5, 7, 9 is:', options: ['3', '5', '7', '9'], a: 1 },
  ],
  Organic: [
    { q: 'Methane has how many hydrogen atoms?', options: ['2', '3', '4', '5'], a: 2 },
    { q: 'Functional group of alcohol is:', options: ['\u2013COOH', '\u2013OH', '\u2013CHO', '\u2013NH\u2082'], a: 1 },
  ],
  Inorganic: [
    { q: 'Atomic number of carbon:', options: ['4', '6', '8', '12'], a: 1 },
  ],
  Physical: [
    { q: 'pH of pure water at 25\u00b0C:', options: ['5', '6', '7', '8'], a: 2 },
  ],
  'Coordination Compounds': [
    { q: 'Central atom in [Cu(NH\u2083)\u2084]\u00b2\u207a is:', options: ['N', 'Cu', 'H', 'Cl'], a: 1 },
  ],
  Equilibrium: [
    { q: 'Le Chatelier’s principle applies to:', options: ['Reaction rate', 'Equilibrium shift', 'Catalysis', 'Solubility only'], a: 1 },
  ],
  'Cell Biology': [
    { q: 'Powerhouse of the cell:', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi'], a: 1 },
  ],
  Genetics: [
    { q: 'Father of genetics:', options: ['Darwin', 'Mendel', 'Watson', 'Crick'], a: 1 },
  ],
  Ecology: [
    { q: 'Producers in an ecosystem are mainly:', options: ['Animals', 'Plants', 'Fungi', 'Bacteria'], a: 1 },
  ],
  'Human Physiology': [
    { q: 'Normal human body temperature in \u00b0C:', options: ['35', '36.5', '37', '38'], a: 2 },
  ],
  'Plant Physiology': [
    { q: 'Photosynthesis occurs in:', options: ['Mitochondria', 'Chloroplast', 'Ribosome', 'Vacuole'], a: 1 },
  ],
  History: [
    { q: 'Year of Indian independence:', options: ['1942', '1945', '1947', '1950'], a: 2 },
  ],
  Geography: [
    { q: 'Largest continent by area:', options: ['Africa', 'Asia', 'Europe', 'Australia'], a: 1 },
  ],
  Civics: [
    { q: 'India is a:', options: ['Monarchy', 'Republic', 'Theocracy', 'Dictatorship'], a: 1 },
  ],
  Economics: [
    { q: 'GDP stands for:', options: ['Gross Domestic Product', 'General Domestic Price', 'Gross Distribution Plan', 'Global Domestic Price'], a: 0 },
  ],
  'Reading Comprehension': [
    { q: 'The main idea of a passage is best described as:', options: ['A minor detail', 'The central message', 'A direct quote', 'A summary of words'], a: 1 },
  ],
  Grammar: [
    { q: 'Identify the verb: "She runs fast."', options: ['She', 'runs', 'fast', 'none'], a: 1 },
  ],
  Vocabulary: [
    { q: 'Synonym of "happy":', options: ['Sad', 'Joyful', 'Angry', 'Tired'], a: 1 },
  ],
};

// Default fallback questions for any topic missing
export const FALLBACK_QUESTIONS = [
  { q: 'This worksheet uses sample questions. Pick the correct option:', options: ['Option A', 'Option B (correct)', 'Option C', 'Option D'], a: 1 },
  { q: 'Which of these is true about practice?', options: ['It is unhelpful', 'It builds mastery', 'It is random', 'None'], a: 1 },
  { q: 'A worksheet helps you to:', options: ['Avoid study', 'Test understanding', 'Sleep', 'Browse social'], a: 1 },
  { q: 'Best way to review mistakes:', options: ['Ignore them', 'Analyze and retry', 'Delete them', 'Forget'], a: 1 },
  { q: 'Spaced repetition improves:', options: ['Speed only', 'Long-term recall', 'Sleep', 'Nothing'], a: 1 },
];

export const STATS_LANDING = [
  { num: '9', label: 'exam and syllabus pathways' },
  { num: '48', label: 'subjects across all courses' },
  { num: '400+', label: 'focused syllabus topics' },
];

// Subject overview info: emoji, tagline, description, key topics, study tips
export const SUBJECT_INFO = {
  Mathematics: {
    emoji: '\u{1F4D0}',
    tone: 'blue',
    tagline: 'The language of patterns and proof.',
    description: 'Build fluency in algebra, geometry, calculus, and statistics through targeted practice. Mastery here unlocks confidence across every science subject.',
    keyTopics: ['Algebra & equations', 'Trigonometry', 'Geometry', 'Calculus basics', 'Probability & statistics'],
    studyTips: ['Practice 10 mixed problems daily', 'Re-solve mistakes from memory', 'Time yourself on past papers'],
  },
  'Mathematics AA': {
    emoji: '\u2795',
    tone: 'blue',
    tagline: 'Analysis & approaches in IB Maths.',
    description: 'Rigorous focus on proofs, functions, and calculus. AA students will spend more time on abstract reasoning and algebraic manipulation.',
    keyTopics: ['Functions', 'Sequences & series', 'Calculus', 'Probability'],
    studyTips: ['Memorise key derivatives and integrals', 'Annotate your worked examples', 'Practice IA-style problems'],
  },
  'Mathematics AI': {
    emoji: '\u{1F9EE}',
    tone: 'blue',
    tagline: 'Applications & interpretation.',
    description: 'AI emphasises real-world modelling, technology use, and statistics. Great for students heading into the social sciences.',
    keyTopics: ['Statistics', 'Modelling', 'Geometry', 'Number'],
    studyTips: ['Practice with GDC efficiently', 'Interpret graphs carefully', 'Connect topics to real datasets'],
  },
  'Further Maths': {
    emoji: '\u221E',
    tone: 'violet',
    tagline: 'For students hungry for more.',
    description: 'A deeper dive into complex numbers, matrices, and differential equations. Built for future engineers and mathematicians.',
    keyTopics: ['Complex numbers', 'Matrices', 'Differential equations', 'Polar coordinates'],
    studyTips: ['Work proofs forwards and backwards', 'Group similar problem types', 'Push past the first attempt'],
  },
  Math: {
    emoji: '\u{1F9EE}',
    tone: 'blue',
    tagline: 'SAT math: speed, accuracy, strategy.',
    description: 'Train on the four content areas of the SAT math section: Heart of Algebra, Problem Solving and Data Analysis, Passport to Advanced Math, and Additional Topics.',
    keyTopics: ['Heart of Algebra', 'Problem Solving', 'Advanced Math', 'Geometry'],
    studyTips: ['Skip and return on hard ones', 'Estimate answers first', 'Memorise the formula sheet'],
  },
  Physics: {
    emoji: '\u{1FA90}',
    tone: 'violet',
    tagline: 'How the universe works.',
    description: 'From projectile motion to electromagnetism. Physics rewards conceptual clarity plus mathematical precision.',
    keyTopics: ['Mechanics', 'Electrostatics', 'Optics', 'Thermodynamics', 'Modern physics', 'Waves'],
    studyTips: ['Draw force diagrams first', 'Always check units', 'Solve symbolically before plugging in'],
  },
  Chemistry: {
    emoji: '\u{1F9EA}',
    tone: 'cyan',
    tagline: 'Reactions, bonds, and matter.',
    description: 'Organic, inorganic, and physical chemistry feed each other. Connecting principles is how top scorers think.',
    keyTopics: ['Organic chemistry', 'Inorganic', 'Physical', 'Coordination compounds', 'Equilibrium'],
    studyTips: ['Master reaction mechanisms by drawing them', 'Practice equation balancing daily', 'Use flashcards for nomenclature'],
  },
  Biology: {
    emoji: '\u{1F9EC}',
    tone: 'success',
    tagline: 'The science of life.',
    description: 'Heavy on definitions, processes, and diagrams. Biology rewards consistent recall and clear explanations.',
    keyTopics: ['Cell biology', 'Genetics', 'Ecology', 'Human physiology', 'Plant physiology'],
    studyTips: ['Make labelled diagrams from memory', 'Connect structure to function', 'Use mnemonics for cycles'],
  },
  'Social Science': {
    emoji: '\u{1F5FA}\uFE0F',
    tone: 'blue',
    tagline: 'People, places, and power.',
    description: 'History, geography, civics, and economics work together to understand societies. Strong on argument writing and source analysis.',
    keyTopics: ['History', 'Geography', 'Civics', 'Economics'],
    studyTips: ['Build timelines and maps', 'Practice short structured answers', 'Quote sources precisely'],
  },
  English: {
    emoji: '\u270D\uFE0F',
    tone: 'violet',
    tagline: 'Words that move ideas.',
    description: 'Grammar, comprehension, vocabulary, and writing. The goal is precise, persuasive expression with strong reading habits.',
    keyTopics: ['Reading comprehension', 'Grammar', 'Vocabulary', 'Writing'],
    studyTips: ['Read short non-fiction daily', 'Outline before writing', 'Vary sentence length'],
  },
  'Computer Applications': {
    emoji: '\u{1F4BB}',
    tone: 'cyan',
    tagline: 'Code, logic, and computational thinking.',
    description: 'Java fundamentals, OOP, arrays, and strings. Practice by writing small programs and tracing execution by hand.',
    keyTopics: ['Java basics', 'OOP', 'Arrays', 'Strings', 'Recursion'],
    studyTips: ['Dry-run code on paper', 'Refactor your own solutions', 'Build mini projects'],
  },
  Economics: {
    emoji: '\u{1F4BC}',
    tone: 'success',
    tagline: 'Choices under scarcity.',
    description: 'Microeconomics, macroeconomics, and international trade. Build intuition with graphs and apply it to current events.',
    keyTopics: ['Microeconomics', 'Macroeconomics', 'International trade', 'Development'],
    studyTips: ['Draw and re-draw key diagrams', 'Practice short-answer evaluation', 'Read business news weekly'],
  },
  Reading: {
    emoji: '\u{1F4D6}',
    tone: 'violet',
    tagline: 'Read smarter, not slower.',
    description: 'Master inference, main idea, and vocabulary in context. Pacing is half the SAT reading battle.',
    keyTopics: ['Passages', 'Vocabulary in context', 'Author tone'],
    studyTips: ['Skim first, then question-by-question', 'Eliminate obviously wrong choices', 'Track time per passage'],
  },
  Writing: {
    emoji: '\u2712\uFE0F',
    tone: 'blue',
    tagline: 'Clear, precise, and persuasive prose.',
    description: 'Grammar rules, rhetoric, and structure. Most points are won by spotting predictable patterns.',
    keyTopics: ['Grammar', 'Rhetoric', 'Punctuation', 'Style'],
    studyTips: ['Memorise comma rules', 'Read sentences aloud', 'Watch for redundant phrases'],
  },
};
