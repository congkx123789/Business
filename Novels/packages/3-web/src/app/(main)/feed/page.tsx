import { Suspense } from "react";
import { PostList } from "@/components/features/PostList";
import { CreatePostForm } from "@/components/features/CreatePostForm";

export default function FeedPage() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Feed</h1>
        <p className="text-muted-foreground">
          Posts from users you follow
        </p>
      </header>

      <div className="space-y-6">
        <CreatePostForm />
        
        <Suspense fallback={<div>Loading posts...</div>}>
          <PostList />
        </Suspense>
      </div>
    </div>
  );
}
