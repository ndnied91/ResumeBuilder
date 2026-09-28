import openai from '../lib/openai.js';

// export const generateResumeWithAI = async ({ currResume, jobLink }) => {
//   console.log('in ai service', currResume, jobLink);
//   const prompt = `
// You are a resume assistant.

// You will receive a current resume and a job URL.
// Your job is to ONLY improve the wording of the resume to better match the job posting — do NOT restructure, reorder, or remove anything.

// Current resume:
// ${JSON.stringify(currResume, null, 2)}

// Job URL:
// ${jobLink || 'No job URL provided'}

// Instructions:
// - Keep all information truthful
// - Do not invent experience, companies, dates, projects, or technologies
// - ONLY improve wording, clarity, and impact — do not change the structure
// - Optimize for ATS through wording only
// - Preserve the resume's general structure exactly as provided
// - The "experience" array MUST contain the exact same number of jobs as the input — do not remove, skip, or merge any jobs
// - Each job's bullets must ONLY contain duties and responsibilities performed at that specific company during that specific date range
// - Do NOT move, copy, or merge bullets between jobs
// - Do NOT exceed the word count of the current resume
// - Do NOT assign responsibilities from one company to another
// - Preserve the original bullets per job as the source of truth — only improve the wording
// - If you are unsure about a job's bullets, keep the original bullets and only improve the wording
// - Return valid JSON only
// - Do not include markdown
// - Do not include commentary
// - Do not wrap the response in backticks

// Return JSON in this exact format:
// {
//   "summary": "string",
//   "targetCompany": "string",
//   "experience": [
//     {
//       "role": "string",
//       "company": "string",
//       "date": "string",
//       "bullets": ["string"]
//     }
//   ],
//   "skillGroups": [
//     {
//       "category": "string",
//       "items": ["string"]
//     }
//   ],
//   "notes": ["string"]
// }

// Rules:
// - "summary" must always be a string
// - "experience" must always be an array with the SAME number of entries as the input
// - "skillGroups" must always be an array and must reflect skills mentioned across all jobs
// - Each skill group must include a non-empty "category"
// - Each skill group must include an "items" array of strings
// - Do not use "skills" as a top-level field
// - Do not rename any fields
// - If there are no skill groups, return an empty array
// - If there are no notes, return an empty array

// Final self-check before returning:
// - Verify the "experience" array has the same number of jobs as the input
// - Verify no bullets were shared or moved between jobs
// - Verify "skillGroups" is not empty
// - Verify "summary" is present and tailored to the job URL
// - If any section is incomplete or missing, fix it before returning
// `;

//   const response = await openai.responses.create({
//     model: process.env.OPENAI_MODEL || 'gpt-6-sol',
//     input: prompt,
//   });

//   return response.output_text;
// };

// export const generateResumeWithAI = async ({
//   currResume,
//   jobDescription,
//   jobLink,
// }) => {
//   console.log('job description length:', jobDescription?.length);

//   // Don't show the model the old job's metadata; it will just copy it
//   const {
//     targetCompany: _oldCompany,
//     title: _oldTitle,
//     jobLink: _oldLink,
//     jobDescription: _oldDescription,
//     ...resumeContent
//   } = currResume;

//   const prompt = `
// You are an expert resume writer tailoring a resume to a specific job posting.

// Your goal: make this resume a strong, obvious match for the role, using only the candidate's real experience.

// Job description:
// ${jobDescription || 'Not provided. Infer what you can from the job URL.'}

// Job URL:
// ${jobLink || 'Not provided'}

// Current resume:
// ${JSON.stringify(resumeContent, null, 2)}

