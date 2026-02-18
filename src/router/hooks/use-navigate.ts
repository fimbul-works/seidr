import { isClient, isServer } from "../../util/environment";
import { getCurrentPath } from "../get-current-path";
import { parseURL } from "./util";

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
  /**
   * Navigate to a path.
   * @param {string} path - Path to navigate to
   * @param {boolean} replace - Whether to replace the current history entry
   * @param {any} data - Data to pass to history
   */
  function navigate(path: string, data: any = {}, replace = true): void {
    getCurrentPath().value = path.split(/[?#]/)[0];

    // Skip actual navigation in server
    if (isServer()) {
      // TODO: should server not redirect, and client-side will update URL to match target location?
      return;
    }

    // TODO: store window.scrollY to data, restore it when navigating back
    // TODO: allow adding custom scroll positons and other context to store in the navigation data

    window.history[replace ? "replaceState" : "pushState"](data, "", getCurrentPath().value);
  }

  // SSR can call navigate, but it will not do anything?
  if (isServer()) {
    return {
      navigate,
      redirect: (path: string) => navigate(path, null, true),
      history: {
        back: () => {},
        forward: () => {},
        go: (_delta: number) => {},
      },
    };
  }

  // Listen to window location changes in client mode
  if (isClient()) {
    window.onpopstate = (event) => {
      console.log(`location: ${document.location}, state: ${JSON.stringify(event.state)}`);
      console.log(parseURL(window.location.href));
    };
  }

  return {
    navigate,
    redirect: (path: string) => navigate(path, null, true),
    history: {
      back: () => window.history.back(),
      forward: () => window.history.forward(),
      go: (delta: number) => window.history.go(delta),
    },
  };
};
