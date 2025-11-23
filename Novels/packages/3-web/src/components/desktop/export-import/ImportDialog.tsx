"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useImport } from "@/lib/hooks/desktop/useImport";

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({ isOpen, onClose }) => {
  const { importType, setImportType, isImporting, error, resultSummary, importFiles } = useImport();
  const [files, setFiles] = React.useState<FileList | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(event.target.files);
  };

  const handleImport = async () => {
    if (!files || files.length === 0) {
      return;
    }
    await importFiles(Array.from(files));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Data</DialogTitle>
          <DialogDescription>
            Import your library, annotations, or reading progress from CSV or JSON files.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="import-type">Data Type</Label>
            <select
              id="import-type"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={importType}
              onChange={(event) => setImportType(event.target.value as typeof importType)}
            >
              <option value="library">Library</option>
              <option value="annotations">Annotations</option>
              <option value="progress">Reading Progress</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="import-file">Files</Label>
            <Input id="import-file" type="file" multiple accept=".json,.csv" onChange={handleFileChange} />
            <p className="text-xs text-muted-foreground">Supports JSON and CSV exports from the app.</p>
          </div>

          {error && <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
          {resultSummary && (
            <div className="rounded-md bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              Imported {resultSummary.totalItems} {importType}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleImport} disabled={isImporting || !files?.length}>
            {isImporting ? "Importing..." : "Import"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};


