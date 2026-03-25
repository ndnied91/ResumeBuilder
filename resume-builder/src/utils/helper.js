export const mapResumeToState = (resume) => {
  return {
    resumeId: resume.id,
    name: resume.name,
    header: resume.header,
    title: resume.title,
    email: resume.email,
    contact: resume.contact,
    portfolio: resume.portfolio,
    summary: resume.summary,
    education: resume.education,
    edu_desc: resume.eduDesc,
    edu_honors: resume.eduHonors,
    edu_location: resume.eduLocation,

    experience: resume.experiences.map((exp) => ({
      role: exp.role,
      company: exp.company,
      date: exp.date,
      bullets: exp.bullets.sort((a, b) => a.order - b.order).map((b) => b.text),
    })),

    skills: resume.skillGroups.map((group) => ({
      category: group.category,
      items: group.items.sort((a, b) => a.order - b.order).map((i) => i.name),
    })),
  };
};

export const fetchWithAuth = async (url, options = {}, getToken) => {
  const token = await getToken();

  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
};

export const blankResume = {
  resumeId: null,
  title: 'Untitled Resume',
  name: '',
  header: '',
  email: '',
  contact: '',
  portfolio: '',
  summary: '',
  education: '',
  edu_desc: '',
  edu_honors: '',
  edu_location: '',
  skills: [
    {
      category: '',
      items: [],
    },
  ],
  experience: [
    {
      role: '',
      company: '',
      date: '',
      bullets: [''],
    },
  ],
};

export const seedResume = {
  name: 'Danny Niedzwiedzki',
  resumeId: null,
  title: 'Primary',
  header:
    'Woodbridge, NJ | linkedin.com/in/daniel-niedzwiedzki | github.com/ndnied91',
  email: 'danny@email.com',
  contact: '908.275.7097 | danielniedzwiedzki.1@gmail.com',
  portfolio: 'www.danielniedzwiedzki.com',
  summary:
    'Software Engineer with 4+ years of experience building scalable, user-friendly chat UI platforms serving over 1M monthly users. Experienced in designing and implementing custom, enterprise-level, reusable solutions across different clients, tailored to diverse requirements, with a focus on high-performance interfaces and cross-client frontend architecture.',
  experience: [
    {
      role: 'Software Engineer | (Microsoft acquisition)',
      company: 'HCL Tech',
      date: 'April 2025 - Present',
      bullets: [
        'Led frontend development of a Next.js–based enterprise chat application built on the Microsoft Bot Framework, serving as a reusable foundation across multiple client portfolios.',
        'Architected and implemented custom, modular chat UI features (message rendering, conversation flows, theming, extensibility hooks) designed to be easily transferable between clients',
        'Built high-performance, reusable React components optimized for scalability, maintainability, and consistent UX across',
        'Designed and enforced ADA-compliant frontend patterns, ensuring accessibility across all chat experiences',
        'Optimized rendering performance and state management to support complex, real-time chat interactions at scale',
        'Collaborated with product and backend teams to align frontend architecture with long-term platform and business goals',
        'Aligned innovative technical solutions with key business goals across engineering and product teams.',
        'Guided clients through critical software transitions, ensuring long-term confidence and satisfaction.',
      ],
    },
    {
      role: ' Software Engineer',
      company: 'Microsoft',
      date: 'Dec 2022 – April 2025',
      bullets: [
        'Led frontend development of a Next.js–based enterprise chat application built on the Microsoft Bot Framework, serving as a reusable foundation across multiple client portfolios.',
        'Architected and implemented custom, modular chat UI features (message rendering, conversation flows, theming, extensibility hooks) designed to be easily transferable between clients',
        'Built high-performance, reusable React components optimized for scalability, maintainability, and consistent UX across',
        'Designed and enforced ADA-compliant frontend patterns, ensuring accessibility across all chat experiences',
        'Optimized rendering performance and state management to support complex, real-time chat interactions at scale',
        'Collaborated with product and backend teams to align frontend architecture with long-term platform and business goals',
        'Aligned innovative technical solutions with key business goals across engineering and product teams.',
      ],
    },
    {
      role: 'Jr. Software Engineer ',
      company: 'Nuance Communications, A Microsoft Company ',
      date: 'Oct 2021 – Dec 2022',
      bullets: [
        'Led frontend development of a Next.js–based enterprise chat application built on the Microsoft Bot Framework, serving as a reusable foundation across multiple client portfolios.',
        'Architected and implemented custom, modular chat UI features (message rendering, conversation flows, theming, extensibility hooks) designed to be easily transferable between clients',
        'Built high-performance, reusable React components optimized for scalability, maintainability, and consistent UX across',
        'Designed and enforced ADA-compliant frontend patterns, ensuring accessibility across all chat experiences',
      ],
    },
    {
      role: 'UX Strategies Technical Team Lead (Apple Pay) (Career Experience)',
      company: 'Apple',
      date: ' Jan ’21 – Jun ’21',
      bullets: [
        'Improved Apple Pay transaction KPIs by 10% through innovative UX solutions.',
        'Led a cross-functional team to resolve technical issues across 200+ merchant platforms',
        'Facilitated weekly meetings to align development efforts and priorities',
      ],
    },
  ],

  skills: [
    {
      category: 'Frontend',
      items: [
        'React',
        'Next.js',
        'React Native',
        'TypeScript',
        'JavaScript',
        'TailwindCSS',
        'Redux',
        'HTML/CSS',
        'Python',
      ],
    },
    {
      category: 'Backend & APIs',
      items: ['Node.js', 'Express', 'FastAPI', 'REST APIs'],
    },
    {
      category: 'Databases',
      items: ['PostgreSQL', 'MongoDB', 'Supabase'],
    },
    {
      category: 'Version Control & CI/CD',
      items: ['Git', 'GitHub', 'GitLab', 'CI/CD pipelines', 'Docker'],
    },
  ],

  education: 'Kean University',
  edu_desc: 'B.S. in Computer Science, Minor in Data Science',
  edu_honors: 'Lambda Alpha Sigma Honors Society Recipient',
  edu_location: 'Union, New Jersey',
};
