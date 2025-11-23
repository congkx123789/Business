"use client";

import { useState } from "react";
import {
  useBookClubSchedule,
  useScheduleGroupReading,
} from "@/lib/api/useGroups";
import { cn } from "@/lib/utils";

type Props = {
  groupId: number;
  storyId?: number;
  canSchedule?: boolean;
};

export function BookClubSchedule({ groupId, storyId, canSchedule }: Props) {
  const { data, isLoading, error } = useBookClubSchedule(groupId);
  const scheduleMutation = useScheduleGroupReading();

  const [chapterNumber, setChapterNumber] = useState("");
  const [deadline, setDeadline] = useState("");
  const [discussionDate, setDiscussionDate] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!storyId || !chapterNumber || !deadline) return;

    scheduleMutation.mutate({
      groupId,
      payload: {
        storyId,
        chapterNumber: Number(chapterNumber),
        deadline,
        discussionDate: discussionDate || undefined,
      },
    });
  };

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold">Reading Schedule</h2>
        <p className="text-sm text-muted-foreground">
          Track upcoming chapters and deadlines for this book club.
        </p>
      </header>

      {isLoading && <p className="text-sm text-muted-foreground">Loading schedule…</p>}
      {error && (
        <p className="text-sm text-destructive">
          Unable to load schedule. Please try again later.
        </p>
      )}

      {!isLoading && !error && (
        <ul className="space-y-3">
          {(data?.items ?? []).length === 0 && (
            <li className="text-sm text-muted-foreground">
              No scheduled readings yet.
            </li>
          )}
          {(data?.items ?? []).map((item: any) => (
            <li
              key={item.id}
              className="rounded-md border bg-card p-3 text-sm flex flex-col gap-1"
            >
              <span className="font-medium">
                Chapter {item.chapterNumber}
              </span>
              <span className="text-muted-foreground">
                Deadline: {formatDate(item.deadline)}
              </span>
              {item.discussionDate && (
                <span className="text-muted-foreground">
                  Discussion: {formatDate(item.discussionDate)}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {canSchedule && storyId && (
        <form className="space-y-3 rounded-md border p-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium block mb-1">
              Chapter Number
            </label>
            <input
              type="number"
              value={chapterNumber}
              onChange={(event) => setChapterNumber(event.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              min={1}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">
              Discussion Date (optional)
            </label>
            <input
              type="date"
              value={discussionDate}
              onChange={(event) => setDiscussionDate(event.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className={cn(
              "w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground",
              scheduleMutation.isPending && "opacity-50",
            )}
            disabled={scheduleMutation.isPending}
          >
            {scheduleMutation.isPending ? "Scheduling…" : "Schedule Reading"}
          </button>
          {scheduleMutation.isError && (
            <p className="text-sm text-destructive">
              Unable to schedule reading. Please try again.
            </p>
          )}
        </form>
      )}
    </section>
  );
}

const formatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
});

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return formatter.format(date);
}

