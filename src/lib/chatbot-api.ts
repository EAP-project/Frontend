// Chatbot API service

import { ChatbotRequest, ChatbotResponse, ChatbotError } from '@/types/chatbot';

const CHATBOT_API_URL = 'http://localhost:5000/chat';
const REQUEST_TIMEOUT = 10000; // 10 seconds

export async function sendChatMessage(message: string): Promise<ChatbotResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(CHATBOT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message } as ChatbotRequest),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData: ChatbotError = await response.json().catch(() => ({
        error: 'Unknown error',
      }));
      throw new Error(errorData.message || errorData.error || 'Failed to get response');
    }

    const data: ChatbotResponse = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      throw error;
    }

    throw new Error('An unexpected error occurred. Please try again.');
  }
}
