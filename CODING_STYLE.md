# Clean Code Style Guide

Based on analysis of paper-cranes and modern best practices.

## Core Principles

### 1. Early Returns and Guard Clauses
```javascript
// Good
const calculateResolutionRatio = (frameTime, renderTimes, lastRatio) => {
    renderTimes.push(frameTime)
    if (renderTimes.length > 20) renderTimes.shift()
    if (renderTimes.length < 20) return lastRatio
    
    const avgFrameTime = renderTimes.reduce((a, b) => a + b) / renderTimes.length
    
    if (avgFrameTime > 50) return Math.max(0.5, lastRatio - 0.5)
    if (avgFrameTime < 20 && lastRatio < 1) return Math.min(1, lastRatio + 0.1)
    return lastRatio
}

// Bad
const calculateResolutionRatio = (frameTime, renderTimes, lastRatio) => {
    let result = lastRatio
    renderTimes.push(frameTime)
    if (renderTimes.length > 20) {
        renderTimes.shift()
    }
    if (renderTimes.length >= 20) {
        const avgFrameTime = renderTimes.reduce((a, b) => a + b) / renderTimes.length
        if (avgFrameTime > 50) {
            result = Math.max(0.5, lastRatio - 0.5)
        } else if (avgFrameTime < 20 && lastRatio < 1) {
            result = Math.min(1, lastRatio + 0.1)
        }
    }
    return result
}
```

### 2. Single Responsibility
Each function does ONE thing well:
```javascript
// Good
const askForWakeLock = async () => {
    if (!navigator.wakeLock) return
    return navigator.wakeLock.request('screen')
}

// Bad
const setupAndAskForWakeLock = async (canvas, options) => {
    // Mixing concerns - setup and wake lock
    canvas.width = options.width
    canvas.height = options.height
    if (navigator.wakeLock) {
        return navigator.wakeLock.request('screen')
    }
}
```

### 3. Minimal State
Avoid mutable state when possible:
```javascript
// Good
const resolveReferences = (uniforms) => {
    const resolved = { ...uniforms }
    for (const [key, value] of Object.entries(resolved)) {
        if (typeof value !== 'string') continue
        const resolvedValue = resolved[value]
        if (resolvedValue === undefined) continue
        resolved[key] = resolvedValue
    }
    return resolved
}

// Bad
let globalUniforms = {}
function updateUniforms(uniforms) {
    globalUniforms = uniforms
    // mutating global state
}
```

### 4. Descriptive Variable Names
```javascript
// Good
const frameBuffers = [createFramebufferInfo(gl), createFramebufferInfo(gl)]
const currentFrame = frameBuffers[frameNumber % 2]
const previousFrame = frameBuffers[(frameNumber + 1) % 2]

// Bad
const fb = [createFramebufferInfo(gl), createFramebufferInfo(gl)]
const f = fb[fn % 2]
const pf = fb[(fn + 1) % 2]
```

### 5. Error Handling Close to Source
```javascript
// Good
await askForWakeLock().catch(e => {})  // Handle where called

// Bad
const askForWakeLock = async () => {
    try {
        // Error handling inside utility function
        if (!navigator.wakeLock) return
        return navigator.wakeLock.request('screen')
    } catch (e) {
        console.error(e)
    }
}
```

### 6. Prefer Functional Patterns
```javascript
// Good
uniforms = Object.fromEntries(
    Object.entries(uniforms).filter(([, value]) => 
        value !== null && value !== undefined && !Number.isNaN(value)
    )
)

// Bad
const cleanUniforms = {}
for (const key in uniforms) {
    const value = uniforms[key]
    if (value !== null && value !== undefined && !Number.isNaN(value)) {
        cleanUniforms[key] = value
    }
}
uniforms = cleanUniforms
```

### 7. Async/Promise Patterns
```javascript
// Good
const getTexture = async (gl, url) => {
    return new Promise((resolve) => {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
        const texture = createTexture(gl, {
            src: url,
            crossOrigin: 'anonymous',
            min: gl.NEAREST,
            mag: gl.NEAREST,
            wrap: gl.REPEAT
        }, () => {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
            resolve(texture)
        })
    })
}
```

## Anti-Patterns to Avoid

1. **Nested Conditionals** - Use early returns
2. **Long Functions** - Break into smaller pieces
3. **Mixed Concerns** - One function, one job
4. **Global State** - Pass dependencies explicitly
5. **Unclear Intent** - Name things by what they do
6. **Error Swallowing** - Handle errors meaningfully
7. **Mutating Parameters** - Return new values instead

## Testing Strategy

1. **Unit Tests First** - Test pure functions in isolation
2. **Integration Tests** - Test component interactions
3. **E2E with Playwright** - Test user flows
4. **Visual Regression** - For UI components

## Code Review Checklist

- [ ] Can this function be shorter with early returns?
- [ ] Does each function do ONE thing?
- [ ] Are variable names self-documenting?
- [ ] Is error handling appropriate?
- [ ] Can state be eliminated?
- [ ] Are there any nested conditionals to flatten?
- [ ] Is the code testable?