import { type FC } from "react"

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error"

interface ConnectionEyeProps {
  status: ConnectionStatus
  error?: string
  onClick?: () => void
}

export const ConnectionEye: FC<ConnectionEyeProps> = ({ status, error, onClick }) => {
  const getEyeColors = () => {
    if (status === "disconnected" || status === "error") {
      return {
        outer: "oklch(65% 0.35 25)",
        inner: "oklch(60% 0.4 15)",
        highlight: "oklch(75% 0.3 35)",
        glow: "oklch(65% 0.35 25 / 0.4)"
      }
    }
    if (status === "connecting") {
      return {
        outer: "oklch(75% 0.25 280)",
        inner: "oklch(70% 0.3 200)",
        highlight: "oklch(85% 0.2 45)",
        glow: "oklch(75% 0.25 280 / 0.4)"
      }
    }
    return {
      outer: "oklch(80% 0.2 160)",
      inner: "oklch(75% 0.25 200)",
      highlight: "oklch(85% 0.15 140)",
      glow: "oklch(80% 0.2 160 / 0.4)"
    }
  }

  const colors = getEyeColors()
  const animationClass = status === "connecting" ? "eye-shimmer" : status === "error" ? "eye-pulse-fast" : "eye-pulse"

  return (
    <>
      <style>{`
        @keyframes eye-pulse {
          0%, 100% { 
            transform: scale(1);
            filter: brightness(1);
          }
          50% { 
            transform: scale(1.05);
            filter: brightness(1.1);
          }
        }
        
        @keyframes eye-pulse-fast {
          0%, 100% { 
            transform: scale(1);
            filter: brightness(0.9);
          }
          50% { 
            transform: scale(1.1);
            filter: brightness(1.2);
          }
        }
        
        @keyframes eye-shimmer {
          0%, 100% { 
            filter: hue-rotate(0deg) saturate(1) brightness(1);
          }
          25% { 
            filter: hue-rotate(30deg) saturate(1.2) brightness(1.1);
          }
          50% { 
            filter: hue-rotate(60deg) saturate(1.3) brightness(1.2);
          }
          75% { 
            filter: hue-rotate(20deg) saturate(1.1) brightness(1.05);
          }
        }
        
        .connection-eye {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 60px;
          height: 60px;
          cursor: pointer;
          z-index: 1000;
          transition: transform 0.2s ease;
        }
        
        .connection-eye:hover {
          transform: scale(1.1);
        }
        
        .connection-eye svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 4px 12px ${colors.glow});
        }
        
        .eye-iris {
          animation: ${animationClass} ${status === "error" ? "0.5s" : "3s"} ease-in-out infinite;
        }
        
        .eye-tooltip {
          position: absolute;
          bottom: 70px;
          right: 0;
          background: var(--opal-white);
          color: var(--text-contrast);
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 14px;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px oklch(from var(--bg-dark) l c h / 0.2);
          border: 1px solid oklch(from var(--edge-violet) l calc(c * 0.2) h / 0.3);
        }
        
        .connection-eye:hover .eye-tooltip {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
      
      <div className="connection-eye" onClick={onClick} role="button" tabIndex={0} aria-label={`Connection status: ${status}`}>
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id={`eye-gradient-${status}`}>
              <stop offset="0%" stopColor={colors.highlight} />
              <stop offset="30%" stopColor={colors.inner} />
              <stop offset="70%" stopColor={colors.outer} />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            
            <radialGradient id={`eye-highlight-${status}`}>
              <stop offset="0%" stopColor="oklch(95% 0.05 280)" stopOpacity="0.8" />
              <stop offset="50%" stopColor="oklch(90% 0.1 250)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>
          
          <ellipse 
            cx="50" 
            cy="50" 
            rx="35" 
            ry="20" 
            fill={`url(#eye-gradient-${status})`}
            className="eye-iris"
          />
          
          <circle 
            cx="50" 
            cy="50" 
            r="12" 
            fill="oklch(15% 0.02 280)"
          />
          
          <circle 
            cx="45" 
            cy="45" 
            r="6" 
            fill={`url(#eye-highlight-${status})`}
          />
          
          {status === "error" && (
            <text x="50" y="90" textAnchor="middle" fill={colors.outer} fontSize="16" fontWeight="bold">!</text>
          )}
        </svg>
        
        <div className="eye-tooltip">
          {status === "disconnected" && "Click to connect to LLM"}
          {status === "connecting" && "Establishing cosmic link..."}
          {status === "connected" && "Neural pathways active"}
          {status === "error" && (error || "Connection failed")}
        </div>
      </div>
    </>
  )
}