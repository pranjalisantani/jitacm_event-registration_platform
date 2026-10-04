import React from 'react';
import type { EventItem } from '../../types';
import { sound } from '../../utils/audio';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Sparkles, 
  ShieldAlert, 
  Mail, 
  Phone, 
  CheckCircle2, 
  Tag 
} from 'lucide-react';

interface EventDetailModalProps {
  event: EventItem | null;
  onClose: () => void;
  onRegisterClick: (event: EventItem) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onClose, onRegisterClick }) => {
  if (!event) return null;

  const isFree = event.fee === 0;
  const isSoldOut = event.isSoldOut || event.registeredCount >= event.capacity;
  const fillPercent = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl my-8 bg-[#0c1017] rounded-3xl border border-white/10 shadow-2xl overflow-hidden text-bone">
        {/* Banner with Close Button */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden">
          <img
            src={event.bannerUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c1017] via-[#0c1017]/40 to-black/60" />

          {/* Close button */}
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="absolute top-5 right-5 p-2 text-white bg-black/60 backdrop-blur-md rounded-full border border-white/20 hover:border-white/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges on Banner */}
          <div className="absolute top-5 left-5 flex flex-wrap gap-2">
            <span className="font-mono text-xs font-semibold px-3 py-1 rounded-full bg-[#060709]/80 backdrop-blur border border-[#27FCF2]/40 text-[#27FCF2]">
              {event.category}
            </span>
            <span className="font-mono text-xs font-semibold px-3 py-1 rounded-full bg-[#060709]/80 backdrop-blur border border-white/20 text-white uppercase">
              {event.mode}
            </span>
          </div>

          {/* Title on Banner Base */}
          <div className="absolute bottom-5 left-6 right-6">
            <h1 className="text-2xl sm:text-3xl font-display font-black text-white leading-tight">
              {event.title}
            </h1>
            <p className="text-sm text-mist/90 mt-1 max-w-xl font-sans">{event.tagline}</p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-8 max-h-[60vh] overflow-y-auto">
          {/* Quick Metrics & Capacity Pill */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-surface/70 border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-mist uppercase flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#27FCF2]" /> Date
              </span>
              <p className="text-xs font-bold text-bone">
                {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface/70 border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-mist uppercase flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#8739D5]" /> Time
              </span>
              <p className="text-xs font-bold text-bone truncate">{event.time}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface/70 border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-mist uppercase flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" /> Seats Left
              </span>
              <p className="text-xs font-bold text-bone">
                {Math.max(0, event.capacity - event.registeredCount)} / {event.capacity}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface/70 border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-mist uppercase flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" /> Entry Fee
              </span>
              <p className="text-xs font-mono font-black text-[#27FCF2]">
                {isFree ? 'FREE PASS' : `₹${event.fee}`}
              </p>
            </div>
          </div>

          {/* Venue & Capacity Meter */}
          <div className="p-4 rounded-2xl bg-surface/40 border border-white/5 space-y-3">
            <div className="flex items-center gap-2 text-xs text-mist">
              <MapPin className="w-4 h-4 text-[#27FCF2] shrink-0" />
              <span className="text-bone font-medium">{event.venue}</span>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono mb-1.5">
                <span className="text-mist">Capacity Fill: {event.registeredCount} booked</span>
                <span className={fillPercent >= 90 ? 'text-rose-400 font-bold' : 'text-[#27FCF2]'}>
                  {fillPercent}% Filled
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    fillPercent >= 90
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                      : 'bg-gradient-to-r from-[#3064D0] to-[#27FCF2]'
                  }`}
                  style={{ width: `${fillPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-mono uppercase tracking-wider text-[#27FCF2] mb-2 font-bold">
              ABOUT THE EVENT
            </h3>
            <p className="text-sm text-mist/90 leading-relaxed whitespace-pre-line">{event.description}</p>
          </div>

          {/* Speakers */}
          {event.speakers && event.speakers.length > 0 && (
            <div>
              <h3 className="text-sm font-mono uppercase tracking-wider text-[#27FCF2] mb-3 font-bold">
                KEYNOTE SPEAKERS & JURY
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {event.speakers.map((sp, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-surface/50 border border-white/5">
                    {sp.avatarUrl ? (
                      <img src={sp.avatarUrl} alt={sp.name} className="w-11 h-11 rounded-full object-cover border border-white/10" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-[#3064D0]/30 flex items-center justify-center text-white font-bold text-sm">
                        {sp.name[0]}
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-white">{sp.name}</h4>
                      <p className="text-[11px] text-mist">{sp.role}</p>
                      <p className="text-[10px] text-[#27FCF2] font-mono">{sp.company}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Schedule / Agenda */}
          {event.schedule && event.schedule.length > 0 && (
            <div>
              <h3 className="text-sm font-mono uppercase tracking-wider text-[#27FCF2] mb-3 font-bold">
                EVENT TIMELINE & AGENDA
              </h3>
              <div className="relative pl-6 border-l border-white/10 space-y-4">
                {event.schedule.map((item, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-[#27FCF2] shadow-sm shadow-[#27FCF2]" />
                    <span className="font-mono text-xs font-bold text-[#27FCF2]">{item.time}</span>
                    <h5 className="text-xs font-semibold text-bone mt-0.5">{item.title}</h5>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Perks & What's Included */}
          {event.perks && event.perks.length > 0 && (
            <div>
              <h3 className="text-sm font-mono uppercase tracking-wider text-[#27FCF2] mb-3 font-bold">
                WHAT’S INCLUDED & PERKS
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {event.perks.map((perk, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-mist bg-surface/30 p-2.5 rounded-xl border border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rules & Guidelines */}
          {event.rules && event.rules.length > 0 && (
            <div className="p-4 rounded-2xl bg-surface/30 border border-white/5 space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-bold">
                <ShieldAlert className="w-4 h-4" /> CODE OF CONDUCT & RULES
              </h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-mist">
                {event.rules.map((rule, idx) => (
                  <li key={idx} className="leading-relaxed">{rule}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Organizer Contact */}
          <div className="border-t border-white/10 pt-4 flex flex-wrap items-center justify-between text-xs text-mist gap-4">
            <span className="font-mono text-[11px] uppercase">ORGANIZED BY JYOTHY ACM CHAPTER</span>
            <div className="flex items-center gap-4">
              <a href={`mailto:${event.organizerEmail}`} className="flex items-center gap-1.5 hover:text-white transition">
                <Mail className="w-3.5 h-3.5 text-[#27FCF2]" /> {event.organizerEmail}
              </a>
              <a href={`tel:${event.organizerPhone}`} className="flex items-center gap-1.5 hover:text-white transition">
                <Phone className="w-3.5 h-3.5 text-[#27FCF2]" /> {event.organizerPhone}
              </a>
            </div>
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="p-6 border-t border-white/10 bg-[#07090e] flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono text-mist uppercase">FEE / DELEGATE</span>
            <p className="font-mono text-xl font-extrabold text-[#27FCF2]">
              {isFree ? 'FREE PASS' : `₹${event.fee}`}
            </p>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onRegisterClick(event);
            }}
            disabled={isSoldOut}
            className={`flex items-center gap-2 py-3 px-8 rounded-xl font-mono text-xs font-bold transition shadow-lg ${
              isSoldOut
                ? 'bg-surface border border-white/10 text-mist cursor-not-allowed'
                : 'bg-gradient-to-r from-[#3064D0] to-[#27FCF2] text-[#060709] hover:opacity-95 shadow-[#27FCF2]/20'
            }`}
          >
            {isSoldOut ? (
              <span>EVENT FULL / SOLD OUT</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>REGISTER & RESERVE SPOT</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