// ## What you SHOULD change
// - Rewrite the summary for this specific role. Lead with the experience most relevant to the posting.
// - Rewrite bullets to emphasize the work, skills, and outcomes that match the posting's requirements.
// - Use the posting's terminology where the candidate's experience genuinely supports it (e.g. if they did "built UI components" and the posting says "design systems", and that's accurate, use "design systems").
// - Reorder bullets within each job so the most relevant ones come first.
// - Strengthen weak bullets: start with a strong action verb, make the impact clear, and keep existing metrics.
// - Reorder skill groups and the items within them so the most relevant skills come first.
// - It's fine to substantially rewrite a bullet as long as it describes the same real work.

// ## What you must NOT change
// - Do not invent experience, companies, titles, dates, projects, technologies, or metrics.
// - Do not add a skill or tool unless it already appears somewhere in the resume.
// - Keep every job, with the same role, company, and date. The "experience" array must have the same number of jobs, in the same order.
// - Do not move bullets between jobs. Each bullet must describe work done at that job.

// ## Length
// - The resume must still fit on one page. Keep the total length about the same as the original.
// - You may drop a bullet that is irrelevant to this role if it helps make room for stronger content, but keep at least 2 bullets per job.

// ## Output
// Return valid JSON only, with no markdown, commentary, or backticks, in this exact shape:
// {
//   "summary": "string",
//   "targetCompany": "string",
//   "experience": [
//     { "role": "string", "company": "string", "date": "string", "bullets": ["string"] }
//   ],
//   "skillGroups": [
//     { "category": "string", "items": ["string"] }
//   ],
//   "notes": ["string"]
// }

// - "targetCompany" must be the hiring company's name from the job description. Never reuse a company name from the resume.
// - "skillGroups" must not be empty, and each group needs a non-empty "category".
// - Do not use "skills" as a top-level field, and do not rename any fields.
// - "notes" should briefly list the main changes you made and why (e.g. "Moved accessibility bullet to the top of the HCL role to match the posting's WCAG requirement").

// Before returning, check: same number of jobs in the same order, no bullets moved between jobs, no invented facts, the summary is clearly written for this role, and "targetCompany" is the company from the job description.
// `;

//   const response = await openai.responses.create({
//     model: process.env.OPENAI_MODEL || 'gpt-6-sol',
//     input: prompt,
//   });

//   console.log('AI output:', response.output_text);
//   return response.output_text;
// };

