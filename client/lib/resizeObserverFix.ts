// Work around Chromium bug: https://crbug.com/809574
// Recharts/Radix use ResizeObserver which can trigger noisy console errors.
if (typeof window !== "undefined") {
  const handler = (e: ErrorEvent) => {
    const msg = String(e?.message || "");
    if (
      msg.includes("ResizeObserver loop completed with undelivered notifications.") ||
      msg.includes("ResizeObserver loop limit exceeded")
    ) {
      e.stopImmediatePropagation();
      e.preventDefault();
      return false;
    }
  };
  window.addEventListener("error", handler, true);

  // Silence noisy console messages from third-party libs
  const originalError = console.error.bind(console);
  const originalWarn = console.warn.bind(console);
  const shouldIgnore = (args: unknown[]) =>
    args
      .filter((a): a is string => typeof a === "string")
      .some(
        (s) =>
          s.includes("ResizeObserver loop completed with undelivered notifications") ||
          s.includes("ResizeObserver loop limit exceeded"),
      );
  console.error = (...args: unknown[]) => {
    if (shouldIgnore(args)) return;
    originalError(...args);
  };
  console.warn = (...args: unknown[]) => {
    if (shouldIgnore(args)) return;
    originalWarn(...args);
  };

  // Wrap global ResizeObserver callback in requestAnimationFrame to avoid loop-limit warning
  if ("ResizeObserver" in window) {
    const RO = window.ResizeObserver as unknown as new (
      callback: ResizeObserverCallback,
    ) => ResizeObserver;
    // @ts-ignore - augmenting global constructor
    window.ResizeObserver = class ResizeObserverPatched extends RO {
      constructor(callback: ResizeObserverCallback) {
        super((entries, observer) => {
          // Defer to next frame to break synchronous resize cycles
          requestAnimationFrame(() => callback(entries, observer));
        });
      }
    } as unknown as typeof window.ResizeObserver;
  }
}
