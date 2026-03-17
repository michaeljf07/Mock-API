import { faker } from "@faker-js/faker";

type PropGenerator = () => unknown;

// Ordered by specificity — first match wins
const NAME_PATTERNS: ReadonlyArray<readonly [RegExp, PropGenerator]> = [
    [/^id$|Id$/, () => faker.string.uuid()],
    [/email/i, () => faker.internet.email()],
    [/username/i, () => faker.internet.username()],
    [/password|secret/i, () => faker.internet.password()],
    [/phone|mobile/i, () => faker.phone.number()],
    [/firstName|first_name/i, () => faker.person.firstName()],
    [/lastName|last_name/i, () => faker.person.lastName()],
    [/fullName|full_name/i, () => faker.person.fullName()],
    [/name/i, () => faker.person.fullName()],
    [/address|street/i, () => faker.location.streetAddress()],
    [/city/i, () => faker.location.city()],
    [/state|province/i, () => faker.location.state()],
    [/zip|postal/i, () => faker.location.zipCode()],
    [/country/i, () => faker.location.country()],
    [/latitude|lat$/i, () => faker.location.latitude()],
    [/longitude|lng$|lon$/i, () => faker.location.longitude()],
    [/createdAt|updatedAt|deletedAt/i, () => faker.date.recent().toISOString()],
    [/date|time/i, () => faker.date.recent().toISOString()],
    [/description|bio|summary|about/i, () => faker.lorem.paragraph()],
    [/title|headline/i, () => faker.lorem.words(4)],
    [/slug/i, () => faker.helpers.slugify(faker.lorem.words(3))],
    [/image|avatar|photo|picture/i, () => faker.image.url()],
    [/url|website|link|href/i, () => faker.internet.url()],
    [/price|cost|amount|fee/i, () => faker.commerce.price()],
    [/color|colour/i, () => faker.color.human()],
    [/company|organization|org/i, () => faker.company.name()],
    [/job|position|role|occupation/i, () => faker.person.jobTitle()],
    [/age/i, () => faker.number.int({ min: 18, max: 80 })],
    [
        /rating|score/i,
        () => faker.number.float({ min: 0, max: 5, fractionDigits: 1 }),
    ],
    [/count|total|quantity|qty/i, () => faker.number.int({ min: 0, max: 100 })],
    [/content|body|text/i, () => faker.lorem.paragraphs(2)],
    [/token|key|hash/i, () => faker.string.alphanumeric(32)],
    [/tag|label|category/i, () => faker.commerce.department()],
    [
        /isActive|isEnabled|isVerified|active|enabled|verified/i,
        () => faker.datatype.boolean(),
    ],
] as const;

// Record of type generic type fallbacks in case no pattern matches
const TYPE_FALLBACKS: Readonly<Record<string, PropGenerator>> = {
    string: () => faker.lorem.word(),
    number: () => faker.number.int({ max: 1000 }),
    boolean: () => faker.datatype.boolean(),
    Date: () => faker.date.recent().toISOString(),
    any: () => faker.lorem.word(),
    unknown: () => faker.lorem.word(),
};

// generateProp(propName, propType) generates a mock property with the given name and type
// returns: mock property
// example: "name" -> "John Doe"
//          "email" -> "john.doe@example.com"
//          "password" -> "password123"
//          "phone" -> "1234567890"
//          "createdAt" -> "2021-01-01T00:00:00.000Z"
export function generateProp(propName: string, propType: string): unknown {
    for (const [pattern, generator] of NAME_PATTERNS) {
        if (pattern.test(propName)) {
            return generator();
        }
    }

    const fallback = TYPE_FALLBACKS[propType];
    if (fallback !== undefined) {
        return fallback();
    }

    return faker.lorem.word();
}
