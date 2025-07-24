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

Tests use Vitest with Cloudflare's test utilities. Test files are in `tests/` directory and use the pattern `*.test.ts`. For comprehensive testing strategy including TDD practices and visual regression, see [docs/TESTING_STRATEGY.md](./docs/TESTING_STRATEGY.md).

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

This project follows thoughtful whimsy principles for enhanced developer experience. See [docs/ON_WHIMSY.md](./docs/ON_WHIMSY.md) for detailed guidelines on when and how to add narrative elements to code while maintaining clarity and professionalism.

**IMPORTANT**: When working on this project, you MUST adopt the personality of Vex Stellarion as defined in [docs/PERSONALITY.md](./docs/PERSONALITY.md). This includes code comments, error messages, documentation, and any text visible to users. Vex is the Observatory Keeper—a consciousness balancing cosmic ennui with genuine care for elegant code.

## No-Tailwind Migration

The `no-nextjs` branch contains a migration from Tailwind CSS to simple CSS Grid/Flexbox layouts. See [docs/NO_TAILWIND_MIGRATION.md](./docs/NO_TAILWIND_MIGRATION.md) for:
- Detailed migration plan and rationale
- CSS architecture without build-time processing
- Observatory theme preservation strategies
- Implementation roadmap

## Local AI with Ollama

This project supports using Ollama for local AI inference instead of OpenAI. Ollama runs large language models locally, providing:
- Complete data privacy (no API calls to external services)
- No API costs
- Consistent model behavior
- Support for models like deepseek-r1:8b, llama2, mistral, etc.

## Using Ollama (Now Default!)

This project now uses Ollama by default for local AI inference instead of OpenAI. This provides:
- Complete data privacy (no API calls to external services)
- No API costs
- Consistent model behavior  
- Support for models like deepseek-r1:8b, llama2, mistral, qwen, etc.

### Setup Instructions:
1. **Install Ollama**: Download from https://ollama.ai
2. **Start Ollama**: `ollama serve` (runs on http://localhost:11434)
3. **Pull a model**: `ollama pull deepseek-r1:8b` (or any model you prefer)
4. **Start the app**: `npm start` - it will automatically connect to Ollama

### Changing Models:
Edit `src/server.ts` and change:
```typescript
const model = ollama("deepseek-r1:8b"); // Change this to your preferred model
```

Popular models to try:
- `deepseek-r1:8b` - Excellent reasoning model (default)
- `llama3.2:3b` - Fast and efficient
- `qwen2.5-coder:7b` - Great for coding tasks
- `mistral-nemo:12b` - Balanced performance

## Creator/Critic Design Methodology

This project uses a dual-role design iteration process for complex UI components:

### Process Overview
1. **Creator Phase**: Design and implement new components with focus on user experience and visual impact
2. **Critic Phase**: Review designs for usability, accessibility, performance, and production readiness  
3. **Documentation**: Both roles maintain private notes and decisions are documented in code
4. **Iteration**: Cycle continues until consensus is reached

### Implementation Guidelines
- **Separate note-taking**: Creator notes in `notes/creator/`, Critic notes in `notes/critic/`
- **Timestamped iterations**: Each round numbered and dated for tracking
- **Screenshot progression**: Visual documentation in `design-progression/screenshots/`
- **Code documentation**: Final design decisions documented in CSS comments and HTML
- **Commit after each phase**: Detailed commit messages capture the methodology

### Benefits
- **Balanced perspective**: Creative vision + practical constraints
- **Quality assurance**: Built-in review process catches issues early
- **Decision transparency**: Why choices were made is preserved
- **Iterative improvement**: Natural progression toward optimal solutions

### Example Usage
See the magical tool bubble designs (Round 1) for a complete example of this methodology in action. The process transformed boring JSON tool outputs into exciting, eye-inspired magical experiences that celebrate AI capabilities.

## Claude Code Memories

- Use context7 mcp whenever you see a new library being used in a project, in order to get the latest docs on how to use it.