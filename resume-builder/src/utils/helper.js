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
    jobLink: resume.jobLink,
    targetCompany: resume.targetCompany,

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
  targetCompany: '',
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
  jobLink: 'http://daniel.com',
  targetCompany: 'PRIMARY',
  resumeId: '',
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
      role: 'Software Engineer',
      company: 'HCL Tech (Microsoft acquisition)',
      date: 'April 2025 - Present',
      bullets: [
        'Led frontend development for a Next.js enterprise chat application on the Microsoft Bot Framework, evolving it into a reusable baseline across client portfolios.',
        'Architected modular chat UI features (message rendering, conversation orchestration, theming, extensibility hooks) designed for rapid client customization and reuse.',
        'Built and maintained high-performance React/TypeScript components optimized for scalability, maintainability, and consistent UX across implementations.',
        'Established ADA-compliant patterns and semantic structures to ensure accessible, keyboard-navigable chat experiences.',
        'Collaborated with product and backend teams to align frontend architecture with long-term platform and business goals.',
        'Guided clients through key software transitions and portfolio-wide upgrades, increasing adoption and satisfaction.',
        'Worked in agile sprints, partnering with cross-functional teams to design, build, and ship features efficiently while adhering to secure coding standards and code quality best practices.',
      ],
    },
    {
      role: 'Software Engineer',
      company: 'Microsoft',
      date: 'Dec 2022 – April 2025',
      bullets: [
        'Implemented and integrated chatbot systems across both front-end and back-end, enhancing user engagement.',
        'Supported multiple clients with diverse architectures and requirements, delivering tailored scalable solutions.',
        'Built and optimized frontend solutions for large-scale platforms supporting over 1M+ users monthly.',
        'Produced frontend architecture documentation and component design artifacts to align cross-functional teams and guide scalable, maintainable implementation decisions.',
        'Partnered with stakeholders, clients, and project managers to define requirements, align on tradeoffs, and deliver frontend features on time and within budget.',
        'Conducted code reviews and implemented best practices, ensuring high-quality code and performance efficiency.',
      ],
    },
    {
      role: 'Junior Software Engineer',
      company: 'Nuance Communications, A Microsoft Company ',
      date: 'Oct 2021 - Dec 2022',
      bullets: [
        'Participated in production releases of XML and JavaScript features, ensuring smooth deployments and system stability.',
        'Enhanced JavaScript efficiency to minimize redundant systems and optimized file structures for better performance.',
        'Implemented API integrations, ensuring seamless data retrieval and interactions.',
        'Diagnosed and resolved production issues, ensuring system reliability and minimizing downtime. ',
      ],
    },
    {
      role: 'Technical Team Lead (Apple Pay- Career Experience) / Apple Certified Mac Tech',
      company: 'Apple',
      date: ' Jan ’21 – Jun ’21',
      bullets: [
        'Improved Apple Pay transaction KPIs by 10% through innovative UX solutions.',
        'Led a cross-functional team to resolve technical issues across 200+ merchant platforms.',
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
    {
      category: 'AI & Developer Tools',
      items: ['ChatGPT', 'Microsoft Copilot', 'Claude'],
    },
  ],

  education: 'Kean University',
  edu_desc: 'B.S. in Computer Science, Minor in Data Science',
  edu_honors: 'Lambda Alpha Sigma Honors Society Recipient',
  edu_location: 'Union, New Jersey',
};

export const formatResumeForClient = (resume) => ({
  ...resume,
  resumeId: resume.resumeId || resume.id,
  experience: (resume.experience || resume.experiences || []).map((job) => ({
    role: job.role,
    company: job.company,
    date: job.date,
    bullets: (job.bullets || []).map((bullet) =>
      typeof bullet === 'string' ? bullet : bullet.text,
    ),
  })),
  skills: (resume.skills || resume.skillGroups || []).map((group) => ({
    category: group.category,
    items: (group.items || []).map((item) =>
      typeof item === 'string' ? item : item.name,
    ),
  })),
});
