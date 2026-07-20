import { Link } from "@tanstack/react-router";

export function ProfileRedirectFallback() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <span className="text-6xl" aria-hidden>
        🦊
      </span>
      <h1 className="mt-4 font-display text-3xl font-extrabold text-primary">Set up a kid profile</h1>
      <p className="mt-2 text-base font-bold text-muted-foreground">
        Create a kid profile in the Parents tab so the game can save progress.
      </p>
      <Link
        to="/parents"
        replace
        className="btn-bounce shadow-pop mt-6 inline-flex w-full items-center justify-center rounded-3xl bg-primary px-6 py-5 font-display text-xl font-extrabold text-primary-foreground"
      >
        Open Parents tab 👨‍👩‍👧
      </Link>
    </div>
  );
}
