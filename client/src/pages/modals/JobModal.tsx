import { useEffect, useState } from "react";

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

type EditInput = {
  title: string;
  rawText: string;
};

type Props = {
  setJob: React.Dispatch<React.SetStateAction<JobResponse | null>>;
  deleteJob: (id: string) => Promise<void>;
  updateJob: (id: string, data: EditInput) => Promise<void>;
  job: JobResponse;
  loading: boolean;
};

export default function JobModal(props: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<EditInput>({
    title: props.job.title,
    rawText: props.job.rawText,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEditData({
      title: props.job.title,
      rawText: props.job.rawText,
    });
    setIsEditing(false);
  }, [props.job]);

  const handleSave = async () => {
    if (!editData.title.trim() || !editData.rawText.trim()) return;

    setSaving(true);
    await props.updateJob(props.job.id, editData);
    setSaving(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      title: props.job.title,
      rawText: props.job.rawText,
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => props.setJob(null)}
        className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
      >
        ← Back to all jobs
      </button>

      <div className="rounded-2xl border border-slate-300/70 bg-gradient-to-br from-slate-50/95 via-white/90 to-indigo-50/30 p-5 dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/60">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-800 dark:text-slate-200">
                Job Title
              </label>
              <input
                value={editData.title}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 bg-white/90 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Job title"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-800 dark:text-slate-200">
                Job Description
              </label>
              <textarea
                value={editData.rawText}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, rawText: e.target.value }))
                }
                rows={18}
                className="w-full rounded-lg border border-slate-300 bg-white/90 px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Paste job description..."
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>

              <button
                onClick={handleCancel}
                disabled={saving}
                className="rounded-lg border border-slate-300 bg-white/90 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {props.job.title}
            </h2>

            <div className="mt-2 flex flex-wrap gap-2">
              {props.job.tags?.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-indigo-100/70 px-3 py-1 text-xs text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                >
                  {tag}
                </span>
              ))}
            </div>

            <p className="mt-4 whitespace-pre-line text-sm text-slate-700 dark:text-slate-300">
              {props.job.rawText}
            </p>

            <div className="mt-6 flex gap-3">
              <button
                className="rounded-lg border border-slate-300 bg-white/90 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>

              
              <button
                type="button"
                className="rounded-lg border border-rose-300/50 bg-rose-50/80 px-4 py-2 text-sm text-rose-700 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/15"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this?")) {
                    props.deleteJob(props.job.id);
                  }
                }}
                disabled={props.loading}
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}