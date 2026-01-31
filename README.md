# OCI Agent Hub Demo

This is an demo application to show how to build a ChatGPT-like Agentic Chatbot with OCI Agent Hub.

## Getting Started

Step 1: Clone this repo to local.

Step 2: Set environment variable in .env.development.local
```bash
mv env.development.local.example .env.development.local
```

Step 3: Run the development server:

```bash
pnpm install
pnpm dev
```

Step 4: Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## What is the stack?
- OCI Agent Hub (for Responses API and Conversations API)
- Next.js (for full-stack application)
- AI SDK (for model integration in Next.js)
- Shadcn (for foundational UI components)
- AI Elements (for AI related UI elements)
- SQLite (for local database)
- Turso (for SQLite in the cloud)


## How was this project scaffolded?

```
pnpm create next-app@latest agenthub-demo --yes
```

## What dependencies were added to this project?

```
pnpm add --save-dev --save-exact prettier
pnpm add --save-dev eslint-config-prettier
pnpm add zod
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add sidebar
pnpm add ai @ai-sdk/react @ai-sdk/openai
npx ai-elements@latest
```
