import { cn } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { applyThemeIsolated, type Theme } from "theme-o-rama";
import { ThemePreviewContent } from "./ThemePreviewContent";

interface ThemePreviewRendererProps {
  theme: Theme | null;
  className?: string;
}

interface ThemePreviewContentProps {
  theme: Theme | null;
}

export function ThemePreviewRenderer({ theme, className }: ThemePreviewRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [iframeDocument, setIframeDocument] = useState<Document | null>(null);
  const [mountNode, setMountNode] = useState<HTMLDivElement | null>(null);

  const handleLoad = useCallback(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) {
      setIframeDocument(null);
      return;
    }

    // Reset iframe document content
    doc.body.innerHTML = "";
    doc.documentElement.style.height = "100%";
    doc.body.style.margin = "0";
    doc.body.style.minHeight = "100%";
    doc.body.style.height = "100%";
    doc.body.style.backgroundColor = "#ffffff";

    // Create a root container for React portal content
    const mount = doc.createElement("div");
    mount.className = "theme-preview-iframe-root";
    mount.style.height = "100%";
    mount.style.width = "100%";
    doc.body.appendChild(mount);
    setMountNode(mount);
    setIframeDocument(doc);
  }, []);

  useEffect(() => {
    if (!iframeDocument) {
      return;
    }

    const head = iframeDocument.head;
    head.innerHTML = "";

    const parentStyles = Array.from(
      document.head.querySelectorAll<HTMLLinkElement | HTMLStyleElement>(
        "link[rel='stylesheet'], style",
      ),
    );

    parentStyles.forEach((node) => {
      const cloned = node.cloneNode(true) as HTMLElement;
      head.appendChild(cloned);
    });
  }, [iframeDocument]);

  const content = useMemo(() => {
    if (!mountNode) {
      return null;
    }

    return createPortal(<IsolatedThemePreview theme={theme} className={className} />, mountNode);
  }, [className, mountNode, theme]);

  return (
    <div
      className="theme-preview-iframe-wrapper relative h-full w-full"
      style={{ backgroundColor: "#fff" }}
    >
      <iframe
        ref={iframeRef}
        className="h-full w-full border-0"
        sandbox="allow-same-origin allow-scripts"
        srcDoc="<!DOCTYPE html><html><head></head><body></body></html>"
        onLoad={handleLoad}
        aria-label="Theme preview"
      />
      {content}
    </div>
  );
}

function IsolatedThemePreview({ theme, className }: ThemePreviewRendererProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    if (theme) {
      applyThemeIsolated(theme, container);
    } else {
      container.removeAttribute("style");
      const themeClasses = Array.from(container.classList).filter(
        (cls) =>
          cls.startsWith("theme-") && cls !== "theme-preview" && cls !== "theme-card-isolated",
      );
      if (themeClasses.length > 0) {
        container.classList.remove(...themeClasses);
      }
      container.removeAttribute("data-theme-style");
    }
  }, [theme]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "theme-preview relative h-full min-h-full overflow-auto rounded-lg border bg-background text-foreground theme-card-isolated",
        className,
      )}
    >
      <ThemePreviewContent theme={theme} />
    </div>
  );
}
