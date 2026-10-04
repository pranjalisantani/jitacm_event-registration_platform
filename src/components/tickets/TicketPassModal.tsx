import React, { useEffect, useState, useRef } from 'react';
import type { Registration } from '../../types';
import { generateQRCodeDataUrl } from '../../utils/qr';
import { sound } from '../../utils/audio';
import { useToast } from '../ui/Toast';
import { 
  X, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  Calendar, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  QrCode 
} from 'lucide-react';

interface TicketPassModalProps {
  registration: Registration | null;
  onClose: () => void;
}

export const TicketPassModal: React.FC<TicketPassModalProps> = ({ registration, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);
  const { success } = useToast();

  useEffect(() => {
    if (registration) {
      generateQRCodeDataUrl(registration.qrToken).then((url) => {
        setQrDataUrl(url);
      });
    }
  }, [registration]);

  if (!registration) return null;

  const handleCopyToken = () => {
    sound.playClick();
    navigator.clipboard.writeText(registration.qrToken);
    setCopied(true);
    success('Token Copied!', 'Use this token in the Organizer QR Terminal to test check-in verification.');
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg my-8">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute -top-12 right-0 p-2 text-mist hover:text-white bg-surface/80 rounded-full border border-white/10 hover:border-white/30 transition-colors"
          aria-label="Close pass"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Outer Pass Glow Container */}
        <div className="gradient-border-box p-[1.5px] rounded-3xl shadow-2xl shadow-[#27FCF2]/10">
          <div
            ref={ticketRef}
            className="bg-[#0b0e14] rounded-3xl overflow-hidden border border-white/10 text-bone select-none"
          >
            {/* Ticket Header Foil */}
            <div className="relative p-6 bg-gradient-to-r from-[#0d131f] via-[#131b2c] to-[#0d131f] border-b border-white/10">
              <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-[#27FCF2] to-transparent opacity-80" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#8739D5] to-[#3064D0] p-0.5 shadow-lg shadow-[#3064D0]/30">
                    <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0a0d14]">
                      <span className="font-mono text-xs font-black tracking-wider text-[#27FCF2]">ACM</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm tracking-wide text-white">JYOTHY INSTITUTE OF TECHNOLOGY</h3>
                    <p className="font-mono text-[10px] text-[#27FCF2] tracking-wider uppercase">ACM STUDENT CHAPTER PASS</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#27FCF2]/10 text-[#27FCF2] border border-[#27FCF2]/30">
                    <Sparkles className="w-3 h-3" /> OFFICIAL PASS
                  </span>
                </div>
              </div>
            </div>

            {/* Event Name & Banner Accent */}
            <div className="p-6 pb-4">
              <span className="font-mono text-[11px] text-mist uppercase tracking-widest">EVENT ADMISSION TICKET</span>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white mt-1 leading-snug">
                {registration.eventTitle}
              </h2>

              {/* Event Time & Venue Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs text-mist">
                <div className="flex items-center gap-2 bg-surface/60 p-2.5 rounded-xl border border-white/5">
                  <Calendar className="w-4 h-4 text-[#27FCF2] shrink-0" />
                  <span className="truncate">{new Date(registration.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2 bg-surface/60 p-2.5 rounded-xl border border-white/5">
                  <MapPin className="w-4 h-4 text-[#8739D5] shrink-0" />
                  <span className="truncate">{registration.eventVenue}</span>
                </div>
              </div>
            </div>

            {/* Perforated Notches & Dotted Tear Line */}
            <div className="relative flex items-center my-1">
              <div className="w-5 h-10 rounded-r-full bg-black/80 border-r border-y border-white/10" />
              <div className="flex-1 border-b-2 border-dashed border-white/15 mx-3" />
              <div className="w-5 h-10 rounded-l-full bg-black/80 border-l border-y border-white/10" />
            </div>

            {/* Attendee Details & Dynamic QR Code Section */}
            <div className="p-6 pt-3 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-mono text-[10px] text-mist/70 uppercase">ATTENDEE NAME</span>
                  <p className="font-semibold text-sm text-bone mt-0.5">{registration.attendee.name}</p>
                </div>
                <div>
                  <span className="font-mono text-[10px] text-mist/70 uppercase">COLLEGE USN</span>
                  <p className="font-mono font-semibold text-sm text-[#27FCF2] mt-0.5">{registration.attendee.usn}</p>
                </div>
                <div>
                  <span className="font-mono text-[10px] text-mist/70 uppercase">TICKET NUMBER</span>
                  <p className="font-mono font-bold text-xs text-white mt-0.5 tracking-wider">{registration.ticketNumber}</p>
                </div>
                <div>
                  <span className="font-mono text-[10px] text-mist/70 uppercase">PAYMENT STATUS</span>
                  <p className="font-semibold text-xs mt-0.5">
                    {registration.payment.status === 'free' ? (
                      <span className="text-emerald-400">FREE ADMISSION</span>
                    ) : (
                      <span className="text-[#27FCF2]">PAID ₹{registration.payment.amount} ({registration.payment.method})</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Scannable QR Code Canvas */}
              <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/5 border border-white/10">
                <div className="p-3 bg-white rounded-2xl shadow-xl shadow-black/60 relative group">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="Event QR Code" className="w-48 h-48 rounded-lg" />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded-lg">
                      <QrCode className="w-16 h-16 text-gray-400 animate-pulse" />
                    </div>
                  )}

                  {/* Overlay Watermark Badge */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-[#060709]/90 border border-[#27FCF2]/50 text-[#27FCF2] text-[9px] font-mono font-bold px-2 py-1 rounded shadow-md">
                      JITACM
                    </div>
                  </div>
                </div>

                {/* Live Entry Status Pill */}
                <div className="mt-4">
                  {registration.checkIn.isCheckedIn ? (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono text-xs font-semibold animate-pulse">
                      <ShieldCheck className="w-4 h-4" /> CHECKED IN • ENTRY APPROVED
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#27FCF2]/10 text-[#27FCF2] border border-[#27FCF2]/30 font-mono text-xs font-semibold">
                      <Clock className="w-4 h-4" /> READY FOR VENUE CHECK-IN
                    </div>
                  )}
                </div>

                <p className="font-mono text-[10px] text-mist/60 mt-2 text-center">
                  Scan at the auditorium entrance gate with the organizer mobile scanner.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={handleCopyToken}
                  className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-surface hover:bg-surface-hover border border-white/10 text-xs font-mono text-mist hover:text-white transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#27FCF2]" />}
                  <span>{copied ? 'TOKEN COPIED' : 'COPY QR STRING'}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-surface hover:bg-surface-hover border border-white/10 text-xs font-mono text-mist hover:text-white transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>PRINT PASS</span>
                </button>

                {qrDataUrl && (
                  <a
                    href={qrDataUrl}
                    download={`${registration.ticketNumber}-JITACM-PASS.png`}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#3064D0] to-[#27FCF2] text-[#060709] text-xs font-bold font-mono shadow-md hover:opacity-95 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>SAVE QR</span>
                  </a>
                )}
              </div>
            </div>

            {/* Footer Hash Stamp */}
            <div className="bg-black/50 p-3 px-6 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-mist/40">
              <span className="truncate max-w-[200px]">HASH: {registration.payment.transactionHash.slice(0, 18)}...</span>
              <span>JITACM SECURE AUTH</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
