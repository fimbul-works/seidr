import { component } from "../component/component";
import type { SeidrComponent, SeidrComponentFunction } from "../component/types";
import { useScope } from "../component/use-scope";
import { Seidr, unwrapSeidr } from "../seidr";
import { isSeidr } from "../util/type-guards/is-seidr";
import { wrapError } from "../util/wrap-error";
import { Switch } from "./switch";

const PROMISE_PENDING = "pending";
const PROMISE_RESOLVED = "resolved";
const PROMISE_ERROR = "error";

/**
 * Creates a component that handles Promise resolution with loading and error states.
 *
 * @template T - The type of resolved value
 *
 * @param {Promise<T> | Seidr<Promise<T>>} promiseOrSeidr - The promise to wait for, or a Seidr emitting promises
 * @param {SeidrComponentFunction<T>} factory - Function that creates the component when promise resolves
 * @param {SeidrComponentFunction} [loadingFactory] - Optional loading component
 * @param {SeidrComponentFunction<Error>} [errorBoundaryFactory] - Optional error handler component
 * @returns {SeidrComponent} A component handling the promise state
 */
export const Suspense = <T>(
  promiseOrSeidr: Promise<T> | Seidr<Promise<T>>,
  factory: SeidrComponentFunction<T>,
  loadingFactory: SeidrComponentFunction = () => "Loading...",
  errorBoundaryFactory: SeidrComponentFunction<Error> = (err: Error) => `Error: ${err.message}`,
): SeidrComponent =>
  component(() => {
    const scope = useScope();
    const status = new Seidr<typeof PROMISE_PENDING | typeof PROMISE_RESOLVED | typeof PROMISE_ERROR>(PROMISE_PENDING);

    let resolvedValue: T | null = null;
    let errorValue: Error | null = null;
    let currentPromiseId = 0;

    const handlePromise = async (prom: Promise<T>) => {
      if (!prom || scope.isDestroyed) {
        return;
      }

      status.value = PROMISE_PENDING;

      const currentId = ++currentPromiseId;

      try {
        const value = await prom;
        if (currentId === currentPromiseId) {
          resolvedValue = value;
          status.value = PROMISE_RESOLVED;
        }
      } catch (err) {
        if (currentId === currentPromiseId) {
          errorValue = wrapError(err);
          status.value = PROMISE_ERROR;
        }
      }
    };

    // Track initial promise
    const initialProm = unwrapSeidr(promiseOrSeidr);
    if (initialProm) {
      scope.waitFor(handlePromise(initialProm));
    }

    // Handle reactive promise changes
    if (isSeidr<Promise<T>>(promiseOrSeidr)) {
      scope.track(promiseOrSeidr.observe((prom) => scope.waitFor(handlePromise(prom))));
    }

    return Switch(
      status,
      {
        resolved: () => factory(resolvedValue!),
        error: () => errorBoundaryFactory(errorValue!),
        pending: loadingFactory,
      },
      null,
      "Suspense",
    );
  }, "Suspense")();
