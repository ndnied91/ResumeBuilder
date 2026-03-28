import { useAppContext } from '../context/useAppContext';

export const HeatMap = () => {
  const { jobApps } = useAppContext();

  const days = buildHeatmapData(jobApps, 133);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Application Activity
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Your application consistency over the last 12 weeks
        </p>
      </div>

      <div className="grid grid-flow-col grid-rows-7 gap-0.5 overflow-x-auto">
        {days.map((day) => (
          <div
            key={day.key}
            title={`${day.key}: ${day.count} application${day.count === 1 ? '' : 's'}`}
            className={`h-4 w-4 rounded-sm ${getHeatmapColor(day.count)}`}
          />
        ))}
      </div>

      {/* <div className="max-w-full overflow-x-auto">
  <div className="grid grid-flow-col grid-rows-7 gap-[2px] w-max">
    {days.map((day) => (
      <div
        key={day.key}
        title={`${day.key}: ${day.count} application${day.count === 1 ? '' : 's'}`}
        className={`h-3 w-3 rounded-sm ${getHeatmapColor(day.count)}`}
      />
    ))}
  </div>
</div> */}

      <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
        <span>Less</span>
        <div className="h-3 w-3 rounded-sm bg-gray-100" />
        <div className="h-3 w-3 rounded-sm bg-green-200" />
        <div className="h-3 w-3 rounded-sm bg-green-400" />
        <div className="h-3 w-3 rounded-sm bg-green-600" />
        <div className="h-3 w-3 rounded-sm bg-green-800" />
        <span>More</span>
      </div>
    </div>
  );
};

const formatDateKey = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const buildHeatmapData = (jobApps, totalDays = 84) => {
  const counts = {};

  jobApps.forEach((job) => {
    const rawDate = job.dateApplied || job.createdAt;
    if (!rawDate) return;

    const key = formatDateKey(rawDate);
    counts[key] = (counts[key] || 0) + 1;
  });

  const days = [];
  const today = new Date();

  for (let i = totalDays - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const key = formatDateKey(date);

    days.push({
      key,
      date,
      count: counts[key] || 0,
    });
  }

  return days;
};

const getHeatmapColor = (count) => {
  if (count === 0) return 'bg-gray-100';
  if (count === 1) return 'bg-green-200';
  if (count === 2) return 'bg-green-400';
  if (count === 3) return 'bg-green-600';
  return 'bg-green-800';
};
