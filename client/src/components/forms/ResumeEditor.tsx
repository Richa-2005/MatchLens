import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Upload, FileText } from "lucide-react";

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
  setFormData: React.Dispatch<React.SetStateAction<AnalysisInput>>;

  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;

  submitLabel: string;
  submittingLabel: string;
  isSubmitting: boolean;

  secondaryLabel?: string;
  onSecondaryClick?: () => void;

  mode: "upload" | "manual";
  setMode: (nextMode: "manual" | "upload") => void;

  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
  onDropFile: (file: File | null) => void;

  layout: "panel" | "card";
};

export default function ResumeEditor({
  badge = "Resume",
  titleText,
  description,
  title,
  rawText,
  setFormData,
  onSubmit,
  submitLabel,
  submittingLabel,
  isSubmitting,
  secondaryLabel,
  onSecondaryClick,
  mode,
  setMode,
  selectedFile,
  onFileChange,
  onDropFile,
  layout,
}: ResumeEditorProps) {
  const content = (
    <>
      <div className="flex justify-center pt-1">
        <div className="inline-flex rounded-full border border-indigo-300/70 bg-gradient-to-r from-slate-100 to-indigo-100/70 p-1 shadow-inner dark:border-indigo-400/25 dark:from-slate-800 dark:to-slate-700">
          <button
            type="button"
            onClick={() => setMode("manual")}
            className={`min-w-[150px] rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
              mode === "manual"
                ? "bg-indigo-500 text-white shadow-md shadow-indigo-200/70 dark:shadow-indigo-900/30"
                : "text-slate-700 hover:bg-white/80 dark:text-slate-300 dark:hover:bg-slate-700/70"
            }`}
          >
            Paste Text
          </button>

          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`min-w-[150px] rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
              mode === "upload"
                ? "bg-white text-indigo-700 shadow-md"
                : "text-slate-700 hover:bg-white/80 dark:text-slate-300 dark:hover:bg-slate-700/70"
            }`}
          >
            Upload PDF
          </button>
        </div>
      </div>

      <div className="space-y-5 rounded-2xl border border-slate-300/70 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-sky-50/40 p-5 shadow-sm dark:border-slate-800 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700/70">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Resume details
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Add a clear title and either paste the text or upload a PDF.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
            Resume title
          </label>
          <Input
            value={title}
            name="title"
            onChange={(e) => {
              const { name, value } = e.target;
              setFormData((prev) => ({ ...prev, [name]: value }));
            }}
            placeholder="e.g. Full Stack Resume v2"
            className="border-slate-300 bg-white/90 text-slate-900 placeholder:text-slate-400 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>

        {mode === "manual" && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Resume text
            </label>
            <Textarea
              value={rawText}
              name="rawText"
              onChange={(e) => {
                const { name, value } = e.target;
                setFormData((prev) => ({ ...prev, [name]: value }));
              }}
              placeholder="Paste your resume content here..."
              rows={9}
              className="border-slate-300 bg-white/90 text-slate-900 placeholder:text-slate-400 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>
        )}

        {mode === "upload" && (
          <div className="space-y-4">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0] ?? null;
                onDropFile(file);
              }}
              className="rounded-2xl border-2 border-dashed border-indigo-300/80 bg-gradient-to-br from-white/90 via-indigo-50/40 to-sky-50/50 px-6 py-10 text-center transition hover:border-indigo-400 hover:from-indigo-50/50 hover:to-sky-50/70 dark:border-indigo-500/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 dark:hover:border-indigo-400/50 dark:hover:from-slate-900 dark:hover:to-slate-800"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                <Upload className="h-6 w-6" />
              </div>

              <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Drag and drop your resume PDF
              </h4>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                or select a file from your device
              </p>

              <div className="mt-5">
                <label className="inline-flex cursor-pointer items-center rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500">
                  Choose PDF
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      onFileChange(file);
                    }}
                  />
                </label>
              </div>

              <p className="mt-3 text-xs text-slate-500 dark:text-slate-500">
                PDF only • recommended under 5 MB
              </p>
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between rounded-xl border border-slate-300/70 bg-gradient-to-r from-white/90 to-indigo-50/40 px-4 py-3 dark:border-slate-700 dark:from-slate-900 dark:to-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                    <FileText className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onFileChange(null)}
                  className="text-sm font-medium text-rose-500 transition hover:text-rose-600 dark:text-rose-300 dark:hover:text-rose-200"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {layout == "card" && (
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
      )}
    </>
  );

  if (layout === "panel") {
    return <div className="space-y-5">{content}</div>;
  }

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
          {content}
        </form>
      </CardContent>
    </Card>
  );
}