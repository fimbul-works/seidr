import { isClient, isServer } from "../../util/environment";
import { getCurrentPath } from "../get-current-path";

/**
 * Interface for the navigate function.
 */
export interface Navigation {
  /**
   * Navigate to a path.
   * @param {string} path - Path to navigate to
   * @param {boolean} replace - Whether to replace the current history entry
   * @param {any} data - Data to pass to history
   */
  navigate: (path: string, replace?: boolean, data?: any) => void;
  /**
   * Redirect the user to another path.
   * @param {string} path - Path to redirect to
   */
  redirect: (path: string) => void;
  /**
   * History object.
   */
  history: {
    /**
     * Navigate back in history.
     */
    back: () => void;
    /**
     * Navigate forward in history.
     */
    forward: () => void;
    /**
     * Navigate to a specific history entry.
     * @param {number} delta - The history entry to navigate to
     */
    go: (delta: number) => void;
  };
}

/**
 * Returns the navigate function.
 * @returns {Navigation} navigate function
 */
export const useNavigate = (): Navigation => {
  const currentPath = getCurrentPath();

  /**
   * Navigate to a path.
   * @param {string} path - Path to navigate to
   * @param {boolean} replace - Whether to replace the current history entry
   * @param {any} data - Data to pass to history
   */
  function navigate(path: string, replace = false, data: any = {}): void {
    // Update the reactive path state
    // This will also update ctx.currentPath on the server via the observer in getCurrentPath
    currentPath.value = path;

    if (isServer()) {
      return;
    }

    // Client-side navigation
    // TODO: store window.scrollY to data, restore it when navigating back
    // TODO: allow adding custom scroll positons and other context to store in the navigation data

    if (path !== window.location.pathname + window.location.search + window.location.hash) {
      window.history[replace ? "replaceState" : "pushState"](data, "", path);
    }
  }

  // Listen to window location changes in client mode
  if (isClient()) {
    window.onpopstate = (_event) => {
      // console.log(`location: ${document.location}, state: ${JSON.stringify(event.state)}`);
      // console.log(parseURL(window.location.href));
      currentPath.value = window.location.pathname + window.location.search + window.location.hash;
    };
  }

  const navObj: Navigation = {
    navigate: (path, replace, data) => navigate(path, replace, data),
    redirect: (path: string) => navigate(path, true),
    history: {
      back: () => (isClient() ? window.history.back() : undefined),
      forward: () => (isClient() ? window.history.forward() : undefined),
      go: (delta: number) => (isClient() ? window.history.go(delta) : undefined),
    },
  };

  return navObj;
};