export const generateResumeWithAI = async ({
  currResume,
  jobDescription,
  jobLink,
}) => {
  console.log('job description length:', jobDescription?.length);

  // Don't show the model the old job's metadata; it will just copy it
  const {
    targetCompany: _oldCompany,
    title: _oldTitle,
    jobLink: _oldLink,
    jobDescription: _oldDescription,
    ...resumeContent
  } = currResume;

  // Measure the original so the tailored version fills the page the same way
  const countWords = (text = '') =>
    text
      .replace(/<[^>]*>/g, ' ')
      .split(/\s+/)
      .filter(Boolean).length;

  const summaryWords = countWords(resumeContent.summary);

  const jobTargets = (resumeContent.experience || []).map((job) => {
    const bullets = job.bullets || [];
    const words = bullets.reduce((sum, b) => sum + countWords(b), 0);
    return {
      company: job.company,
      bullets: bullets.length,
      avgWords: bullets.length ? Math.round(words / bullets.length) : 0,
    };
  });

  const totalWords =
    summaryWords +
    jobTargets.reduce((sum, job) => sum + job.bullets * job.avgWords, 0);

  const jobTargetLines = jobTargets
    .map(
      (job) =>
        `  - ${job.company}: ${job.bullets} bullets, about ${job.avgWords} words each`,
    )
    .join('\n');

  const prompt = `
You are an expert resume writer tailoring a resume to a specific job posting.

Your goal: make this resume a strong, obvious match for the role, using only the candidate's real experience.

Job description:
${jobDescription || 'Not provided. Infer what you can from the job URL.'}

Job URL:
${jobLink || 'Not provided'}

Current resume:
${JSON.stringify(resumeContent, null, 2)}

## What you SHOULD change
- Rewrite the summary for this specific role. Lead with the experience most relevant to the posting.
- Rewrite bullets to emphasize the work, skills, and outcomes that match the posting's requirements.
- Use the posting's terminology where the candidate's experience genuinely supports it (e.g. if they did "built UI components" and the posting says "design systems", and that's accurate, use "design systems").
- Reorder bullets within each job so the most relevant ones come first.
- Strengthen weak bullets: start with a strong action verb, make the impact clear, and keep existing metrics.
- Reorder skill groups and the items within them so the most relevant skills come first.
- It's fine to substantially rewrite a bullet as long as it describes the same real work.

## What you must NOT change
- Do not invent experience, companies, titles, dates, projects, technologies, or metrics.
- Do not add a skill or tool unless it already appears somewhere in the resume.
- Keep every job, with the same role, company, and date. The "experience" array must have the same number of jobs, in the same order.
- Do not move bullets between jobs. Each bullet must describe work done at that job.

## Length (important)
The original resume exactly fills one page. The tailored version must fill the page the same way, not shorter.

- Summary: about ${summaryWords} words (within 10%).
- Keep the SAME number of bullets per job. Do not drop or merge bullets:
${jobTargetLines}
- Total length: about ${totalWords} words (within 5%).
- If a bullet is less relevant to this role, rewrite it to emphasize the most relevant part of that work instead of removing it.

## Output
Return valid JSON only, with no markdown, commentary, or backticks, in this exact shape:
{
  "summary": "string",
  "targetCompany": "string",
  "experience": [
    { "role": "string", "company": "string", "date": "string", "bullets": ["string"] }
  ],
  "skillGroups": [
    { "category": "string", "items": ["string"] }
  ],
  "notes": ["string"]
}

- "targetCompany" must be the hiring company's name from the job description. Never reuse a company name from the resume.
- "skillGroups" must not be empty, and each group needs a non-empty "category".
- Do not use "skills" as a top-level field, and do not rename any fields.
- "notes" should briefly list the main changes you made and why (e.g. "Moved accessibility bullet to the top of the HCL role to match the posting's WCAG requirement").

Before returning, check: same number of jobs in the same order, same number of bullets per job, total length about ${totalWords} words, no bullets moved between jobs, no invented facts, the summary is clearly written for this role, and "targetCompany" is the company from the job description.
`;

  const response = await openai.responses.create({
    model: process.env.OPENAI_MODEL || 'gpt-6-sol',
    input: prompt,
  });

  console.log('AI output:', response.output_text);
  return response.output_text;
};

