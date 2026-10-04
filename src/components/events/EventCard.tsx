import React from 'react';
import type { EventItem } from '../../types';
import { sound } from '../../utils/audio';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

interface EventCardProps {
  event: EventItem;
  onViewDetails: (event: EventItem) => void;
  onRegister: (event: EventItem) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onViewDetails, onRegister }) => {
  const isFree = event.fee === 0;
  const isSoldOut = event.isSoldOut || event.registeredCount >= event.capacity;
  const remainingSeats = Math.max(0, event.capacity - event.registeredCount);
  const fillPercent = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));

  const isNearlyFull = remainingSeats <= 15 && !isSoldOut;

  return (
    <div className="group relative flex flex-col rounded-3xl bg-[#0c1017]/80 backdrop-blur-xl border border-white/10 hover:border-[#27FCF2]/40 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-[#27FCF2]/10 overflow-hidden">
      {/* Banner Image */}
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={event.bannerUrl}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1017] via-[#0c1017]/30 to-black/40" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <span className="font-mono text-[11px] font-bold px-3 py-1 rounded-full bg-[#060709]/80 backdrop-blur border border-white/15 text-[#27FCF2] shadow-sm">
            {event.category}
          </span>

          <span
            className={`font-mono text-xs font-black px-3 py-1 rounded-full backdrop-blur border shadow-md ${
              isFree
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-[#27FCF2]/20 text-[#27FCF2] border-[#27FCF2]/40'
            }`}
          >
            {isFree ? 'FREE' : `₹${event.fee}`}
          </span>
        </div>

        {/* Mode Pill */}
        <div className="absolute bottom-3 left-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur border border-white/10 text-[10px] font-mono text-mist uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#27FCF2] animate-pulse" />
            {event.mode}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-6 space-y-4">
        <div>
          <h3 className="font-display font-bold text-lg text-white group-hover:text-[#27FCF2] transition-colors line-clamp-1">
            {event.title}
          </h3>
          <p className="text-xs text-mist line-clamp-2 mt-1.5 leading-relaxed font-sans">
            {event.tagline || event.description}
          </p>
        </div>

        {/* Date, Time & Venue */}
        <div className="space-y-2 text-xs text-mist border-t border-white/5 pt-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#27FCF2] shrink-0" />
            <span className="text-bone font-medium">
              {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="text-dim">•</span>
            <span className="flex items-center gap-1 truncate text-mist">
              <Clock className="w-3.5 h-3.5 text-[#8739D5]" /> {event.time}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#8739D5] shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        {/* Capacity Bar & Urgent Warning */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-mist">
              <Users className="w-3.5 h-3.5 text-mist/60" />
              <span>{remainingSeats} seats remaining</span>
            </span>

            {isSoldOut ? (
              <span className="text-rose-400 font-bold">SOLD OUT</span>
            ) : isNearlyFull ? (
              <span className="text-amber-400 flex items-center gap-1 font-bold animate-pulse">
                <AlertCircle className="w-3 h-3" /> Filling Fast!
              </span>
            ) : (
              <span className="text-dim">{fillPercent}% booked</span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isSoldOut
                  ? 'bg-rose-500'
                  : isNearlyFull
                  ? 'bg-gradient-to-r from-amber-400 to-rose-500'
                  : 'bg-gradient-to-r from-[#3064D0] to-[#27FCF2]'
              }`}
              style={{ width: `${fillPercent}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 mt-auto flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              onViewDetails(event);
            }}
            className="flex-1 py-2.5 px-3 rounded-xl bg-surface hover:bg-surface-hover border border-white/10 text-xs font-mono text-mist hover:text-white transition flex items-center justify-center gap-1"
          >
            <span>DETAILS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onRegister(event);
            }}
            disabled={isSoldOut}
            className={`flex-1 py-2.5 px-3 rounded-xl font-mono text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md ${
              isSoldOut
                ? 'bg-white/5 text-mist border border-white/5 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#3064D0] to-[#27FCF2] text-[#060709] hover:opacity-95 shadow-[#27FCF2]/15'
            }`}
          >
            {isSoldOut ? (
              <span>FULL</span>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>REGISTER</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
