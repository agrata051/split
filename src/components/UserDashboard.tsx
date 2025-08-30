import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Users, Receipt, Edit3, Trash2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { Event } from '../types';
import { formatCurrency } from '../utils/calculations';
import { 
  getEventsByUser, 
  deleteEvent, 
  getParticipantsByEvent, 
  getActivitiesByEvent 
} from '../utils/localStorage';

interface UserDashboardProps {
  onCreateEvent: () => void;
  onEditEvent: (eventId: string) => void;
}

export function UserDashboard({ onCreateEvent, onEditEvent }: UserDashboardProps) {
  const { profile, signOut } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [eventStats, setEventStats] = useState<Record<string, { participants: number; activities: number; total: number }>>({});

  useEffect(() => {
    if (profile) {
      loadEvents();
    }
  }, [profile]);

  const loadEvents = () => {
    if (!profile) return;
    
    const userEvents = getEventsByUser(profile.id);
    setEvents(userEvents);

    // Calculate stats for each event
    const stats: Record<string, any> = {};
    userEvents.forEach(event => {
      const participants = getParticipantsByEvent(event.id);
      const activities = getActivitiesByEvent(event.id);
      
      stats[event.id] = {
        participants: participants.length,
        activities: activities.length,
        total: activities.reduce((sum, a) => sum + a.amount, 0)
      };
    });
    setEventStats(stats);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    deleteEvent(eventId);
    loadEvents(); // Refresh the list
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
    >
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, {profile?.name}!
              </h1>
              <p className="text-white/70">Manage your events and track expenses</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={onCreateEvent}>
                <Plus className="w-4 h-4 mr-2" />
                New Event
              </Button>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{events.length}</p>
                  <p className="text-white/70">Total Events</p>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {Object.values(eventStats).reduce((sum, stat) => sum + stat.participants, 0)}
                  </p>
                  <p className="text-white/70">Total Participants</p>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(Object.values(eventStats).reduce((sum, stat) => sum + stat.total, 0))}
                  </p>
                  <p className="text-white/70">Total Expenses</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Events Grid */}
          {events.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-white/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Events Yet</h3>
                <p className="text-white/70 mb-6">Create your first event to start tracking expenses</p>
                <Button onClick={onCreateEvent}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Event
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card hoverable>
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-white mb-2">{event.name}</h3>
                      {event.description && (
                        <p className="text-white/70 text-sm">{event.description}</p>
                      )}
                    </div>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/70">Participants</span>
                        <span className="text-white font-medium">
                          {eventStats[event.id]?.participants || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/70">Activities</span>
                        <span className="text-white font-medium">
                          {eventStats[event.id]?.activities || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/70">Total Amount</span>
                        <span className="text-green-400 font-medium">
                          {formatCurrency(eventStats[event.id]?.total || 0)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditEvent(event.id)}
                        className="flex-1"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/20">
                      <p className="text-white/50 text-xs">
                        Created {new Date(event.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}