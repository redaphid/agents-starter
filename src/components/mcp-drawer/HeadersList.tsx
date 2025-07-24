import { useState } from 'react'

interface HeadersListProps {
  headers: Record<string, string>
  serverIndex: number
  onHeadersChange: (headers: Record<string, string>) => void
}

interface HeaderEntry {
  id: string
  name: string
  value: string
}

export function HeadersList({ headers, serverIndex, onHeadersChange }: HeadersListProps) {
  // Transform the object into an array for easier manipulation
  const [headerEntries, setHeaderEntries] = useState<HeaderEntry[]>(() => 
    Object.entries(headers).map(([name, value]) => ({
      id: `header-${Date.now()}-${Math.random()}`,
      name,
      value
    }))
  )

  const handleAddHeader = () => {
    const newHeader: HeaderEntry = {
      id: `header-${Date.now()}-${Math.random()}`,
      name: '',
      value: ''
    }
    setHeaderEntries([...headerEntries, newHeader])
  }

  const handleUpdateHeader = (id: string, field: 'name' | 'value', newValue: string) => {
    const updated = headerEntries.map(header =>
      header.id === id ? { ...header, [field]: newValue } : header
    )
    setHeaderEntries(updated)
    
    // Convert back to object and notify parent
    const headersObject = updated.reduce((acc, header) => {
      if (header.name && header.value) {
        acc[header.name] = header.value
      }
      return acc
    }, {} as Record<string, string>)
    
    onHeadersChange(headersObject)
  }

  const handleRemoveHeader = (id: string) => {
    const filtered = headerEntries.filter(h => h.id !== id)
    setHeaderEntries(filtered)
    
    // Update parent
    const headersObject = filtered.reduce((acc, header) => {
      if (header.name && header.value) {
        acc[header.name] = header.value
      }
      return acc
    }, {} as Record<string, string>)
    
    onHeadersChange(headersObject)
  }

  return (
    <div className="headers-list">
      <div className="headers-intro">
        <p className="headers-description">
          🔐 Authentication headers for this portal. 
          Your secrets are safe with me... probably.
        </p>
      </div>

      {headerEntries.length === 0 ? (
        <div className="headers-empty">
          <p>No headers configured. Your requests shall pass naked through the void.</p>
        </div>
      ) : (
        <div className="headers-entries">
          {headerEntries.map((header, headerIndex) => (
            <div key={header.id} className="header-entry">
              <input
                type="text"
                value={header.name}
                onChange={(e) => handleUpdateHeader(header.id, 'name', e.target.value)}
                placeholder="Header name (e.g., Authorization)"
                className="header-name"
                data-testid={`header-name-${serverIndex}-${headerIndex}`}
                aria-label="Header name"
              />
              <input
                type="text"
                value={header.value}
                onChange={(e) => handleUpdateHeader(header.id, 'value', e.target.value)}
                placeholder="Header value (e.g., Bearer token)"
                className="header-value"
                data-testid={`header-value-${serverIndex}-${headerIndex}`}
                aria-label="Header value"
              />
              <button
                onClick={() => handleRemoveHeader(header.id)}
                className="header-remove"
                data-testid={`remove-header-${serverIndex}-${headerIndex}`}
                aria-label="Remove header"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleAddHeader}
        className="add-header-button"
        data-testid={`add-header-${serverIndex}`}
      >
        <span className="add-icon">+</span>
        <span>Add Authentication Header</span>
      </button>

      <div className="headers-hints">
        <details className="hints-details">
          <summary className="hints-summary">
            💡 Common authentication patterns
          </summary>
          <div className="hints-content">
            <code>Authorization: Bearer your-token</code>
            <code>X-API-Key: your-api-key</code>
            <code>Cookie: session=your-session</code>
            <p className="hint-note">
              The universe has many ways to prove one's identity. 
              Choose wisely, mortal.
            </p>
          </div>
        </details>
      </div>
    </div>
  )
}