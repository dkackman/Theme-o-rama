import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react";
import { SimpleThemeProvider, useSimpleTheme } from "./simple-theme-context";
import { Theme } from "./theme.type";
import * as themeModule from "./theme";

// Mock the applyTheme function
vi.mock("./theme", async () => {
  const actual = await vi.importActual("./theme");
  return {
    ...actual,
    applyTheme: vi.fn(),
  };
});

describe("SimpleThemeProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render children", () => {
    render(
      <SimpleThemeProvider>
        <div data-testid="child">Test Child</div>
      </SimpleThemeProvider>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("should start with loading state and then finish loading", async () => {
    const { result } = renderHook(() => useSimpleTheme(), {
      wrapper: SimpleThemeProvider,
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.currentTheme).toBe(null);

    // Wait for loading to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(null);
  });

  it("should provide setTheme function", async () => {
    const { result } = renderHook(() => useSimpleTheme(), {
      wrapper: SimpleThemeProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const testTheme: Theme = {
      name: "test",
      displayName: "Test Theme",
      schemaVersion: 1,
      colors: {
        background: "hsl(0 0% 100%)",
        foreground: "hsl(0 0% 0%)",
      },
    };

    await act(async () => {
      await result.current.setTheme(testTheme);
    });

    expect(result.current.currentTheme).toEqual(testTheme);
  });

  it("should call applyTheme when setting a theme", async () => {
    const applyThemeSpy = vi.spyOn(themeModule, "applyTheme");

    const { result } = renderHook(() => useSimpleTheme(), {
      wrapper: SimpleThemeProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const testTheme: Theme = {
      name: "test",
      displayName: "Test Theme",
      schemaVersion: 1,
    };

    await act(async () => {
      await result.current.setTheme(testTheme);
    });

    expect(applyThemeSpy).toHaveBeenCalledWith(testTheme, document.documentElement);
  });

  it("should call onThemeChange callback when theme changes", async () => {
    const onThemeChange = vi.fn();

    const { result } = renderHook(() => useSimpleTheme(), {
      wrapper: ({ children }) => (
        <SimpleThemeProvider onThemeChange={onThemeChange}>{children}</SimpleThemeProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const testTheme: Theme = {
      name: "test",
      displayName: "Test Theme",
      schemaVersion: 1,
    };

    await act(async () => {
      await result.current.setTheme(testTheme);
    });

    expect(onThemeChange).toHaveBeenCalledWith(testTheme);
  });

  it("should provide initializeTheme function", async () => {
    const { result } = renderHook(() => useSimpleTheme(), {
      wrapper: SimpleThemeProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.initializeTheme).toBeDefined();
    expect(typeof result.current.initializeTheme).toBe("function");
  });

  it("should handle imageResolver prop", async () => {
    const imageResolver = vi.fn(async (themeName: string, imagePath: string) => {
      return `/resolved/${themeName}/${imagePath}`;
    });

    const { result } = renderHook(() => useSimpleTheme(), {
      wrapper: ({ children }) => (
        <SimpleThemeProvider imageResolver={imageResolver}>{children}</SimpleThemeProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const themeWithImage: Theme = {
      name: "test",
      displayName: "Test Theme",
      schemaVersion: 1,
      backgroundImage: "background.jpg",
    };

    await act(async () => {
      const initializedTheme = await result.current.initializeTheme(themeWithImage);
      expect(initializedTheme).toBeDefined();
    });
  });

  it("should prevent concurrent setTheme calls", async () => {
    const { result } = renderHook(() => useSimpleTheme(), {
      wrapper: SimpleThemeProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const theme1: Theme = {
      name: "theme1",
      displayName: "Theme 1",
      schemaVersion: 1,
    };

    const theme2: Theme = {
      name: "theme2",
      displayName: "Theme 2",
      schemaVersion: 1,
    };

    // Call setTheme twice rapidly
    await act(async () => {
      const promise1 = result.current.setTheme(theme1);
      const promise2 = result.current.setTheme(theme2);
      await Promise.all([promise1, promise2]);
    });

    // Should have set one of them (the concurrent call should be prevented)
    expect(result.current.currentTheme).toBeTruthy();
  });

  it("should handle errors gracefully", async () => {
    const applyThemeSpy = vi.spyOn(themeModule, "applyTheme");
    applyThemeSpy.mockImplementation(() => {
      throw new Error("Test error");
    });

    const { result } = renderHook(() => useSimpleTheme(), {
      wrapper: SimpleThemeProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const testTheme: Theme = {
      name: "test",
      displayName: "Test Theme",
      schemaVersion: 1,
    };

    await act(async () => {
      await result.current.setTheme(testTheme);
    });

    expect(result.current.error).toBe("Failed to set theme");
  });

  it("should clear error when successfully setting theme", async () => {
    const applyThemeSpy = vi.spyOn(themeModule, "applyTheme");

    const { result } = renderHook(() => useSimpleTheme(), {
      wrapper: SimpleThemeProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // First, cause an error
    applyThemeSpy.mockImplementationOnce(() => {
      throw new Error("Test error");
    });

    const theme1: Theme = {
      name: "theme1",
      displayName: "Theme 1",
      schemaVersion: 1,
    };

    await act(async () => {
      await result.current.setTheme(theme1);
    });

    expect(result.current.error).toBe("Failed to set theme");

    // Now set successfully
    applyThemeSpy.mockImplementation(vi.fn());

    const theme2: Theme = {
      name: "theme2",
      displayName: "Theme 2",
      schemaVersion: 1,
    };

    await act(async () => {
      await result.current.setTheme(theme2);
    });

    expect(result.current.error).toBe(null);
  });
});

describe("useSimpleTheme", () => {
  it("should throw error when used outside SimpleThemeProvider", () => {
    expect(() => {
      renderHook(() => useSimpleTheme());
    }).toThrow("useSimpleTheme must be used within a SimpleThemeProvider");
  });
});
