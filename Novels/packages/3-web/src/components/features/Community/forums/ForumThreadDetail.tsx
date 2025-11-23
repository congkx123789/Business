"use client";

import React, { useState } from "react";
import { useForumThread, useReplyToThread } from "@/lib/hooks/useForums";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ForumThreadDetailProps {
  threadId: string;
  onClose: () => void;
}

export const ForumThreadDetail: React.FC<ForumThreadDetailProps> = ({ threadId, onClose }) => {
  const { data: thread, isLoading } = useForumThread(threadId);
  const replyMutation = useReplyToThread();
  const [reply, setReply] = useState("");

  const handleReply = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await replyMutation.mutateAsync({ threadId, content: reply });
    setReply("");
  };

  if (!threadId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4">
      <div className="h-[80vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-border/60 bg-background">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <p className="text-xs uppercase text-muted-foreground">{thread?.category}</p>
            <h3 className="text-xl font-semibold">{thread?.title}</h3>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="h-full overflow-y-auto">
          {isLoading ? (
            <div className="p-6 text-muted-foreground">Loading thread...</div>
          ) : (
            <div className="space-y-4 p-6">
              {thread?.posts?.map((post: any) => (
                <div key={post.id} className="rounded-lg border border-border/60 bg-card/70 p-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{post.author.username}</span>
                    <span>{new Date(post.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="mt-2 text-sm text-foreground">{post.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <form onSubmit={handleReply} className="border-t border-border p-4">
          <Textarea
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            placeholder="Write a reply..."
            rows={3}
            required
          />
          <div className="mt-3 flex justify-end">
            <Button type="submit" disabled={replyMutation.isPending}>
              {replyMutation.isPending ? "Posting..." : "Reply"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

