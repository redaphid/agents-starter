import { useState } from "react";
import { Robot, CaretDown, Sparkle, Lightning, Eye, Gear } from "@phosphor-icons/react";
import { Button } from "@/components/button/Button";
import { Card } from "@/components/card/Card";
import { Tooltip } from "@/components/tooltip/Tooltip";
import { APPROVAL } from "@/shared";

interface ToolInvocation {
  toolName: string;
  toolCallId: string;
  state: "call" | "result" | "partial-call";
  step?: number;
  args: Record<string, unknown>;
  result?: {
    content?: Array<{ type: string; text: string }>;
  };
}

interface ToolInvocationCardProps {
  toolInvocation: ToolInvocation;
  toolCallId: string;
  needsConfirmation: boolean;
  addToolResult: (args: { toolCallId: string; result: string }) => void;
}

// Opalescent tool configurations inspired by cosmic creatures
const OPAL_TOOL_CONFIGS = {
  echo: {
    icon: "🔮",
    name: "Echo Protocol",
    action: "Broadcasting cosmic signal...",
    achievement: "Signal Echoed Successfully!",
    color: "oklch(78% 0.18 200)",  // Aqua mist from magical effects
    accentColor: "oklch(82% 0.12 300)", // Lavender dream 
    bgGradient: "linear-gradient(135deg, oklch(96% 0.02 280 / 0.9), oklch(94% 0.04 240 / 0.95))",
    borderColor: "oklch(78% 0.08 200 / 0.4)",
    shimmerColors: ["oklch(96% 0.02 280)", "oklch(78% 0.18 200)", "oklch(82% 0.12 300)"],
  },
  weather: {
    icon: "🌤️", 
    name: "Atmospheric Scanner",
    action: "Analyzing weather patterns...",
    achievement: "Atmospheric Data Acquired!",
    color: "oklch(85% 0.15 25)",   // Coral bloom from ear interiors
    accentColor: "oklch(80% 0.20 65)", // Amber glow
    bgGradient: "linear-gradient(135deg, oklch(96% 0.02 280 / 0.9), oklch(94% 0.04 25 / 0.95))",
    borderColor: "oklch(85% 0.08 25 / 0.4)",
    shimmerColors: ["oklch(96% 0.02 280)", "oklch(85% 0.15 25)", "oklch(80% 0.20 65)"],
  },
  task: {
    icon: "📝",
    name: "Task Coordinator", 
    action: "Scheduling mission objective...",
    achievement: "Task Successfully Scheduled!",
    color: "oklch(82% 0.12 300)",  // Lavender dream from tendrils
    accentColor: "oklch(78% 0.18 200)", // Aqua mist
    bgGradient: "linear-gradient(135deg, oklch(96% 0.02 280 / 0.9), oklch(94% 0.04 300 / 0.95))",
    borderColor: "oklch(82% 0.08 300 / 0.4)",
    shimmerColors: ["oklch(96% 0.02 280)", "oklch(82% 0.12 300)", "oklch(78% 0.18 200)"],
  },
  default: {
    icon: "⚡",
    name: "Observatory Tool",
    action: "Executing dimensional protocol...",
    achievement: "Protocol Executed Successfully!",
    color: "oklch(80% 0.20 65)",   // Amber glow from eyes
    accentColor: "oklch(85% 0.15 25)", // Coral bloom
    bgGradient: "linear-gradient(135deg, oklch(96% 0.02 280 / 0.9), oklch(94% 0.04 65 / 0.95))",
    borderColor: "oklch(80% 0.08 65 / 0.4)",
    shimmerColors: ["oklch(96% 0.02 280)", "oklch(80% 0.20 65)", "oklch(85% 0.15 25)"],
  }
};

function getToolConfig(toolName: string) {
  return OPAL_TOOL_CONFIGS[toolName as keyof typeof OPAL_TOOL_CONFIGS] || OPAL_TOOL_CONFIGS.default;
}

function formatResult(result: any): string {
  if (typeof result === "object" && result?.content) {
    return result.content
      .map((item: { type: string; text: string }) => {
        if (item.type === "text") {
          // Clean up the text and make it more readable
          return item.text.replace(/^\*Echo:\s*/, "").trim();
        }
        return item.text;
      })
      .join(" ");
  }
  
  if (typeof result === "string") {
    return result;
  }
  
  // Last resort - but make it prettier than raw JSON
  return "Operation completed successfully.";
}

