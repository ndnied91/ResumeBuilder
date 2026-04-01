import openai from '../lib/openai.js';

export const generateResumeWithAI = async ({ currResume, jobLink }) => {
  const prompt = `
You are a resume assistant.

You will receive a current resume and a job URL.
Your job is to rewrite and optimize the resume so it better matches the job posting while staying completely truthful.

Current resume:
${JSON.stringify(currResume, null, 2)}

Job URL:
${jobLink || 'No job URL provided'}

Instructions:
- Keep all information truthful
- Do not invent experience, companies, dates, projects, or technologies
- Improve wording, clarity, and impact
- Optimize for ATS
- Preserve the resume's general structure
- Return valid JSON only
- Do not include markdown
- Do not include commentary
- Do not wrap the response in backticks

Return JSON in this exact format:
{
  "summary": "string",
  "targetCompany": "string",
  "experience": [
    {
      "role": "string",
      "company": "string",
      "date": "string",
      "bullets": ["string"]
    }
  ],
  "skillGroups": [
    {
      "category": "string",
      "items": ["string"]
    }
  ],
  "notes": ["string"]
}

Rules:
- "summary" must always be a string
- "experience" must always be an array
- "skillGroups" must always be an array
- Each skill group must include a non-empty "category"
- Each skill group must include an "items" array of strings
- Do not use "skills" as a top-level field
- Do not rename any fields
- If there are no skill groups, return an empty array
- If there are no notes, return an empty array
`;

  const response = await openai.responses.create({
    model: 'gpt-5',
    input: prompt,
  });

  // const response = {
  //   title: 'AI Resume',
  //   summary:
  //     'AI GEN - Frontend Software Engineer with 4+ years of experience building scalable, ADA-compliant chat and messaging platforms in React/Next.js for 1M+ monthly users. Specializes in modular, reusable component libraries; performance optimization; and multi-tenant, cross-client architectures. Strong collaborator with product, design, and backend teams; comfortable owning features end-to-end from discovery through production.',
  //   experience: [
  //     {
  //       role: 'Software Engineer',
  //       company: 'HCLTech',
  //       date: 'Apr 2025 – March 2026',
  //       bullets: [
  //         'Owned frontend architecture for a reusable, multi-tenant Next.js chat platform powered by Microsoft Bot Framework, enabling rapid rollout across multiple enterprise clients.',
  //         'Implemented extensible plugin patterns, feature flags, and theming to support client-specific requirements without code forks.',
  //         'Established ADA/WCAG-compliant patterns (ARIA roles, keyboard navigation, focus management) across chat surfaces.',
  //         'Optimized rendering, virtualization, and state management (Redux) to support complex, real-time conversations and rich message payloads at scale.',
  //         'Partnered with product, design, and backend to define contracts, APIs, and roadmap; led code reviews and mentored junior engineers.',
  //         'Guided clients through critical platform upgrades and migrations, improving reliability and stakeholder confidence.',
  //       ],
  //     },
  //     {
  //       role: 'Software Engineer',
  //       company: 'Microsoft',
  //       date: 'Dec 2022 – Apr 2025',
  //       bullets: [
  //         'Led frontend development of an enterprise chat application in React/Next.js within the Microsoft Bot Framework ecosystem, serving as a reusable foundation across multiple client portfolios (1M+ MAU).',
  //         'Architected modular message rendering pipelines, conversation flows, theming, and extensibility hooks to standardize implementations across clients.',
  //         'Built high-performance, reusable React components optimized for scalability, maintainability, and consistent UX.',
  //         'Drove accessibility compliance by defining ADA/WCAG standards and reusable patterns; improved usability and parity across experiences.',
  //         'Improved performance and stability by refining state management, minimizing unnecessary re-renders, and tuning data flows for real-time workloads.',
  //         'Collaborated with product managers, designers, and backend engineers to align frontend architecture with long-term platform goals.',
  //       ],
  //     },
  //     {
  //       role: 'Jr. Software Engineer',
  //       company: 'Nuance Communications (A Microsoft Company)',
  //       date: 'Oct 2021 – Dec 2022',
  //       bullets: [
  //         'Contributed to core chat features and UI components in React/Next.js for enterprise assistants integrated with Microsoft Bot Framework.',
  //         'Implemented configurable theming and layout systems to enable rapid, brand-aligned deployments across clients.',
  //         'Ensured accessibility standards were met across components, partnering with design to refine UX for keyboard and screen reader users.',
  //       ],
  //     },
  //     {
  //       role: 'UX Strategies Technical Team Lead (Apple Pay) – Career Experience',
  //       company: 'Apple',
  //       date: 'Jan 2021 – Jun 2021',
  //       bullets: [
  //         'Improved Apple Pay transaction KPIs by 10% through targeted UX and technical solutions.',
  //         'Led a cross-functional effort to resolve technical issues across 200+ merchant platforms.',
  //         'Facilitated weekly meetings to align priorities, surface blockers, and accelerate delivery.',
  //       ],
  //     },
  //   ],
  //   skills: [
  //     {
  //       category: 'Frontend',
  //       items: [
  //         'React',
  //         'Next.js',
  //         'TypeScript',
  //         'JavaScript (ES6+)',
  //         'React Native',
  //         'Redux',
  //         'Tailwind CSS',
  //         'HTML5/CSS3',
  //         'Accessibility (ADA/WCAG, ARIA)',
  //         'Design Systems',
  //         'Performance Optimization',
  //       ],
  //     },
  //     {
  //       category: 'Conversational Platforms',
  //       items: ['Microsoft Bot Framework', 'Chat UI', 'Real-time interactions'],
  //     },
  //     {
  //       category: 'Backend & APIs',
  //       items: ['Node.js', 'Express', 'FastAPI', 'REST APIs', 'Python'],
  //     },
  //     {
  //       category: 'Databases',
  //       items: ['PostgreSQL', 'MongoDB', 'Supabase'],
  //     },
  //     {
  //       category: 'Version Control & CI/CD',
  //       items: ['Git', 'GitHub', 'GitLab', 'CI/CD pipelines', 'Docker'],
  //     },
  //   ],
  //   notes: [
  //     'Tailored for EliseAI-style roles focused on conversational UI and real-time chat in React/Next.js; emphasized accessibility, modular architecture, and multi-tenant reuse.',
  //     'Removed duplicate and placeholder bullets; clarified impact and ownership while keeping technology references truthful to the original content.',
  //     'Consider adding concrete metrics (e.g., performance gains, load-time reductions) and testing tools used (e.g., Jest, React Testing Library, Cypress) if applicable to further boost ATS alignment.',
  //     'Recommend standardizing contact info and removing stray placeholders (e.g., extra numbers in name/portfolio) on the final resume document.',
  //     'Education section can be included in the final resume layout: Kean University — B.S. in Computer Science, Minor in Data Science; Lambda Alpha Sigma Honors Society.',
  //   ],
  // };

  console.log(response.output_text);
  return response.output_text;
};

