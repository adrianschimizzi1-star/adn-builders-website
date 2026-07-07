import { ArrowRight } from "lucide-react";
import { Button } from "../components/Button";
import { usePageMeta } from "../hooks/usePageMeta";

export default function NotFound() {
  usePageMeta("Page not found | ADN Builders");

  return (
    <section className="container-page flex min-h-[70vh] flex-col items-center justify-center py-28 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-accent-400">
        404
      </p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-navy-300">
        Sorry, we couldn't find that page. It may have moved, or the link might
        be out of date.
      </p>
      <Button to="/" size="lg" className="mt-8">
        Back to home
        <ArrowRight className="h-5 w-5" aria-hidden />
      </Button>
    </section>
  );
}
