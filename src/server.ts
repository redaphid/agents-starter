import { routeAgentRequest, type Schedule } from "agents";

import { unstable_getSchedulePrompt } from "agents/schedule";

import { AIChatAgent } from "agents/ai-chat-agent";
import {
  createDataStreamResponse,
  generateId,
  streamText,
  type StreamTextOnFinishCallback,
  type ToolSet,
} from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { processToolCalls } from "./utils";
import { tools, executions } from "./tools";

// Store for dynamic LLM configuration
let currentLLMConfig: any = null;
let currentModel: any = null;

// Function to configure LLM based on user selection
export function configureLLM(config: any) {
  currentLLMConfig = config;
  
  if (config.provider === 'ollama') {
    const ollama = createOpenAI({
      apiKey: "ollama",
      baseURL: config.ollama.baseUrl + '/v1',
    });
    currentModel = ollama(config.ollama.model);
    console.log(`🦙 Configured Ollama: ${config.ollama.model} at ${config.ollama.baseUrl}`);
  } else if (config.provider === 'cloudflare') {
    const cloudflare = createOpenAI({
      apiKey: config.cloudflare.apiKey,
      baseURL: config.cloudflare.apiEndpoint,
    });
    currentModel = cloudflare(config.cloudflare.model);
    console.log(`☁️ Configured Cloudflare AI Gateway: ${config.cloudflare.model}`);
  }
}

/**
 * Chat Agent implementation that handles real-time AI chat interactions
 */
export class Chat extends AIChatAgent<Env> {
  /**
   * Handles incoming chat messages and manages the response stream
   * @param onFinish - Callback function executed when streaming completes
   */

  async onChatMessage(
    onFinish: StreamTextOnFinishCallback<ToolSet>,
    _options?: { abortSignal?: AbortSignal }
  ) {
    // const mcpConnection = await this.mcp.connect(
    //   "https://path-to-mcp-server/sse"
    // );

    // Collect all tools, including MCP tools
    const allTools = {
      ...tools,
      ...this.mcp.unstable_getAITools(),
    };

    // Create a streaming response that handles both text and tool outputs
    const dataStreamResponse = createDataStreamResponse({
      execute: async (dataStream) => {
        // Process any pending tool calls from previous messages
        // This handles human-in-the-loop confirmations for tools
        const processedMessages = await processToolCalls({
          messages: this.messages,
          dataStream,
          tools: allTools,
          executions,
        });

        // Stream the AI response using configured model
        if (!currentModel) {
          throw new Error('LLM not configured. Please configure connection first.');
        }
        
        const result = streamText({
          model: currentModel,
          system: `You are a helpful assistant that can do various tasks... 

${unstable_getSchedulePrompt({ date: new Date() })}

If the user asks to schedule a task, use the schedule tool to schedule the task.
`,
          messages: processedMessages,
          tools: allTools,
          onFinish: async (args) => {
            onFinish(
              args as Parameters<StreamTextOnFinishCallback<ToolSet>>[0]
            );
            // await this.mcp.closeConnection(mcpConnection.id);
          },
          onError: (error) => {
            console.error("Error while streaming:", error);
          },
          maxSteps: 10,
        });

        // Merge the AI response stream with tool execution outputs
        result.mergeIntoDataStream(dataStream);
      },
    });

    return dataStreamResponse;
  }
  async executeTask(description: string, _task: Schedule<string>) {
    await this.saveMessages([
      ...this.messages,
      {
        id: generateId(),
        role: "user",
        content: `Running scheduled task: ${description}`,
        createdAt: new Date(),
      },
    ]);
  }
}

/**
 * Worker entry point that routes incoming requests to the appropriate handler
 */
