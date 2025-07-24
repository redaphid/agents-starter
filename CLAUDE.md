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

### Playwright E2E Testing

#### Important Configuration
- **Isolation**: Tests must be isolated to avoid conflicts with other Playwright instances on the system
- **Headless Mode**: Always run in headless mode by default (no headed mode unless debugging)
- **Screenshots & Videos**: 
  - All test artifacts output to `./tmp/screenshots/`
  - Screenshots taken automatically every second during test execution
  - Videos retained on test failures
  - Always capture screenshots on both success and failure
- **Single Worker**: Use `workers: 1` to ensure test isolation
- **Sequential Execution**: `fullyParallel: false` to avoid port conflicts

#### Server Setup
- Development server runs via: `watch 'npm run start | tee ./tmp/client.log'`
- Server auto-restarts if down for ~2 seconds
- Check logs at `./tmp/client.log` for debugging
- Port: 5173 (configured to reuse existing server)

#### Running Tests
```bash
# Run all tests in headless mode
npx playwright test

# Run specific test
npx playwright test tests/e2e/chat.spec.ts:8

# With line reporter (cleaner output)
npx playwright test --reporter=line
```

## Code Standards

- TypeScript with strict mode enabled
- Prettier for formatting (no semicolons, single quotes)
- Biome for linting (configured in `biome.json`)
- Path aliases: `@/*` maps to `./src/*`

## Whimsy Guidelines

This project follows thoughtful whimsy principles for enhanced developer experience. See [ON_WHIMSY.md](./ON_WHIMSY.md) for detailed guidelines on when and how to add narrative elements to code while maintaining clarity and professionalism.