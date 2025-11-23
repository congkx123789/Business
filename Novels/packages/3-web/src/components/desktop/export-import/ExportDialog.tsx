"use client";

import { useEffect, useMemo, useState } from "react";
import { useExport, type ExportFormat, type ExportTarget } from "@/lib/hooks/desktop/useExport";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ExportFormats } from "./ExportFormats";

const TARGET_OPTIONS: { value: ExportTarget; label: string; description: string }[] = [
  {
    value: "library",
    label: "Library & Bookshelves",
    description: "Stories in your library, custom tags, and optional bookshelf metadata.",
  },
  {
    value: "annotations",
    label: "Annotations & Highlights",
    description: "Highlights, notes, and AI summaries across stories and chapters.",
  },
  {
    value: "reading-progress",
    label: "Reading Progress",
    description: "Chapter position, scroll offsets, and completion history.",
  },
];

const FORMAT_MAP: Record<ExportTarget, ExportFormat[]> = {
  library: ["json", "csv"],
  annotations: ["json", "markdown"],
  "reading-progress": ["json", "csv"],
};

interface ExportDialogProps {
  triggerLabel?: string;
}

export function ExportDialog({ triggerLabel = "Export Data" }: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<ExportTarget>("library");
  const [format, setFormat] = useState<ExportFormat>("json");
  const [includeBookshelves, setIncludeBookshelves] = useState(true);
  const [includeAiSummary, setIncludeAiSummary] = useState(true);
  const { exportData, status, error } = useExport();

  const availableFormats = useMemo(() => FORMAT_MAP[target], [target]);

  useEffect(() => {
    if (!availableFormats.includes(format)) {
      setFormat(availableFormats[0]);
    }
  }, [availableFormats, format]);

  const handleExport = async () => {
    await exportData({
      target,
      format,
      includeBookshelves: target === "library" ? includeBookshelves : undefined,
      includeAiSummary: target === "annotations" ? includeAiSummary : undefined,
    });
  };

  const isRunning = status === "running";
  const isSuccess = status === "success";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Export your data</DialogTitle>
          <DialogDescription>
            Choose the dataset and format you want to export. Files are generated locally in your browser.
          </DialogDescription>
        </DialogHeader>

        <section className="space-y-3">
          <p className="text-xs uppercase text-muted-foreground">Dataset</p>
          <div className="grid gap-2">
            {TARGET_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`rounded-md border p-3 transition hover:border-primary ${target === option.value ? "border-primary bg-primary/5" : "border-border bg-background"}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  <input
                    type="radio"
                    name="export-target"
                    value={option.value}
                    checked={target === option.value}
                    onChange={() => setTarget(option.value)}
                    className="h-4 w-4 accent-primary"
                  />
                </div>
              </label>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <p className="text-xs uppercase text-muted-foreground">Format</p>
          <ExportFormats formats={availableFormats} value={format} onChange={setFormat} />
        </section>

        {target === "library" && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary"
              checked={includeBookshelves}
              onChange={(event) => setIncludeBookshelves(event.target.checked)}
            />
            Include bookshelf metadata
          </label>
        )}

        {target === "annotations" && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary"
              checked={includeAiSummary}
              onChange={(event) => setIncludeAiSummary(event.target.checked)}
            />
            Include AI summaries
          </label>
        )}

        {error && (
          <p className="rounded-md border border-destructive/50 bg-destructive/10 p-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {isSuccess && (
          <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-2 text-sm text-emerald-600">
            Export completed. Check your downloads folder.
          </p>
        )}

        <DialogFooter className="gap-2 sm:justify-end">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button onClick={() => handleExport()} disabled={isRunning}>
            {isRunning ? "Exporting…" : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


