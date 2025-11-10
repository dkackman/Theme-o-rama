import { Loader2, Maximize2, Minimize2, PanelBottomClose, PanelBottomOpen } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSimpleTheme, type Theme } from "theme-o-rama";
import { ThemePreviewRenderer } from "./ThemePreviewRenderer";
import { Button } from "./ui/button";

export interface ThemePreviewProps {
  themeJson: string;
  validateTheme: (json: string) => string | null;
  onValidationChange?: (error: string | null) => void;
  debounceMs?: number;
  insetScale?: number;
}

export function ThemePreview({
  themeJson,
  validateTheme,
  onValidationChange,
  debounceMs = 500,
  insetScale = 0.33,
}: ThemePreviewProps) {
  const { initializeTheme } = useSimpleTheme();
  const PREVIEW_HIDDEN_STORAGE_KEY = "theme-preview-hidden";
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const validationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);
  const hasRunInitialRef = useRef(false);
  const hasLoadedHiddenStateRef = useRef(false);
  const latestValidateRef = useRef(validateTheme);
  const latestInitializeRef = useRef(initializeTheme);

  useEffect(() => {
    latestValidateRef.current = validateTheme;
  }, [validateTheme]);

  useEffect(() => {
    latestInitializeRef.current = initializeTheme;
  }, [initializeTheme]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      const stored = window.localStorage.getItem(PREVIEW_HIDDEN_STORAGE_KEY);
      if (stored === "true") {
        setIsHidden(true);
      }
    } catch (error) {
      console.warn("Failed to read preview hidden state:", error);
    } finally {
      hasLoadedHiddenStateRef.current = true;
    }
  }, [PREVIEW_HIDDEN_STORAGE_KEY]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (!hasLoadedHiddenStateRef.current) {
      return;
    }
    try {
      window.localStorage.setItem(PREVIEW_HIDDEN_STORAGE_KEY, isHidden ? "true" : "false");
    } catch (error) {
      console.warn("Failed to persist preview hidden state:", error);
    }
  }, [PREVIEW_HIDDEN_STORAGE_KEY, isHidden]);

  const updateValidationError = useCallback(
    (error: string | null) => {
      setValidationError(error);
      onValidationChange?.(error);
    },
    [onValidationChange],
  );

  const runValidationAndPreparePreview = useCallback(
    async (json: string, requestId: number) => {
      const error = latestValidateRef.current(json);
      updateValidationError(error);

      if (error) {
        if (requestIdRef.current === requestId) {
          setPreviewTheme(null);
          setPreviewError(null);
          setIsPreviewLoading(false);
        }
        return;
      }

      let parsedTheme: Theme;
      try {
        parsedTheme = JSON.parse(json) as Theme;
      } catch (parseError) {
        const message = parseError instanceof Error ? parseError.message : "Invalid theme JSON";
        updateValidationError(message);
        if (requestIdRef.current === requestId) {
          setPreviewTheme(null);
          setPreviewError(null);
          setIsPreviewLoading(false);
        }
        return;
      }

      if (requestIdRef.current !== requestId) {
        return;
      }

      setPreviewError(null);
      setIsPreviewLoading(true);

      try {
        const initializedTheme = await latestInitializeRef.current(parsedTheme);
        if (requestIdRef.current === requestId) {
          setPreviewTheme(initializedTheme);
          setPreviewError(null);
        }
      } catch (initializationError) {
        const message =
          initializationError instanceof Error
            ? initializationError.message
            : "Failed to prepare theme preview";
        if (requestIdRef.current === requestId) {
          setPreviewTheme(null);
          setPreviewError(message);
        }
      } finally {
        if (requestIdRef.current === requestId) {
          setIsPreviewLoading(false);
        }
      }
    },
    [updateValidationError],
  );

  const scheduleValidationAndPreview = useCallback(
    (json: string, immediate: boolean) => {
      const execute = () => {
        const nextId = requestIdRef.current + 1;
        requestIdRef.current = nextId;
        void runValidationAndPreparePreview(json, nextId);
      };

      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
        validationTimeoutRef.current = null;
      }

      if (immediate || debounceMs === 0) {
        execute();
      } else {
        validationTimeoutRef.current = setTimeout(execute, debounceMs);
      }
    },
    [debounceMs, runValidationAndPreparePreview],
  );

  useEffect(() => {
    const immediate = !hasRunInitialRef.current;
    hasRunInitialRef.current = true;
    scheduleValidationAndPreview(themeJson, immediate);
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
        validationTimeoutRef.current = null;
      }
    };
  }, [scheduleValidationAndPreview, themeJson]);

  const renderPreview = useCallback(
    (scale: number) => {
      if (validationError) {
        return (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
            Fix the theme JSON to see the live preview.
          </div>
        );
      }

      if (previewError) {
        return (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-destructive">
            {previewError}
          </div>
        );
      }

      if (isPreviewLoading) {
        return (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        );
      }

      if (!previewTheme) {
        return (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
            Preview will appear once the theme is ready.
          </div>
        );
      }

      const scaledStyle =
        scale !== 1
          ? {
              transform: `scale(${scale})`,
              transformOrigin: "top left" as const,
              width: `${100 / scale}%`,
              height: `${100 / scale}%`,
            }
          : undefined;

      return (
        <div className="h-full overflow-hidden">
          <div className="h-full w-full origin-top-left" style={scaledStyle}>
            <ThemePreviewRenderer theme={previewTheme} className="rounded-none border-0 h-full" />
          </div>
        </div>
      );
    },
    [isPreviewLoading, previewError, previewTheme, validationError],
  );

  const insetContent = useMemo(() => renderPreview(insetScale), [insetScale, renderPreview]);

  const dialogContent = useMemo(() => renderPreview(1), [renderPreview]);

  let content = null;

  if (isFullscreen) {
    content = (
      <div className="fixed inset-x-0 top-16 bottom-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-lg font-semibold">Preview</h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsFullscreen(false)}
              title="Close preview"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-hidden px-6 pb-6">
            <div className="h-full overflow-hidden rounded-xl border bg-popover">
              {dialogContent}
            </div>
          </div>
        </div>
      </div>
    );
  } else if (isHidden) {
    content = (
      <div className="pointer-events-auto fixed bottom-6 right-6 z-60 flex items-center gap-3 rounded-full border bg-popover/95 px-4 py-2 shadow-lg">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Preview
        </span>
        {isPreviewLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-3"
          onClick={() => setIsHidden(false)}
          title="Restore preview"
        >
          <PanelBottomOpen className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    );
  } else {
    content = (
      <div className="pointer-events-auto fixed bottom-6 right-6 z-60 w-[22rem] max-w-[90vw] overflow-hidden rounded-xl border bg-popover shadow-2xl">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Live Preview
          </span>
          <div className="flex items-center gap-2">
            {isPreviewLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4"
              onClick={() => {
                setIsHidden(false);
                setIsFullscreen(true);
              }}
              title="Open full preview"
            >
              <Maximize2 className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4"
              onClick={() => {
                setIsFullscreen(false);
                setIsHidden(true);
              }}
              title="Hide preview"
            >
              <PanelBottomClose className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
        <div className="h-[18rem] bg-background">{insetContent}</div>
      </div>
    );
  }

  return <>{content}</>;
}
