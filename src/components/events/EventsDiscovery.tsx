import React, { useState } from 'react';
import type { EventItem, FilterState } from '../../types';
import { EventCard } from './EventCard';
import { sound } from '../../utils/audio';
import { 
  Search, 
  Sparkles, 
  Calendar, 
  Ticket, 
  ShieldCheck, 
  Cpu, 
  Filter, 
  Flame 
} from 'lucide-react';

interface EventsDiscoveryProps {
  events: EventItem[];
  onViewDetails: (event: EventItem) => void;
  onRegister: (event: EventItem) => void;
}

export const EventsDiscovery: React.FC<EventsDiscoveryProps> = ({
  events,
  onViewDetails,
  onRegister,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    mode: 'all',
    feeType: 'all',
  });

  const categories = ['all', 'Hackathon', 'Workshop', 'Competition', 'Tech Talk'];

  const filteredEvents = events.filter((evt) => {
    // Search
    const matchesSearch =
      evt.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      evt.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      evt.tags.some((t) => t.toLowerCase().includes(filters.search.toLowerCase())) ||
      evt.venue.toLowerCase().includes(filters.search.toLowerCase());

    if (!matchesSearch) return false;

    // Category
    if (filters.category !== 'all' && evt.category !== filters.category) return false;

    // Mode
    if (filters.mode !== 'all' && evt.mode !== filters.mode) return false;

    // Fee
    if (filters.feeType === 'free' && evt.fee > 0) return false;
    if (filters.feeType === 'paid' && evt.fee === 0) return false;

    return true;
  });

  const featuredEvent = events.find((e) => e.isFeatured) || events[0];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#0a0d14] via-[#0f1422] to-[#07090e] p-8 sm:p-12 shadow-2xl">
        {/* Glow orbs behind */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#27FCF2]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#8739D5]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#27FCF2]/10 border border-[#27FCF2]/30 text-[#27FCF2] text-xs font-mono font-bold tracking-wider uppercase">
            <Cpu className="w-3.5 h-3.5" /> JYOTHY INSTITUTE OF TECHNOLOGY ACM CHAPTER
          </div>

          <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1]">
            Innovate, Code & Connect with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#27FCF2] via-[#3064D0] to-[#8739D5]">JITACM</span>
          </h1>

          <p className="text-sm sm:text-base text-mist/90 leading-relaxed font-sans max-w-2xl">
            The premier campus computing hub. Register for high-octane 24-hour hackathons, hands-on generative AI masterclasses, and ranked competitive coding clashes with instant digital passes.
          </p>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-6 pt-2 font-mono text-xs text-mist">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#27FCF2]" />
              <span className="text-bone font-bold">₹1,00,000+</span> Prize Pool
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#8739D5]" />
              <span className="text-bone font-bold">100% Cryptographic</span> Digital Tickets
            </div>
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-emerald-400" />
              <span className="text-bone font-bold">Zero-Overbooking</span> Concurrency Engine
            </div>
          </div>
        </div>
      </section>

      {/* Featured Event Spotlight */}
      {featuredEvent && (
        <section className="relative rounded-3xl bg-[#0c1017] border border-white/10 p-6 sm:p-8 overflow-hidden shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-4 h-4 text-[#27FCF2]" />
            <span className="font-mono text-xs uppercase tracking-wider text-[#27FCF2] font-bold">
              FEATURED CHAPTER FLAGSHIP
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[#27FCF2]">
                {featuredEvent.category} • {featuredEvent.mode.toUpperCase()}
              </span>

              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
                {featuredEvent.title}
              </h2>

              <p className="text-xs sm:text-sm text-mist leading-relaxed line-clamp-3">
                {featuredEvent.description}
              </p>

              <div className="flex flex-wrap gap-4 text-xs text-mist pt-1">
                <span className="flex items-center gap-1.5 text-bone">
                  <Calendar className="w-4 h-4 text-[#27FCF2]" />
                  {new Date(featuredEvent.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="text-dim">•</span>
                <span>{featuredEvent.venue}</span>
                <span className="text-dim">•</span>
                <span className="font-mono font-bold text-[#27FCF2]">
                  {featuredEvent.fee === 0 ? 'FREE' : `₹${featuredEvent.fee} Entry`}
                </span>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => {
                    sound.playClick();
                    onRegister(featuredEvent);
                  }}
                  disabled={featuredEvent.isSoldOut || featuredEvent.registeredCount >= featuredEvent.capacity}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#3064D0] to-[#27FCF2] text-[#060709] font-mono text-xs font-bold shadow-lg shadow-[#27FCF2]/20 hover:opacity-95 transition"
                >
                  RESERVE SPOT NOW
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    onViewDetails(featuredEvent);
                  }}
                  className="px-5 py-3 rounded-xl bg-surface hover:bg-surface-hover border border-white/10 text-xs font-mono text-mist hover:text-white transition"
                >
                  VIEW SYNOPSIS & JURY
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 h-64 sm:h-72 rounded-2xl overflow-hidden border border-white/10 relative group">
              <img
                src={featuredEvent.bannerUrl}
                alt={featuredEvent.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div className="text-xs font-mono text-white">
                  <span className="block text-mist text-[10px]">SEATS FILLED</span>
                  <span className="font-bold text-sm text-[#27FCF2]">
                    {featuredEvent.registeredCount} / {featuredEvent.capacity}
                  </span>
                </div>
                <span className="text-xs font-mono bg-black/70 px-2.5 py-1 rounded-lg border border-white/10 text-emerald-400 font-bold">
                  PASS AVAILABLE
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filter and Search Bar */}
      <section className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-3xl bg-surface/60 border border-white/10 backdrop-blur-xl">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-mist" />
            <input
              type="text"
              placeholder="Search events, workshops, hackathons, tags..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-[#27FCF2] transition"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  sound.playClick();
                  setFilters({ ...filters, category: cat });
                }}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs uppercase transition ${
                  filters.category === cat
                    ? 'bg-[#27FCF2] text-black font-bold shadow-md shadow-[#27FCF2]/20'
                    : 'bg-black/30 border border-white/10 text-mist hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Fee & Mode Selectors */}
          <div className="flex items-center gap-2">
            <select
              value={filters.feeType}
              onChange={(e) => setFilters({ ...filters, feeType: e.target.value as FilterState['feeType'] })}
              className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono"
            >
              <option value="all">All Fees</option>
              <option value="free">Free Events Only</option>
              <option value="paid">Paid Delegations</option>
            </select>

            <select
              value={filters.mode}
              onChange={(e) => setFilters({ ...filters, mode: e.target.value })}
              className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono"
            >
              <option value="all">All Modes</option>
              <option value="in-person">In-Person</option>
              <option value="hybrid">Hybrid</option>
              <option value="virtual">Virtual</option>
            </select>
          </div>
        </div>

        {/* Active Results Summary */}
        <div className="flex items-center justify-between px-2 text-xs font-mono text-mist">
          <span>SHOWING {filteredEvents.length} UPCOMING CHAPTER EVENTS</span>
          {filters.search && (
            <button
              onClick={() => setFilters({ search: '', category: 'all', mode: 'all', feeType: 'all' })}
              className="text-[#27FCF2] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-surface/30 border border-white/5 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-white/5 mx-auto flex items-center justify-center text-mist">
              <Filter className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">No Matching Events Found</h3>
            <p className="text-xs text-mist max-w-sm mx-auto">
              Try adjusting your search query or reset your filters to see all available chapter events.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((evt) => (
              <EventCard
                key={evt.id}
                event={evt}
                onViewDetails={onViewDetails}
                onRegister={onRegister}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
