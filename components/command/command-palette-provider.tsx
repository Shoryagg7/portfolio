"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import type { PostMeta } from "@/types";

const CommandPalette = dynamic(
  () => import("./command-palette").then((m) => m.CommandPalette),
  { ssr: false },
);

interface PaletteContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

const PaletteContext = createContext<PaletteContextValue | null>(null);

export function useCommandPalette(): PaletteContextValue {
  const ctx = useContext(PaletteContext);
  if (!ctx) throw new Error("useCommandPalette must be used within CommandPaletteProvider");
  return ctx;
}

export function CommandPaletteProvider({
  children,
  posts = [],
}: {
  children: ReactNode;
  posts?: PostMeta[];
}) {
  const [open, setOpenState] = useState(false);
  /*
    Latched on first open and never released. Rendering the palette as
    `{open && <CommandPalette/>}` tore the whole Radix dialog out of the tree the
    instant open went false, so the close animation never got a frame to run:
    the node went straight from data-state="open" to removed. Keeping it mounted
    hands the exit back to Radix, which holds the node until the animation ends.
    Closed, it renders no DOM, so this costs nothing.
  */
  const [everOpened, setEverOpened] = useState(false);

  const setOpen = useCallback((next: boolean) => {
    if (next) setEverOpened(true);
    setOpenState(next);
  }, []);

  const toggle = useCallback(() => {
    setEverOpened(true);
    setOpenState((o) => !o);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [toggle]);

  return (
    <PaletteContext.Provider value={{ open, setOpen, toggle }}>
      {children}
      {everOpened && <CommandPalette open={open} setOpen={setOpen} posts={posts} />}
    </PaletteContext.Provider>
  );
}
