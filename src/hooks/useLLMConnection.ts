import { useState, useEffect } from "react"

export type LLMProvider = "ollama" | "cloudflare"

export interface LLMConfig {
  provider: LLMProvider
  ollamaUrl?: string
  ollamaModel?: string
  cloudflareAccountId?: string
  cloudflareGatewayId?: string
  cloudflareApiToken?: string
}

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error"

export const useLLMConnection = () => {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected")
  const [error, setError] = useState<string>("")
  const [config, setConfig] = useState<LLMConfig | null>(() => {
    const saved = localStorage.getItem("llm-config")
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    if (config) {
      // Configure server on load
      fetch("/api/llm/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: config.provider,
          ...(config.provider === "ollama" ? {
            ollama: {
              baseUrl: config.ollamaUrl,
              model: config.ollamaModel
            }
          } : {
            cloudflare: {
              accountId: config.cloudflareAccountId,
              gatewayId: config.cloudflareGatewayId,
              apiKey: config.cloudflareApiToken
            }
          })
        })
      }).catch(e => console.error("Failed to configure server on load:", e))
      
      checkConnection()
    }
  }, [config])

  const checkConnection = async () => {
    if (!config) {
      setStatus("disconnected")
      return
    }

    setStatus("connecting")
    setError("")

    try {
      const response = await fetch("/llm/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      })

      const result = await response.json()

      if (result.success) {
        setStatus("connected")
        console.log("✨ Neural pathways established:", result.details)
      } else {
        setStatus("error")
        setError(result.error || "Unknown connection anomaly")
        console.error("🌌 Connection failed:", result.error, result.details)
      }
    } catch (e) {
      setStatus("error")
      setError(e instanceof Error ? e.message : "Catastrophic dimensional failure")
      console.error("💥 Connection error:", e)
    }
  }

  const saveConfig = async (newConfig: LLMConfig) => {
    localStorage.setItem("llm-config", JSON.stringify(newConfig))
    setConfig(newConfig)
    
    // Configure the server
    try {
      const response = await fetch("/api/llm/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: newConfig.provider,
          ...(newConfig.provider === "ollama" ? {
            ollama: {
              baseUrl: newConfig.ollamaUrl,
              model: newConfig.ollamaModel
            }
          } : {
            cloudflare: {
              accountId: newConfig.cloudflareAccountId,
              gatewayId: newConfig.cloudflareGatewayId,
              apiKey: newConfig.cloudflareApiToken
            }
          })
        })
      })
      
      if (!response.ok) {
        console.error("Failed to configure server:", await response.text())
      }
    } catch (e) {
      console.error("Error configuring server:", e)
    }
  }

  const clearConfig = () => {
    localStorage.removeItem("llm-config")
    setConfig(null)
    setStatus("disconnected")
    setError("")
  }

  return {
    status,
    error,
    config,
    checkConnection,
    saveConfig,
    clearConfig
  }
}