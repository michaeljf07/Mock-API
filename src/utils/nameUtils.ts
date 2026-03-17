const IRREGULAR_PLURALS: Readonly<Record<string, string>> = {
    person: "people",
    man: "men",
    woman: "women",
    child: "children",
    mouse: "mice",
    tooth: "teeth",
    foot: "feet",
    goose: "geese",
};

// pluralize(word) pluralizes the given word
// returns: the pluralized word
// example: "Person" -> "People"
//          "User" -> "Users"
export function pluralize(word: string): string {
    const lower = word.toLowerCase();

    const irregular = IRREGULAR_PLURALS[lower];
    if (irregular !== undefined) {
        return irregular;
    }
    // If the word ends in s, x, z, ch, or sh, add es
    if (/(?:s|x|z|ch|sh)$/i.test(word)) {
        return word + "es";
    }
    // If the word ends in y and is not preceded by a vowel, add ies
    if (/[^aeiou]y$/i.test(word)) {
        return word.slice(0, -1) + "ies";
    }

    return word + "s";
}

// toKebabCase(str) converts the given string to kebab case
// returns: the kebab case string
// example: "User" -> "user"
export function toKebabCase(str: string): string {
    return str
        .replace(/([A-Z])/g, (_, char: string) => `-${char}`)
        .toLowerCase()
        .replace(/^-/, "");
}

// toRoutePath(interfaceName) converts the given interface name to a route path
// returns: route path
// example: "User" -> "/users"
export function toRoutePath(interfaceName: string): string {
    const kebab = toKebabCase(interfaceName);
    const parts = kebab.split("-");
    const lastPart = parts[parts.length - 1];
    if (lastPart !== undefined) {
        parts[parts.length - 1] = pluralize(lastPart);
    }
    return "/" + parts.join("-");
}

// toCollectionKey(interfaceName) converts the given interface name to a collection key
// returns: collection key
// example: "User" -> "users"
export function toCollectionKey(interfaceName: string): string {
    return toRoutePath(interfaceName).slice(1);
}
