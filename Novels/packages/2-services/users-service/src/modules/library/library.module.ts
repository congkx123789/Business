import { Module } from "@nestjs/common";
import { LibraryService } from "./library.service";
import { LibrarySyncService } from "./library-sync.service";
import { LibraryDownloadService } from "./library-download.service";
import { LibraryStorageService } from "./library-storage.service";

@Module({
  providers: [LibraryService, LibrarySyncService, LibraryDownloadService, LibraryStorageService],
  exports: [LibraryService, LibrarySyncService, LibraryDownloadService, LibraryStorageService],
})
export class LibraryModule {}
