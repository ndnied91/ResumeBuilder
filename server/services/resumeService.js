export const RESUME_INCLUDE = {
  experiences: {
    include: { bullets: { orderBy: { order: 'asc' } } },
    orderBy: { order: 'asc' },
  },
  skillGroups: {
    include: { items: { orderBy: { order: 'asc' } } },
    orderBy: { order: 'asc' },
  },
};

export const buildExperiencesCreate = (experience = []) =>
  experience.map((job, jobIndex) => ({
    role: job.role || '',
    company: job.company || '',
    date: job.date || '',
    order: jobIndex,
    bullets: {
      create: job.bullets.map((text, bulletIndex) => ({
        text,
        order: bulletIndex,
      })),
    },
  }));

export const buildSkillGroupsCreate = (skills = []) =>
  skills.map((group, groupIndex) => ({
    category: group.category || '',
    order: groupIndex,
    items: {
      create: group.items.map((name, itemIndex) => ({
        name,
        order: itemIndex,
      })),
    },
  }));

export const createResumeRecord = async (
  userId,
  resume,
  { jobLink = '', jobDescription = '' } = {},
) => {
  const data = normalizeResumeForSave(resume);

  return prisma.resume.create({
    data: {
      userId,
      jobLink: jobLink || '',
      jobDescription: jobDescription || '',
      targetCompany: data.targetCompany || '',
      name: data.name || '',
      header: data.header || '',
      title: data.title || '',
      email: data.email || '',
      contact: data.contact || '',
      portfolio: data.portfolio || '',
      summary: data.summary || '',
      education: data.education || '',
      eduDesc: data.edu_desc,
      eduHonors: data.edu_honors,
      eduLocation: data.edu_location,
      experiences: { create: buildExperiencesCreate(data.experience) },
      skillGroups: { create: buildSkillGroupsCreate(data.skills) },
    },
    include: RESUME_INCLUDE,
  });
};

// export const createResumeRecord = async (
//   userId,
//   resume,
//   { jobLink = '', jobDescription = '' } = {},
// ) => {
//   const data = normalizeResumeForSave(resume);

//   return prisma.resume.create({
//     data: {
//       userId,
//       jobLink: jobLink || '',
//       jobDescription: jobDescription || '',
//       targetCompany: data.targetCompany || '',
//       name: data.name || '',
//       header: data.header || '',
//       title: data.title || '',
//       email: data.email || '',
//       contact: data.contact || '',
//       portfolio: data.portfolio || '',
//       summary: data.summary || '',
//       education: data.education || '',
//       eduDesc: data.edu_desc,
//       eduHonors: data.edu_honors,
//       eduLocation: data.edu_location,

//       experiences: {
//         create: data.experience.map((job, jobIndex) => ({
//           role: job.role || '',
//           company: job.company || '',
//           date: job.date || '',
//           order: jobIndex,
//           bullets: {
//             create: job.bullets.map((text, bulletIndex) => ({
//               text,
//               order: bulletIndex,
//             })),
//           },
//         })),
//       },

//       skillGroups: {
//         create: data.skills.map((group, groupIndex) => ({
//           category: group.category || '',
//           order: groupIndex,
//           items: {
//             create: group.items.map((name, itemIndex) => ({
//               name,
//               order: itemIndex,
//             })),
//           },
//         })),
//       },
//     },
//     include: {
//       experiences: {
//         include: { bullets: { orderBy: { order: 'asc' } } },
//         orderBy: { order: 'asc' },
//       },
//       skillGroups: {
//         include: { items: { orderBy: { order: 'asc' } } },
//         orderBy: { order: 'asc' },
//       },
//     },
//   });
// };

export const saveGeneratedResume = async (
  aiResume,
  currResume,
  userId,
  jobLink,
  jobDescription,
) => {
  const parsedAIResume = JSON.parse(aiResume);

  return createResumeRecord(
    userId,
    {
      ...currResume,
      targetCompany: parsedAIResume.targetCompany || '',
      summary: parsedAIResume.summary || '',
      experience: parsedAIResume.experience,
      skills: parsedAIResume.skillGroups || parsedAIResume.skills,
    },
    { jobLink, jobDescription },
  );
};

export const normalizeResumeForSave = (resume = {}) => {
  return {
    ...resume,

    // top-level aliases
    edu_desc: resume.edu_desc ?? resume.eduDesc ?? '',
    edu_honors: resume.edu_honors ?? resume.eduHonors ?? '',
    edu_location: resume.edu_location ?? resume.eduLocation ?? '',

    // normalize skills shape
    skills: Array.isArray(resume.skills)
      ? resume.skills
      : Array.isArray(resume.skillGroups)
        ? resume.skillGroups.map((group) => ({
            category: group.category || '',
            items: Array.isArray(group.items)
              ? group.items.map((item) =>
                  typeof item === 'string' ? item : item.name || '',
                )
              : [],
          }))
        : [],

    // normalize experience bullets if needed
    experience: Array.isArray(resume.experience)
      ? resume.experience.map((job) => ({
          ...job,
          bullets: Array.isArray(job.bullets)
            ? job.bullets.map((bullet) =>
                typeof bullet === 'string' ? bullet : bullet.text || '',
              )
            : [],
        }))
      : Array.isArray(resume.experiences)
        ? resume.experiences.map((job) => ({
            role: job.role || '',
            company: job.company || '',
            date: job.date || '',
            bullets: Array.isArray(job.bullets)
              ? job.bullets.map((bullet) =>
                  typeof bullet === 'string' ? bullet : bullet.text || '',
                )
              : [],
          }))
        : [],
  };
};
