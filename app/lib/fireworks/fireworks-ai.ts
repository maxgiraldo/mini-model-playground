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

export interface FireworksAI {
    getModels(): Promise<FireworksModel[]>;
    createCompletion(request: FireworksChatRequest): Promise<FireworksChatResponse>;
    createCompletionStream(request: FireworksChatRequest): Promise<ReadableStream>;
}