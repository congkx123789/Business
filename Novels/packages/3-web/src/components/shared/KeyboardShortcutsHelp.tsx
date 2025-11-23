"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Keyboard } from "lucide-react";

interface Shortcut {
  category: string;
  shortcuts: Array<{
    keys: string[];
    description: string;
  }>;
}

const shortcuts: Shortcut[] = [
  {
    category: "Reading",
    shortcuts: [
      { keys: ["Space"], description: "Next page / Scroll down" },
      { keys: ["Shift", "Space"], description: "Previous page / Scroll up" },
      { keys: ["Arrow Right"], description: "Next chapter" },
      { keys: ["Arrow Left"], description: "Previous chapter" },
      { keys: ["T"], description: "Toggle TTS/Narration" },
      { keys: ["D"], description: "Open dictionary" },
      { keys: ["B"], description: "Add bookmark" },
      { keys: ["A"], description: "Add annotation" },
    ],
  },
  {
    category: "Navigation",
    shortcuts: [
      { keys: ["Ctrl", "K"], description: "Open command palette" },
      { keys: ["G", "H"], description: "Go to home" },
      { keys: ["G", "L"], description: "Go to library" },
      { keys: ["G", "R"], description: "Go to reader" },
      { keys: ["G", "F"], description: "Go to feed" },
      { keys: ["/"], description: "Focus search" },
      { keys: ["Esc"], description: "Close dialog / Cancel" },
    ],
  },
  {
    category: "Reader Controls",
    shortcuts: [
      { keys: ["C"], description: "Toggle controls visibility" },
      { keys: ["S"], description: "Open settings panel" },
      { keys: ["F"], description: "Toggle focus mode" },
      { keys: ["M"], description: "Toggle reading mode (scroll/page)" },
      { keys: ["+", "="], description: "Increase font size" },
      { keys: ["-"], description: "Decrease font size" },
    ],
  },
  {
    category: "Desktop Features",
    shortcuts: [
      { keys: ["Ctrl", "T"], description: "New tab" },
      { keys: ["Ctrl", "W"], description: "Close tab" },
      { keys: ["Ctrl", "Tab"], description: "Switch tab" },
      { keys: ["Ctrl", "Shift", "S"], description: "Toggle split view" },
      { keys: ["Ctrl", "E"], description: "Export library" },
      { keys: ["Ctrl", "I"], description: "Import library" },
    ],
  },
];

export function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Keyboard className="h-4 w-4" />
          Shortcuts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          {shortcuts.map((category) => (
            <div key={category.category}>
              <h3 className="font-semibold text-lg mb-3">{category.category}</h3>
              <div className="space-y-2">
                {category.shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <kbd
                          key={keyIndex}
                          className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

