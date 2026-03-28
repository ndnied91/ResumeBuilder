//takes the AI generated resume and saved it to the database;
export const saveGeneratedResume = async (
  aiResume,
  currResume,
  userId,
  jobLink,
) => {
  console.log('AI Resume in save generated resume', aiResume);

  const parsedAIResume = JSON.parse(aiResume);
  console.log('parsed', parsedAIResume);

  const resume = await prisma.resume.create({
    data: {
      jobLink,
      // title: parsedAIResume.notes.title,
      name: currResume.name, //stays the same
      header: currResume.header, //stays the same
      email: currResume.email, //stays the same
      contact: currResume.contact, //stays the same
      portfolio: currResume.portfolio, //stays the same
      summary: parsedAIResume.summary,
      education: currResume.education, //stays the same
      eduDesc: currResume.edu_desc, //stays the same
      eduHonors: currResume.edu_honors, //stays the same
      eduLocation: currResume.edu_location, //stays the same
      userId,

      experiences: {
        create: (parsedAIResume.experience || []).map((job, jobIndex) => ({
          role: job.role,
          company: job.company,
          date: job.date,
          order: jobIndex,
          bullets: {
            create: (job.bullets || []).map((bullet, bulletIndex) => ({
              text: bullet,
              order: bulletIndex,
            })),
          },
        })),
      },

      skillGroups: {
        create: (parsedAIResume.skills || []).map((group, groupIndex) => ({
          category: group.category,
          order: groupIndex,
          items: {
            create: (group.items || []).map((item, itemIndex) => ({
              name: item,
              order: itemIndex,
            })),
          },
        })),
      },
    },
    include: {
      experiences: {
        include: {
          bullets: true,
        },
        orderBy: { order: 'asc' },
      },
      skillGroups: {
        include: {
          items: true,
        },
        orderBy: { order: 'asc' },
      },
    },
  });

  return resume;
};
