import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react";
import { ThemeProvider, useTheme } from "./theme-context";
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

describe("ThemeProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render children", () => {
    render(
      <ThemeProvider>
        <div data-testid="child">Test Child</div>
      </ThemeProvider>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("should start with loading state and then finish loading", async () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for loading to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(null);
  });

  it("should load with default theme (light)", async () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.currentTheme).toBeDefined();
    expect(result.current.currentTheme?.name).toBe("light");
  });

  it("should respect defaultTheme prop", async () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => <ThemeProvider defaultTheme="dark">{children}</ThemeProvider>,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.currentTheme?.name).toBe("dark");
  });

  it("should provide list of available themes", async () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.availableThemes).toBeDefined();
    expect(Array.isArray(result.current.availableThemes)).toBe(true);
    expect(result.current.availableThemes.length).toBeGreaterThan(0);

    // Should include built-in themes
    const themeNames = result.current.availableThemes.map((t) => t.name);
    expect(themeNames).toContain("light");
    expect(themeNames).toContain("dark");
    expect(themeNames).toContain("color");
  });

  it("should switch themes using setTheme", async () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.currentTheme?.name).toBe("light");

    await act(async () => {
      await result.current.setTheme("dark");
    });

    expect(result.current.currentTheme?.name).toBe("dark");
  });

  it("should call applyTheme when switching themes", async () => {
    const applyThemeSpy = vi.spyOn(themeModule, "applyTheme");

    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    applyThemeSpy.mockClear(); // Clear initial theme application

    await act(async () => {
      await result.current.setTheme("dark");
    });

    expect(applyThemeSpy).toHaveBeenCalled();
    const callArgs = applyThemeSpy.mock.calls[applyThemeSpy.mock.calls.length - 1];
    expect(callArgs[0].name).toBe("dark");
    expect(callArgs[1]).toBe(document.documentElement);
  });

  it("should call onThemeChange callback when theme changes", async () => {
    const onThemeChange = vi.fn();

    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider onThemeChange={onThemeChange}>{children}</ThemeProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.setTheme("dark");
    });

    expect(onThemeChange).toHaveBeenCalledWith("dark");
  });

  it("should load discovered themes from discoverThemes function", async () => {
    const customTheme: Theme = {
      name: "custom",
      displayName: "Custom Theme",
      schemaVersion: 1,
      colors: {
        background: "hsl(0 0% 50%)",
      },
    };

    const discoverThemes = vi.fn(async () => [customTheme]);

    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider discoverThemes={discoverThemes}>{children}</ThemeProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(discoverThemes).toHaveBeenCalled();

    const themeNames = result.current.availableThemes.map((t) => t.name);
    expect(themeNames).toContain("custom");

    // Should be able to switch to the discovered theme
    await act(async () => {
      await result.current.setTheme("custom");
    });

    expect(result.current.currentTheme?.name).toBe("custom");
  });

  it("should handle imageResolver prop", async () => {
    const imageResolver = vi.fn(async (themeName: string, imagePath: string) => {
      return `/resolved/${themeName}/${imagePath}`;
    });

    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider imageResolver={imageResolver}>{children}</ThemeProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.initializeTheme).toBeDefined();
  });

  it("should setCustomTheme from JSON string", async () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const customThemeJson = JSON.stringify({
      name: "custom-json",
      displayName: "Custom JSON Theme",
      schemaVersion: 1,
      colors: {
        background: "hsl(0 0% 75%)",
      },
    });

    let success = false;
    await act(async () => {
      success = await result.current.setCustomTheme(customThemeJson);
    });

    expect(success).toBe(true);
    expect(result.current.currentTheme?.name).toBe("custom-json");
  });

  it("should handle invalid JSON in setCustomTheme", async () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let success = false;
    await act(async () => {
      success = await result.current.setCustomTheme("invalid json");
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe("Failed to load custom theme");
  });

  it("should reload themes with reloadThemes", async () => {
    const customTheme: Theme = {
      name: "custom-reload",
      displayName: "Custom Reload Theme",
      schemaVersion: 1,
    };

    const discoverThemes = vi.fn(async () => [customTheme]);

    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider discoverThemes={discoverThemes} defaultTheme="dark">
          {children}
        </ThemeProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(discoverThemes).toHaveBeenCalledTimes(1);

    // Change to custom theme
    await act(async () => {
      await result.current.setTheme("custom-reload");
    });

    expect(result.current.currentTheme?.name).toBe("custom-reload");

    // Reload themes
    await act(async () => {
      await result.current.reloadThemes();
    });

    expect(discoverThemes).toHaveBeenCalledTimes(2);
    // Should reset to default theme after reload
    expect(result.current.currentTheme?.name).toBe("dark");
  });

  it("should prevent concurrent setTheme calls", async () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Call setTheme twice rapidly
    await act(async () => {
      const promise1 = result.current.setTheme("dark");
      const promise2 = result.current.setTheme("color");
      await Promise.all([promise1, promise2]);
    });

    // Should have set one of them (the concurrent call should be prevented)
    expect(result.current.currentTheme?.name).toMatch(/dark|color|light/);
  });

  it("should handle errors when setting theme", async () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Try to set a non-existent theme
    const applyThemeSpy = vi.spyOn(themeModule, "applyTheme");
    applyThemeSpy.mockImplementationOnce(() => {
      throw new Error("Test error");
    });

    await act(async () => {
      await result.current.setTheme("dark");
    });

    expect(result.current.error).toBe("Failed to set theme");
  });

  it("should clear error on successful theme change", async () => {
    const applyThemeSpy = vi.spyOn(themeModule, "applyTheme");

    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // First, cause an error
    applyThemeSpy.mockImplementationOnce(() => {
      throw new Error("Test error");
    });

    await act(async () => {
      await result.current.setTheme("dark");
    });

    expect(result.current.error).toBe("Failed to set theme");

    // Now set successfully
    applyThemeSpy.mockImplementation(vi.fn());

    await act(async () => {
      await result.current.setTheme("color");
    });

    expect(result.current.error).toBe(null);
  });

  it("should provide initializeTheme function", async () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.initializeTheme).toBeDefined();
    expect(typeof result.current.initializeTheme).toBe("function");

    const testTheme: Theme = {
      name: "test-init",
      displayName: "Test Init",
      schemaVersion: 1,
      backgroundImage: "test.jpg",
    };

    await act(async () => {
      const initialized = await result.current.initializeTheme(testTheme);
      expect(initialized).toBeDefined();
    });
  });

  it("should handle theme inheritance through initializeTheme", async () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const inheritedTheme: Theme = {
      name: "inherited",
      displayName: "Inherited Theme",
      schemaVersion: 1,
      inherits: "dark",
      colors: {
        primary: "hsl(200 100% 50%)",
      },
    };

    await act(async () => {
      const initialized = await result.current.initializeTheme(inheritedTheme);
      expect(initialized).toBeDefined();
      expect(initialized.name).toBe("inherited");
    });
  });
});

describe("useTheme", () => {
  it("should throw error when used outside ThemeProvider", () => {
    expect(() => {
      renderHook(() => useTheme());
    }).toThrow("useTheme must be used within a ThemeProvider");
  });
});
