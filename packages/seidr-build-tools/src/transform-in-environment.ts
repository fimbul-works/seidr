import type MagicString from "magic-string";
import { type CallExpression, type Node, parseSync } from "oxc-parser";
import { isObj } from "./util.js";

/**
 * Depth-first generator over all CallExpression nodes in an AST.
 *
 * @param {Node} node - Node to process
 * @return {Generator<CallExpression>} Generator that yields CallExpression nodes from the AST
 */
function* walkCallExpressions(node: Node, parent?: Node): Generator<{ call: CallExpression; parent?: Node }> {
  // Skip non-objects
  if (!isObj(node)) {
    return;
  }

  // Skip import specifiers
  if (node.type === "ImportSpecifier") {
    return;
  }

  // Yield CallExpression
  if (node.type === "CallExpression") {
    yield { call: node, parent };
  }

  // Walk AST recursively
  for (const key of Object.keys(node)) {
    const child = node[key as keyof typeof node];
    if (Array.isArray(child)) {
      for (const item of child) {
        if (item && isObj(item) && "type" in item) {
          yield* walkCallExpressions(item, node);
        }
      }
    } else if (child && isObj(child) && "type" in child) {
      yield* walkCallExpressions(child, node);
    }
  }
}

/**
 * Strips `inClient`/`inServer` calls that belong to the wrong environment.
 *
 * @param {MagicString} ms - MagicString instance to manipulate
 * @param {string} id - Source identifier
 * @param {boolean} isClient - Target environment is client-side
 */
export function transformInEnvironment(ms: MagicString, id: string, isClient: boolean): void {
  const { program, errors } = parseSync(id, ms.toString());

  // Let parse failures surface naturally through normal bundler error handling
  if (errors.length > 0) {
    return;
  }

  // Track overwritten ranges to guard against nested inClient(inServer(...)) cases.
  // Outer calls are yielded first, so we skip any node whose range is already covered.
  const overwritten: Array<[number, number]> = [];

  for (const node of program.body) {
    for (const match of walkCallExpressions(node)) {
      const { call, parent } = match;
      const code = ms.toString();

      // Only process CallExpressions where called function has a name
      if (call.callee.type !== "Identifier") {
        continue;
      }

      // Only process `inClient` and `inServer` calls
      const name = call.callee.name;
      if (name !== "inClient" && name !== "inServer") {
        continue;
      }

      // Skip over already overwritten calls
      const start = call.start;
      const end = call.end;
      if (overwritten.some(([s, e]) => start >= s && end <= e)) {
        continue;
      }

      // Keep current environment calls
      const keepCall = (name === "inClient") === isClient;
      if (keepCall) {
        continue;
      }

      if (parent?.type === "AssignmentExpression" && parent.right === call) {
        // Find the ExpressionStatement wrapping the assignment and remove the whole line
        const stmtEnd = code[parent.end] === ";" ? parent.end + 1 : parent.end;
        const stmtEnd2 = code[stmtEnd] === "\n" ? stmtEnd + 1 : stmtEnd;
        ms.remove(parent.start, stmtEnd2);
      } else {
        // Remove callback
        ms.overwrite(start, end, "(void 0)");
        overwritten.push([start, end]);
      }
    }
  }
}
