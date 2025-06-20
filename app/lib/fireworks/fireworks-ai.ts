// {
//     "name": "accounts/fireworks/models/qwen3-30b-a3b",
//     "title": "Qwen3 30B-A3B",
//     "description": "Latest Qwen3 state of the art model, 30B with 3B active parameter model",
//     "provider": {
//       "name": "Qwen",
//       "hf": "Qwen",
//       "org": {
//         "name": "Qwen",
//         "logos": {
//           "logomark": {
//             "src": "/images/logos/qwen-icon.svg"
//           }
//         }
//       }
//     },
//     "type": "text",
//     "serverless": true,
//     "contextLength": 40000,
//     "supportsImageInput": false,
//     "tags": [
//       "Serverless",
//       "LLM",
//       "Chat",
//       "Function Calling",
//       "On-demand"
//     ],
//     "cost": {
//       "inputTokenPrice": 0.15,
//       "outputTokenPrice": 0.6,
//       "tokenPrice": 0.15
//     }
//   },
export interface FireworksModel {
    name: string;
    title: string;
    description: string;
    provider: {
        name: string;
        hf: string;
        org: {
            name: string;
            logos: {
                logomark: {
                    src: string;
                };
            };
        };
    };
    type: string;
    serverless: boolean;
    contextLength: number;
    supportsImageInput: boolean;
    tags: string[];
    cost: {
        inputTokenPrice: number;
        outputTokenPrice: number;
        tokenPrice: number;
    };
}

export interface FireworksMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface FireworksChatRequest {
    model: string;
    messages: FireworksMessage[];
    stream?: boolean;
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    top_k?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
}

export interface FireworksChatResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        message: FireworksMessage;
        finish_reason: string | null;
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

export interface IFireworksAI {
    getModels(): Promise<FireworksModel[]>;
    createChatCompletion(request: FireworksChatRequest): Promise<FireworksChatResponse>;
    createChatCompletionStream(request: FireworksChatRequest): Promise<ReadableStream>;
}