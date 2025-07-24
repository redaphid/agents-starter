import { useState, useRef, useEffect } from 'react'
import type { McpServerConfig } from './McpDrawer'
import { HeadersList } from './HeadersList'

interface UrlItemProps {
  server: McpServerConfig
  index: number
  isEditing: boolean
  onUpdate: (updates: Partial<McpServerConfig>) => void
  onRemove: () => void
  onSaveComplete: () => void
}

export function UrlItem({ 
  server, 
  index, 
  isEditing: initialEditing,
  onUpdate, 
  onRemove,
  onSaveComplete 
}: UrlItemProps) {
  const [isEditing, setIsEditing] = useState(initialEditing)
  const [showHeaders, setShowHeaders] = useState(false)
  const [url, setUrl] = useState(server.url)
  const [error, setError] = useState<string>('')
  const [isValidating, setIsValidating] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [availableTools, setAvailableTools] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const validateUrl = async (urlToValidate: string) => {
    // First, the mortal validation rituals
    try {
      const parsed = new URL(urlToValidate)
      if (!['http:', 'https:', 'ws:', 'wss:'].includes(parsed.protocol)) {
        throw new Error('Protocol must be http, https, ws, or wss. This is the way.')
      }
    } catch (err) {
      setError('Invalid URL format. The cosmos rejects malformed addresses.')
      return false
    }

    // Now, attempt to commune with the server
    setIsValidating(true)
    setError('')

    try {
      // We'll just check if we can reach it with a HEAD request
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000) // 5 second patience

      const response = await fetch(urlToValidate, {
        method: 'HEAD',
        signal: controller.signal,
        mode: 'no-cors' // Avoid CORS drama in the browser
      })

      clearTimeout(timeout)
      
      // In no-cors mode, we can't read the response, but if it doesn't throw, it's reachable
      onUpdate({ 
        isReachable: true, 
        lastChecked: new Date().toISOString() 
      })
      
      return true
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Connection timeout. The server exists in a distant realm.')
      } else {
        setError('Server unreachable. Perhaps it exists in another dimension?')
      }
      
      onUpdate({ 
        isReachable: false, 
        lastChecked: new Date().toISOString() 
      })
      
      return false
    } finally {
      setIsValidating(false)
    }
  }

  const handleSave = async () => {
    if (!url.trim()) {
      setError('A URL is required. Even the void has an address.')
      return
    }

    const isValid = await validateUrl(url)
    if (isValid) {
      onUpdate({ url })
      setIsEditing(false)
      onSaveComplete()
    }
  }

  const handleCancel = () => {
    setUrl(server.url)
    setError('')
    setIsEditing(false)
    if (!server.url) {
      onRemove() // Remove empty servers - the void reclaims them
    }
  }

  const testConnection = async () => {
    if (!server.url) return
    
    setIsTesting(true)
    setError('')
    
    try {
      // Test MCP server connection and discover tools
      const response = await fetch('/api/mcp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: server.url,
          headers: server.headers 
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setAvailableTools(result.tools || [])
        onUpdate({ 
          isReachable: true, 
          lastChecked: new Date().toISOString() 
        })
      } else {
        setError(result.error || 'Failed to connect to MCP server')
        onUpdate({ 
          isReachable: false, 
          lastChecked: new Date().toISOString() 
        })
      }
    } catch (err) {
      setError('Network error testing MCP connection')
      onUpdate({ 
        isReachable: false, 
        lastChecked: new Date().toISOString() 
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  return (
    <div className="url-item" data-testid={`url-item-${index}`}>
      <div className="url-main">
        {isEditing ? (
          <div className="url-edit-mode">
            <input
              ref={inputRef}
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
                if (e.key === 'Escape') handleCancel()
              }}
              placeholder="https://your-mcp-server.com/api"
              className="url-input"
              required
              data-testid={`url-input-${index}`}
              aria-label="MCP Server URL"
              aria-invalid={!!error}
              aria-describedby={error ? `url-error-${index}` : undefined}
            />
            <div className="url-actions">
              <button
                onClick={handleSave}
                disabled={isValidating}
                className="url-save"
                data-testid={`save-url-${index}`}
                aria-label="Save URL"
              >
                {isValidating ? '🌀' : '✓'}
              </button>
              <button
                onClick={handleCancel}
                className="url-cancel"
                data-testid={`cancel-url-${index}`}
                aria-label="Cancel editing"
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <div className="url-display-mode">
            <span 
              className="url-display"
              data-testid={`url-display-${index}`}
            >
              {server.url}
            </span>
            <div className="url-status">
              {server.isReachable !== undefined && (
                <span 
                  className={`status-indicator ${server.isReachable ? 'reachable' : 'unreachable'}`}
                  data-testid={`url-status-${index}`}
                  title={`Last checked: ${server.lastChecked || 'Never'}`}
                >
                  {server.isReachable ? '🟢' : '🔴'}
                </span>
              )}
              {availableTools.length > 0 && (
                <span 
                  className="tools-indicator"
                  title={`Tools available: ${availableTools.join(', ')}`}
                >
                  🔧 {availableTools.length}
                </span>
              )}
            </div>
            <div className="url-actions">
              <button
                onClick={testConnection}
                disabled={isTesting}
                className="url-test"
                data-testid={`test-url-${index}`}
                aria-label="Test MCP connection"
                title="Test connection and discover tools"
              >
                {isTesting ? '🌀' : '🔍'}
              </button>
              <button
                onClick={handleEdit}
                className="url-edit"
                data-testid={`edit-url-${index}`}
                aria-label="Edit URL"
              >
                ✏️
              </button>
              <button
                onClick={onRemove}
                className="url-remove"
                data-testid={`remove-url-${index}`}
                aria-label="Remove URL"
              >
                🗑️
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div 
          className="url-error"
          id={`url-error-${index}`}
          data-testid={`url-error-${index}`}
          role="alert"
        >
          {error}
        </div>
      )}

      {!isEditing && server.url && (
        <button
          className="headers-toggle"
          onClick={() => setShowHeaders(!showHeaders)}
          aria-expanded={showHeaders}
          data-testid={`expand-headers-${index}`}
        >
          <span className="expand-icon">{showHeaders ? '▼' : '▶'}</span>
          <span>Authentication Headers</span>
          <span className="headers-hint">
            {Object.keys(server.headers).length > 0 
              ? `(${Object.keys(server.headers).length} configured)`
              : '(Click to add)'}
          </span>
        </button>
      )}

      {showHeaders && (
        <div 
          className="headers-section expanded"
          data-testid={`headers-section-${index}`}
        >
          <HeadersList
            headers={server.headers}
            serverIndex={index}
            onHeadersChange={(headers) => onUpdate({ headers })}
          />
        </div>
      )}

      {availableTools.length > 0 && (
        <div 
          className="tools-section"
          data-testid={`tools-section-${index}`}
        >
          <div className="tools-header">
            <span className="tools-title">🔧 Available Tools ({availableTools.length})</span>
          </div>
          <div className="tools-list">
            {availableTools.map((tool, toolIndex) => (
              <span 
                key={toolIndex}
                className="tool-badge"
                title={`Tool: ${tool}`}
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}