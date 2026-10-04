import React, { useState } from 'react';
import type { Registration } from '../../types';
import { sound } from '../../utils/audio';
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  QrCode, 
  Search, 
  ExternalLink 
} from 'lucide-react';

interface MyTicketsViewProps {
  registrations: Registration[];
  activeUSN: string;
  onSelectTicket: (registration: Registration) => void;
  onExploreEvents: () => void;
}

export const MyTicketsView: React.FC<MyTicketsViewProps> = ({
  registrations,
  activeUSN,
  onSelectTicket,
  onExploreEvents,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'valid' | 'checked_in'>('all');

  const filtered = registrations.filter((reg) => {
    const matchesSearch =
      reg.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.attendee.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'valid') return !reg.checkIn.isCheckedIn;
    if (filterStatus === 'checked_in') return reg.checkIn.isCheckedIn;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Wallet Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-surface/60 border border-white/10 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#27FCF2]" />
            <span className="font-mono text-xs uppercase tracking-wider text-[#27FCF2] font-semibold">
              DIGITAL PASS WALLET
            </span>
          </div>
          <h2 className="text-2xl font-bold font-display text-white mt-1">My Registered Event Passes</h2>
          <p className="text-xs text-mist mt-0.5">
            Active attendee USN: <span className="font-mono text-[#27FCF2] font-semibold">{activeUSN}</span> • Keep your QR code ready at the venue entrance.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-mist" />
            <input
              type="text"
              placeholder="Search pass / event..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-[#27FCF2] transition"
            />
          </div>

          <div className="flex rounded-xl bg-black/40 border border-white/10 p-1">
            <button
              onClick={() => {
                sound.playClick();
                setFilterStatus('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                filterStatus === 'all' ? 'bg-[#27FCF2] text-black font-bold' : 'text-mist hover:text-white'
              }`}
            >
              ALL ({registrations.length})
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setFilterStatus('valid');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                filterStatus === 'valid' ? 'bg-[#27FCF2] text-black font-bold' : 'text-mist hover:text-white'
              }`}
            >
              VALID
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setFilterStatus('checked_in');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                filterStatus === 'checked_in' ? 'bg-[#27FCF2] text-black font-bold' : 'text-mist hover:text-white'
              }`}
            >
              CHECKED-IN
            </button>
          </div>
        </div>
      </div>

      {/* Tickets Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-surface/30 border border-white/5 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 mx-auto flex items-center justify-center text-mist">
            <Ticket className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No Event Passes Found</h3>
            <p className="text-xs text-mist mt-1 max-w-sm mx-auto">
              You haven’t registered for any events matching this filter yet. Explore upcoming hackathons and workshops now!
            </p>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onExploreEvents();
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#3064D0] to-[#27FCF2] text-[#060709] font-mono text-xs font-bold shadow-lg shadow-[#27FCF2]/20"
          >
            EXPLORE UPCOMING EVENTS
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((reg) => {
            const isCheckedIn = reg.checkIn.isCheckedIn;
            return (
              <div
                key={reg.id}
                className="group relative rounded-3xl bg-[#0c1017] border border-white/10 hover:border-[#27FCF2]/50 p-6 flex flex-col justify-between space-y-5 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-[#27FCF2]/10"
              >
                {/* Header status */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-[10px] text-mist uppercase tracking-widest">
                      TICKET #{reg.ticketNumber}
                    </span>
                    <h3 className="font-display font-bold text-base text-white mt-1 group-hover:text-[#27FCF2] transition line-clamp-1">
                      {reg.eventTitle}
                    </h3>
                  </div>

                  <div>
                    {isCheckedIn ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <ShieldCheck className="w-3 h-3" /> ATTENDED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#27FCF2]/10 text-[#27FCF2] border border-[#27FCF2]/30">
                        <Clock className="w-3 h-3" /> ACTIVE PASS
                      </span>
                    )}
                  </div>
                </div>

                {/* Event Schedule Info */}
                <div className="space-y-2 text-xs text-mist bg-surface/50 p-3.5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#27FCF2] shrink-0" />
                    <span className="text-bone font-medium">
                      {new Date(reg.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#8739D5] shrink-0" />
                    <span className="truncate">{reg.eventVenue}</span>
                  </div>
                </div>

                {/* Attendee USN & Payment Badge */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                  <div>
                    <span className="font-mono text-[10px] text-mist/60 block">ATTENDEE</span>
                    <span className="font-mono text-[#27FCF2] font-semibold">{reg.attendee.usn}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-[10px] text-mist/60 block">PAYMENT</span>
                    <span className="font-semibold text-bone">
                      {reg.payment.status === 'free' ? 'Free Pass' : `₹${reg.payment.amount}`}
                    </span>
                  </div>
                </div>

                {/* Show QR Code Action CTA */}
                <button
                  onClick={() => {
                    sound.playClick();
                    onSelectTicket(reg);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-surface to-surface-hover hover:from-[#27FCF2]/20 hover:to-[#3064D0]/20 border border-white/10 hover:border-[#27FCF2]/50 text-white font-mono text-xs font-bold transition shadow-sm group-hover:shadow-[#27FCF2]/20"
                >
                  <QrCode className="w-4 h-4 text-[#27FCF2]" />
                  <span>SHOW DIGITAL QR PASS</span>
                  <ExternalLink className="w-3.5 h-3.5 text-mist ml-auto" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
