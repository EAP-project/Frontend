// Chatbot TypeScript interfaces

export interface ChatMessage {
  role: 'user' | 'bot';
  message: string;
  slots?: AvailableSlot[];
  timestamp: Date;
}

export interface AvailableSlot {
  id: number;
  sessionPeriod: 'MORNING' | 'AFTERNOON';
  slotNumber: number;
  startTime: string;
  endTime: string;
  slotDescription: string;
  isAvailable: boolean;
}

export interface ChatbotRequest {
  message: string;
}

export interface ChatbotResponse {
  response: string;
  slots_data?: {
    available_slots: AvailableSlot[];
  };
  intent?: string;
}

export interface ChatbotError {
  error: string;
  message?: string;
}
