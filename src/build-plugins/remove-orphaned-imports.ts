import type MagicString from "magic-string";
import {
  type BindingIdentifier,
  type IdentifierName,
  type IdentifierReference,
  type LabelIdentifier,
  type Node,
  parseSync,
  type TSIndexSignatureName,
  type TSThisParameter,
} from "oxc-parser";

type IdentifierNode =
  | IdentifierName
  | IdentifierReference
  | BindingIdentifier
  | LabelIdentifier
  | TSThisParameter
  | TSIndexSignatureName;

type ImportInfo = {
  declarationStart: number;
  declarationEnd: number;
  specifiers: Array<{ name: string; start: number; end: number }>;
};

/**
 * Depth-first generator over all Identifier-type nodes in an AST.
 *
 * @param {Node} node - Node to process
 * @return {Generator<IdentifierNode>} Generator that yields Identifier nodes from the AST
 */
function* walkIdentifiers(node: Node): Generator<IdentifierNode> {
  // Skip import declarations
  if (node.type === "ImportDeclaration") {
    return;
  }

  // Yield Identifier nodes
  if (node.type === "Identifier") {
    yield node;
  }

  // Walk AST recursively
  for (const key of Object.keys(node)) {
    const child = node[key as keyof typeof node];
    if (Array.isArray(child)) {
      for (const item of child) {
        if (item && typeof item === "object" && "type" in item) {
          yield* walkIdentifiers(item);
        }
      }
    } else if (child && typeof child === "object" && "type" in child) {
      yield* walkIdentifiers(child);
    }
  }
}

/**
 * Remove specifier with optional trailing comma
 *
 * @param {MagicString} ms - Node to process
 * @param {string} code - Code to use as reference to determine whitespace and trailing comma
 * @param {{ start: number; end: number }} specifier - Range in code for the specifier to remove
 * @param {Array<{ start: number; end: number }>} allSpecifiers - All specifiers in the import group
 */
function removeSpecifierWithComma(
  ms: MagicString,
  code: string,
  specifier: { start: number; end: number },
  allSpecifiers: Array<{ start: number; end: number }>,
): void {
  const idx = allSpecifiers.indexOf(specifier);
  const isLast = idx === allSpecifiers.length - 1;

  if (!isLast) {
    // Eat the trailing comma and any whitespace up to the next specifier
    let end = specifier.end;
    while (code[end] === "," || code[end] === " ") {
      end++;
    }
    ms.remove(specifier.start, end);
  } else {
    // Last specifier — eat the preceding comma and whitespace
    let start = specifier.start;
    while (code[start - 1] === " ") {
      start--;
    }
    if (code[start - 1] === ",") {
      start--;
    }
    ms.remove(start, specifier.end);
  }
}

/**
 * Removes orphaned imported symbols and resulting empty import statements.
 *
 * @param {MagicString} ms - MagicString instance to manipulate
 * @param {string} id - Source identifier
 */
export function removeOrphanedImports(ms: MagicString, id: string): void {
  const code = ms.toString();
  const { program, errors } = parseSync(id, code);

  // Let parse failures surface naturally through normal bundler error handling
  if (errors.length > 0) {
    return;
  }

  // Collect all import specifier local names, grouped by their declaration
  const imports: ImportInfo[] = [];

  // First pass: process import declarations
  for (const node of program.body) {
    // Skip non-import declaration Nodes
    if (node.type !== "ImportDeclaration") {
      continue;
    }

    // Find specifiers
    const specifiers = node.specifiers
      .filter(
        (s) =>
          s.type === "ImportSpecifier" || s.type === "ImportDefaultSpecifier" || s.type === "ImportNamespaceSpecifier",
      )
      .map((s) => ({
        // `local` is the local binding name in all three specifier types
        name: s.local.name,
        start: s.start,
        end: s.end,
      }));

    // Track imports
    if (specifiers.length > 0) {
      imports.push({
        declarationStart: node.start,
        declarationEnd: node.end,
        specifiers,
      });
    }
  }

  // Exit early when no imports
  if (imports.length === 0) {
    return;
  }

  // Build a set of all imported names so we can exclude import positions from the usage scan
  const importedNames = new Set(imports.flatMap((i) => i.specifiers.map((s) => s.name)));

  // Collect all Identifier usages that are NOT inside an ImportDeclaration
  const usedNames = new Set<string>();

  // 2nd pass: find all used identifiers
  for (const node of program.body) {
    // Skip import declarations
    if (node.type === "ImportDeclaration") {
      continue;
    }

    // Walk AST recursively
    for (const ident of walkIdentifiers(node)) {
      if (importedNames.has(ident.name)) {
        usedNames.add(ident.name);
      }
    }
  }

  // Remove orphaned specifiers and empty declarations
  for (const decl of imports) {
    const orphaned = decl.specifiers.filter((s) => !usedNames.has(s.name));

    // Skip if no orphaned identifiers
    if (orphaned.length === 0) {
      continue;
    }

    if (orphaned.length === decl.specifiers.length) {
      // Entire declaration is orphaned — remove the whole line including trailing newline
      const end = code[decl.declarationEnd] === "\n" ? decl.declarationEnd + 1 : decl.declarationEnd;
      ms.remove(decl.declarationStart, end);
    } else {
      // Partial — remove individual specifiers
      // This needs care around commas — see note below
      for (const s of orphaned) {
        removeSpecifierWithComma(ms, code, s, decl.specifiers);
      }
    }
  }
}
