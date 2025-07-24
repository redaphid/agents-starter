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

**EXACT METHODOLOGY**: Continue Creator/Critic cycles until both roles agree OR 100 iterations maximum. Iterate even if appearing "done". Continue after compacting events. Commit frequently.

### Detailed Process Flow
1. **Creator Phase** (See `agents/creator/behavior.md` for full role definition)
   - Focus on user experience, visual impact, and bleeding edge CSS techniques
   - Research new CSS features via context7 MCP as needed
   - Design/implement new components or iterations
   - Write private notes to `agents/creator/notes/YYYY-MM-DDTHH-MM-SS_description.md`
   - Update `component-lab.html` with new designs
   - Document design decisions in CSS comments
   - Take screenshots of current state
   - Mark Creator todo as completed

2. **Critic Phase** (See `agents/critic/behavior.md` for full role definition)
   - **RIGOROUS evaluation** for visual issues: bad contrast, overlapping text, weird padding, ugly layouts
   - **Accessibility audit**: WCAG 2.1 AA compliance, keyboard navigation, screen reader compatibility
   - **Performance analysis**: Animation performance, repaints, layout thrashing
   - **Cross-browser compatibility**: Test bleeding edge CSS feature support with fallbacks
   - Write detailed notes to `agents/critic/notes/YYYY-MM-DDTHH-MM-SS_critique-roundN.md`
   - Provide specific, actionable feedback with screenshots
   - Take screenshots of issues found
   - Determine if more iteration needed or ready to ship
   - Mark Critic todo as completed

**CRITICAL**: The Critic MUST catch visual/usability issues like light text on light backgrounds, overlapping elements, poor spacing, insufficient contrast ratios, broken responsive behavior, etc.

3. **Iteration Decision**
   - If Critic approves: Move to final documentation
   - If Critic requests changes: Start new Creator round
   - Continue until consensus OR 100 rounds maximum
   - Each round gets unique number and timestamp

4. **Documentation & Commit**
   - Update code with design decision comments
   - Commit with detailed methodology message
   - Update CLAUDE.md with any process improvements
   - Continue iterating

### Concurrent Research Requirements
- **Modern CSS Theories**: Maintain active document `docs/MODERN_CSS_THEORIES.md` 
- **Bleeding Edge Techniques**: Document patterns for positioning/styling without abstractions
- **DOM Minimalism**: Notice and validate hypotheses about effective minimal DOM usage
- **No Hallucination**: Only document actually observed patterns and validated techniques

### Implementation Guidelines
- **Agent behavior files**: `agents/creator/behavior.md` and `agents/critic/behavior.md` define role requirements
- **Timestamped notes**: Creator notes in `agents/creator/notes/`, Critic notes in `agents/critic/notes/`
- **ISO timestamp format**: `YYYY-MM-DDTHH-MM-SS_description.md` for all notes
- **Screenshot progression**: Visual documentation in `design-progression/screenshots/`
- **Code documentation**: Design decisions in CSS comments and HTML
- **Frequent commits**: After each phase with detailed methodology messages
- **CLAUDE.md updates**: Keep this file current with process refinements

### Termination Conditions
- Both Creator and Critic agree on final design
- OR 100 iteration rounds completed
- OR user explicitly stops the process

### Turn-Taking Method Explained

The Creator/Critic methodology uses **strict role alternation** with distinct behavioral patterns:

1. **Role Switching**: Claude adopts the specific personality and evaluation criteria defined in the agent behavior files
2. **Behavioral Context**: Each role has different priorities, evaluation criteria, and quality standards
3. **Private Notes**: Each agent maintains their own perspective and reasoning in timestamped notes
4. **Quality Gates**: The Critic acts as a quality gate, preventing issues from reaching production

#### Agent Behavior Files:
- **`agents/creator/behavior.md`**: Defines creative focus, experimentation mindset, and design innovation priorities
- **`agents/critic/behavior.md`**: Defines rigorous evaluation standards, accessibility requirements, and production readiness criteria

#### Why This Works:
- **Separation of Concerns**: Creative exploration vs. quality assurance happen in separate phases
- **Balanced Perspective**: Prevents both "creative tunnel vision" and "analysis paralysis"
- **Quality Assurance**: Critic must explicitly approve designs before they can be considered complete
- **Iterative Improvement**: Each cycle refines the design based on specific feedback

### Current Status Tracking
- **Round 1**: Completed (Creator: magical tool bubbles, Critic: 5-star approval BUT missed contrast issues)
- **Round 2**: Ready to start (Creator needs to iterate, Critic needs to be more rigorous)

## Claude Code Memories & Research Requirements

**CRITICAL**: Use context7 MCP for bleeding edge CSS techniques and modern web platform APIs. We are actively researching:

### Required Context7 Lookups:
- **CSS Container Queries** - For component-based responsive design
- **CSS Cascade Layers (@layer)** - For organized specificity without abstractions  
- **OKLCH Color Space** - For perceptually uniform color systems
- **CSS Grid Level 2** - For advanced layout without frameworks
- **CSS Subgrid** - For nested grid alignment patterns
- **Modern Viewport Units** (dvh, svh, lvh) - For reliable full-height layouts
- **color-mix() and Relative Color Syntax** - For dynamic color computations
- **CSS :has() Selector** - For parent-based styling logic
- **CSS Anchor Positioning** - For tooltip and overlay positioning
- **Scroll-driven Animations** - For performance-conscious motion

### Active Research Documents:
- `docs/MODERN_CSS_THEORIES.md` - Bleeding edge CSS patterns and hypotheses
- `agents/creator/notes/` - Creator's design research and implementation notes
- `agents/critic/notes/` - Critic's evaluation findings and accessibility audits
- DOM minimalism research ongoing

### Agent Personalities:
- **Creator**: Enthusiastic about visual design, willing to take creative risks, focused on user delight and bleeding edge CSS techniques
- **Critic**: Detail-oriented quality advocate, ruthlessly honest about usability issues, prioritizes accessibility and production readiness

### General Guidelines:
- Use context7 mcp whenever encountering new libraries, frameworks, or web platform APIs
- Focus on vanilla web platform capabilities over abstractions
- Document all CSS patterns and validate hypotheses with real implementations