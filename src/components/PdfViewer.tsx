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

  // Render the PDF to canvases (works reliably on mobile browsers, unlike <iframe>)
  useEffect(() => {
    let cancelled = false;
    const host = pagesRef.current;
    if (!host) return;

    (async () => {
      setLoading(true);
      setFailed(false);
      try {
        const pdfjs = await import("pdfjs-dist");
        const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
        pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

        const doc = await pdfjs.getDocument({ url: product.url }).promise;
        if (cancelled) return;
        setPageCount(doc.numPages);

        host.innerHTML = "";
        const zoom = ZOOMS[zoomIdx];
        const containerWidth = (scrollRef.current?.clientWidth ?? 360) - 16;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        for (let n = 1; n <= doc.numPages; n++) {
          if (cancelled) return;
          const page = await doc.getPage(n);
          const base = page.getViewport({ scale: 1 });
          const scale = ((containerWidth * zoom) / base.width) * dpr;
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          canvas.style.width = `${Math.floor(viewport.width / dpr)}px`;
          canvas.style.height = "auto";
          canvas.className = "mx-auto block rounded-xl bg-white shadow-lg";
          canvas.dataset.page = String(n);

          const wrap = document.createElement("div");
          wrap.className = "mb-4";
          wrap.appendChild(canvas);
          host.appendChild(wrap);

          const ctx = canvas.getContext("2d");
          if (ctx) await page.render({ canvas, canvasContext: ctx, viewport }).promise;
          if (n === 1) setLoading(false);
        }
        setLoading(false);
      } catch (err) {
        console.error("pdf render failed", err);
        if (!cancelled) {
          setFailed(true);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
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
