# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Cloudflare AI Agent starter kit that provides a foundation for building AI-powered chat agents using Cloudflare's Agent platform. It includes:
- React-based chat interface with dark/light theme support
- AI agent backend using OpenAI's GPT-4
- Tool system with human-in-the-loop confirmation
- Task scheduling (one-time, delayed, and recurring)
- Durable Objects for state management

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm start

# Deploy to Cloudflare
npm run deploy

# Run tests
npm test

# Generate Cloudflare types
npm run types

# Format code
npm run format

# Run linting and type checking
npm run check
```

## Architecture

### Core Components

1. **Server-side Agent (`src/server.ts`)**
   - `Chat` class extends `AIChatAgent` from the agents framework
   - Handles streaming AI responses using OpenAI's GPT-4
   - Manages tool execution and MCP (Model Context Protocol) integration
   - Uses Durable Objects for persistent state

2. **Client Interface (`src/app.tsx`)**
   - React app with real-time chat UI
   - Tool confirmation dialogs for human-in-the-loop
   - Dark/light theme toggle
   - Message streaming with markdown support

3. **Tool System (`src/tools.ts`)**
   - Tools can auto-execute or require user confirmation
   - Example tools: weather info, local time, task scheduling
   - Execution handlers in `executions` object for confirmed tools

### Key Configuration Files

- **`wrangler.jsonc`**: Cloudflare Worker configuration
  - Durable Object bindings for Chat class
  - Compatibility flags for Node.js
  - SQLite migrations for agent storage

- **`vite.config.ts`**: Build configuration
  - Cloudflare plugin for Workers
  - React and Tailwind CSS integration

## Adding New Features

### Creating New Tools

1. Add tool definition in `src/tools.ts`:
   - With `execute` function → auto-executes
   - Without `execute` → requires confirmation

2. For tools requiring confirmation:
   - Add execution handler to `executions` object
   - Update `toolsRequiringConfirmation` in `app.tsx`

### Changing AI Provider

Default uses OpenAI. To switch providers:
1. Install provider SDK (e.g., `workers-ai-provider`, `@anthropic-ai/sdk`)
2. Update imports and model initialization in `src/server.ts`
3. Configure any required bindings in `wrangler.jsonc`

## Environment Setup

Create `.dev.vars` file:
```env
OPENAI_API_KEY=your_openai_api_key
```

## Testing

Tests use Vitest with Cloudflare's test utilities. Test files are in `tests/` directory and use the pattern `*.test.ts`.

## Code Standards

- TypeScript with strict mode enabled
- Prettier for formatting (no semicolons, single quotes)
- Biome for linting (configured in `biome.json`)
- Path aliases: `@/*` maps to `./src/*`