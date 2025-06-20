import { IFireworksAI, FireworksChatRequest, FireworksChatResponse, FireworksModel } from "./fireworks-ai";

export class MockFireworksSDK implements IFireworksAI {
  private mockModels: FireworksModel[] = [
    {
      name: 'accounts/fireworks/models/qwen3-30b-a3b',
      title: 'Qwen3 30B-A3B',
      description: 'Latest Qwen3 state of the art model, 30B with 3B active parameter model',
      provider: {
        name: 'Qwen',
        hf: 'Qwen',
        org: {
          name: 'Qwen',
          logos: {
            logomark: {
              src: '/images/logos/qwen-icon.svg'
            }
          }
        }
      },
      type: 'text',
      serverless: true,
      contextLength: 40000,
      supportsImageInput: false,
      tags: ['Serverless', 'LLM', 'Chat', 'Function Calling', 'On-demand'],
      cost: {
        inputTokenPrice: 0.15,
        outputTokenPrice: 0.6,
        tokenPrice: 0.15
      }
    },
    {
      name: 'accounts/fireworks/models/llama-v3-8b-instruct',
      title: 'Llama v3 8B Instruct',
      description: 'Meta\'s latest Llama model optimized for instruction following',
      provider: {
        name: 'Meta',
        hf: 'meta-llama',
        org: {
          name: 'Meta',
          logos: {
            logomark: {
              src: '/images/logos/meta-icon.svg'
            }
          }
        }
      },
      type: 'text',
      serverless: true,
      contextLength: 8192,
      supportsImageInput: false,
      tags: ['Serverless', 'LLM', 'Chat', 'On-demand'],
      cost: {
        inputTokenPrice: 0.1,
        outputTokenPrice: 0.4,
        tokenPrice: 0.1
      }
    }
  ];

  async getModels(): Promise<FireworksModel[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.mockModels;
  }

  async createChatCompletion(request: FireworksChatRequest): Promise<FireworksChatResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Generate a mock response based on the request
    const mockContent = this.generateMockResponse(request.messages);
    
    return {
      id: `mock-chat-${Date.now()}`,
      object: 'chat.completion',
      created: Date.now(),
      model: request.model,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: mockContent
        },
        finish_reason: 'stop'
      }],
      usage: {
        prompt_tokens: this.calculateMockTokens(request.messages),
        completion_tokens: this.calculateMockTokens([{ role: 'assistant', content: mockContent }]),
        total_tokens: this.calculateMockTokens(request.messages) + this.calculateMockTokens([{ role: 'assistant', content: mockContent }])
      }
    };
  }

  async createChatCompletionStream(request: FireworksChatRequest): Promise<ReadableStream> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const mockContent = this.generateMockResponse(request.messages);
    const words = mockContent.split(' ');
    
    return new ReadableStream({
      start: (controller) => {
        const encoder = new TextEncoder();
        
        // Send initial data
        const initialData = {
          id: `mock-stream-${Date.now()}`,
          object: 'chat.completion.chunk',
          created: Date.now(),
          model: request.model,
          choices: [{
            index: 0,
            delta: { role: 'assistant' },
            finish_reason: null
          }]
        };
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`));
        
        // Stream words with delays
        let wordIndex = 0;
        const streamWords = () => {
          if (wordIndex < words.length) {
            const word = words[wordIndex];
            const chunkData = {
              id: `mock-stream-${Date.now()}`,
              object: 'chat.completion.chunk',
              created: Date.now(),
              model: request.model,
              choices: [{
                index: 0,
                delta: { content: wordIndex === 0 ? word : ` ${word}` },
                finish_reason: null
              }]
            };
            
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunkData)}\n\n`));
            wordIndex++;
            
            // Schedule next word
            setTimeout(streamWords, 50);
          } else {
            // Send final chunk
            const finalData = {
              id: `mock-stream-${Date.now()}`,
              object: 'chat.completion.chunk',
              created: Date.now(),
              model: request.model,
              choices: [{
                index: 0,
                delta: {},
                finish_reason: 'stop'
              }]
            };
            
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalData)}\n\n`));
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          }
        };
        
        // Start streaming
        setTimeout(streamWords, 100);
      }
    });
  }

  private generateMockResponse(messages: any[]): string {
    const lastMessage = messages[messages.length - 1];
    const content = lastMessage?.content || '';
    
    // Generate different responses based on the input
    if (content.toLowerCase().includes('hello') || content.toLowerCase().includes('hi')) {
      return "Hello! I'm a mock AI assistant. How can I help you today?";
    } else if (content.toLowerCase().includes('weather')) {
      return "The weather is sunny and 72°F with a light breeze. Perfect day for a walk!";
    } else if (content.toLowerCase().includes('joke')) {
      return "Why don't scientists trust atoms? Because they make up everything! 😄";
    } else if (content.toLowerCase().includes('help')) {
      return "I'm here to help! I can answer questions, tell jokes, discuss the weather, or just chat. What would you like to know?";
    } else {
      return "This is a mock response from the Fireworks AI SDK. In a real implementation, this would be the actual AI model's response to your message.";
    }
  }

  private calculateMockTokens(messages: any[]): number {
    // Simple token calculation - roughly 4 characters per token
    const totalChars = messages.reduce((sum, msg) => sum + msg.content.length, 0);
    return Math.ceil(totalChars / 4);
  }
}

export const mockFireworks = () => new MockFireworksSDK();