export function ToolInvocationCard({
  toolInvocation,
  toolCallId,
  needsConfirmation,
  addToolResult,
}: ToolInvocationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = getToolConfig(toolInvocation.toolName);
  const isCompleted = !needsConfirmation && toolInvocation.state === "result";
  const isInProgress = toolInvocation.state === "call" && !needsConfirmation;

  return (
    <div 
      className="observatory-achievement-card"
      style={{
        background: config.bgGradient,
        border: `1px solid ${config.borderColor}`,
        borderRadius: "1.2rem",
        padding: "0",
        margin: "1.5rem 0",
        overflow: "hidden",
        position: "relative",
        boxShadow: `
          0 8px 32px oklch(50% 0.1 240 / 0.1),
          0 0 16px ${config.color}20
        `,
        backdropFilter: "blur(10px)",
      }}
    >
      {/* Opalescent shimmer effect for completed achievements */}
      {isCompleted && (
        <div 
          className="opalescent-shimmer"
          style={{
            position: "absolute",
            top: "0",
            left: "-200%",
            width: "200%",
            height: "100%",
            background: `linear-gradient(
              45deg, 
              transparent 0%, 
              ${config.shimmerColors[0]}60 25%, 
              ${config.shimmerColors[1]}80 50%, 
              ${config.shimmerColors[2]}60 75%, 
              transparent 100%
            )`,
            animation: "opalShimmer 3s ease-in-out infinite",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      )}

      {/* Header - The Achievement Banner */}
      <div 
        className="achievement-header"
        style={{
          background: `linear-gradient(135deg, ${config.color}30, ${config.color}20)`,
          padding: "1.2rem 1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          borderBottom: `1px solid ${config.borderColor}`,
          position: "relative",
          zIndex: 2,
        }}
      >
        <div 
          className="tool-icon-cosmic"
          style={{
            width: "2.5rem",
            height: "2.5rem",
            borderRadius: "50%",
            background: `radial-gradient(circle at 30% 30%, oklch(95% 0.15 60) 0%, ${config.color} 50%, oklch(70% 0.25 200) 100%)`,
            border: `2px solid oklch(95% 0.1 280 / 0.6)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.2rem",
            boxShadow: `0 4px 12px ${config.color}30, inset 0 1px 0 oklch(98% 0.05 280)`,
          }}
        >
          {config.icon}
        </div>

        <div className="tool-info" style={{ flex: 1 }}>
          <div 
            className="tool-name"
            style={{
              fontSize: "1.1rem",
              fontWeight: "700",
              color: "oklch(20% 0.1 280)",
              marginBottom: "0.2rem",
              textShadow: "0 1px 2px oklch(30% 0.1 280 / 0.5)",
            }}
          >
            {config.name}
          </div>
          <div 
            className="tool-action"
            style={{
              fontSize: "0.85rem",
              color: "oklch(45% 0.08 270)",
              fontStyle: "italic",
            }}
          >
            {isCompleted ? "✨ Achievement Unlocked!" : 
             isInProgress ? config.action : 
             needsConfirmation ? "Awaiting cosmic approval..." : config.action}
          </div>
        </div>

        <div 
          className="achievement-status"
          style={{
            background: isCompleted 
              ? `radial-gradient(circle, oklch(85% 0.2 45) 0%, oklch(75% 0.25 60) 100%)`
              : isInProgress
              ? `radial-gradient(circle, oklch(85% 0.2 200) 0%, oklch(75% 0.25 220) 100%)`
              : `radial-gradient(circle, oklch(85% 0.2 280) 0%, oklch(75% 0.25 300) 100%)`,
            color: "white",
            padding: "0.4rem 0.8rem",
            borderRadius: "1rem",
            fontSize: "0.7rem",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            border: `1px solid oklch(90% 0.15 45 / 0.6)`,
            boxShadow: `0 2px 8px ${config.color}40, inset 0 1px 0 oklch(95% 0.1 45 / 0.7)`,
          }}
        >
          {isCompleted ? "🏆 ACHIEVED" : 
           isInProgress ? "⚡ CASTING" : 
           needsConfirmation ? "🔒 PENDING" : "⏳ READY"}
        </div>
      </div>

      {/* Result Showcase - The Exciting Part */}
      {isCompleted && (
        <div 
          className="achievement-result"
          style={{
            padding: "1.5rem",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `radial-gradient(ellipse at center, oklch(98% 0.02 240 / 0.8), oklch(96% 0.03 200 / 0.9))`,
          }}
        >
          <div 
            className="result-glow"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "100%",
              height: "100%",
              background: `radial-gradient(ellipse, ${config.color}10 0%, ${config.color}05 50%, transparent 100%)`,
              animation: "resultPulse 2s ease-in-out infinite",
            }}
          />
          
          <div 
            className="result-text"
            style={{
              position: "relative",
              zIndex: 2,
              fontSize: "1rem",
              fontWeight: "600",
              color: "oklch(20% 0.1 280)",
              textAlign: "center",
              lineHeight: "1.6",
              textShadow: `
                0 1px 0 oklch(99% 0.03 280 / 0.95),
                0 0 6px oklch(97% 0.08 280 / 0.7),
                0 0 12px oklch(95% 0.12 280 / 0.4)
              `,
            }}
          >
            "{formatResult(toolInvocation.result)}"
          </div>
        </div>
      )}

      {/* Technical Details (Hidden by default, cosmic style when expanded) */}
      {(needsConfirmation || isExpanded) && (
        <div 
          className="technical-details"
          style={{
            borderTop: `1px solid ${config.borderColor}`,
            padding: "1rem 1.5rem",
            background: "oklch(94% 0.01 280)",
          }}
        >
          {needsConfirmation && toolInvocation.state === "call" && (
            <div className="confirmation-actions" style={{ display: "flex", gap: "0.8rem", justifyContent: "center", marginBottom: "1rem" }}>
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  addToolResult({
                    toolCallId,
                    result: APPROVAL.NO,
                  })
                }
                style={{
                  background: "linear-gradient(135deg, oklch(60% 0.3 15), oklch(65% 0.25 25))",
                  border: "none",
                  color: "white",
                }}
              >
                ❌ Deny Access
              </Button>
              <Tooltip content={"Grant the Observatory permission to execute this cosmic protocol"}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    addToolResult({
                      toolCallId,
                      result: APPROVAL.YES,
                    })
                  }
                  style={{
                    background: `linear-gradient(135deg, ${config.color}, oklch(80% 0.2 160))`,
                    border: "none",
                    color: "white",
                  }}
                >
                  ✨ Grant Permission
                </Button>
              </Tooltip>
            </div>
          )}

          <details style={{ cursor: "pointer" }}>
            <summary 
              style={{
                fontSize: "0.8rem",
                color: "oklch(45% 0.08 270)",
                fontWeight: "600",
                padding: "0.5rem 0",
                borderRadius: "0.25rem",
                transition: "all 0.2s ease",
              }}
            >
              🔍 Technical Specifications
            </summary>
            <div style={{ padding: "0.8rem 0", fontSize: "0.75rem" }}>
              <div style={{ marginBottom: "0.8rem" }}>
                <strong style={{ color: "oklch(35% 0.15 280)" }}>Protocol Parameters:</strong>
                <div 
                  style={{
                    background: "oklch(90% 0.02 280)",
                    padding: "0.6rem",
                    borderRadius: "0.5rem",
                    fontFamily: "'SF Mono', Monaco, monospace",
                    fontSize: "0.7rem",
                    color: "oklch(45% 0.08 270)",
                    marginTop: "0.3rem",
                    border: `1px solid ${config.borderColor}`,
                  }}
                >
                  {Object.entries(toolInvocation.args).map(([key, value]) => (
                    <div key={key} style={{ margin: "0.2rem 0" }}>
                      <span style={{ color: config.color, fontWeight: "600" }}>{key}:</span>{" "}
                      <span style={{ color: "oklch(35% 0.1 280)" }}>
                        {typeof value === "string" ? `"${value}"` : JSON.stringify(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </details>
        </div>
      )}

      {/* Expand toggle for non-confirmed tools */}
      {!needsConfirmation && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            position: "absolute",
            top: "1.2rem",
            right: "1.2rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            zIndex: 3,
            opacity: 0.6,
            transition: "opacity 0.2s ease",
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
          onMouseLeave={(e) => e.currentTarget.style.opacity = "0.6"}
        >
          <CaretDown
            size={16}
            style={{
              color: "oklch(45% 0.08 270)",
              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          />
        </button>
      )}

      <style jsx>{`
        @keyframes opalShimmer {
          0% { left: -200%; opacity: 0; }
          25% { left: -50%; opacity: 0.6; }
          50% { left: 0%; opacity: 0.8; }
          75% { left: 50%; opacity: 0.6; }
          100% { left: 200%; opacity: 0; }
        }
        
        @keyframes resultPulse {
          0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.05); }
        }
        
        .achievement-header:hover .tool-icon-cosmic {
          transform: scale(1.05);
          box-shadow: 0 6px 16px ${config.color}40, inset 0 1px 0 oklch(98% 0.05 280);
        }
        
        .technical-details summary:hover {
          color: oklch(35% 0.15 280);
          text-shadow: 0 0 8px ${config.color}40;
        }
      `}</style>
    </div>
  );
}