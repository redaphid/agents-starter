# Testing Strategy

## Overview
This document outlines our comprehensive testing approach for the Cloudflare AI Agent starter kit, focusing on visual regression, component testing, and TDD practices.

## Testing Stack

### 1. Playwright (E2E & Visual Regression)
- **Purpose**: End-to-end testing with visual regression capabilities
- **Configuration**: Isolated execution with single worker
- **Screenshot Strategy**: 
  - Automatic captures every second during tests
  - Organized by feature: `./tmp/screenshots/<category>/images/<ISO-timestamp>_<name>.png`
  - Categories: enhanced-ui, visual-regression, chat-interface, iteration-tests, mcp-drawer

### 2. Vitest (Unit & Component Testing)
- **Purpose**: Fast unit tests for utilities and React component testing
- **Integration**: Works with Cloudflare Workers environment
- **Coverage**: Business logic, hooks, utilities

### 3. React Testing Library (Component Testing)
- **Purpose**: Testing React components in isolation
- **Philosophy**: Test user behavior, not implementation details
- **Integration**: Works with Vitest for component testing

## Test Organization

```
tests/
├── e2e/                    # Playwright E2E tests
│   ├── chat.spec.ts       # Core chat functionality
│   ├── mcp-drawer.spec.ts # MCP URL drawer tests
│   └── visual-regression.spec.ts
├── unit/                   # Vitest unit tests
│   ├── utils/             # Utility function tests
│   └── hooks/             # Custom hook tests
└── components/            # Component tests
    ├── UrlList.test.tsx   # URL list component
    └── Drawer.test.tsx    # Drawer component
```

## TDD Workflow

1. **Write Failing Test**: Start with Playwright test for user flow
2. **Implement Minimal Code**: Just enough to pass
3. **Refactor**: Improve code while keeping tests green
4. **Visual Verification**: Capture screenshots at each step

## Visual Regression Testing

### Screenshot Capture Points
1. Initial state
2. User interactions (clicks, typing)
3. State changes (drawer open/close)
4. Error states
5. Loading states
6. Final state

### Naming Convention
`<ISO-timestamp>_<test-name>_<step-description>.png`

Example: `2025-07-24T05:45:00.000Z_mcp-drawer_initial-closed-state.png`

## Component Testing Strategy

### MCP Drawer Components
1. **Drawer Container**
   - Test open/close animations
   - Keyboard accessibility (Escape to close)
   - Click outside to close
   - Proper ARIA attributes

2. **URL List**
   - Add/remove URL functionality
   - URL validation (proper format)
   - Reachability checks (can connect)
   - Persistence across sessions

3. **Header Configuration**
   - Expand/collapse for each URL
   - Add/remove header pairs
   - Header name/value validation
   - Visual indication of expandable state

## Test Data Management

### Mock MCP Server URLs
```javascript
const mockMcpServers = [
  'http://localhost:3000/mcp',
  'https://api.example.com/mcp',
  'wss://websocket.example.com/mcp'
];
```

### Mock Headers
```javascript
const mockHeaders = {
  'Authorization': 'Bearer token123',
  'X-API-Key': 'test-key',
  'Content-Type': 'application/json'
};
```

## Continuous Testing

1. **Pre-commit**: Run unit tests
2. **Pre-push**: Run E2E tests
3. **CI/CD**: Full test suite with visual regression

## Accessibility Testing

- ARIA labels for all interactive elements
- Keyboard navigation testing
- Screen reader compatibility
- Color contrast verification

## Performance Testing

- Initial load time < 3s
- Drawer animation < 300ms
- URL validation response < 1s
- No memory leaks during add/remove cycles

## Error Scenarios

1. Invalid URL formats
2. Unreachable servers
3. Network timeouts
4. Maximum URL limit
5. Duplicate URLs
6. Invalid headers

## Test Utilities

### Custom Test Helpers
```typescript
// test-utils.ts
export async function addMcpUrl(page: Page, url: string) {
  await page.click('[data-testid="add-url-button"]');
  await page.fill('[data-testid="url-input"]', url);
  await page.click('[data-testid="save-url"]');
}

export async function expandHeaders(page: Page, index: number) {
  await page.click(`[data-testid="expand-headers-${index}"]`);
}
```

## Success Metrics

- 100% E2E test coverage for user flows
- 80%+ unit test coverage
- Visual regression catches all UI changes
- Tests run in < 2 minutes
- Zero flaky tests