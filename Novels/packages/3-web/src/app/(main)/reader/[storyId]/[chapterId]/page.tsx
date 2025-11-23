"use client";

import { ReaderContainer } from "@/components/features/Reader/ReaderContainer";
import { TabManager } from "@/components/desktop/multi-window/TabManager";
import { TabPersistence } from "@/components/desktop/multi-window/TabPersistence";

export default function ReaderChapterPage({
  params,
}: {
  params: { storyId: string; chapterId: string };
}) {
  return (
    <>
      <TabPersistence />
      <TabManager>
        <ReaderContainer storyId={params.storyId} initialChapterId={params.chapterId} />
      </TabManager>
    </>
  );
}


