import { Event, Participant, Activity } from '../types';

const STORAGE_KEYS = {
  EVENTS: 'fairsplit_events',
  PARTICIPANTS: 'fairsplit_participants',
  ACTIVITIES: 'fairsplit_activities'
};

// Event operations
export function saveEvent(event: Event): void {
  const events = getEvents();
  const existingIndex = events.findIndex(e => e.id === event.id);
  
  if (existingIndex >= 0) {
    events[existingIndex] = { ...event, updated_at: new Date().toISOString() };
  } else {
    events.push(event);
  }
  
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
}

export function getEvents(): Event[] {
  const stored = localStorage.getItem(STORAGE_KEYS.EVENTS);
  return stored ? JSON.parse(stored) : [];
}

export function getEventsByUser(userId: string): Event[] {
  return getEvents().filter(event => event.created_by === userId);
}

export function getEventById(id: string): Event | null {
  const events = getEvents();
  return events.find(event => event.id === id) || null;
}

export function deleteEvent(id: string): void {
  const events = getEvents().filter(event => event.id !== id);
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  
  // Also delete related participants and activities
  deleteParticipantsByEvent(id);
  deleteActivitiesByEvent(id);
}

// Participant operations
export function saveParticipant(participant: Participant): void {
  const participants = getParticipants();
  const existingIndex = participants.findIndex(p => p.id === participant.id);
  
  if (existingIndex >= 0) {
    participants[existingIndex] = participant;
  } else {
    participants.push(participant);
  }
  
  localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(participants));
}

export function getParticipants(): Participant[] {
  const stored = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
  return stored ? JSON.parse(stored) : [];
}

export function getParticipantsByEvent(eventId: string): Participant[] {
  return getParticipants().filter(participant => participant.event_id === eventId);
}

export function deleteParticipant(id: string): void {
  const participants = getParticipants().filter(participant => participant.id !== id);
  localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(participants));
  
  // Remove participant from activities
  const activities = getActivities();
  const updatedActivities = activities.map(activity => ({
    ...activity,
    participants: activity.participants.filter(pId => pId !== id)
  })).filter(activity => activity.paid_by !== id && activity.participants.length > 0);
  
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updatedActivities));
}

export function deleteParticipantsByEvent(eventId: string): void {
  const participants = getParticipants().filter(participant => participant.event_id !== eventId);
  localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(participants));
}

// Activity operations
export function saveActivity(activity: Activity): void {
  const activities = getActivities();
  const existingIndex = activities.findIndex(a => a.id === activity.id);
  
  if (existingIndex >= 0) {
    activities[existingIndex] = activity;
  } else {
    activities.push(activity);
  }
  
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
}

export function getActivities(): Activity[] {
  const stored = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
  return stored ? JSON.parse(stored) : [];
}

export function getActivitiesByEvent(eventId: string): Activity[] {
  return getActivities().filter(activity => activity.event_id === eventId);
}

export function deleteActivity(id: string): void {
  const activities = getActivities().filter(activity => activity.id !== id);
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
}

export function deleteActivitiesByEvent(eventId: string): void {
  const activities = getActivities().filter(activity => activity.event_id !== eventId);
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
}

// Generate unique ID
export function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}