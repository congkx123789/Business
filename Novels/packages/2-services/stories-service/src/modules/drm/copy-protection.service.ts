import { Injectable } from "@nestjs/common";

@Injectable()
export class CopyProtectionService {
  buildClientDirectives(isPaidChapter: boolean) {
    if (!isPaidChapter) {
      return {
        disableSelection: false,
        disableContextMenu: false,
        keyboardShortcuts: [],
      };
    }

    return {
      disableSelection: true,
      disableContextMenu: true,
      keyboardShortcuts: ["CTRL+C", "CTRL+A", "CMD+C", "CMD+A"],
    };
  }
}


