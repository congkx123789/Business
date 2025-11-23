import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api";

async function fetchBooks(): Promise<{
  data: Array<{
    id: number;
    title: string;
    author: string;
    description?: string;
    coverUrl?: string;
  }>;
  error: string | null;
}> {
  try {
  const response = await fetch(`${API_BASE_URL}/books`, {
      next: { revalidate: 60 },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(5000) // 5 second timeout
  });

  if (!response.ok) {
      const errorMessage = `Failed to fetch books: ${response.status} ${response.statusText}`;
      console.error(errorMessage);
      return { data: [], error: errorMessage };
  }

    const result = await response.json() as {
    data: Array<{
      id: number;
      title: string;
      author: string;
      description?: string;
      coverUrl?: string;
    }>;
    };
    
    return { data: result.data || [], error: null };
  } catch (error) {
    // Handle network errors gracefully
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error fetching books:", errorMessage);
    return { data: [], error: `Network error: ${errorMessage}` };
  }
}

export default async function BooksPage() {
  const { data, error } = await fetchBooks();

  return (
    <section className="grid gap-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Discover stories</h1>
        <p className="text-slate-400">
          Browse curated novels, sync your reading progress, and explore freshly updated chapters.
        </p>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {error ? (
          <div className="col-span-full text-center py-12">
            <p className="text-red-400 mb-2">Failed to load books</p>
            <p className="text-slate-400 text-sm">{error}</p>
            <p className="text-slate-500 text-xs mt-2">Please try again later</p>
          </div>
        ) : data.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-slate-400">No books found. Try again later.</p>
          </div>
        ) : (
          data.map((book) => (
          <Link
            key={book.id}
            href={`/books/${book.id}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-slate-900 bg-slate-900/60"
          >
            <div className="aspect-[3/4] w-full bg-slate-900/80">
              {book.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-600">No cover</div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <h2 className="text-lg font-semibold text-slate-100 line-clamp-2">{book.title}</h2>
              <p className="text-sm text-slate-400">By {book.author}</p>
              <p className="line-clamp-3 text-sm text-slate-400/80">{book.description}</p>
            </div>
          </Link>
        ))
        )}
      </div>
    </section>
  );
}
