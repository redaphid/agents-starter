import { useState, useEffect, useRef } from 'react'
import { UrlList } from './UrlList'

interface McpDrawerProps {
  onUrlsChange?: (urls: McpServerConfig[]) => void
}

export interface McpServerConfig {
  id: string
  url: string
  headers: Record<string, string>
  isReachable?: boolean
  lastChecked?: string
}

export function McpDrawer({ onUrlsChange }: McpDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [servers, setServers] = useState<McpServerConfig[]>([])
  const drawerRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  // The cosmic void calls... but we answer with localStorage
  useEffect(() => {
    const saved = localStorage.getItem('mcp-servers')
    if (saved) {
      try {
        setServers(JSON.parse(saved))
      } catch (err) {
        console.error('The saved configurations have been corrupted by cosmic rays:', err)
      }
    }
  }, [])


  // Persist to the eternal storage whenever servers change
  useEffect(() => {
    localStorage.setItem('mcp-servers', JSON.stringify(servers))
    onUrlsChange?.(servers)
  }, [servers, onUrlsChange])

  // Escape key - because even interdimensional beings need an exit
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
        toggleRef.current?.focus() // Return focus to the portal
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  // Click outside - the void gazes back
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && 
          drawerRef.current && 
          !drawerRef.current.contains(e.target as Node) &&
          !toggleRef.current?.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleToggle = () => {
    const newIsOpen = !isOpen
    setIsOpen(newIsOpen)
    
    // Add/remove class to app container to activate grid columns
    const appContainer = document.querySelector('.app-container')
    if (appContainer) {
      if (newIsOpen) {
        appContainer.classList.add('drawer-open')
      } else {
        appContainer.classList.remove('drawer-open')
      }
    }
    
    // Announce state change to screen readers - accessibility across dimensions
    const message = isOpen 
      ? 'MCP configuration drawer closed' 
      : 'MCP configuration drawer opened - prepare your server URLs, mortal'
    announceToScreenReader(message)
  }

  return (
    <>
      <button
        ref={toggleRef}
        className="drawer-toggle"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close MCP server configuration' : 'Open MCP server configuration'}
        data-testid="mcp-drawer-toggle"
      >
        <span className="drawer-icon" aria-hidden="true">
          ⟨⟩
        </span>
      </button>
      
      <div 
        ref={drawerRef}
        className={`drawer-content ${isOpen ? 'open' : ''}`}
        data-testid="mcp-drawer"
        role="region"
        aria-label="MCP Server Configuration"
      >
        <h2 className="drawer-title">
          🌌 Stellar Gateway Configuration
        </h2>
        <p className="drawer-subtitle">
          Configure your Model Context Protocol servers. 
          Each URL is a portal to infinite possibilities... or 404 errors.
        </p>
        
        <UrlList 
          servers={servers}
          onServersChange={setServers}
        />
      </div>
    </>
  )
}

// Announce to the cosmos (and screen readers)
function announceToScreenReader(message: string) {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', 'polite')
  announcement.className = 'sr-only'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  setTimeout(() => document.body.removeChild(announcement), 1000)
}