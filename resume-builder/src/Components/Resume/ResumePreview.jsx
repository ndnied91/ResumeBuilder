import { useAppContext } from '../../context/useAppContext';

export const FormatPreview = ({ showEdit, resumeRef }) => {
  const { currResume } = useAppContext();

  return (
    <div
      className={`min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm ${
        !showEdit ? 'mx-auto w-full max-w-4xl' : ''
      }`}
    >
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-500">Preview</p>
      </div>

      <div className="h-[calc(100vh-220px)] overflow-auto rounded-xl bg-gray-100 p-4">
        <div className="flex min-w-0 justify-center">
          <div
            ref={resumeRef}
            className="w-full max-w-[8.5in] min-h-[11in] bg-white px-12 py-9 text-black"
            style={{
              fontFamily: 'Calibri, Arial, Helvetica, sans-serif',
            }}
          >
            {/* Header */}
            <header className="border-b border-gray-300 pb-2 text-center">
              <h1 className="text-[15px] font-bold tracking-wide">
                {currResume.name}
              </h1>
              <p className="text-[13px] leading-[1.3]">{currResume.header}</p>
              <p className="text-[13px] leading-[1.3]">{currResume.contact}</p>
              <p className="text-[13px] leading-[1.3]">
                {currResume.portfolio}
              </p>
            </header>

            {/* Summary */}
            <section className="mt-3">
              <h2 className="text-[15px] font-bold tracking-wider">Summary</h2>
              <p className="text-[12px] leading-[1.3]">{currResume.summary}</p>
            </section>

            {/* Skills */}
            <section className="mt-2">
              <h2 className="text-[15px] font-bold tracking-wider">
                Technical Skills
              </h2>
              <div className="space-y-[2px]">
                {currResume.skills
                  ? currResume.skills.map((skillGroup, index) => (
                      <p key={index} className="text-[12px] leading-[1.3]">
                        <span className="font-semibold">
                          {skillGroup.category}:
                        </span>{' '}
                        {skillGroup.items.join(', ')}
                      </p>
                    ))
                  : null}
              </div>
            </section>

            {/* Experience */}
            <section className="mt-3">
              <h2 className="text-[15px] font-bold tracking-wider">
                Work Experience
              </h2>

              <div className="mt-1 space-y-2">
                {currResume?.experience?.length > 0
                  ? currResume.experience.map((job, index) => (
                      <div key={index}>
                        <div className="flex items-start justify-between">
                          <p className="text-[12px] font-bold leading-[1.3]">
                            {job?.company ? ` ${job.company}` : ''}
                          </p>
                          <p className="text-[12px] font-bold leading-[1.3]">
                            {job?.date || ''}
                          </p>
                        </div>
                        <p className="text-[12px] italic leading-tight">
                          {job?.role || ''}
                        </p>
                        <ul className="mt-[2px] list-disc pl-4 text-[12px] leading-[1.3]">
                          {job?.bullets?.length > 0 &&
                            job.bullets.map((bullet, bulletIndex) => (
                              <li key={bulletIndex}>{bullet}</li>
                            ))}
                        </ul>
                      </div>
                    ))
                  : null}
              </div>
            </section>

            {/* Education */}
            <section className="mt-1">
              <h2 className="text-[15px] font-bold tracking-wider">
                Education
              </h2>

              <div className="flex justify-between">
                <p className="text-[12px] font-bold leading-[1.3]">
                  {currResume.education}
                </p>
                <p className="text-[12px] font-bold leading-[1.3]">
                  {currResume.edu_location}
                </p>
              </div>

              <p className="text-[12px] italic leading-[1.3]">
                {currResume.edu_desc}
              </p>
              <p className="text-[12px] italic leading-[1.3]">
                {currResume.edu_honors}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
