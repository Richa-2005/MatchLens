type JobsResponse = {
  id: string;
  title: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

type Props = {
  displayedJobs: JobsResponse[];
  openJob: (id: string) => Promise<void>;
};

export default function JobCard(props: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {props.displayedJobs.map((j) => (
        <div
          key={j.id}
          onClick={() => props.openJob(j.id)}
          className="cursor-pointer rounded-2xl border border-slate-700 bg-slate-800/60 p-4 transition hover:border-indigo-500/40 hover:bg-slate-800"
        >
          <h3 className="font-semibold text-slate-100">{j.title}</h3>

          <p className="mt-1 text-xs text-slate-400">
            Created: {new Date(j.createdAt).toLocaleDateString()}
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            {j.tags?.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-700 px-2 py-1 text-xs text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}