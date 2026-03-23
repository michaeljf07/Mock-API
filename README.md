# Mock API

Generate a mock REST API server from TypeScript interfaces and object type aliases. Perfect for frontend development, testing, and prototyping—define your data shapes in TypeScript and get a fully functional API with realistic fake data powered by [Faker](https://fakerjs.dev/).

## Features

- **TypeScript-first**: Define schemas as interfaces or object type aliases
- **Smart mock data**: Property names are matched to appropriate Faker generators (e.g. `email` → realistic emails, `price` → commerce prices)
- **Full REST API**: GET, POST, PUT, PATCH, DELETE with pagination support
- **Nested types**: References to other interfaces/types are resolved recursively
- **Multiple schemas**: Point to one or more schema files to build a complete API

## Installation

```bash
pnpm add mock-api
# or
npm install mock-api
```

## Quick Start

1. Create a schema file (e.g. `schema.ts`):

```typescript
interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    isActive: boolean;
}

type Product = {
    id: string;
    name: string;
    price: number;
    inStock: boolean;
};
```

2. Start the mock API:

```bash
npx mock-api schema.ts
```

3. Visit `http://localhost:3000` to see all available routes and collections.

## CLI Usage

```bash
mock-api <schemas...> [options]
```

### Arguments

| Argument   | Description                          |
| ---------- | ------------------------------------ |
| `<schemas...>` | One or more TypeScript schema file paths (required) |

### Options

| Option | Short | Default | Description                          |
| ------ | ----- | ------- | ------------------------------------ |
| `--port` | `-p` | `3000` | Port to run the server on            |
| `--count` | `-c` | `10` | Number of mock items to generate per collection |

### Examples

```bash
# Basic usage
mock-api src/schema.ts

# Custom port and item count
mock-api schemas/*.ts -p 8080 -c 25

# Multiple schema files
mock-api src/models/user.ts src/models/product.ts
```

## Schema Definition

### Interfaces

```typescript
interface User {
    id: string;
    name: string;
    email: string;
}
```

### Object Type Aliases

```typescript
type Product = {
    id: string;
    name: string;
    price: number;
};
```

Both interfaces and object type aliases (`type X = { ... }`) are supported. Only object-shaped types are used—primitives and union aliases (e.g. `type ID = string`) are ignored.

### Supported Types

- **Primitives**: `string`, `number`, `boolean`
- **Arrays**: `T[]` or `Array<T>`
- **Unions**: `'a' | 'b'` (picks a random option)
- **Nested types**: References to other interfaces or type aliases in the same project
- **Optional**: `| undefined` and `| null` are stripped when generating mocks

## API Endpoints

Each schema becomes a collection with the following REST endpoints:

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/` | List all collections and their endpoints |
| GET | `/:collection` | List items (supports `?page` and `?limit` for pagination) |
| GET | `/:collection/:id` | Get a single item by ID |
| POST | `/:collection` | Create a new item |
| PUT | `/:collection/:id` | Replace an item |
| PATCH | `/:collection/:id` | Partially update an item |
| DELETE | `/:collection/:id` | Delete an item |

### Route Naming

Interface/type names are converted to kebab-case and pluralized:

- `User` → `/users`
- `Product` → `/products`
- `OrderItem` → `/order-items`

### Response Format

**List (GET `/:collection`):**

```json
{
  "data": [...],
  "total": 10,
  "page": 1,
  "limit": 10
}
```

**Single item (GET `/:collection/:id`):**

```json
{
  "id": "uuid-here",
  "name": "John Doe",
  "email": "john@example.com"
}
```

## Smart Property Generation

Property names are matched to Faker generators for realistic data:

| Pattern | Example |
| ------- | ------- |
| `id`, `*Id` | UUID |
| `email` | `user@example.com` |
| `name`, `firstName`, `lastName` | Person names |
| `phone`, `mobile` | Phone numbers |
| `password`, `secret` | Passwords |
| `address`, `city`, `state`, `zip`, `country` | Location data |
| `price`, `cost`, `amount` | Commerce prices |
| `createdAt`, `updatedAt`, `date` | ISO date strings |
| `description`, `content`, `body` | Lorem paragraphs |
| `url`, `image`, `avatar` | URLs |
| `isActive`, `isEnabled`, `verified` | Booleans |
| ...and more | See `propGenerator.ts` for full list |

Unmatched properties fall back to type-based generation (`string` → word, `number` → integer, etc.).

## Programmatic Usage

Use the library in your own Node.js application:

```typescript
import { createServer, startServer } from "mock-api";
import type { MockApiOptions } from "mock-api";

const options: MockApiOptions = {
    schemaPaths: ["src/schema.ts"],
    port: 3000,
    count: 10,
};

// Start a server (blocks)
startServer(options);

// Or create an Express app for custom use (e.g. testing)
const app = createServer(options);
// app is a standard Express application
```

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm run build

# Run with tsx (no build step)
pnpm run dev src/schema.ts

# Type check
pnpm run typecheck
```

## License

ISC
