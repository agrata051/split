import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Shield } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { UserDashboard } from './components/UserDashboard';
import { LandingPage } from './components/LandingPage';
import { EventManagement } from './components/EventManagement';
import { AdminPortal } from './components/AdminPortal';

type View = 'landing' | 'dashboard' | 'event' | 'admin';

function AppContent() {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // If user is logged in, show dashboard by default
  if (user && currentView === 'landing') {
    setCurrentView('dashboard');
  }

  const handleCreateEvent = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setEditingEventId(null);
    setCurrentView('event');
  };

  const handleEditEvent = (eventId: string) => {
    setEditingEventId(eventId);
    setCurrentView('event');
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {currentView === 'landing' && !user && (
          <LandingPage 
            key="landing"
            onCreateEvent={handleCreateEvent}
            onSignIn={() => setAuthModalOpen(true)}
          />
        )}
        
        {currentView === 'dashboard' && user && (
          <UserDashboard
            key="dashboard"
            onCreateEvent={handleCreateEvent}
            onEditEvent={handleEditEvent}
          />
        )}
        
        {currentView === 'event' && (
          <EventManagement 
            key="event"
            eventId={editingEventId}
            onBack={() => setCurrentView(user ? 'dashboard' : 'landing')}
          />
        )}
        
        {currentView === 'admin' && isAdmin && (
          <AdminPortal 
            key="admin"
            onBack={() => setCurrentView(user ? 'dashboard' : 'landing')}
          />
        )}
      </AnimatePresence>

      {/* Admin Access Button */}
      {(currentView === 'dashboard' || currentView === 'landing') && isAdmin && (
        <button
          onClick={() => setCurrentView('admin')}
          className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-200 z-50"
        >
          <Shield className="w-5 h-5" />
        </button>
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;