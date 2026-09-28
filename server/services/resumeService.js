//takes the AI generated resume and saved it to the database;
export const saveGeneratedResume = async (
  aiResume,
  currResume,
  userId,
  jobLink,
  jobDescription,
) => {
  const parsedAIResume = JSON.parse(aiResume);

  const resume = await prisma.resume.create({
    data: {
      jobLink,
      jobDescription,
      targetCompany: parsedAIResume.targetCompany || '',
      name: currResume.name || '',
      header: currResume.header || '',
      email: currResume.email || '',
      contact: currResume.contact || '',
      portfolio: currResume.portfolio || '',
      summary: parsedAIResume.summary || '',
      education: currResume.education || '',
      eduDesc: currResume.edu_desc ?? currResume.eduDesc ?? '',
      eduHonors: currResume.edu_honors ?? currResume.eduHonors ?? '',
      eduLocation: currResume.edu_location ?? currResume.eduLocation ?? '',
      userId,

      experiences: {
        create: (parsedAIResume.experience || currResume.experience || []).map(
          (job, jobIndex) => ({
            role: job.role || '',
            company: job.company || '',
            date: job.date || '',
            order: jobIndex,
            bullets: {
              create: (job.bullets || []).map((bullet, bulletIndex) => ({
                text: typeof bullet === 'string' ? bullet : bullet.text || '',
                order: bulletIndex,
              })),
            },
          }),
        ),
      },

      skillGroups: {
        create: (parsedAIResume.skillGroups || parsedAIResume.skills || []).map(
          (group, groupIndex) => ({
            category: group.category || '',
            order: groupIndex,
            items: {
              create: (group.items || []).map((item, itemIndex) => ({
                name: typeof item === 'string' ? item : item.name || '',
                order: itemIndex,
              })),
            },
          }),
        ),
      },
    },
    include: {
      experiences: {
        include: { bullets: true },
        orderBy: { order: 'asc' },
      },
      skillGroups: {
        include: { items: true },
        orderBy: { order: 'asc' },
      },
    },
  });

  return resume;
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
