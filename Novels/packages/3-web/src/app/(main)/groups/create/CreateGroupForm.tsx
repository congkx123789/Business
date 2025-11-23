"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateBookClub, useCreateGroup } from "@/lib/api/useGroups";

export function CreateGroupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [groupType, setGroupType] = useState<"general" | "book-club">("general");
  const [storyId, setStoryId] = useState("");

  const createGroupMutation = useCreateGroup();
  const createBookClubMutation = useCreateBookClub();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    if (groupType === "book-club") {
      if (!storyId.trim()) {
        return;
      }
      createBookClubMutation.mutate(
        {
          name: name.trim(),
          description: description.trim(),
          storyId: Number(storyId),
        },
        {
          onSuccess: (data) => {
            router.push(`/groups/${data.id}`);
          },
        }
      );
      return;
    }

    createGroupMutation.mutate(
      {
        name: name.trim(),
        description: description.trim(),
      },
      {
        onSuccess: (data) => {
          router.push(`/groups/${data.id}`);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-label="Create new group">
      <div className="rounded-lg border bg-card p-6">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium mb-2"
            >
              Group Name <span className="text-destructive" aria-label="required">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Fantasy Book Club"
              className="w-full rounded-md border bg-background px-3 py-2"
              maxLength={100}
              required
              aria-required="true"
              aria-describedby="name-char-count"
              aria-invalid={name.length > 100}
            />
            <p id="name-char-count" className="text-xs text-muted-foreground mt-1" aria-live="polite">
              {name.length}/100 characters
            </p>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-2"
            >
              Description <span className="text-destructive" aria-label="required">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what your group is about..."
              className="w-full min-h-[120px] resize-none rounded-md border bg-background px-3 py-2"
              maxLength={500}
              required
              aria-required="true"
              aria-describedby="description-char-count"
              aria-invalid={description.length > 500}
            />
            <p id="description-char-count" className="text-xs text-muted-foreground mt-1" aria-live="polite">
              {description.length}/500 characters
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Group Type</p>
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="groupType"
                  value="general"
                  checked={groupType === "general"}
                  onChange={() => setGroupType("general")}
                />
                General Group
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="groupType"
                  value="book-club"
                  checked={groupType === "book-club"}
                  onChange={() => setGroupType("book-club")}
                />
                Book Club
              </label>
            </div>
            {groupType === "book-club" && (
              <p className="text-xs text-muted-foreground">
                Book clubs highlight a specific story and include a shared reading schedule.
              </p>
            )}
          </div>

          {groupType === "book-club" && (
            <div>
              <label
                htmlFor="storyId"
                className="block text-sm font-medium mb-2"
              >
                Story ID <span className="text-destructive" aria-label="required">*</span>
              </label>
              <input
                id="storyId"
                type="number"
                min={1}
                value={storyId}
                onChange={(e) => setStoryId(e.target.value)}
                placeholder="Provide the story ID this club will follow"
                className="w-full rounded-md border bg-background px-3 py-2"
                required
                aria-required="true"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-4" role="group" aria-label="Form actions">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 rounded-md border hover:bg-accent"
          aria-label="Cancel and go back"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={
            !name.trim() ||
            !description.trim() ||
            (groupType === "book-club" && !storyId.trim()) ||
            createGroupMutation.isPending ||
            createBookClubMutation.isPending
          }
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Create group"
          aria-busy={createGroupMutation.isPending || createBookClubMutation.isPending}
        >
          {createGroupMutation.isPending || createBookClubMutation.isPending
            ? "Creating..."
            : "Create Group"}
        </button>
      </div>

      {(createGroupMutation.isError || createBookClubMutation.isError) && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-md border border-destructive bg-destructive/10 p-4 text-sm text-destructive"
        >
          <span className="sr-only">Error: </span>
          {createGroupMutation.error instanceof Error
            ? createGroupMutation.error.message
            : createBookClubMutation.error instanceof Error
            ? createBookClubMutation.error.message
            : "Failed to create group. Please try again."}
        </div>
      )}
    </form>
  );
}

