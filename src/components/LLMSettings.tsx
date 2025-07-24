import { useState, type FC } from "react"
import { X, Gear } from "@phosphor-icons/react"
import type { LLMConfig, LLMProvider } from "@/hooks/useLLMConnection"

interface LLMSettingsProps {
  isOpen: boolean
  onClose: () => void
  onSave: (config: LLMConfig) => void
  currentConfig: LLMConfig | null
  onTest: () => void
  connectionStatus: "disconnected" | "connecting" | "connected" | "error"
  error?: string
}

export const LLMSettings: FC<LLMSettingsProps> = ({
  isOpen,
  onClose,
  onSave,
  currentConfig,
  onTest,
  connectionStatus,
  error
}) => {
  const [provider, setProvider] = useState<LLMProvider>(currentConfig?.provider || "ollama")
  const [ollamaUrl, setOllamaUrl] = useState(currentConfig?.ollamaUrl || "http://localhost:11434")
  const [ollamaModel, setOllamaModel] = useState(currentConfig?.ollamaModel || "deepseek-r1:8b")
  const [cloudflareAccountId, setCloudflareAccountId] = useState(currentConfig?.cloudflareAccountId || "")
  const [cloudflareGatewayId, setCloudflareGatewayId] = useState(currentConfig?.cloudflareGatewayId || "")
  const [cloudflareApiToken, setCloudflareApiToken] = useState(currentConfig?.cloudflareApiToken || "")

  if (!isOpen) return null

  const handleSave = () => {
    const config: LLMConfig = {
      provider,
      ...(provider === "ollama" ? { ollamaUrl, ollamaModel } : {
        cloudflareAccountId,
        cloudflareGatewayId,
        cloudflareApiToken
      })
    }
    onSave(config)
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected": return "text-green-500"
      case "connecting": return "text-blue-500"
      case "error": return "text-red-500"
      default: return "text-yellow-500"
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected": return "✨ Neural pathways active"
      case "connecting": return "🌀 Establishing cosmic link..."
      case "error": return "💥 Connection severed"
      default: return "🌙 Awaiting configuration"
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <Gear size={20} className="text-[#F48120]" />
              <h2 className="text-lg font-semibold">Observatory Control Panel</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Close settings"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Linguistic Engine Selection
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as LLMProvider)}
                className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
              >
                <option value="ollama">Ollama (Local Oracle)</option>
                <option value="cloudflare">Cloudflare AI Gateway</option>
              </select>
            </div>

            {provider === "ollama" ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Oracle Location
                  </label>
                  <input
                    type="text"
                    value={ollamaUrl}
                    onChange={(e) => setOllamaUrl(e.target.value)}
                    placeholder="http://localhost:11434"
                    className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Model Designation
                  </label>
                  <input
                    type="text"
                    value={ollamaModel}
                    onChange={(e) => setOllamaModel(e.target.value)}
                    placeholder="deepseek-r1:8b"
                    className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Popular choices: deepseek-r1:8b, llama3.2:3b, qwen2.5-coder:7b
                  </p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Account Identifier
                  </label>
                  <input
                    type="text"
                    value={cloudflareAccountId}
                    onChange={(e) => setCloudflareAccountId(e.target.value)}
                    placeholder="Your account ID"
                    className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Gateway Portal ID
                  </label>
                  <input
                    type="text"
                    value={cloudflareGatewayId}
                    onChange={(e) => setCloudflareGatewayId(e.target.value)}
                    placeholder="Your gateway ID"
                    className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Interdimensional Token
                  </label>
                  <input
                    type="password"
                    value={cloudflareApiToken}
                    onChange={(e) => setCloudflareApiToken(e.target.value)}
                    placeholder="Your API token"
                    className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                  />
                </div>
              </>
            )}

            <div className="pt-2">
              <div className={`text-sm font-medium ${getStatusColor()} mb-2`}>
                {getStatusText()}
              </div>
              {error && (
                <div className="text-xs text-red-500 mb-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 p-4 border-t border-neutral-200 dark:border-neutral-800">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-[#F48120] text-white rounded-md hover:bg-[#F48120]/90 transition-colors"
            >
              Save Configuration
            </button>
            <button
              onClick={onTest}
              className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Test Connection
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}