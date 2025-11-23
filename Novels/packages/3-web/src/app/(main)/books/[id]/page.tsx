import Link from "next/link";
import { ReviewsSection } from "@/components/features/Community/reviews/ReviewsSection";
import { FeaturedReviews } from "@/components/features/Community/reviews/FeaturedReviews";
import { ForumSection } from "@/components/features/Community/forums/ForumSection";
import { PollSection } from "@/components/features/Community/platform-interactions/polls/PollSection";
import { QuizSection } from "@/components/features/Community/platform-interactions/quizzes/QuizSection";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api";

async function fetchBookDetail(id: string) {
  const response = await fetch(`${API_BASE_URL}/books/${id}`, {
    next: { revalidate: 60 }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch book detail");
  }

  return response.json();
}

async function fetchChapters(id: string) {
  const response = await fetch(`${API_BASE_URL}/chapters?bookId=${id}`, {
    next: { revalidate: 60 }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch chapters");
  }

  return response.json() as Promise<{
    data: Array<{
      id: number;
      title: string;
      index: number;
    }>;
  }>;
}

interface BookPageProps {
  params: { id: string };
}

export default async function BookDetailPage({ params }: BookPageProps) {
  const [book, chapters] = await Promise.all([
    fetchBookDetail(params.id),
    fetchChapters(params.id)
  ]);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="rounded-2xl border border-slate-900 bg-slate-900/60 p-6">
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="w-full max-w-xs overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80">
              {book.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={book.coverUrl} alt={book.title} className="w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-600">No cover</div>
              )}
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-semibold text-slate-100">{book.title}</h1>
                <p className="mt-2 text-sm text-slate-400">By {book.author}</p>
              </div>
              <p className="text-sm leading-relaxed text-slate-300/90">{book.description}</p>
              <div className="flex flex-wrap gap-2 text-xs uppercase tracking-wide text-primary">
                {book.categories?.split(",").map((category: string) => (
                  <span key={category} className="rounded-full border border-primary/40 px-3 py-1">
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
        <aside className="rounded-2xl border border-slate-900 bg-slate-900/40 p-6">
          <h2 className="text-lg font-semibold text-slate-100">Chapters</h2>
          <ul className="mt-4 grid gap-2 text-sm text-slate-300">
            {chapters.data.map((chapter) => (
              <li key={chapter.id}>
                <Link
                  href={`/reader/${book.id}?chapter=${chapter.id}`}
                  className="flex items-center justify-between rounded-lg border border-transparent px-3 py-2 hover:border-primary/40 hover:bg-primary/5"
                >
                  <span className="font-medium text-slate-200">
                    {chapter.index}. {chapter.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <FeaturedReviews storyId={params.id} />

      <ReviewsSection storyId={params.id} />

      <ForumSection storyId={params.id} />

      <PollSection storyId={params.id} />

      <QuizSection storyId={params.id} />
    </div>
  );
}
