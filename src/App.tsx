import React, { useState, useEffect, useCallback } from 'react';
import type { EventItem, Registration, UserRole } from './types';
import { storageService } from './services/storage';
import { apiService } from './services/api';
import { Navbar } from './components/navigation/Navbar';
import { EventsDiscovery } from './components/events/EventsDiscovery';
import { MyTicketsView } from './components/tickets/MyTicketsView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { EventDetailModal } from './components/events/EventDetailModal';
import { RegistrationModal } from './components/registration/RegistrationModal';
import { TicketPassModal } from './components/tickets/TicketPassModal';
import { ToastProvider, useToast } from './components/ui/Toast';
import { ColorAura } from './components/background/ColorAura';
import { ShieldCheck, Heart } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { info, success } = useToast();

  const [currentView, setCurrentView] = useState<'events' | 'wallet' | 'admin'>('events');
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [activeUSN] = useState<string>('1JT22CS092');

  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  // Modals state
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<EventItem | null>(null);
  const [selectedEventForRegister, setSelectedEventForRegister] = useState<EventItem | null>(null);
  const [selectedTicketForPass, setSelectedTicketForPass] = useState<Registration | null>(null);

  // Load data from storage/API service
  const loadData = useCallback(() => {
    apiService.getEvents().then((loadedEvents) => {
      setEvents(loadedEvents);
    });
    const loadedRegistrations = storageService.getRegistrations();
    setRegistrations(loadedRegistrations);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Registrations for the active student USN
  const myRegistrations = registrations.filter(
    (r) => r.attendee.usn.toUpperCase() === activeUSN.toUpperCase()
  );

  const handleToggleRole = () => {
    if (userRole === 'student') {
      setUserRole('admin');
      setCurrentView('admin');
      info('Switched to Organizer Command', 'Full event management, attendee auditing, and QR terminal unlocked.');
    } else {
      setUserRole('student');
      setCurrentView('events');
      info('Switched to Student Portal', 'Browse chapter events and inspect your digital passes.');
    }
  };

  const handleResetDemoData = () => {
    if (confirm('Reset platform data to default demo state? Any custom created events will be restored to defaults.')) {
      storageService.resetAllData();
      loadData();
      success('Platform Reset', 'Demo events and initial registrations reloaded.');
    }
  };

  const handleOpenRegistration = (event: EventItem) => {
    setSelectedEventForDetail(null);
    setSelectedEventForRegister(event);
  };

  const handleRegistrationSuccess = (newReg: Registration) => {
    loadData();
    // Open the new ticket pass modal immediately
    setSelectedTicketForPass(newReg);
  };

  return (
    <div className="min-h-screen bg-[#060709] text-bone font-sans relative selection:bg-[#27FCF2] selection:text-black">
      {/* Dynamic Background Glow Canvas */}
      <ColorAura />
      <div className="fixed inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

      {/* Navigation Bar */}
      <Navbar
        currentView={currentView}
        onChangeView={(view) => {
          setCurrentView(view);
          if (view === 'admin') setUserRole('admin');
        }}
        userRole={userRole}
        onToggleRole={handleToggleRole}
        activeUSN={activeUSN}
        ticketCount={myRegistrations.length}
        onResetDemoData={handleResetDemoData}
      />

      {/* Main Page Body */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {currentView === 'events' && (
          <EventsDiscovery
            events={events}
            onViewDetails={(evt) => setSelectedEventForDetail(evt)}
            onRegister={handleOpenRegistration}
          />
        )}

        {currentView === 'wallet' && (
          <MyTicketsView
            registrations={myRegistrations}
            activeUSN={activeUSN}
            onSelectTicket={(reg) => setSelectedTicketForPass(reg)}
            onExploreEvents={() => setCurrentView('events')}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            events={events}
            registrations={registrations}
            onRefreshData={loadData}
            onOpenTicket={(reg) => setSelectedTicketForPass(reg)}
          />
        )}
      </main>

      {/* Modals */}
      <EventDetailModal
        event={selectedEventForDetail}
        onClose={() => setSelectedEventForDetail(null)}
        onRegisterClick={handleOpenRegistration}
      />

      <RegistrationModal
        event={selectedEventForRegister}
        onClose={() => setSelectedEventForRegister(null)}
        onSuccess={handleRegistrationSuccess}
      />

      <TicketPassModal
        registration={selectedTicketForPass}
        onClose={() => setSelectedTicketForPass(null)}
      />

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-[#07090e]/90 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-mist">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#8739D5] to-[#27FCF2] p-0.5">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#07090e]">
                <span className="font-mono text-xs font-black text-[#27FCF2]">ACM</span>
              </div>
            </div>
            <div>
              <p className="font-bold text-bone font-display">JYOTHY INSTITUTE OF TECHNOLOGY ACM STUDENT CHAPTER</p>
              <p className="text-[11px] font-mono text-mist/70">Centralized Event Management & Cryptographic Ticketing Engine</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> Zero-Overbooking Idempotency Guaranteed
            </span>
            <span className="text-dim">•</span>
            <span>Made with <Heart className="w-3.5 h-3.5 inline text-rose-500 fill-rose-500" /> for JIT Engineers</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <MainAppContent />
    </ToastProvider>
  );
}
