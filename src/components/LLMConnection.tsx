import React, { useState, useEffect } from 'react';
import { ChevronDown, CheckCircle, XCircle, Loader2 } from 'lucide-react';

type Provider = 'ollama' | 'cloudflare';

interface LLMConfig {
  provider: Provider;
  ollama?: {
    baseUrl: string;
    model: string;
  };
  cloudflare?: {
    apiEndpoint: string;
    apiKey: string;
    model: string;
  };
}

interface ConnectionStatus {
  connected: boolean;
  testing: boolean;
  error?: string;
  details?: string;
}

export function LLMConnection({ onConfigChange }: { onConfigChange: (config: LLMConfig) => void }) {
  const [config, setConfig] = useState<LLMConfig>(() => {
    const saved = localStorage.getItem('llm-config');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      provider: 'ollama',
      ollama: {
        baseUrl: 'http://localhost:11434',
        model: 'llama3.2:latest',
      },
      cloudflare: {
        apiEndpoint: '',
        apiKey: '',
        model: '@cf/meta/llama-3-8b-instruct',
      },
    };
  });

  const [status, setStatus] = useState<ConnectionStatus>({
    connected: false,
    testing: false,
  });

  const [showDropdown, setShowDropdown] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem('llm-config', JSON.stringify(config));
    onConfigChange(config);
  }, [config, onConfigChange]);

  const testConnection = async () => {
    setStatus({ connected: false, testing: true });
    
    try {
      const response = await fetch('/api/llm/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const result = await response.json();

      if (result.success) {
        setStatus({
          connected: true,
          testing: false,
          details: result.details,
        });
        console.log('✅ LLM Connection successful:', result.details);
      } else {
        setStatus({
          connected: false,
          testing: false,
          error: result.error,
          details: result.details,
        });
        console.error('❌ LLM Connection failed:', result.error, result.details);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatus({
        connected: false,
        testing: false,
        error: `Network error: ${errorMessage}`,
      });
      console.error('❌ LLM Connection error:', error);
    }
  };

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/llm/list-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: config.provider, config }),
      });

      const result = await response.json();
      if (result.models) {
        setAvailableModels(result.models);
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
      setAvailableModels([]);
    }
  };

  return (
    <div className="llm-connection-container">
      <div className="llm-connection-header">
        <h3>LLM Connection</h3>
        <div className="connection-status">
          {status.testing ? (
            <Loader2 className="status-icon spinning" />
          ) : status.connected ? (
            <CheckCircle className="status-icon connected" />
          ) : (
            <XCircle className="status-icon disconnected" />
          )}
        </div>
      </div>

      <div className="provider-selector">
        <label>Provider</label>
        <div className="select-container">
          <select
            value={config.provider}
            onChange={(e) => setConfig({ ...config, provider: e.target.value as Provider })}
          >
            <option value="ollama">Ollama (Local)</option>
            <option value="cloudflare">Cloudflare AI Gateway</option>
          </select>
          <ChevronDown className="select-icon" />
        </div>
      </div>

      {config.provider === 'ollama' && (
        <>
          <div className="config-field">
            <label>Base URL</label>
            <input
              type="text"
              value={config.ollama?.baseUrl || ''}
              onChange={(e) =>
                setConfig({
                  ...config,
                  ollama: { ...config.ollama!, baseUrl: e.target.value },
                })
              }
              placeholder="http://localhost:11434"
            />
          </div>
          <div className="config-field">
            <label>Model</label>
            <div className="model-input-container">
              <input
                type="text"
                value={config.ollama?.model || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    ollama: { ...config.ollama!, model: e.target.value },
                  })
                }
                placeholder="llama3.2:latest"
                onFocus={fetchModels}
              />
              <button
                type="button"
                className="model-dropdown-toggle"
                onClick={() => {
                  setShowDropdown(!showDropdown);
                  if (!showDropdown) fetchModels();
                }}
              >
                <ChevronDown />
              </button>
            </div>
            {showDropdown && availableModels.length > 0 && (
              <div className="model-dropdown">
                {availableModels.map((model) => (
                  <div
                    key={model}
                    className="model-option"
                    onClick={() => {
                      setConfig({
                        ...config,
                        ollama: { ...config.ollama!, model },
                      });
                      setShowDropdown(false);
                    }}
                  >
                    {model}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {config.provider === 'cloudflare' && (
        <>
          <div className="config-field">
            <label>API Endpoint</label>
            <input
              type="text"
              value={config.cloudflare?.apiEndpoint || ''}
              onChange={(e) =>
                setConfig({
                  ...config,
                  cloudflare: { ...config.cloudflare!, apiEndpoint: e.target.value },
                })
              }
              placeholder="https://gateway.ai.cloudflare.com/v1/..."
            />
          </div>
          <div className="config-field">
            <label>API Key</label>
            <input
              type="password"
              value={config.cloudflare?.apiKey || ''}
              onChange={(e) =>
                setConfig({
                  ...config,
                  cloudflare: { ...config.cloudflare!, apiKey: e.target.value },
                })
              }
              placeholder="Your Cloudflare API key"
            />
          </div>
          <div className="config-field">
            <label>Model</label>
            <input
              type="text"
              value={config.cloudflare?.model || ''}
              onChange={(e) =>
                setConfig({
                  ...config,
                  cloudflare: { ...config.cloudflare!, model: e.target.value },
                })
              }
              placeholder="@cf/meta/llama-3-8b-instruct"
            />
          </div>
        </>
      )}

      <button className="test-connection-btn" onClick={testConnection} disabled={status.testing}>
        {status.testing ? 'Testing...' : 'Test Connection'}
      </button>

      {status.error && (
        <div className="error-message">
          <strong>Error:</strong> {status.error}
          {status.details && <div className="error-details">{status.details}</div>}
        </div>
      )}

      {status.connected && status.details && (
        <div className="success-message">
          <strong>Connected!</strong>
          <div className="success-details">{status.details}</div>
        </div>
      )}
    </div>
  );
}