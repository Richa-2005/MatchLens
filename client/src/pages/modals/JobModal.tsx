type JobsResponse = {
  id: string;
  title: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

type JobResponse = JobsResponse & {
  rawText: string;
};

type Props = {
  setJob: React.Dispatch<React.SetStateAction<JobResponse | null>>;
  deleteJob: (id: string) => Promise<void>;
  job: JobResponse;
};

export default function JobModal(props: Props) {
  return (
    <div className="space-y-4">
      <button
        onClick={() => props.setJob(null)}
        className="text-sm text-indigo-400 hover:text-indigo-300"
      >
        ← Back to all jobs
      </button>

      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <h2 className="text-xl font-semibold text-slate-100">
          {props.job.title}
        </h2>

        <div className="mt-2 flex flex-wrap gap-2">
          {props.job.tags?.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300"
            >
              {tag}
            </span>
          ))}
        </div>

        <p className="mt-4 whitespace-pre-line text-sm text-slate-300">
          {props.job.rawText}
        </p>

        <div className="mt-6 flex gap-3">
          <button className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700">
            Edit
          </button>

          <button
            className="rounded-lg border border-rose-500/30 px-4 py-2 text-sm text-rose-300 hover:bg-rose-500/10"
            onClick={() => props.deleteJob(props.job.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}