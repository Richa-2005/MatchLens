
type ResumesResponse = {
    id: string,
    title: string,
    tags: string[],
    createdAt: string,
    updatedAt: string
}

type PropsType = {
    displayedResumes : ResumesResponse[],
    openResume : (id: string) => Promise<void>
}

export default function ResumeCard(props:PropsType) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
        {props.displayedResumes.map((r) => (
            <div
                key={r.id}
                onClick={() => props.openResume(r.id)}
                className="cursor-pointer rounded-2xl border border-slate-700 bg-slate-800/60 p-4 hover:border-indigo-500/40 hover:bg-slate-800 transition"
            >
            <h3 className="font-semibold text-slate-100">{r.title}</h3>

            <p className="mt-1 text-xs text-slate-400">
                Created: {new Date(r.createdAt).toLocaleDateString()}
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
                {r.tags?.slice(0, 3).map((tag) => (
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

  )
}
