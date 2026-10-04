import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import type { EventItem, Registration } from '../../types';
import { storageService } from '../../services/storage';
import { sound } from '../../utils/audio';
import { useToast } from '../ui/Toast';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Lock, 
  CheckCircle2, 
  Sparkles, 
  Ticket, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';

interface RegistrationModalProps {
  event: EventItem | null;
  onClose: () => void;
  onSuccess: (newRegistration: Registration) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ event, onClose, onSuccess }) => {
  const { error: toastError, success: toastSuccess } = useToast();

  // Form State
  const [formData, setFormData] = useState({
    name: 'Pranjali Santani',
    email: 'pranjali.santani@jyothyit.ac.in',
    phone: '9845122334',
    usn: '1JT22CS092',
    college: 'Jyothy Institute of Technology',
    branch: 'Computer Science & Engineering',
    semester: '6th Semester',
    teamName: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'NetBanking'>('UPI');
  const [upiId, setUpiId] = useState('pranjali@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8912');
  const [expiry, setExpiry] = useState('08/28');
  const [cvv, setCvv] = useState('881');

  // Checkout Step: 1 = Details, 2 = Payment Gateway, 3 = Verified Confirmation
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdRegistration, setCreatedRegistration] = useState<Registration | null>(null);
  const [idempotencyKey] = useState<string>(() => `IDEMP_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`);

  if (!event) return null;

  const isFree = event.fee === 0;

  const validateForm = (): boolean => {
    setErrorMessage(null);

    if (!formData.name.trim()) {
      setErrorMessage('Full name is required.');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Please enter a valid academic/personal email address.');
      return false;
    }
    if (!formData.usn.trim() || formData.usn.trim().length < 5) {
      setErrorMessage('Please enter a valid College USN (e.g. 1JT22CS092).');
      return false;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number for WhatsApp ticket alerts.');
      return false;
    }
    return true;
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    if (!validateForm()) return;

    // Check capacity first
    if (event.isSoldOut || event.registeredCount >= event.capacity) {
      setErrorMessage(`Sorry! "${event.title}" has reached full capacity (${event.capacity} seats).`);
      return;
    }

    if (isFree) {
      // Free events skip payment gateway directly to instant registration
      executeRegistration('Free Pass');
    } else {
      setStep(2); // Proceed to simulated Razorpay/Stripe checkout
    }
  };

  const executeRegistration = async (selectedMethod: 'UPI' | 'Card' | 'NetBanking' | 'Free Pass') => {
    setIsProcessing(true);
    setErrorMessage(null);

    // Realistic network simulation & webhook verification
    await new Promise((resolve) => setTimeout(resolve, 1400));

    try {
      const { registration } = storageService.reserveSlotAndRegister({
        eventId: event.id,
        attendee: {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          usn: formData.usn.trim().toUpperCase(),
          college: formData.college.trim(),
          branch: formData.branch.trim(),
          semester: formData.semester.trim(),
          teamName: formData.teamName.trim() || undefined,
        },
        paymentMethod: selectedMethod,
        idempotencyKey,
      });

      // Celebration effects!
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#27FCF2', '#3064D0', '#8739D5', '#ffffff'],
      });
      sound.playSuccess();

      setCreatedRegistration(registration);
      setStep(3);
      toastSuccess('Registration Confirmed!', `Ticket #${registration.ticketNumber} generated.`);
      onSuccess(registration);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      setErrorMessage(msg);
      sound.playErrorBuzzer();
      toastError('Registration Failed', msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl my-6 bg-[#0c1017] rounded-3xl border border-white/10 shadow-2xl overflow-hidden text-bone">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-surface to-surface-subtle">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-[#27FCF2] uppercase tracking-wider font-semibold">
                EVENT REGISTRATION
              </span>
              <span className="text-dim">•</span>
              <span className="font-mono text-[11px] text-mist">
                STEP {step} OF {isFree ? 2 : 3}
              </span>
            </div>
            <h2 className="text-lg font-bold font-display text-white mt-1 line-clamp-1">{event.title}</h2>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 text-mist hover:text-white rounded-full hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-200 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-semibold block text-sm mb-0.5">Registration Warning</span>
              {errorMessage}
            </div>
          </div>
        )}

        {/* STEP 1: Attendee Information Form */}
        {step === 1 && (
          <form onSubmit={handleProceedToPayment} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-mist mb-1.5 uppercase">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-white/10 text-white text-sm focus:outline-none focus:border-[#27FCF2] transition"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-mist mb-1.5 uppercase">College USN *</label>
                <input
                  type="text"
                  required
                  value={formData.usn}
                  onChange={(e) => setFormData({ ...formData, usn: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#27FCF2] uppercase transition"
                  placeholder="1JT22CS000"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-mist mb-1.5 uppercase">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-white/10 text-white text-sm focus:outline-none focus:border-[#27FCF2] transition"
                  placeholder="name@jyothyit.ac.in"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-mist mb-1.5 uppercase">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#27FCF2] transition"
                  placeholder="9876543210"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-mist mb-1.5 uppercase">Branch / Department</label>
                <select
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-white/10 text-white text-sm focus:outline-none focus:border-[#27FCF2] transition"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                  <option value="Information Science & Engineering">Information Science & Engineering (ISE)</option>
                  <option value="Artificial Intelligence & Data Science">AI & Data Science (AIDS)</option>
                  <option value="Electronics & Communication">Electronics & Communication (ECE)</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Other">Other College / External</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-mist mb-1.5 uppercase">Current Semester</label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-white/10 text-white text-sm focus:outline-none focus:border-[#27FCF2] transition"
                >
                  <option value="2nd Semester">2nd Semester (1st Year)</option>
                  <option value="4th Semester">4th Semester (2nd Year)</option>
                  <option value="6th Semester">6th Semester (3rd Year)</option>
                  <option value="8th Semester">8th Semester (4th Year)</option>
                  <option value="PG / Alumni">PG / Alumni</option>
                </select>
              </div>
            </div>

            {event.category === 'Hackathon' && (
              <div className="pt-2">
                <label className="block text-xs font-mono text-mist mb-1.5 uppercase">Team Name (Optional for Squads)</label>
                <input
                  type="text"
                  value={formData.teamName}
                  onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-white/10 text-white text-sm focus:outline-none focus:border-[#27FCF2] transition"
                  placeholder="e.g. CyberVanguard"
                />
              </div>
            )}

            {/* Price Summary Breakdown */}
            <div className="mt-4 p-4 rounded-2xl bg-surface-subtle/80 border border-white/5 space-y-2">
              <div className="flex justify-between text-xs text-mist">
                <span>Registration Type:</span>
                <span className="font-semibold text-bone">{isFree ? 'Free Student Admission' : 'Standard Delegate Ticket'}</span>
              </div>
              <div className="flex justify-between text-xs text-mist">
                <span>Convenience / Platform Fee:</span>
                <span className="text-emerald-400 font-mono">₹0.00 (Subsidized by JIT ACM)</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between items-center text-sm font-bold text-white">
                <span>Total Amount Due:</span>
                <span className="font-mono text-base text-[#27FCF2]">
                  {isFree ? 'FREE PASS' : `₹${event.fee}`}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-mono text-mist hover:text-white border border-white/10 hover:border-white/20 transition"
              >
                CANCEL
              </button>

              <button
                type="submit"
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-[#3064D0] to-[#27FCF2] text-[#060709] font-bold text-xs font-mono shadow-lg shadow-[#27FCF2]/20 hover:opacity-95 transition disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>VERIFYING CAPACITY...</span>
                  </>
                ) : isFree ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>CLAIM FREE TICKET PASS</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>PROCEED TO SECURE PAY (₹{event.fee})</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Secure Payment Gateway Simulator */}
        {step === 2 && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-surface/70 border border-white/10">
              <div className="space-y-0.5">
                <span className="font-mono text-[10px] text-mist uppercase">JIT ACM PAYMENT GATEWAY</span>
                <p className="font-mono text-xs text-white">Order: ORD_JIT_{Math.floor(100000 + Math.random() * 900000)}</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-[10px] text-mist uppercase">TOTAL CHARGE</span>
                <p className="font-mono text-xl font-extrabold text-[#27FCF2]">₹{event.fee}</p>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setPaymentMethod('UPI');
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs transition ${
                  paymentMethod === 'UPI'
                    ? 'bg-[#27FCF2]/10 border-[#27FCF2] text-[#27FCF2]'
                    : 'bg-surface border-white/10 text-mist hover:text-white'
                }`}
              >
                <Smartphone className="w-5 h-5 mb-1" />
                <span className="font-mono font-semibold">UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setPaymentMethod('Card');
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs transition ${
                  paymentMethod === 'Card'
                    ? 'bg-[#27FCF2]/10 border-[#27FCF2] text-[#27FCF2]'
                    : 'bg-surface border-white/10 text-mist hover:text-white'
                }`}
              >
                <CreditCard className="w-5 h-5 mb-1" />
                <span className="font-mono font-semibold">CARDS</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setPaymentMethod('NetBanking');
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs transition ${
                  paymentMethod === 'NetBanking'
                    ? 'bg-[#27FCF2]/10 border-[#27FCF2] text-[#27FCF2]'
                    : 'bg-surface border-white/10 text-mist hover:text-white'
                }`}
              >
                <Building2 className="w-5 h-5 mb-1" />
                <span className="font-mono font-semibold">NET BANKING</span>
              </button>
            </div>

            {/* Payment Method Form Body */}
            {paymentMethod === 'UPI' && (
              <div className="p-4 rounded-2xl bg-surface/50 border border-white/5 space-y-3">
                <label className="block text-xs font-mono text-mist uppercase">Enter Virtual Payment Address (VPA / UPI ID)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#27FCF2]"
                    placeholder="yourname@upi"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      executeRegistration('UPI');
                    }}
                    disabled={isProcessing}
                    className="px-4 py-2.5 rounded-xl bg-[#27FCF2] text-black font-mono font-bold text-xs hover:bg-[#27FCF2]/90 disabled:opacity-50"
                  >
                    VERIFY & PAY
                  </button>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-mist/70 pt-1">
                  <span>Supported Apps:</span>
                  <span className="font-mono text-white">GooglePay • PhonePe • Paytm • CRED UPI</span>
                </div>
              </div>
            )}

            {paymentMethod === 'Card' && (
              <div className="p-4 rounded-2xl bg-surface/50 border border-white/5 space-y-3">
                <div>
                  <label className="block text-xs font-mono text-mist uppercase mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#27FCF2]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-mist uppercase mb-1">Expiry</label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#27FCF2]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-mist uppercase mb-1">CVV</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#27FCF2]"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'NetBanking' && (
              <div className="p-4 rounded-2xl bg-surface/50 border border-white/5 space-y-3">
                <label className="block text-xs font-mono text-mist uppercase mb-1">Select Bank</label>
                <select className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-sm">
                  <option>HDFC Bank</option>
                  <option>State Bank of India (SBI)</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                  <option>Kotak Mahindra Bank</option>
                </select>
              </div>
            )}

            {/* Security Guarantee Pill */}
            <div className="flex items-center justify-between text-[11px] font-mono text-mist/60 border-t border-white/5 pt-3">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>256-Bit SSL Encrypted Verification</span>
              </div>
              <span>IDEMP: {idempotencyKey.slice(0, 14)}...</span>
            </div>

            {/* Payment Trigger Buttons */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl text-xs font-mono text-mist hover:text-white border border-white/10"
              >
                BACK
              </button>

              <button
                type="button"
                onClick={() => executeRegistration(paymentMethod)}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-[#27FCF2] to-[#3064D0] text-[#060709] font-bold text-xs font-mono shadow-lg hover:opacity-95 transition disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AUTHORIZING PAYMENT & WEBHOOK...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CONFIRM & PAY ₹{event.fee}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Confirmed Ticket Preview */}
        {step === 3 && createdRegistration && (
          <div className="p-8 text-center space-y-5 animate-in zoom-in-95 duration-300">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="font-mono text-xs text-[#27FCF2] uppercase tracking-widest">REGISTRATION SUCCESSFUL</span>
              <h3 className="text-2xl font-bold font-display text-white mt-1">You’re All Set for the Event!</h3>
              <p className="text-xs text-mist mt-1 max-w-md mx-auto">
                A confirmation has been recorded and ticket #{createdRegistration.ticketNumber} is ready for admission.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface/70 border border-white/10 max-w-sm mx-auto text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-mist">Ticket Number:</span>
                <span className="font-mono font-bold text-white">{createdRegistration.ticketNumber}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-mist">Attendee:</span>
                <span className="font-semibold text-bone">{createdRegistration.attendee.name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-mist">College USN:</span>
                <span className="font-mono text-[#27FCF2]">{createdRegistration.attendee.usn}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-mist">Payment Status:</span>
                <span className="text-emerald-400 font-semibold uppercase">{createdRegistration.payment.status}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-white/10 text-xs font-mono text-mist hover:text-white transition"
              >
                DONE
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onClose();
                  onSuccess(createdRegistration);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8739D5] to-[#27FCF2] text-white font-bold font-mono text-xs shadow-lg shadow-[#8739D5]/30 hover:opacity-95 transition"
              >
                <Ticket className="w-4 h-4" />
                <span>VIEW DIGITAL QR PASS</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
