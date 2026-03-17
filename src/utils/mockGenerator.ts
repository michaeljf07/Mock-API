import type { InterfaceDeclaration, Project } from "ts-morph";
import { generateProp } from "./propGenerator.js";

const MAX_DEPTH = 5;

// findInterface(typeName, project) finds the interface with the given name in the project
// returns: the interface if it exists, undefined otherwise
function findInterface(
    typeName: string,
    project: Project
): InterfaceDeclaration | undefined {
    return project
        .getSourceFiles()
        .flatMap((sf) => sf.getInterfaces())
        .find((i) => i.getName() === typeName);
}

// resolveTypeText(propName, typeText, project, depth) resolves the type text for the given property name, type text, project, and depth
//   returns: the resolved type text
function resolveTypeText(
    propName: string,
    typeText: string,
    project: Project,
    depth: number
): unknown {
    if (depth > MAX_DEPTH) return null;

    // Strip optional modifiers (| undefined, | null)
    const cleaned = typeText
        .replace(/\s*\|\s*undefined/g, "")
        .replace(/\s*\|\s*null/g, "")
        .trim();

    // Array type: T[]
    if (cleaned.endsWith("[]")) {
        const inner = cleaned.slice(0, -2);
        return Array.from({ length: 3 }, () =>
            resolveTypeText(propName, inner, project, depth + 1)
        );
    }

    // Generic array: Array<T>
    const arrayMatch = cleaned.match(/^Array<(.+)>$/);
    const arrayInner = arrayMatch?.[1];
    if (arrayInner !== undefined) {
        return Array.from({ length: 3 }, () =>
            resolveTypeText(propName, arrayInner, project, depth + 1)
        );
    }

    // String literal: 'value' or "value"
    if (/^'[^']*'$/.test(cleaned) || /^"[^"]*"$/.test(cleaned)) {
        return cleaned.slice(1, -1);
    }

    // Union type: pick a random option
    if (cleaned.includes(" | ")) {
        const options = cleaned.split(" | ").map((t) => t.trim());
        const picked =
            options[Math.floor(Math.random() * options.length)] ?? "string";
        return resolveTypeText(propName, picked, project, depth + 1);
    }

    // Nested interface
    const nested = findInterface(cleaned, project);
    if (nested !== undefined) {
        return generateMockObject(nested, project, depth + 1);
    }

    return generateProp(propName, cleaned);
}

// generateMockObject(schema, project, depth) generates a mock object with the given schema, project, and depth
//   returns: a mock object
export function generateMockObject(
    schema: InterfaceDeclaration,
    project: Project,
    depth: number = 0
): Record<string, unknown> {
    const obj: Record<string, unknown> = {};

    for (const prop of schema.getProperties()) {
        const propName = prop.getName();
        // Prefer the type node text (as written) for clean type names
        const typeText =
            prop.getTypeNode()?.getText() ?? prop.getType().getText();
        obj[propName] = resolveTypeText(propName, typeText, project, depth);
    }

    return obj;
}

// generateMockCollection(schema, project, count) generates a mock collection with the given schema, project, and count
//   returns: an array of mock objects
export function generateMockCollection(
    schema: InterfaceDeclaration,
    project: Project,
    count: number
): Record<string, unknown>[] {
    return Array.from({ length: count }, () =>
        generateMockObject(schema, project)
    );
}
