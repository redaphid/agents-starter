import { useState } from 'react'
import { McpServerConfig } from './McpDrawer'
import { UrlItem } from './UrlItem'

interface UrlListProps {
  servers: McpServerConfig[]
  onServersChange: (servers: McpServerConfig[]) => void
}

export function UrlList({ servers, onServersChange }: UrlListProps) {
  const [isAdding, setIsAdding] = useState(false)

  const handleAddServer = () => {
    const newServer: McpServerConfig = {
      id: `mcp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Cosmic randomness
      url: '',
      headers: {},
      isReachable: undefined,
      lastChecked: undefined
    }
    
    onServersChange([...servers, newServer])
    setIsAdding(true)
  }

  const handleUpdateServer = (id: string, updates: Partial<McpServerConfig>) => {
    onServersChange(
      servers.map(server => 
        server.id === id 
          ? { ...server, ...updates }
          : server
      )
    )
  }

  const handleRemoveServer = (id: string) => {
    // A moment of silence for the departed endpoint...
    onServersChange(servers.filter(server => server.id !== id))
  }

  const handleSaveComplete = () => {
    setIsAdding(false)
  }

  return (
    <div className="url-list" data-testid="url-list">
      <div className="url-list-header">
        <h3 className="url-list-title">
          Active Portals ({servers.length})
        </h3>
        <button
          className="add-url-button"
          onClick={handleAddServer}
          data-testid="add-url-button"
          aria-label="Add new MCP server URL"
        >
          <span className="add-icon">+</span>
          <span>Open New Portal</span>
        </button>
      </div>

      {servers.length === 0 ? (
        <div className="empty-state">
          <p className="empty-message">
            The void awaits your first connection...
          </p>
          <p className="empty-hint">
            Click "Open New Portal" to begin your journey through the MCP multiverse.
          </p>
        </div>
      ) : (
        <div className="servers-list">
          {servers.map((server, index) => (
            <UrlItem
              key={server.id}
              server={server}
              index={index}
              isEditing={isAdding && index === servers.length - 1}
              onUpdate={(updates) => handleUpdateServer(server.id, updates)}
              onRemove={() => handleRemoveServer(server.id)}
              onSaveComplete={handleSaveComplete}
            />
          ))}
        </div>
      )}

      <div className="url-list-footer">
        <p className="footer-note">
          💫 Each URL must be reachable from this dimension. 
          We'll verify the connection before saving.
        </p>
      </div>
    </div>
  )
}