export const analyzeResume = async ({ resume, jobDescription }) => {
  if (!jobDescription?.trim()) {
    throw new Error('A job description is required for ATS analysis');
  }

  // Remove fields that describe the resume's own job or database record.
  // A saved resume carries its old jobDescription, which would compete with the one we're scoring against.
  const {
    id,
    userId,
    title,
    targetCompany,
    jobLink,
    jobDescription: _savedDescription,
    createdAt,
    updatedAt,
    ...resumeContent
  } = resume;

  const prompt = `
You are an ATS resume analysis assistant. You evaluate how well a resume matches a specific job description, the way an applicant tracking system and a recruiter screening for this role would.

Job description:
${jobDescription}

Resume:
${JSON.stringify(resumeContent, null, 2)}

## How to evaluate
Base your evaluation ONLY on the requirements stated in the job description above. Do not assume requirements that aren't in it.

First, identify from the job description:
- The required qualifications (must-haves)
- The preferred qualifications (nice-to-haves)
- The key skills, tools, and technologies
- The seniority level and type of role

Then compare the resume against them.

## Scoring (0 to 100)
Score using these weights:
- Required qualifications met: 40 points
- Key skills and keywords present (exact or clear equivalents): 25 points
- Depth and relevance of related experience: 20 points
- Seniority and role fit: 10 points
- Clarity and ATS-friendly wording (clear job titles, standard section content, specific bullets): 5 points

Use these ranges to keep scores consistent:
- 85 to 100: meets nearly all required and most preferred qualifications
- 70 to 84: meets most required qualifications, with a few gaps
- 50 to 69: meets some required qualifications, with notable gaps
- Below 50: missing several core requirements

Missing a preferred qualification should lower the score far less than missing a required one.

## Rules for the feedback
- Only credit experience and skills actually present in the resume. Do not assume or invent anything.
- "strengths": specific matches between the resume and the job description. Name the requirement and where the resume shows it.
- "gaps": specific requirements or keywords from the job description that the resume does not show. Say whether each is required or preferred.
- "recommendations": specific, actionable changes to the resume. Only recommend adding or emphasizing things the resume already supports (e.g. reword a bullet to use the posting's terminology, move relevant experience higher). If a gap can't be fixed truthfully, say so instead of suggesting the candidate claim it.
- "summary": two to three sentences on overall fit and the biggest factors behind the score.

## Output
Return valid JSON only, with no markdown, commentary, or backticks, in this exact format:
{
  "score": 0,
  "summary": "string",
  "strengths": ["string"],
  "gaps": ["string"],
  "recommendations": ["string"]
}

- "score" must be a whole number from 0 to 100.
- "strengths", "gaps", and "recommendations" must always be arrays of strings. Use an empty array if there are none.
- Do not return any other fields.
`;

  const response = await openai.responses.create({
    model: process.env.OPENAI_MODEL || 'gpt-6-sol',
    input: prompt,
  });

  console.log(response.output_text);
  return JSON.parse(response.output_text);
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
    model: process.env.OPENAI_MODEL || 'gpt-6-sol',
    input: prompt,
  });

  return response.output_text;
};

export async function parsePDFResumeWithAI(parsedResume) {
  try {
    const prompt = `
You are a resume formatting assistant.

Your job is to take parsed resume content and convert it into a clean, structured JSON object for a resume builder application.

Rules:
1. Fix spelling mistakes, malformed words, and obvious parsing/OCR errors.
2. Preserve the candidate's real experience and intent.
3. Do not invent companies, job titles, dates, technologies, or achievements.
4. If a field is missing, return an empty string, null, or empty array.
5. Rewrite broken or fragmented bullet points into clear, professional resume bullet points while preserving the original meaning.
6. Group skills into logical categories when possible.
7. Return ONLY valid JSON.
8. Do not include markdown, explanations, or code fences.
9. The response must match the exact field names below.

Return this exact JSON shape:
{
  "title": "",
  "targetCompany": "",
  "name": "",
  "header": "",
  "email": "",
  "contact": "",
  "portfolio": "",
  "summary": "",
  "jobLink": null,
  "education": "",
  "edu_desc": "",
  "edu_honors": "",
  "edu_location": "",
  "experience": [
    {
      "role": "",
      "company": "",
      "date": "",
      "bullets": [""]
    }
  ],
  "skills": [
    {
      "category": "",
      "items": [""]
    }
  ]
}

Additional formatting rules:
- "header" should contain location and professional links when available.
- "contact" should contain phone number and/or secondary contact information when available.
- "portfolio" should contain the portfolio/personal website if present.
- "education" should contain the school name.
- "edu_desc" should contain degree/program details.
- "edu_honors" should contain honors or awards.
- "edu_location" should contain school location.
- "experience" must be an array of jobs.
- Each job's "bullets" must be an array of strings.
- "skills" must be an array of skill groups.
- Each skill group's "items" must be an array of strings.

Here is the parsed resume content:
${JSON.stringify(parsedResume, null, 2)}
`;

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-6-sol',
      input: prompt,
    });

    const content = response.output_text;
    const parsed = JSON.parse(content);

    return parsed;
  } catch (error) {
    console.error('AI formatting failed:', error);
    throw error;
  }
}
