"use client";

import { notFound, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useGroup, useUpdateGroup, useDeleteGroup } from "@/lib/api/useGroups";
import { useAuthStore } from "@/lib/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";

export function GroupSettings({ id }: { id: string }) {
  const router = useRouter();
  const { data: group, isLoading, error } = useGroup(parseInt(id));
  const { user } = useAuthStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const updateMutation = useUpdateGroup();
  const deleteMutation = useDeleteGroup();

  const isOwner = user && group && user.id === group.ownerId;

  // Initialize form when group loads
  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description);
    }
  }, [group]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-muted rounded w-3/4 mb-8"></div>
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <div className="h-6 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded w-full"></div>
            <div className="h-24 bg-muted rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return notFound();
  }

  if (!isOwner) {
    return (
      <div
        className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center"
        role="alert"
        aria-live="assertive"
      >
        <p className="text-destructive" id="permission-error">
          You don't have permission to manage this group.
        </p>
        <button
          onClick={() => router.back()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              router.back();
            }
          }}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Go back to previous page"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    updateMutation.mutate(
      {
        groupId: parseInt(id),
        data: {
          name: name.trim(),
          description: description.trim(),
        },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  const handleDelete = () => {
    if (
      !confirm(
        "Are you sure you want to delete this group? This action cannot be undone."
      )
    ) {
      return;
    }

    deleteMutation.mutate(parseInt(id), {
      onSuccess: () => {
        router.push("/groups");
      },
    });
  };

  const handleCancel = () => {
    if (group) {
      setName(group.name);
      setDescription(group.description);
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-6" role="main">
      <header className="mb-8" role="banner">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2" id="settings-title">
              Group Settings
            </h1>
            <p className="text-muted-foreground" id="settings-description">
              Manage your group: {group.name}
            </p>
          </div>
          <button
            onClick={() => router.back()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                router.back();
              }
            }}
            className="px-4 py-2 rounded-md border hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Go back to group page"
          >
            Back to Group
          </button>
        </div>
      </header>

      <div className="space-y-6">
        {/* Group Information */}
        <section className="rounded-lg border bg-card p-6" aria-labelledby="group-info-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="group-info-heading" className="text-xl font-semibold">Group Information</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setIsEditing(true);
                  }
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Edit group information"
              >
                Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-4" aria-label="Edit group form">
              <div>
                <label
                  htmlFor="edit-name"
                  className="block text-sm font-medium mb-2"
                >
                  Group Name <span className="text-destructive" aria-label="required">*</span>
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  maxLength={100}
                  required
                  aria-required="true"
                  aria-describedby="edit-name-char-count"
                  aria-invalid={name.length > 100}
                />
                <p id="edit-name-char-count" className="text-xs text-muted-foreground mt-1" aria-live="polite">
                  {name.length}/100 characters
                </p>
              </div>

              <div>
                <label
                  htmlFor="edit-description"
                  className="block text-sm font-medium mb-2"
                >
                  Description <span className="text-destructive" aria-label="required">*</span>
                </label>
                <textarea
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[120px] resize-none rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  maxLength={500}
                  required
                  aria-required="true"
                  aria-describedby="edit-description-char-count"
                  aria-invalid={description.length > 500}
                />
                <p id="edit-description-char-count" className="text-xs text-muted-foreground mt-1" aria-live="polite">
                  {description.length}/500 characters
                </p>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t" role="group" aria-label="Form actions">
                <button
                  type="button"
                  onClick={handleCancel}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleCancel();
                    }
                  }}
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 rounded-md border hover:bg-accent disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label="Cancel editing"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    !name.trim() ||
                    !description.trim() ||
                    updateMutation.isPending
                  }
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label="Save group changes"
                  aria-busy={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>

              {updateMutation.isError && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive"
                >
                  <span className="sr-only">Error: </span>
                  {updateMutation.error instanceof Error
                    ? updateMutation.error.message
                    : "Failed to update group. Please try again."}
                </div>
              )}
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Group Name
                </label>
                <p className="text-muted-foreground">{group.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <p className="text-muted-foreground">{group.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Members
                  </label>
                  <p className="text-muted-foreground">{group.memberCount}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Created
                  </label>
                  <p className="text-muted-foreground">
                    {group.createdAt &&
                      formatDistanceToNow(new Date(group.createdAt), {
                        addSuffix: true,
                      })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Danger Zone */}
        <section className="rounded-lg border border-destructive bg-destructive/5 p-6" aria-labelledby="danger-zone-heading">
          <h2 id="danger-zone-heading" className="text-xl font-semibold mb-4 text-destructive">
            Danger Zone
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-4" id="delete-warning">
                Once you delete a group, there is no going back. Please be certain.
              </p>
              <button
                onClick={handleDelete}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleDelete();
                  }
                }}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2"
                aria-label="Delete group permanently"
                aria-describedby="delete-warning"
                aria-busy={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete Group"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

