import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

type AnalysisInput = {
  title: string;
  rawText: string;
};

type JobEditorProps = {
  badge?: string;
  titleText: string;
  description: string;
  sectionLabel?: string;
  sectionTitle?: string;

  title: string;
  rawText: string;

  setFormData: React.Dispatch<React.SetStateAction<AnalysisInput>>;

  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;

  submitLabel: string;
  submittingLabel: string;
  isSubmitting: boolean;

  secondaryLabel?: string;
  onSecondaryClick?: () => void;
};

export default function JobEditor({
  badge = "Job",
  titleText,
  description,
  sectionLabel = "Job",
  sectionTitle = "Job Details",
  title,
  rawText,
  setFormData,
  onSubmit,
  submitLabel,
  submittingLabel,
  isSubmitting,
  secondaryLabel,
  onSecondaryClick,
}: JobEditorProps) {
  return (
    <Card className="overflow-hidden border border-slate-300/70 bg-gradient-to-br from-slate-50/95 via-white/90 to-indigo-50/40 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/70 dark:shadow-black/20">
      <CardHeader className="border-b border-slate-300/60 bg-gradient-to-r from-slate-50 via-indigo-50/40 to-sky-50/50 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/70">
        <div className="space-y-2">
          <div className="inline-flex items-center rounded-full border border-indigo-500/20 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-300">
            {badge}
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {titleText}
          </CardTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 bg-white/40 dark:bg-slate-900/30">
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-4 rounded-2xl border border-slate-300/70 bg-gradient-to-br from-slate-50 via-indigo-50/35 to-sky-50/35 p-5 shadow-sm dark:border-slate-800 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700/70">
            <div className="space-y-2">
              <div className="inline-flex items-center rounded-full border border-slate-300 bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-700/60 dark:text-slate-300">
                {sectionLabel}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                {sectionTitle}
              </h3>
            </div>

            <Input
              value={title}
              name="title"
              onChange={(e) => {
                const { name, value } = e.target;
                setFormData((prev) => ({ ...prev, [name]: value }));
              }}
              placeholder="Job title (e.g. Backend Engineer)"
              className="border-slate-300 bg-white/90 text-slate-900 placeholder:text-slate-400 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500"
            />

            <Textarea
              value={rawText}
              name="rawText"
              onChange={(e) => {
                const { name, value } = e.target;
                setFormData((prev) => ({ ...prev, [name]: value }));
              }}
              placeholder="Paste the job description here..."
              rows={8}
              className="border-slate-300 bg-white/90 text-slate-900 placeholder:text-slate-400 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-300/70 pt-4 dark:border-slate-800">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? submittingLabel : submitLabel}
            </Button>

            {secondaryLabel && onSecondaryClick && (
              <Button
                type="button"
                variant="outline"
                onClick={onSecondaryClick}
                className="border-slate-300 bg-white/90 text-slate-800 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 dark:hover:text-white"
              >
                {secondaryLabel}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}