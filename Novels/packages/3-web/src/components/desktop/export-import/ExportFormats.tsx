"use client";

import type { ExportFormat } from "@/lib/hooks/desktop/useExport";

interface ExportFormatsProps {
  formats: ExportFormat[];
  value: ExportFormat;
  onChange: (format: ExportFormat) => void;
}

const LABELS: Record<ExportFormat, string> = {
  json: "JSON",
  csv: "CSV",
  markdown: "Markdown",
};

export function ExportFormats({ formats, value, onChange }: ExportFormatsProps) {
  return (
    <div className="grid gap-2">
      {formats.map((format) => (
        <label
          key={format}
          className={`flex items-center justify-between rounded-md border p-3 text-sm transition hover:border-primary ${value === format ? "border-primary bg-primary/5" : "border-border bg-background"}`}
        >
          <span className="font-medium">{LABELS[format] ?? format.toUpperCase()}</span>
          <input
            type="radio"
            className="h-4 w-4 accent-primary"
            name="export-format"
            value={format}
            checked={value === format}
            onChange={() => onChange(format)}
          />
        </label>
      ))}
    </div>
  );
}


