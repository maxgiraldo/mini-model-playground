import { IFireworksAI, FireworksChatRequest, FireworksChatResponse, FireworksModel } from "./fireworks-ai";

export class FireworksSDK implements IFireworksAI {
  private apiKey: string;
  private baseUrl: string = 'https://api.fireworks.ai/inference/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getModels(): Promise<FireworksModel[]> {
    const response = await fetch('https://app.fireworks.ai/api/models/mini-playground');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }
    
    return response.json();
  }

  async createChatCompletion(request: FireworksChatRequest): Promise<FireworksChatResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Chat completion failed: ${response.statusText}`);
    }

    return response.json();
  }

  async createChatCompletionStream(request: FireworksChatRequest): Promise<ReadableStream> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...request,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Streaming chat completion failed: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    return response.body;
  }
}

export const fireworks = (apiKey: string) => new FireworksSDK(apiKey);