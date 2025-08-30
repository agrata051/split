import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Calendar, BarChart3, Plus, Edit3, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Event } from '../types';
import { 
  getEvents, 
  deleteEvent, 
  getParticipantsByEvent, 
  getActivitiesByEvent 
} from '../utils/localStorage';
import { formatCurrency } from '../utils/calculations';

interface AdminPortalProps {
  onBack: () => void;
  onEditEvent: (eventId: string) => void;
}

export function AdminPortal({ onBack, onEditEvent }: AdminPortalProps) {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'users' | 'events' | 'analytics'>('dashboard');
  const [events, setEvents] = useState<Event[]>([]);
  const [eventStats, setEventStats] = useState<Record<string, { participants: number; activities: number; total: number }>>({});
  const { profile } = useAuth();

  useEffect(() => {
    if (profile?.role === 'admin' || profile?.role === 'superadmin') {
      loadAdminData();
    }
  }, [profile]);

  const loadAdminData = () => {
    const allEvents = getEvents();
    setEvents(allEvents);

    // Calculate stats for each event
    const stats: Record<string, any> = {};
    allEvents.forEach(event => {
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
    loadAdminData(); // Refresh the data
  };

  // Mock users data for admin view
  const mockUsers = [
    { id: '1', name: 'Admin User', email: 'admin@fairsplit.com', role: 'admin', created_at: new Date().toISOString() },
    { id: '2', name: 'Regular User', email: 'user@fairsplit.com', role: 'user', created_at: new Date().toISOString() },
    { id: '3', name: 'Ram Sharma', email: 'ram@example.com', role: 'user', created_at: new Date().toISOString() },
    { id: '4', name: 'Sita Poudel', email: 'sita@example.com', role: 'user', created_at: new Date().toISOString() }
  ];

  const totalParticipants = Object.values(eventStats).reduce((sum, stat) => sum + stat.participants, 0);
  const totalExpenses = Object.values(eventStats).reduce((sum, stat) => sum + stat.total, 0);

  const stats = [
    { label: 'Total Users', value: mockUsers.length.toString(), change: '+12%', color: 'from-blue-500 to-cyan-500' },
    { label: 'Active Events', value: events.length.toString(), change: '+5%', color: 'from-green-500 to-emerald-500' },
    { label: 'Total Expenses', value: formatCurrency(totalExpenses), change: '+18%', color: 'from-purple-500 to-pink-500' },
    { label: 'Participants', value: totalParticipants.toString(), change: '+8%', color: 'from-orange-500 to-red-500' }
  ];

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900"
    >
      <div className="flex">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          className="w-64 bg-black/20 backdrop-blur-lg border-r border-white/10 min-h-screen p-6"
        >
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold">Admin Portal</h2>
              <p className="text-white/60 text-sm">FairSplit</p>
            </div>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as any)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                  activeSection === item.id
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-8">
            <Button variant="outline" size="sm" onClick={onBack} className="w-full">
              Back to App
            </Button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
              </h1>
              <p className="text-white/70">Manage your FairSplit platform</p>
            </div>

            {activeSection === 'dashboard' && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card>
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl`} />
                          <span className="text-green-400 text-sm font-medium">{stat.change}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                        <p className="text-white/70">{stat.label}</p>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Recent Activity */}
                <Card>
                  <h3 className="text-xl font-semibold text-white mb-6">Recent Events</h3>
                  <div className="space-y-4">
                    {events.slice(0, 5).map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                      >
                        <div>
                          <p className="text-white font-medium">{event.name}</p>
                          <p className="text-white/70 text-sm">
                            {eventStats[event.id]?.participants || 0} participants • {formatCurrency(eventStats[event.id]?.total || 0)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => onEditEvent(event.id)}>
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <span className="text-white/50 text-sm">
                            {new Date(event.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                    {events.length === 0 && (
                      <p className="text-white/50 text-center py-8">No events created yet</p>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {activeSection === 'users' && (
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">User Management</h3>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left text-white/80 pb-3">Name</th>
                        <th className="text-left text-white/80 pb-3">Email</th>
                        <th className="text-left text-white/80 pb-3">Role</th>
                        <th className="text-left text-white/80 pb-3">Joined</th>
                        <th className="text-left text-white/80 pb-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockUsers.map((user, index) => (
                        <tr key={index} className="border-b border-white/10">
                          <td className="py-3 text-white">{user.name}</td>
                          <td className="py-3 text-white/70">{user.email}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                            }`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 text-white/70">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {activeSection === 'events' && (
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Event Management</h3>
                  <p className="text-white/70">Total: {events.length} events</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {events.map((event, index) => (
                    <Card key={event.id} hoverable>
                      <div className="mb-4">
                        <h4 className="font-semibold text-white mb-2">{event.name}</h4>
                        {event.description && (
                          <p className="text-white/60 text-sm mb-2">{event.description}</p>
                        )}
                        <div className="space-y-1 text-sm text-white/70">
                          <p>Created: {new Date(event.created_at).toLocaleDateString()}</p>
                          <p>Participants: {eventStats[event.id]?.participants || 0}</p>
                          <p>Activities: {eventStats[event.id]?.activities || 0}</p>
                          <p className="text-green-400 font-medium">
                            Total: {formatCurrency(eventStats[event.id]?.total || 0)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-300">
                          Active
                        </span>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => onEditEvent(event.id)}>
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {events.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <Calendar className="w-16 h-16 text-white/50 mx-auto mb-4" />
                      <p className="text-white/70">No events created yet</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {activeSection === 'analytics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <h3 className="text-xl font-semibold text-white mb-4">Platform Overview</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-white/80">Total Events</span>
                        <span className="text-white font-bold">{events.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/80">Total Participants</span>
                        <span className="text-white font-bold">{totalParticipants}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/80">Total Expenses</span>
                        <span className="text-green-400 font-bold">{formatCurrency(totalExpenses)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/80">Average per Event</span>
                        <span className="text-blue-400 font-bold">
                          {events.length > 0 ? formatCurrency(totalExpenses / events.length) : formatCurrency(0)}
                        </span>
                      </div>
                    </div>
                  </Card>
                  
                  <Card>
                    <h3 className="text-xl font-semibold text-white mb-4">Event Activity</h3>
                    <div className="space-y-3">
                      {events.slice(0, 4).map((event, index) => (
                        <div key={event.id} className="flex items-center justify-between">
                          <span className="text-white/80">{event.name}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 h-2 bg-white/20 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                                style={{ 
                                  width: `${Math.min(100, ((eventStats[event.id]?.total || 0) / Math.max(totalExpenses, 1)) * 100)}%` 
                                }}
                              />
                            </div>
                            <span className="text-white text-sm">
                              {formatCurrency(eventStats[event.id]?.total || 0)}
                            </span>
                          </div>
                        </div>
                      ))}
                      {events.length === 0 && (
                        <p className="text-white/50 text-center py-4">No activity data available</p>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}