export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'superadmin';
  created_at: string;
}

export interface Event {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Participant {
  id: string;
  event_id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface Activity {
  id: string;
  event_id: string;
  description: string;
  amount: number;
  paid_by: string;
  participants: string[];
  created_at: string;
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export interface EventData {
  event: Event;
  participants: Participant[];
  activities: Activity[];
  settlements: Settlement[];
}