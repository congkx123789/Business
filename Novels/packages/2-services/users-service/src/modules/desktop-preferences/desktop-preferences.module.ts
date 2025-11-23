import { Module } from "@nestjs/common";
import { DesktopPreferencesService } from "./desktop-preferences.service";
import { TabStateService } from "./tab-state.service";
import { LayoutPreferencesService } from "./layout-preferences.service";

@Module({
  providers: [DesktopPreferencesService, TabStateService, LayoutPreferencesService],
  exports: [DesktopPreferencesService, TabStateService, LayoutPreferencesService],
})
export class DesktopPreferencesModule {}
