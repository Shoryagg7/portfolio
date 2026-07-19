import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Starfield } from "@/components/space/starfield";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-5 text-center">
      <Starfield density={1} network className="opacity-80" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 45%, var(--accent-dim), transparent 70%)",
        }}
      />
      <div className="relative">
        <p className="font-mono text-sm text-accent">404 · SIGNAL_LOST</p>
        <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight text-foreground md:text-7xl">
          Node unreachable
        </h1>
        <p className="mx-auto mt-4 max-w-md text-muted">
          This route isn&apos;t part of the topology. The packet was dropped — no retries
          scheduled, but the way home is known-good.
        </p>
        <div className="mt-8 flex justify-center">
          <Button asChild size="lg">
            <Link href="/">
              <ArrowLeft aria-hidden /> Back to base
            </Link>
          </Button>
        </div>
        <p className="mt-10 font-mono text-xs text-faint">
          {"{ \"status\": 404, \"retries\": 0, \"fallback\": \"/\" }"}
        </p>
      </div>
    </main>
  );
}
