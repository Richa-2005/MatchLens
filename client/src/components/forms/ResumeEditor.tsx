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


type ResumeEditorProps = {
  badge?: string;
  titleText: string;
  description: string;
  sectionLabel?: string;
  sectionTitle?: string;

  title: string;
  rawText: string;

  setFormData:React.Dispatch<React.SetStateAction<AnalysisInput>>
  
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;

  submitLabel: string;
  submittingLabel: string;
  isSubmitting: boolean;

  secondaryLabel?: string;
  onSecondaryClick?: () => void;
};

export default function ResumeEditor({
  badge = "Resume",
  titleText,
  description,
  sectionLabel = "Resume",
  sectionTitle = "Resume Details",
  title,
  rawText,
  setFormData,
  onSubmit,
  submitLabel,
  submittingLabel,
  isSubmitting,
  secondaryLabel,
  onSecondaryClick,
}: ResumeEditorProps) {

  return (
    <Card className="overflow-hidden border border-slate-800 bg-slate-900/70 shadow-xl shadow-black/20">
      <CardHeader className="border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800/70">
        <div className="space-y-2">
          <div className="inline-flex items-center rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1 text-xs font-medium text-indigo-300">
            {badge}
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-slate-50">
            {titleText}
          </CardTitle>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 bg-slate-900/30">
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-800/60 p-5 shadow-sm">
            <div className="space-y-2">
              <div className="inline-flex items-center rounded-full border border-slate-700 bg-slate-700/60 px-2.5 py-1 text-xs font-medium text-slate-300">
                {sectionLabel}
              </div>
              <h3 className="text-lg font-semibold text-slate-50">
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
              placeholder="Resume title (e.g. Backend Resume v2)"
              className="border-slate-700 bg-slate-900/80 text-slate-100 placeholder:text-slate-500 focus-visible:ring-indigo-500"
            />

            <Textarea
              value={rawText}
              name="rawText"
              onChange={(e) => {
                      const { name, value } = e.target;
                    setFormData((prev) => ({ ...prev, [name]: value }));
                }}
              placeholder="Paste your resume content here..."
              rows={8}
              className="border-slate-700 bg-slate-900/80 text-slate-100 placeholder:text-slate-500 focus-visible:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-800 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? submittingLabel : submitLabel}
            </Button>

            {secondaryLabel && onSecondaryClick && (
              <Button
                type="button"
                variant="outline"
                onClick={onSecondaryClick}
                className="border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700 hover:text-white"
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