export const analyzeResume = async ({ resume, jobLink_ATS }) => {
  console.log('selected resume is', resume);
  console.log('job link is', jobLink_ATS);

  const prompt = `
You are an ATS resume analysis assistant.

You will receive a current resume and a job URL.
Your job is to analyze how well the resume matches the job posting and return a concise ATS-style evaluation.

Current resume:
${JSON.stringify(resume, null, 2)}

Job URL:
${jobLink_ATS || 'No job URL provided'}

Instructions:
- Evaluate the resume against the likely requirements of the job posting
- Keep the analysis grounded in the provided resume and the job URL
- Do not invent qualifications or experience that are not present
- Focus on relevance, keyword alignment, clarity, and likely ATS match quality
- Return valid JSON only
- Do not include markdown
- Do not include commentary
- Do not wrap the response in backticks

Return JSON in this exact format:
{
  "score": 0,
  "summary": "string",
  "strengths": ["string"],
  "gaps": ["string"],
  "recommendations": ["string"]
}

Rules:
- "score" must always be a number from 0 to 100
- "summary" must always be a string
- "strengths" must always be an array of strings
- "gaps" must always be an array of strings
- "recommendations" must always be an array of strings
- Recommendations should be specific and actionable
- Do not return any fields other than: score, summary, strengths, gaps, recommendations
- If there are no strengths, return an empty array
- If there are no gaps, return an empty array
- If there are no recommendations, return an empty array
`;

  const response = await openai.responses.create({
    model: 'gpt-5',
    input: prompt,
  });

  const parsed = JSON.parse(response.output_text);
  return parsed;
};

export const improveResumeWithAI = async ({ analysisResult, jobLink }) => {
  const prompt = `
You are a resume optimization assistant.

You will receive:
1. The user's current resume
2. A job URL
3. ATS analysis feedback for that resume

Your job is to improve the resume using the ATS feedback while staying completely truthful.

Current resume:
${JSON.stringify(analysisResult.resume, null, 2)}

Job URL:
${jobLink || 'No job URL provided'}

ATS analysis feedback:
${JSON.stringify(
  {
    score: analysisResult.result.score,
    summary: analysisResult.result.summary,
    strengths: analysisResult.result.strengths,
    gaps: analysisResult.result.gaps,
    recommendations: analysisResult.result.recommendations,
  },
  null,
  2,
)}

Instructions:
- Keep all information truthful
- Do not invent experience, companies, dates, projects, technologies, metrics, or responsibilities
- Improve wording, clarity, and impact
- Use the ATS feedback to strengthen the resume
- Address gaps where possible by rewriting existing truthful content more clearly
- Naturally incorporate relevant missing keywords only if supported by the original resume
- Preserve the resume's overall structure
- Remove weak, repetitive, or duplicate bullets
- Keep the result concise and ATS-friendly
- Return valid JSON only
- Do not include markdown
- Do not include commentary
- Do not wrap the response in backticks

Return JSON in this exact format:
{
  "summary": "string",
  "targetCompany": "string",
  "experience": [
    {
      "role": "string",
      "company": "string",
      "date": "string",
      "bullets": ["string"]
    }
  ],
  "skillGroups": [
    {
      "category": "string",
      "items": ["string"]
    }
  ],
  "notes": ["string"]
}

Rules:
- "summary" must always be a string
- "targetCompany" must always be a string
- "targetCompany" must have "-ATS" at the end of the string
- "experience" must always be an array
- "skillGroups" must always be an array
- Each skill group must include a non-empty "category"
- Each skill group must include an "items" array of strings
- Do not use "skills" as a top-level field
- Do not rename any fields
- If there are no skill groups, return an empty array
- If there are no notes, return an empty array
- "notes" should briefly explain what was improved based on the ATS feedback
`;

  const response = await openai.responses.create({
    model: 'gpt-5',
    input: prompt,
  });

  return response.output_text;
};
