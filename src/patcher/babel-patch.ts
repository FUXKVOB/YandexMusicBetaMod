import * as parser from "@babel/parser";
import traverse, { type NodePath } from "@babel/traverse";
import generate from "@babel/generator";
import * as t from "@babel/types";

export interface AstPatch {
  name: string;
  find: (ast: t.File) => boolean;
  apply: (code: string) => string;
}

export class AstPatcher {
  private patches: AstPatch[] = [];

  register(patch: AstPatch): void {
    this.patches.push(patch);
  }

  applyAll(code: string): { result: string; applied: string[]; missing: string[] } {
    let result = code;
    const applied: string[] = [];
    const missing: string[] = [];

    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["decorators-legacy"],
    });

    for (const patch of this.patches) {
      try {
        if (patch.find(ast)) {
          result = patch.apply(result);
          applied.push(patch.name);
        } else {
          missing.push(patch.name);
        }
      } catch (error) {
        console.warn(`[AstPatcher] Patch "${patch.name}" failed:`, error);
        result = patch.apply(result);
        applied.push(patch.name);
      }
    }

    return { result, applied, missing };
  }

  applyAllWithContext(indexJsContents: string): string {
    const patches = this.patches;
    let result = indexJsContents;

    const ast = parser.parse(indexJsContents, {
      sourceType: "script",
      plugins: [],
    });

    const applied: string[] = [];
    const missing: string[] = [];

    for (const patch of patches) {
      try {
        if (patch.find(ast)) {
          result = patch.apply(result);
          applied.push(patch.name);
        } else {
          missing.push(patch.name);
        }
      } catch (error) {
        console.warn(`[AstPatcher] Patch "${patch.name}" failed, falling back:`, error);
        result = patch.apply(result);
        applied.push(patch.name);
      }
    }

    return result;
  }
}

export function findPropertyAssignment(
  ast: t.File,
  objectName: string,
  propertyName: string,
): { node: t.ObjectProperty | t.ObjectMember; path: NodePath } | null {
  let found: { node: t.ObjectProperty | t.ObjectMember; path: NodePath } | null = null;

  traverse(ast, {
    ObjectExpression(path) {
      for (const prop of path.node.properties) {
        if (
          (t.isObjectProperty(prop) || t.isObjectMethod(prop)) &&
          t.isIdentifier(prop.key) &&
          prop.key.name === propertyName
        ) {
          found = { node: prop, path };
        }
      }
    },
  });

  return found;
}
