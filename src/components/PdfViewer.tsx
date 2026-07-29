import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/decks";
import { downloadProduct } from "@/lib/decks";

interface Props {
  product: Product;
  onClose: () => void;
}

const ZOOMS = [1, 1.5, 2.5];

export function PdfViewer({ product, onClose }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<HTMLDivElement>(null);
  const [zoomIdx, setZoomIdx] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [current, setCurrent] = useState(1);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  /**
   * Canvas rendering (mobile browsers handle <iframe> PDFs badly).
   * Pages are laid out immediately as sized placeholders and rendered
   * lazily as they scroll into view, so a 99-page deck opens instantly.
   */
  useEffect(() => {
    let cancelled = false;
    const host = pagesRef.current;
    const scroller = scrollRef.current;
    if (!host || !scroller) return;

    let observer: IntersectionObserver | null = null;

    (async () => {
      setLoading(true);
      setFailed(false);
      try {
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        const workerUrl = (await import("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url")).default;
        pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

        const doc = await pdfjs.getDocument({ url: product.url }).promise;
        if (cancelled) return;
        setPageCount(doc.numPages);

        const zoom = ZOOMS[zoomIdx];
        const cssWidth = Math.max(240, (scroller.clientWidth || 360) - 16) * zoom;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        // Use page 1 to estimate the placeholder height for every page.
        const first = await doc.getPage(1);
        if (cancelled) return;
        const base = first.getViewport({ scale: 1 });
        const ratio = base.height / base.width;

        host.innerHTML = "";
        const rendered = new Set<number>();

        const renderPage = async (n: number, canvas: HTMLCanvasElement) => {
          if (rendered.has(n) || cancelled) return;
          rendered.add(n);
          const page = n === 1 ? first : await doc.getPage(n);
          if (cancelled) return;
          const scale = (cssWidth / base.width) * dpr;
          const viewport = page.getViewport({ scale });
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          await page.render({ canvasContext: ctx, viewport }).promise;
        };

        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              const canvas = entry.target as HTMLCanvasElement;
              void renderPage(Number(canvas.dataset.page), canvas);
            });
          },
          { root: scroller, rootMargin: "800px 0px" },
        );

        for (let n = 1; n <= doc.numPages; n++) {
          const canvas = document.createElement("canvas");
          canvas.dataset.page = String(n);
          canvas.className = "mx-auto block rounded-xl bg-white shadow-lg";
          canvas.style.width = `${cssWidth}px`;
          canvas.style.height = `${Math.round(cssWidth * ratio)}px`;
          const wrap = document.createElement("div");
          wrap.className = "mb-4 w-full overflow-x-auto";
          wrap.appendChild(canvas);
          host.appendChild(wrap);
          observer.observe(canvas);
        }

        await renderPage(1, host.querySelector<HTMLCanvasElement>("canvas[data-page='1']")!);
        if (!cancelled) setLoading(false);
      } catch (err) {
        console.error("PDF preview failed", err);
        if (!cancelled) {
          setFailed(true);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [product.url, zoomIdx]);

  // Track visible page
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const canvases = el.querySelectorAll<HTMLCanvasElement>("canvas[data-page]");
      const mid = el.scrollTop + el.clientHeight / 2;
      let page = 1;
      canvases.forEach((c) => {
        const top = c.parentElement!.offsetTop;
        if (top <= mid) page = Number(c.dataset.page);
      });
      setCurrent(page);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [pageCount]);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-background animate-pop-in">
      {/* Top bar */}
      <div className="flex items-center gap-2 border-b-4 border-border bg-card px-3 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <button
          onClick={onClose}
          aria-label="Close preview"
          className="btn-bounce grid h-11 w-11 shrink-0 place-items-center rounded-2xl border-4 border-border bg-fun-red font-display text-lg font-extrabold text-primary-foreground"
        >
          ✕
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base font-extrabold leading-tight">{product.name}</p>
          <p className="truncate text-xs font-bold text-muted-foreground">
            {pageCount ? `Page ${current} of ${pageCount}` : "Loading preview…"}
          </p>
        </div>
        <button
          onClick={() => setZoomIdx((i) => (i + 1) % ZOOMS.length)}
          aria-label="Change zoom"
          className="btn-bounce h-11 shrink-0 rounded-2xl border-4 border-border bg-fun-purple px-3 font-display text-sm font-extrabold text-primary-foreground"
        >
          🔍 {ZOOMS[zoomIdx]}×
        </button>
      </div>

      {/* Pages */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto overscroll-contain bg-muted px-2 py-3">
        {loading && (
          <div className="flex h-40 items-center justify-center">
            <span className="animate-bounce-soft font-display text-2xl font-extrabold">🃏 Loading cards…</span>
          </div>
        )}
        {failed && (
          <div className="mx-auto max-w-sm rounded-3xl border-4 border-border bg-card p-5 text-center">
            <p className="font-display text-lg font-extrabold">Preview not available here</p>
            <p className="mt-2 text-sm font-bold text-muted-foreground">
              No worries — open the PDF in a new tab or download it.
            </p>
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-bounce mt-4 inline-block rounded-2xl border-4 border-border bg-fun-blue px-5 py-3 font-display text-base font-extrabold text-primary-foreground"
            >
              ↗️ Open PDF
            </a>
          </div>
        )}
        <div ref={pagesRef} />
      </div>

      {/* Bottom actions */}
      <div className="flex items-center gap-2 border-t-4 border-border bg-card px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-bounce flex-1 rounded-2xl border-4 border-border bg-card px-3 py-3 text-center font-display text-base font-extrabold"
        >
          ↗️ Open
        </a>
        <button
          onClick={() => downloadProduct(product)}
          className="btn-bounce flex-[2] rounded-2xl border-4 border-border bg-fun-green px-3 py-3 font-display text-base font-extrabold text-primary-foreground"
        >
          ⬇️ Download PDF
        </button>
      </div>
    </div>
  );
}
