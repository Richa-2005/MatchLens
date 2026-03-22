

type ResumesResponse = {
    id: string,
    title: string,
    tags: string[],
    createdAt: string,
    updatedAt: string
}

type ResumeResponse = ResumesResponse & {
    rawText: string
}
type Props = {
    setResume : React.Dispatch<React.SetStateAction<ResumeResponse | null>>,
    deleteResume : (id:string)=>Promise<void>,
    resume : ResumeResponse
}

export default function ResumeModal(props:Props) {
    
  return (
    <div className="space-y-4">
                    <button
                        onClick={() => props.setResume(null)}
                        className="text-sm text-indigo-400 hover:text-indigo-300"
                        >
                    ← Back to all resumes
                    </button>

                    <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
                    <h2 className="text-xl font-semibold text-slate-100">
                        {props.resume.title}
                    </h2>

                    <div className="mt-2 flex flex-wrap gap-2">
                        {props.resume.tags?.map((tag) => (
                        <span
                            key={tag}
                            className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300"
                        >
                            {tag}
                        </span>
                        ))}
                    </div>

                    <p className="mt-4 text-sm text-slate-300 whitespace-pre-line">
                        {props.resume.rawText}
                    </p>

                 
                    <div className="mt-6 flex gap-3">
                        <button className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700">
                            Edit
                        </button>

                        <button 
                            className="rounded-lg border border-rose-500/30 px-4 py-2 text-sm text-rose-300 hover:bg-rose-500/10"
                            onClick={()=>props.deleteResume(props.resume.id)}
                        >
                            Delete
                        </button>
                    </div>
                    </div>
                </div>
  )
}
