import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Users, Receipt, Calculator } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { Participant, Activity, Settlement, Event } from '../types';
import { calculateSettlements, formatCurrency } from '../utils/calculations';
import {
  saveEvent,
  getEventById,
  saveParticipant,
  getParticipantsByEvent,
  deleteParticipant,
  saveActivity,
  getActivitiesByEvent,
  deleteActivity,
  generateId
} from '../utils/localStorage';

interface EventManagementProps {
  eventId?: string | null;
  onBack: () => void;
}

export function EventManagement({ eventId, onBack }: EventManagementProps) {
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [activeTab, setActiveTab] = useState<'participants' | 'activities' | 'settlements'>('participants');
  const [currentEventId, setCurrentEventId] = useState<string | null>(eventId);

  // Form states
  const [newParticipant, setNewParticipant] = useState({ name: '', email: '', phone: '' });
  const [newActivity, setNewActivity] = useState({
    description: '',
    amount: '',
    paid_by: '',
    participants: [] as string[]
  });

  const { user } = useAuth();

  useEffect(() => {
    if (eventId) {
      loadEvent(eventId);
    }
  }, [eventId]);

  useEffect(() => {
    if (participants.length > 0 && activities.length > 0) {
      const calculatedSettlements = calculateSettlements(participants, activities);
      setSettlements(calculatedSettlements);
    } else {
      setSettlements([]);
    }
  }, [participants, activities]);

  const loadEvent = (id: string) => {
    const event = getEventById(id);
    if (event) {
      setEventName(event.name);
      setEventDescription(event.description || '');
      setCurrentEventId(id);
      
      const eventParticipants = getParticipantsByEvent(id);
      const eventActivities = getActivitiesByEvent(id);
      
      setParticipants(eventParticipants);
      setActivities(eventActivities);
    }
  };

  const handleSaveEvent = () => {
    if (!eventName.trim() || !user) return;

    let eventIdToUse = currentEventId;

    if (!eventIdToUse) {
      // Create new event
      eventIdToUse = generateId();
      setCurrentEventId(eventIdToUse);
    }

    const event: Event = {
      id: eventIdToUse,
      name: eventName,
      description: eventDescription || undefined,
      created_by: user.id,
      created_at: currentEventId ? getEventById(currentEventId)?.created_at || new Date().toISOString() : new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    saveEvent(event);
  };

  const addParticipant = () => {
    if (!newParticipant.name.trim()) return;
    
    // Save event first if it doesn't exist
    if (!currentEventId) {
      handleSaveEvent();
    }

    const participant: Participant = {
      id: generateId(),
      event_id: currentEventId!,
      name: newParticipant.name,
      email: newParticipant.email || undefined,
      phone: newParticipant.phone || undefined
    };

    saveParticipant(participant);
    setParticipants([...participants, participant]);
    setNewParticipant({ name: '', email: '', phone: '' });
  };

  const addActivity = () => {
    if (!newActivity.description.trim() || !newActivity.amount || !newActivity.paid_by || newActivity.participants.length === 0) {
      return;
    }
    
    // Save event first if it doesn't exist
    if (!currentEventId) {
      handleSaveEvent();
    }

    const activity: Activity = {
      id: generateId(),
      event_id: currentEventId!,
      description: newActivity.description,
      amount: parseFloat(newActivity.amount),
      paid_by: newActivity.paid_by,
      participants: newActivity.participants,
      created_at: new Date().toISOString()
    };

    saveActivity(activity);
    setActivities([...activities, activity]);
    setNewActivity({
      description: '',
      amount: '',
      paid_by: '',
      participants: []
    });
  };

  const removeParticipant = (id: string) => {
    deleteParticipant(id);
    setParticipants(participants.filter(p => p.id !== id));
    setActivities(activities.filter(a => a.paid_by !== id && !a.participants.includes(id)));
  };

  const removeActivity = (id: string) => {
    deleteActivity(id);
    setActivities(activities.filter(a => a.id !== id));
  };

  const getParticipantName = (id: string) => {
    return participants.find(p => p.id === id)?.name || 'Unknown';
  };

  const tabs = [
    { id: 'participants', label: 'Participants', icon: Users, count: participants.length },
    { id: 'activities', label: 'Activities', icon: Receipt, count: activities.length },
    { id: 'settlements', label: 'Settlements', icon: Calculator, count: settlements.length }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 z-50 overflow-y-auto"
    >
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center space-x-4">
              <Button variant="secondary" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Enter event name..."
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    onBlur={handleSaveEvent}
                    className="text-2xl font-bold bg-transparent text-white placeholder-white/50 border-none outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Event description (optional)"
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    onBlur={handleSaveEvent}
                    className="text-lg bg-transparent text-white/80 placeholder-white/50 border-none outline-none"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-8 bg-white/10 backdrop-blur-sm p-1 rounded-2xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-purple-900 shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  activeTab === tab.id ? 'bg-purple-100 text-purple-900' : 'bg-white/20 text-white'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'participants' && (
              <motion.div
                key="participants"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <Card>
                  <h3 className="text-xl font-semibold text-white mb-4">Add Participant</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                      type="text"
                      placeholder="Name *"
                      value={newParticipant.name}
                      onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                      className="bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/50"
                    />
                    <input
                      type="email"
                      placeholder="Email (optional)"
                      value={newParticipant.email}
                      onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })}
                      className="bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/50"
                    />
                    <input
                      type="tel"
                      placeholder="Phone (optional)"
                      value={newParticipant.phone}
                      onChange={(e) => setNewParticipant({ ...newParticipant, phone: e.target.value })}
                      className="bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/50"
                    />
                    <Button onClick={addParticipant}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {participants.map((participant) => (
                    <Card key={participant.id} hoverable>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-white">{participant.name}</h4>
                          {participant.email && (
                            <p className="text-white/70 text-sm">{participant.email}</p>
                          )}
                          {participant.phone && (
                            <p className="text-white/70 text-sm">{participant.phone}</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeParticipant(participant.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'activities' && (
              <motion.div
                key="activities"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <Card>
                  <h3 className="text-xl font-semibold text-white mb-4">Add Activity</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Activity description *"
                      value={newActivity.description}
                      onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                      className="bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/50"
                    />
                    <input
                      type="number"
                      placeholder="Amount (NPR) *"
                      value={newActivity.amount}
                      onChange={(e) => setNewActivity({ ...newActivity, amount: e.target.value })}
                      className="bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/50"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-white/80 mb-2">Who paid?</label>
                    <select
                      value={newActivity.paid_by}
                      onChange={(e) => setNewActivity({ ...newActivity, paid_by: e.target.value })}
                      className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white"
                    >
                      <option value="">Select who paid</option>
                      {participants.map((participant) => (
                        <option key={participant.id} value={participant.id} className="text-gray-900">
                          {participant.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-white/80 mb-2">Who was involved?</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {participants.map((participant) => (
                        <label key={participant.id} className="flex items-center space-x-2 text-white">
                          <input
                            type="checkbox"
                            checked={newActivity.participants.includes(participant.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewActivity({
                                  ...newActivity,
                                  participants: [...newActivity.participants, participant.id]
                                });
                              } else {
                                setNewActivity({
                                  ...newActivity,
                                  participants: newActivity.participants.filter(id => id !== participant.id)
                                });
                              }
                            }}
                            className="rounded"
                          />
                          <span>{participant.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <Button onClick={addActivity} disabled={participants.length === 0}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Activity
                  </Button>
                </Card>

                <div className="space-y-4">
                  {activities.map((activity) => (
                    <Card key={activity.id}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-white">{activity.description}</h4>
                            <span className="text-2xl font-bold text-green-400">
                              {formatCurrency(activity.amount)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-white/70">
                            <span>Paid by: <span className="text-white font-medium">{getParticipantName(activity.paid_by)}</span></span>
                            <span>Split among: {activity.participants.length} people</span>
                          </div>
                          <div className="mt-2">
                            <span className="text-white/70">Participants: </span>
                            <span className="text-white">
                              {activity.participants.map(id => getParticipantName(id)).join(', ')}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeActivity(activity.id)}
                          className="text-red-400 hover:text-red-300 transition-colors ml-4"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'settlements' && (
              <motion.div
                key="settlements"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {settlements.length === 0 ? (
                  <Card>
                    <div className="text-center py-12">
                      <Calculator className="w-16 h-16 text-white/50 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No Settlements Yet</h3>
                      <p className="text-white/70">Add participants and activities to see settlement calculations</p>
                    </div>
                  </Card>
                ) : (
                  <>
                    <Card>
                      <h3 className="text-xl font-semibold text-white mb-4">Settlement Summary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-white/80 mb-2">Total Expenses</h4>
                          <p className="text-3xl font-bold text-green-400">
                            {formatCurrency(activities.reduce((sum, activity) => sum + activity.amount, 0))}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-white/80 mb-2">Transactions Needed</h4>
                          <p className="text-3xl font-bold text-blue-400">{settlements.length}</p>
                        </div>
                      </div>
                    </Card>

                    <div className="space-y-4">
                      {settlements.map((settlement, index) => (
                        <motion.div
                          key={`${settlement.from}-${settlement.to}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card hoverable>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                                  <span className="text-white font-bold text-lg">
                                    {getParticipantName(settlement.from).charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-white font-medium">
                                    {getParticipantName(settlement.from)}
                                  </p>
                                  <p className="text-white/70 text-sm">owes</p>
                                </div>
                              </div>
                              
                              <div className="text-center">
                                <p className="text-2xl font-bold text-yellow-400">
                                  {formatCurrency(settlement.amount)}
                                </p>
                              </div>
                              
                              <div className="flex items-center space-x-4">
                                <div className="text-right">
                                  <p className="text-white font-medium">
                                    {getParticipantName(settlement.to)}
                                  </p>
                                  <p className="text-white/70 text-sm">receives</p>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                                  <span className="text-white font-bold text-lg">
                                    {getParticipantName(settlement.to).charAt(0)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}