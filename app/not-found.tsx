import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-euphoria-cyan">404</p>
      <h1 className="mt-3 text-3xl font-black text-white md:text-4xl">Page not found</h1>
      <p className="mt-3 text-sm text-euphoria-muted">
        The page you requested does not exist in this public dashboard.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center rounded-md border border-euphoria-pink/50 bg-euphoria-pink/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-euphoria-pink/20"
      >
        Back to dashboard
      </Link>
    </main>
  );
}
