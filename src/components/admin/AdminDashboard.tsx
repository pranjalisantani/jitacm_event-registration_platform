import React, { useState } from 'react';
import type { EventItem, Registration, CheckInVerificationResult } from '../../types';
import { storageService } from '../../services/storage';
import { sound } from '../../utils/audio';
import { useToast } from '../ui/Toast';
import { 
  Users, 
  Calendar, 
  Plus, 
  Search, 
  Download, 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  BarChart3, 
  Clock, 
  IndianRupee, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  Camera, 
  ScanLine 
} from 'lucide-react';

interface AdminDashboardProps {
  events: EventItem[];
  registrations: Registration[];
  onRefreshData: () => void;
  onOpenTicket: (reg: Registration) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  events,
  registrations,
  onRefreshData,
  onOpenTicket,
}) => {
  const { success, error, warning } = useToast();

  const [activeTab, setActiveTab] = useState<'events' | 'participants' | 'checkin' | 'analytics'>('events');

  // Participant search & filter
  const [participantSearch, setParticipantSearch] = useState('');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'attended' | 'pending'>('all');

  // QR Scanner Terminal state
  const [scannedInput, setScannedInput] = useState('');
  const [scannerEventFilter, setScannerEventFilter] = useState<string>('all');
  const [lastCheckInResult, setLastCheckInResult] = useState<CheckInVerificationResult | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // New Event Modal state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventFormData, setEventFormData] = useState({
    title: '',
    tagline: '',
    description: '',
    category: 'Workshop' as EventItem['category'],
    mode: 'in-person' as EventItem['mode'],
    venue: 'JIT Campus',
    date: '2026-10-30',
    time: '10:00 AM - 04:00 PM',
    registrationDeadline: '2026-10-29T23:59:59Z',
    bannerUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    fee: 99,
    capacity: 80,
    tags: 'ACM, Workshop, Tech',
    organizerEmail: 'acm.organizer@jyothyit.ac.in',
    organizerPhone: '+91 98450 12345',
  });

  // Calculate high-level metrics
  const totalRevenue = registrations.reduce((sum, r) => sum + (r.payment.status === 'paid' ? r.payment.amount : 0), 0);
  const totalCapacity = events.reduce((sum, e) => sum + e.capacity, 0);
  const totalRegistrations = registrations.length;
  const totalCheckedIn = registrations.filter((r) => r.checkIn.isCheckedIn).length;
  const overallFillRate = totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 0;
  const overallCheckInRate = totalRegistrations > 0 ? Math.round((totalCheckedIn / totalRegistrations) * 100) : 0;

  // Handle QR Check-in Terminal verification
  const handleVerifyCheckIn = (inputToVerify?: string) => {
    sound.playClick();
    const target = (inputToVerify || scannedInput).trim();
    if (!target) {
      warning('Input Required', 'Please enter or scan a ticket number or QR verification token.');
      return;
    }

    const result = storageService.verifyAndCheckInTicket(target, scannerEventFilter);
    setLastCheckInResult(result);

    if (result.success) {
      sound.playCheckInBeep();
      success('Check-in Approved!', result.message);
      setScannedInput('');
      onRefreshData();
    } else {
      sound.playErrorBuzzer();
      if (result.code === 'ALREADY_CHECKED_IN') {
        warning('Already Checked In', result.message);
      } else {
        error('Check-in Rejected', result.message);
      }
    }
  };

  // Quick scanner simulation test for immediate demo
  const handleSimulateScan = (reg: Registration) => {
    setScannedInput(reg.qrToken);
    handleVerifyCheckIn(reg.qrToken);
  };

  // Toggle manual check-in from participant table
  const handleToggleManualCheckIn = (reg: Registration) => {
    sound.playClick();
    const updated = storageService.getRegistrations();
    const index = updated.findIndex((r) => r.id === reg.id);
    if (index !== -1) {
      const nextChecked = !updated[index].checkIn.isCheckedIn;
      updated[index].checkIn = {
        isCheckedIn: nextChecked,
        checkedInAt: nextChecked ? new Date().toISOString() : undefined,
        verifiedBy: nextChecked ? 'Admin Manual Override' : undefined,
      };
      storageService.saveRegistrations(updated);

      // Adjust event count
      const currentEvents = storageService.getEvents();
      const evt = currentEvents.find((e) => e.id === reg.eventId);
      if (evt) {
        evt.checkedInCount = Math.max(0, (evt.checkedInCount || 0) + (nextChecked ? 1 : -1));
        storageService.saveEvents(currentEvents);
      }

      onRefreshData();
      if (nextChecked) {
        success('Attendee Checked In', `${reg.attendee.name} marked present.`);
      } else {
        warning('Check-in Cleared', `${reg.attendee.name} marked pending.`);
      }
    }
  };

  // Export participant directory to CSV
  const handleExportCSV = () => {
    sound.playClick();
    const headers = ['Ticket Number', 'Event Title', 'Attendee Name', 'USN', 'Email', 'Phone', 'Payment Status', 'Amount', 'Checked In', 'Checked In At'];
    const rows = filteredParticipants.map((r) => [
      r.ticketNumber,
      `"${r.eventTitle.replace(/"/g, '""')}"`,
      `"${r.attendee.name.replace(/"/g, '""')}"`,
      r.attendee.usn,
      r.attendee.email,
      r.attendee.phone,
      r.payment.status,
      r.payment.amount,
      r.checkIn.isCheckedIn ? 'YES' : 'NO',
      r.checkIn.checkedInAt || 'N/A',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `JITACM_Attendees_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('CSV Exported!', 'Attendee registry downloaded successfully.');
  };

  // Event modal actions
  const handleOpenCreateEvent = () => {
    sound.playClick();
    setEditingEventId(null);
    setEventFormData({
      title: '',
      tagline: '',
      description: '',
      category: 'Workshop',
      mode: 'in-person',
      venue: 'JIT Campus',
      date: '2026-10-30',
      time: '10:00 AM - 04:00 PM',
      registrationDeadline: '2026-10-29T23:59:59Z',
      bannerUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
      fee: 99,
      capacity: 80,
      tags: 'ACM, Tech, Workshop',
      organizerEmail: 'acm.organizer@jyothyit.ac.in',
      organizerPhone: '+91 98450 12345',
    });
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (evt: EventItem) => {
    sound.playClick();
    setEditingEventId(evt.id);
    setEventFormData({
      title: evt.title,
      tagline: evt.tagline,
      description: evt.description,
      category: evt.category,
      mode: evt.mode,
      venue: evt.venue,
      date: evt.date,
      time: evt.time,
      registrationDeadline: evt.registrationDeadline,
      bannerUrl: evt.bannerUrl,
      fee: evt.fee,
      capacity: evt.capacity,
      tags: evt.tags.join(', '),
      organizerEmail: evt.organizerEmail,
      organizerPhone: evt.organizerPhone,
    });
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();

    const tagList = eventFormData.tags.split(',').map((t) => t.trim()).filter(Boolean);

    if (editingEventId) {
      storageService.updateEvent(editingEventId, {
        title: eventFormData.title,
        tagline: eventFormData.tagline,
        description: eventFormData.description,
        category: eventFormData.category,
        mode: eventFormData.mode,
        venue: eventFormData.venue,
        date: eventFormData.date,
        time: eventFormData.time,
        registrationDeadline: eventFormData.registrationDeadline,
        bannerUrl: eventFormData.bannerUrl,
        fee: Number(eventFormData.fee),
        capacity: Number(eventFormData.capacity),
        tags: tagList,
        organizerEmail: eventFormData.organizerEmail,
        organizerPhone: eventFormData.organizerPhone,
      });
      success('Event Updated', `Updated "${eventFormData.title}".`);
    } else {
      storageService.createEvent({
        title: eventFormData.title,
        slug: eventFormData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        tagline: eventFormData.tagline,
        description: eventFormData.description,
        category: eventFormData.category,
        mode: eventFormData.mode,
        venue: eventFormData.venue,
        date: eventFormData.date,
        time: eventFormData.time,
        registrationDeadline: eventFormData.registrationDeadline,
        bannerUrl: eventFormData.bannerUrl,
        fee: Number(eventFormData.fee),
        currency: 'INR',
        capacity: Number(eventFormData.capacity),
        tags: tagList,
        organizerEmail: eventFormData.organizerEmail,
        organizerPhone: eventFormData.organizerPhone,
      });
      success('Event Created', `New event "${eventFormData.title}" published!`);
    }

    setIsEventModalOpen(false);
    onRefreshData();
  };

  const handleDeleteEvent = (id: string, title: string) => {
    sound.playClick();
    if (confirm(`Are you sure you want to remove event "${title}"?`)) {
      storageService.deleteEvent(id);
      success('Event Removed', `"${title}" has been deleted.`);
      onRefreshData();
    }
  };

  // Filter participants
  const filteredParticipants = registrations.filter((r) => {
    const matchesSearch =
      r.attendee.name.toLowerCase().includes(participantSearch.toLowerCase()) ||
      r.attendee.usn.toLowerCase().includes(participantSearch.toLowerCase()) ||
      r.attendee.email.toLowerCase().includes(participantSearch.toLowerCase()) ||
      r.ticketNumber.toLowerCase().includes(participantSearch.toLowerCase());

    if (!matchesSearch) return false;
    if (eventFilter !== 'all' && r.eventId !== eventFilter) return false;
    if (statusFilter === 'attended' && !r.checkIn.isCheckedIn) return false;
    if (statusFilter === 'pending' && r.checkIn.isCheckedIn) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Top Admin Telemetry Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0c1017] via-[#121722] to-[#0c1017] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#27FCF2]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#27FCF2] uppercase tracking-widest font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#27FCF2] animate-ping" />
                CENTRAL ORGANIZER COMMAND
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-white mt-1">
              JITACM Event & Ticketing Operations
            </h1>
            <p className="text-xs text-mist mt-1 max-w-xl">
              Monitor admissions, verify attendees via digital QR, audit registration transactions, and manage campus events in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleOpenCreateEvent}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3064D0] to-[#27FCF2] text-[#060709] font-mono text-xs font-bold shadow-lg shadow-[#27FCF2]/20 hover:opacity-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>CREATE EVENT</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Badges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
            <span className="font-mono text-[10px] text-mist uppercase flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-400" /> Total Revenue
            </span>
            <p className="font-mono text-2xl font-black text-emerald-400">₹{totalRevenue.toLocaleString()}</p>
            <span className="text-[10px] text-mist/60 block">From paid registrations</span>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
            <span className="font-mono text-[10px] text-mist uppercase flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#27FCF2]" /> Total Registrations
            </span>
            <p className="font-mono text-2xl font-black text-white">{totalRegistrations}</p>
            <span className="text-[10px] text-mist/60 block">{overallFillRate}% overall fill rate</span>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
            <span className="font-mono text-[10px] text-mist uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8739D5]" /> Checked-in Attendees
            </span>
            <p className="font-mono text-2xl font-black text-[#27FCF2]">{totalCheckedIn}</p>
            <span className="text-[10px] text-mist/60 block">{overallCheckInRate}% check-in turnout</span>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
            <span className="font-mono text-[10px] text-mist uppercase flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" /> Active Events
            </span>
            <p className="font-mono text-2xl font-black text-white">{events.length}</p>
            <span className="text-[10px] text-mist/60 block">{totalCapacity} total seat capacity</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-white/10 overflow-x-auto">
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('events');
          }}
          className={`flex items-center gap-2 py-3.5 px-6 font-mono text-xs font-bold transition border-b-2 whitespace-nowrap ${
            activeTab === 'events'
              ? 'border-[#27FCF2] text-[#27FCF2]'
              : 'border-transparent text-mist hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>EVENTS MANAGER ({events.length})</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('participants');
          }}
          className={`flex items-center gap-2 py-3.5 px-6 font-mono text-xs font-bold transition border-b-2 whitespace-nowrap ${
            activeTab === 'participants'
              ? 'border-[#27FCF2] text-[#27FCF2]'
              : 'border-transparent text-mist hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>PARTICIPANT DIRECTORY ({registrations.length})</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('checkin');
          }}
          className={`flex items-center gap-2 py-3.5 px-6 font-mono text-xs font-bold transition border-b-2 whitespace-nowrap ${
            activeTab === 'checkin'
              ? 'border-[#27FCF2] text-[#27FCF2]'
              : 'border-transparent text-mist hover:text-white'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>QR CHECK-IN TERMINAL</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('analytics');
          }}
          className={`flex items-center gap-2 py-3.5 px-6 font-mono text-xs font-bold transition border-b-2 whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'border-[#27FCF2] text-[#27FCF2]'
              : 'border-transparent text-mist hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>ANALYTICS & CAPACITIES</span>
        </button>
      </div>

      {/* TAB 1: Events Manager */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((evt) => {
              const isFull = evt.isSoldOut || evt.registeredCount >= evt.capacity;
              const fillPct = Math.min(100, Math.round((evt.registeredCount / evt.capacity) * 100));

              return (
                <div
                  key={evt.id}
                  className="rounded-3xl bg-[#0c1017] border border-white/10 p-6 flex flex-col justify-between space-y-4 shadow-xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-mono text-[10px] text-[#27FCF2] uppercase tracking-wider font-semibold">
                        {evt.category}
                      </span>
                      <h3 className="font-display font-bold text-base text-white mt-0.5 line-clamp-1">
                        {evt.title}
                      </h3>
                      <p className="text-xs text-mist line-clamp-1">{evt.venue}</p>
                    </div>

                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white">
                      {evt.fee === 0 ? 'FREE' : `₹${evt.fee}`}
                    </span>
                  </div>

                  {/* Capacity Bar */}
                  <div className="space-y-1.5 bg-surface/50 p-3 rounded-2xl border border-white/5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-mist">Bookings:</span>
                      <span className="text-bone font-bold">
                        {evt.registeredCount} / {evt.capacity} ({fillPct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isFull ? 'bg-rose-500' : 'bg-gradient-to-r from-[#3064D0] to-[#27FCF2]'
                        }`}
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] font-mono text-mist/70 pt-0.5">
                      <span>Checked-in: {evt.checkedInCount || 0}</span>
                      <span>Deadline: {new Date(evt.registrationDeadline).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => handleEditEvent(evt)}
                      className="flex-1 py-2 px-3 rounded-xl bg-surface hover:bg-surface-hover border border-white/10 text-xs font-mono text-mist hover:text-white flex items-center justify-center gap-1.5 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#27FCF2]" />
                      <span>EDIT</span>
                    </button>

                    <button
                      onClick={() => handleDeleteEvent(evt.id, evt.title)}
                      className="p-2 rounded-xl bg-surface hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-mist hover:text-rose-400 transition"
                      title="Delete event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Participant Directory */}
      {activeTab === 'participants' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-surface/60 border border-white/10">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[240px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-mist" />
                <input
                  type="text"
                  placeholder="Search by USN, Name, Email, Ticket..."
                  value={participantSearch}
                  onChange={(e) => setParticipantSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-[#27FCF2]"
                />
              </div>

              {/* Event Filter */}
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs"
              >
                <option value="all">All Events ({registrations.length})</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'attended' | 'pending')}
                className="px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs"
              >
                <option value="all">All Attendance</option>
                <option value="attended">Checked In Only</option>
                <option value="pending">Pending Attendance Only</option>
              </select>
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface hover:bg-surface-hover border border-white/10 text-xs font-mono text-mist hover:text-white transition"
            >
              <Download className="w-3.5 h-3.5 text-[#27FCF2]" />
              <span>EXPORT CSV ({filteredParticipants.length})</span>
            </button>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-white/10 bg-[#0c1017] overflow-x-auto shadow-2xl">
            <table className="w-full text-left text-xs text-mist">
              <thead className="bg-surface/80 border-b border-white/10 font-mono text-[10px] text-mist uppercase">
                <tr>
                  <th className="py-3.5 px-4">Ticket / Pass</th>
                  <th className="py-3.5 px-4">Attendee & USN</th>
                  <th className="py-3.5 px-4">Event</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Check-In Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredParticipants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-mist">
                      No participants match this filter query.
                    </td>
                  </tr>
                ) : (
                  filteredParticipants.map((reg) => (
                    <tr key={reg.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-3 px-4 font-mono font-bold text-white whitespace-nowrap">
                        <button
                          onClick={() => {
                            sound.playClick();
                            onOpenTicket(reg);
                          }}
                          className="hover:text-[#27FCF2] underline underline-offset-4 flex items-center gap-1.5"
                        >
                          <QrCode className="w-3.5 h-3.5 text-[#27FCF2]" />
                          <span>{reg.ticketNumber}</span>
                        </button>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-bone">{reg.attendee.name}</div>
                        <div className="font-mono text-[11px] text-[#27FCF2]">{reg.attendee.usn}</div>
                        <div className="text-[10px] text-mist/60">{reg.attendee.email}</div>
                      </td>

                      <td className="py-3 px-4 max-w-[200px]">
                        <span className="font-medium text-bone line-clamp-1">{reg.eventTitle}</span>
                        <span className="text-[10px] text-mist/60 block">
                          {new Date(reg.eventDate).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {reg.payment.status === 'free' ? (
                          <span className="font-mono text-emerald-400 font-semibold">FREE PASS</span>
                        ) : (
                          <span className="font-mono text-bone font-semibold">
                            ₹{reg.payment.amount} ({reg.payment.method})
                          </span>
                        )}
                        <span className="text-[10px] text-mist/50 block font-mono">
                          ID: {reg.payment.orderId}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {reg.checkIn.isCheckedIn ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3" /> CHECKED IN
                            </span>
                            <span className="text-[10px] text-mist/60 block font-mono mt-0.5">
                              {reg.checkIn.checkedInAt
                                ? new Date(reg.checkIn.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : ''}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 text-mist border border-white/10 font-mono text-[10px]">
                            <Clock className="w-3 h-3" /> PENDING ENTRY
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleManualCheckIn(reg)}
                            className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold transition ${
                              reg.checkIn.isCheckedIn
                                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-[#27FCF2]/10 hover:bg-[#27FCF2]/20 text-[#27FCF2] border border-[#27FCF2]/30'
                            }`}
                          >
                            {reg.checkIn.isCheckedIn ? 'CLEAR CHECK-IN' : 'CHECK IN'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: QR Check-In Terminal */}
      {activeTab === 'checkin' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Scanner Input Panel */}
          <div className="p-6 rounded-3xl bg-[#0c1017] border border-white/10 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ScanLine className="w-5 h-5 text-[#27FCF2] animate-pulse" />
                <h3 className="font-display font-bold text-lg text-white">Live QR Check-In Terminal</h3>
              </div>
              <span className="font-mono text-[10px] text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 font-semibold">
                ONLINE
              </span>
            </div>

            {/* Event Gate Filter */}
            <div>
              <label className="block text-xs font-mono text-mist uppercase mb-1.5">
                Active Gate / Event Filter
              </label>
              <select
                value={scannerEventFilter}
                onChange={(e) => setScannerEventFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-white/10 text-white text-xs focus:border-[#27FCF2]"
              >
                <option value="all">Universal Gate (Accept All JITACM Events)</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title} ({e.venue})
                  </option>
                ))}
              </select>
            </div>

            {/* Direct QR Token Input */}
            <div className="space-y-3">
              <label className="block text-xs font-mono text-mist uppercase">
                Scan or Enter QR Token / Ticket Number
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={scannedInput}
                  onChange={(e) => setScannedInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyCheckIn()}
                  placeholder="e.g. JITACM|JITACM-2026-C891|... or JITACM-2026-C891"
                  className="flex-1 px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#27FCF2]"
                />
                <button
                  onClick={() => handleVerifyCheckIn()}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#3064D0] to-[#27FCF2] text-[#060709] font-mono text-xs font-black shadow-lg hover:opacity-95 transition"
                >
                  VERIFY
                </button>
              </div>
            </div>

            {/* Camera Viewfinder Simulation */}
            <div className="p-4 rounded-2xl bg-surface/50 border border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs text-mist">
                <span className="flex items-center gap-1.5 font-mono">
                  <Camera className="w-4 h-4 text-[#27FCF2]" /> Scanner Optics
                </span>
                <button
                  onClick={() => {
                    sound.playClick();
                    setIsCameraActive(!isCameraActive);
                  }}
                  className="text-xs font-mono text-[#27FCF2] hover:underline"
                >
                  {isCameraActive ? 'Disable Viewfinder' : 'Enable Camera Viewfinder'}
                </button>
              </div>

              {isCameraActive ? (
                <div className="relative h-44 rounded-xl bg-black/80 border border-[#27FCF2]/40 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-[#27FCF2] shadow-lg shadow-[#27FCF2] animate-bounce" />
                  <div className="font-mono text-xs text-mist/60">Position student QR code inside camera target</div>
                </div>
              ) : (
                <p className="text-[11px] text-mist/70 leading-relaxed font-sans">
                  The terminal accepts rapid USB barcode/QR scanner hardware, webcam scans, or manual ticket number searches.
                </p>
              )}
            </div>

            {/* Rapid Demo Test Simulations */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <span className="text-[10px] font-mono text-mist uppercase block">
                Quick Test Simulators (Click to trigger instant scan verification):
              </span>
              <div className="flex flex-wrap gap-2">
                {registrations.slice(0, 3).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleSimulateScan(r)}
                    className="px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-hover border border-white/10 text-[11px] font-mono text-mist hover:text-white transition flex items-center gap-1"
                  >
                    <QrCode className="w-3 h-3 text-[#27FCF2]" />
                    <span>Scan {r.attendee.name.split(' ')[0]} ({r.ticketNumber})</span>
                  </button>
                ))}

                <button
                  onClick={() => {
                    sound.playClick();
                    setScannedInput('JITACM|FAKE_TICKET|evt-unknown|1JT99CS000|0|badhash');
                    handleVerifyCheckIn('JITACM|FAKE_TICKET|evt-unknown|1JT99CS000|0|badhash');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-[11px] font-mono text-rose-300 transition"
                >
                  Simulate Fraud/Invalid QR
                </button>
              </div>
            </div>
          </div>

          {/* Verification Feedback Result HUD */}
          <div className="p-6 rounded-3xl bg-[#0c1017] border border-white/10 min-h-[380px] flex flex-col justify-center shadow-2xl">
            {lastCheckInResult ? (
              <div className="space-y-5 animate-in zoom-in-95 duration-200">
                {/* Result Status Header */}
                <div
                  className={`p-4 rounded-2xl border flex items-start gap-3 ${
                    lastCheckInResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : lastCheckInResult.code === 'ALREADY_CHECKED_IN'
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                      : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {lastCheckInResult.success ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  ) : lastCheckInResult.code === 'ALREADY_CHECKED_IN' ? (
                    <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                  )}

                  <div>
                    <h4 className="font-display font-bold text-base">
                      {lastCheckInResult.success
                        ? 'ADMISSION AUTHORIZED'
                        : lastCheckInResult.code === 'ALREADY_CHECKED_IN'
                        ? 'DUPLICATE CHECK-IN ATTEMPT'
                        : 'ACCESS DENIED'}
                    </h4>
                    <p className="text-xs mt-0.5 leading-relaxed opacity-90">{lastCheckInResult.message}</p>
                  </div>
                </div>

                {/* Attendee Profile Dossier */}
                {lastCheckInResult.registration && (
                  <div className="p-5 rounded-2xl bg-surface/60 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div>
                        <span className="font-mono text-[10px] text-mist uppercase">ATTENDEE VERIFIED</span>
                        <h3 className="font-display font-bold text-lg text-white">
                          {lastCheckInResult.registration.attendee.name}
                        </h3>
                        <p className="font-mono text-xs text-[#27FCF2]">
                          USN: {lastCheckInResult.registration.attendee.usn}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-[10px] text-mist uppercase">TICKET</span>
                        <p className="font-mono font-bold text-sm text-white">
                          {lastCheckInResult.registration.ticketNumber}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-mist uppercase font-mono block">Event</span>
                        <span className="font-medium text-bone">
                          {lastCheckInResult.registration.eventTitle}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-mist uppercase font-mono block">Department</span>
                        <span className="font-medium text-bone">
                          {lastCheckInResult.registration.attendee.branch}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-mist uppercase font-mono block">Payment</span>
                        <span className="font-medium text-emerald-400 uppercase">
                          {lastCheckInResult.registration.payment.status} ({lastCheckInResult.registration.payment.method})
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-mist uppercase font-mono block">Timestamp</span>
                        <span className="font-mono text-bone">
                          {new Date().toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-8 space-y-3 text-mist">
                <div className="w-16 h-16 rounded-2xl bg-white/5 mx-auto flex items-center justify-center">
                  <ScanLine className="w-8 h-8 text-mist/60" />
                </div>
                <h4 className="text-base font-bold text-white">Awaiting QR Scan</h4>
                <p className="text-xs text-mist max-w-xs mx-auto">
                  Scan an attendee ticket with your device or click one of the quick test buttons on the left.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Analytics & Capacities */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Capacity Utilization Chart */}
          <div className="p-6 rounded-3xl bg-[#0c1017] border border-white/10 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-white">Event Capacity Fill Rates</h3>
              <span className="font-mono text-xs text-[#27FCF2]">{overallFillRate}% AVG FILL</span>
            </div>

            <div className="space-y-4">
              {events.map((e) => {
                const pct = Math.min(100, Math.round((e.registeredCount / e.capacity) * 100));
                return (
                  <div key={e.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-bone truncate max-w-[240px]">{e.title}</span>
                      <span className="text-[#27FCF2]">
                        {e.registeredCount} / {e.capacity} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#3064D0] to-[#27FCF2]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="p-6 rounded-3xl bg-[#0c1017] border border-white/10 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-white">Ticket Revenue by Event</h3>
              <span className="font-mono text-xs text-emerald-400">₹{totalRevenue.toLocaleString()} TOTAL</span>
            </div>

            <div className="space-y-4">
              {events.map((e) => {
                const eventRegs = registrations.filter((r) => r.eventId === e.id && r.payment.status === 'paid');
                const rev = eventRegs.reduce((acc, r) => acc + r.payment.amount, 0);

                return (
                  <div key={e.id} className="flex items-center justify-between p-3 rounded-2xl bg-surface/40 border border-white/5 text-xs">
                    <div>
                      <h4 className="font-bold text-white line-clamp-1">{e.title}</h4>
                      <p className="text-[10px] text-mist font-mono mt-0.5">
                        {eventRegs.length} paid delegate tickets @ ₹{e.fee}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      ₹{rev.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Event Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl my-6 bg-[#0c1017] rounded-3xl border border-white/10 shadow-2xl overflow-hidden text-bone">
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-surface">
              <h2 className="text-lg font-bold font-display text-white">
                {editingEventId ? 'Edit Event Details' : 'Create New JITACM Event'}
              </h2>
              <button
                onClick={() => {
                  sound.playClick();
                  setIsEventModalOpen(false);
                }}
                className="p-2 text-mist hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-mono text-mist uppercase mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={eventFormData.title}
                  onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-white/10 text-white text-sm focus:border-[#27FCF2]"
                  placeholder="e.g. AI Promptcraft Hackathon"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-mist uppercase mb-1">Tagline / Short Summary *</label>
                <input
                  type="text"
                  required
                  value={eventFormData.tagline}
                  onChange={(e) => setEventFormData({ ...eventFormData, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-white/10 text-white text-sm focus:border-[#27FCF2]"
                  placeholder="e.g. 12 Hours of prompt engineering and LLM evaluation"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-mist uppercase mb-1">Detailed Description *</label>
                <textarea
                  rows={3}
                  required
                  value={eventFormData.description}
                  onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-white/10 text-white text-sm focus:border-[#27FCF2]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono text-mist uppercase mb-1">Category</label>
                  <select
                    value={eventFormData.category}
                    onChange={(e) => setEventFormData({ ...eventFormData, category: e.target.value as EventItem['category'] })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-white/10 text-white text-xs"
                  >
                    <option value="Hackathon">Hackathon</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Tech Talk">Tech Talk</option>
                    <option value="Competition">Competition</option>
                    <option value="Ideathon">Ideathon</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-mist uppercase mb-1">Delivery Mode</label>
                  <select
                    value={eventFormData.mode}
                    onChange={(e) => setEventFormData({ ...eventFormData, mode: e.target.value as EventItem['mode'] })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-white/10 text-white text-xs"
                  >
                    <option value="in-person">In-Person</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="virtual">Virtual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-mist uppercase mb-1">Registration Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={eventFormData.fee}
                    onChange={(e) => setEventFormData({ ...eventFormData, fee: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-white/10 text-white font-mono text-xs focus:border-[#27FCF2]"
                    placeholder="0 for Free"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-mist uppercase mb-1">Event Date</label>
                  <input
                    type="date"
                    value={eventFormData.date}
                    onChange={(e) => setEventFormData({ ...eventFormData, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-white/10 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-mist uppercase mb-1">Max Capacity (Seats)</label>
                  <input
                    type="number"
                    min="1"
                    value={eventFormData.capacity}
                    onChange={(e) => setEventFormData({ ...eventFormData, capacity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-white/10 text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-mist uppercase mb-1">Venue / Hall Location</label>
                <input
                  type="text"
                  value={eventFormData.venue}
                  onChange={(e) => setEventFormData({ ...eventFormData, venue: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-white/10 text-white text-sm"
                  placeholder="e.g. Auditorium 2, JIT Campus"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-mist uppercase mb-1">Banner Image URL</label>
                <input
                  type="url"
                  value={eventFormData.bannerUrl}
                  onChange={(e) => setEventFormData({ ...eventFormData, bannerUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-white/10 text-white text-xs font-mono"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-mono text-mist hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#3064D0] to-[#27FCF2] text-[#060709] font-mono text-xs font-bold shadow-md"
                >
                  {editingEventId ? 'SAVE CHANGES' : 'PUBLISH EVENT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