export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext) {
    const url = new URL(request.url);

    // Simple LLM endpoints for our connection system
    if (url.pathname === "/llm/test") {
      if (request.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
      }
      
      try {
        const config = await request.json() as any;
        
        if (config.provider === "ollama") {
          try {
            const testUrl = `${config.ollamaUrl}/api/tags`;
            const response = await fetch(testUrl);
            
            if (!response.ok) {
              return Response.json({
                success: false,
                error: "Ollama oracle remains silent",
                details: `HTTP ${response.status}: ${response.statusText}`
              });
            }
            
            const data = await response.json();
            const models = data.models || [];
            const hasModel = models.some((m: any) => m.name === config.ollamaModel);
            
            if (!hasModel && models.length > 0) {
              return Response.json({
                success: false,
                error: `Model '${config.ollamaModel}' not found in this dimension`,
                details: `Available models: ${models.map((m: any) => m.name).join(", ")}`
              });
            }
            
            return Response.json({
              success: true,
              details: `Connected to Ollama at ${config.ollamaUrl} with model ${config.ollamaModel}`
            });
          } catch (e) {
            return Response.json({
              success: false,
              error: "Failed to reach the local oracle",
              details: e instanceof Error ? e.message : "Unknown error"
            });
          }
        }
        
        if (config.provider === "cloudflare") {
          return Response.json({
            success: false,
            error: "Cloudflare gateway configuration pending",
            details: "This dimensional portal awaits implementation"
          });
        }
        
        return Response.json({
          success: false,
          error: "Unknown linguistic engine",
          details: `Provider '${config.provider}' is not recognized in this reality`
        });
      } catch (e) {
        return Response.json({
          success: false,
          error: "Configuration parsing failed",
          details: e instanceof Error ? e.message : "Invalid configuration format"
        });
      }
    }

    if (url.pathname === "/llm/status") {
      return Response.json({
        connected: false,
        provider: null,
        message: "No active neural pathways detected"
      });
    }

    // LLM API endpoints
    if (url.pathname === "/api/llm/test-connection") {
      if (request.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
      }
      
      try {
        const config = await request.json();
        const result = await testLLMConnection(config);
        return Response.json(result);
      } catch (error) {
        return Response.json({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    if (url.pathname === "/api/llm/list-models") {
      if (request.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
      }
      
      try {
        const { provider, config } = await request.json();
        const models = await listAvailableModels(provider, config);
        return Response.json({ models });
      } catch (error) {
        return Response.json({ models: [] });
      }
    }

    if (url.pathname === "/api/llm/configure") {
      if (request.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
      }
      
      try {
        const config = await request.json();
        configureLLM(config);
        return Response.json({ success: true });
      } catch (error) {
        return Response.json({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return (
      // Route the request to our agent or return 404 if not found
      (await routeAgentRequest(request, env)) ||
      new Response("Not found", { status: 404 })
    );
  },
} satisfies ExportedHandler<Env>;

// Test LLM connection
async function testLLMConnection(config: any) {
  try {
    if (config.provider === 'ollama') {
      // Test Ollama connection
      const response = await fetch(`${config.ollama.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`Ollama API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const models = data.models || [];
      const modelExists = models.some((m: any) => m.name === config.ollama.model);
      
      if (!modelExists && models.length > 0) {
        return {
          success: false,
          error: `Model '${config.ollama.model}' not found`,
          details: `Available models: ${models.map((m: any) => m.name).join(', ')}`,
        };
      }
      
      return {
        success: true,
        details: `Connected to Ollama at ${config.ollama.baseUrl} with model ${config.ollama.model}`,
      };
    } else if (config.provider === 'cloudflare') {
      // Test Cloudflare AI Gateway connection
      if (!config.cloudflare.apiKey) {
        return {
          success: false,
          error: "API key is required for Cloudflare AI Gateway",
        };
      }
      
      // Make a minimal API call to test the connection
      const testPayload = {
        model: config.cloudflare.model,
        messages: [{ role: "user", content: "test" }],
        max_tokens: 1,
      };
      
      const response = await fetch(`${config.cloudflare.apiEndpoint}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${config.cloudflare.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testPayload),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Cloudflare API returned ${response.status}: ${errorText}`);
      }
      
      return {
        success: true,
        details: `Connected to Cloudflare AI Gateway with model ${config.cloudflare.model}`,
      };
    }
    
    return {
      success: false,
      error: "Invalid provider selected",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      details: error instanceof Error ? error.stack : undefined,
    };
  }
}

// List available models
async function listAvailableModels(provider: string, config: any) {
  if (provider === 'ollama') {
    try {
      const response = await fetch(`${config.ollama.baseUrl}/api/tags`);
      const data = await response.json();
      return (data.models || []).map((m: any) => m.name);
    } catch (error) {
      console.error('Failed to fetch Ollama models:', error);
      return [];
    }
  } else if (provider === 'cloudflare') {
    // Cloudflare doesn't have a list models endpoint, return common models
    return [
      '@cf/meta/llama-3-8b-instruct',
      '@cf/meta/llama-2-7b-chat-int8',
      '@cf/mistral/mistral-7b-instruct-v0.1',
      '@cf/openai/whisper',
    ];
  }
  return [];
}
