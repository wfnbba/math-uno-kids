import { useEffect } from "react";
import type { Product } from "@/lib/decks";
import { downloadProduct } from "@/lib/decks";

interface Props {
  product: Product;
  onClose: () => void;
}

export function PdfViewer({ product, onClose }: Props) {
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

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/80 backdrop-blur-sm animate-pop-in">
      <div className="flex items-center justify-between gap-2 border-b-4 border-border bg-card p-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-extrabold">{product.name}</p>
          <p className="truncate text-xs font-bold text-muted-foreground">
            {product.cards} cards · Print at 100% scale
          </p>
        </div>
        <button
          onClick={() => downloadProduct(product)}
          className="btn-bounce shrink-0 rounded-2xl bg-fun-green px-3 py-2 font-display text-sm font-extrabold text-primary-foreground"
        >
          ⬇️ Download
        </button>
        <button
          onClick={onClose}
          aria-label="Close"
          className="btn-bounce shrink-0 rounded-2xl bg-fun-red px-3 py-2 font-display text-sm font-extrabold text-primary-foreground"
        >
          ✕ Close
        </button>
      </div>
      <iframe
        src={`${product.url}#toolbar=1&navpanes=0&view=FitH`}
        title={product.name}
        className="min-h-0 flex-1 bg-white"
      />
    </div>
  );
}
