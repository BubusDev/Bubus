# Client/Server Boundary Rules

## The rule
Client components, meaning any file with `"use client"` at the top and anything it imports at runtime, must not import:

- Prisma client runtime such as `@/lib/db` or `PrismaClient` from `@prisma/client`
- `next/headers` or `next/server`
- NextAuth server helpers such as `auth()` and `getServerSession`
- Any file containing `import "server-only"`
- Any `*-server.ts` module

`actions.ts` files are the single exception. Server Actions are allowed to be imported by client components because Next.js compiles them into RPC endpoints. Do not add `server-only` to Server Action entrypoints that are meant to be called from client components.

## How to share code safely
1. Types only: use `import type { X } from "@prisma/client"`. Type-only imports are erased at build time.
2. Data: fetch in a Server Component or route handler, then pass serializable props into the Client Component.
3. Mutations: use Server Actions in `"use server"` files and call them from forms or action props.
4. Constants, formatters, validators, and shared view types: put them in `*-client.ts` or a truly isomorphic module with no server imports.

## Naming convention
- `src/lib/*-server.ts`: server-only code. Must start with `import "server-only";`
- `src/lib/*-client.ts`: client-safe shared code
- `src/lib/*.ts`: isomorphic code only. Keep this category small.

## Signs you are violating the boundary
- `npm run build` passes but production crashes when the page renders
- Development mode appears fine but the deployed page fails
- Runtime error mentions Prisma in the browser
- A client component starts depending on a module that imports DB, cookies, headers, auth, or secret env vars

## Guardrails in this repo
- `server-only` markers on foundational server modules such as DB, auth, env, cookies, Stripe, and the Prisma-backed products library
- ESLint rule `local/no-server-imports-in-client` to fail lint when a `"use client"` file imports a server-only module
- `products-server.ts` for Prisma-backed product queries and `products-client.ts` or `admin-products-client.ts` for client-safe product shapes
