import { createValue, inClient, inServer, isClient, isServer, SEIDR_BASE_URL } from "@fimbul-works/seidr";
import { $a, $button, $div, $h1, $p, $span } from "@fimbul-works/seidr/html";
import { getClientLocalStorageItem } from "./client-only-storage.js";
import { loadServerDatabaseData, SERVER_SECRET_DATABASE_KEY } from "./server-only-secret.js";

/**
 * Isomorphic Seidr component demonstrating cross-bundler AST branch pruning.
 */
export function createIsomorphicApp(initialCount = 0) {
  const count = createValue(initialCount, { id: "app-count" });
  const envName = createValue("unknown", { id: "app-env" });
  const data = createValue("initial", { id: "app-data" });

  // Compile-time environment detection
  if (isServer()) {
    envName("SSR_SERVER");
  } else if (isClient()) {
    envName("CLIENT_BROWSER");
  }

  // Server execution block
  inServer(() => {
    const secret = SERVER_SECRET_DATABASE_KEY;
    const dbData = loadServerDatabaseData();
    data(`${secret}:${dbData}`);
  });

  // Client execution block
  inClient(() => {
    const cached = getClientLocalStorageItem("my-cache-key") || "no-client-cache";
    data(`client-cached:${cached}`);
  });

  return $div({ className: "isomorphic-app", id: "root-app" }, [
    $h1({ textContent: "Seidr Cross-Bundler Isomorphic App" }),
    $p({}, [
      $span({ textContent: "Running Environment: " }),
      $a({ href: SEIDR_BASE_URL, id: "env-indicator", textContent: envName.as((val: string) => val) }),
    ]),
    $p({}, [
      $span({ textContent: "Data Payload: " }),
      $span({ id: "data-indicator", textContent: data.as((val: string) => val) }),
    ]),
    $div({ className: "counter-box" }, [
      $span({ id: "counter-value", textContent: count.as((c: number) => `Count: ${c}`) }),
      $button({
        id: "btn-increment",
        textContent: "+ Increment",
        onclick: () => count(count() + 1),
      }),
    ]),
  ]);
}
