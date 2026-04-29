import openai from '../lib/openai.js';

export const generateResumeWithAI = async ({ currResume, jobLink }) => {
  const prompt = `
You are a resume assistant.

You will receive a current resume and a job URL.
Your job is to ONLY improve the wording of the resume to better match the job posting — do NOT restructure, reorder, or remove anything.

Current resume:
${JSON.stringify(currResume, null, 2)}

Job URL:
${jobLink || 'No job URL provided'}

Instructions:
- Keep all information truthful
- Do not invent experience, companies, dates, projects, or technologies
- ONLY improve wording, clarity, and impact — do not change the structure
- Optimize for ATS through wording only
- Preserve the resume's general structure exactly as provided
- The "experience" array MUST contain the exact same number of jobs as the input — do not remove, skip, or merge any jobs
- Each job's bullets must ONLY contain duties and responsibilities performed at that specific company during that specific date range
- Do NOT move, copy, or merge bullets between jobs
- Do NOT exceed the word count of the current resume 
- Do NOT assign responsibilities from one company to another
- Preserve the original bullets per job as the source of truth — only improve the wording
- If you are unsure about a job's bullets, keep the original bullets and only improve the wording
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
- "experience" must always be an array with the SAME number of entries as the input
- "skillGroups" must always be an array and must reflect skills mentioned across all jobs
- Each skill group must include a non-empty "category"
- Each skill group must include an "items" array of strings
- Do not use "skills" as a top-level field
- Do not rename any fields
- If there are no skill groups, return an empty array
- If there are no notes, return an empty array

Final self-check before returning:
- Verify the "experience" array has the same number of jobs as the input
- Verify no bullets were shared or moved between jobs
- Verify "skillGroups" is not empty
- Verify "summary" is present and tailored to the job URL
- If any section is incomplete or missing, fix it before returning
`;

  const response = await openai.responses.create({
    model: 'gpt-5',
    input: prompt,
  });

  return response.output_text;
};

export const analyzeResume = async ({ resume, jobLink_ATS }) => {
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
      model: 'gpt-4.1',
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
