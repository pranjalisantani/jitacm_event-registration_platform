import type { EventItem, Registration, CheckInVerificationResult } from '../types';
import { generateTicketQRToken, parseTicketQRToken } from '../utils/qr';

const EVENTS_STORAGE_KEY = 'jitacm_events_v2';
const REGISTRATIONS_STORAGE_KEY = 'jitacm_registrations_v2';

// High quality initial seed events
const SEED_EVENTS: EventItem[] = [
  {
    id: 'evt-codestorm-2026',
    title: 'CodeStorm 2026: 24-Hour National Hackathon',
    slug: 'codestorm-2026',
    tagline: 'Build, hack, deploy. 24 hours of non-stop computing innovation.',
    description: 'CodeStorm is JITACM’s flagship annual hackathon bringing together the brightest engineering minds across the nation. Form your squad of 2-4, tackle challenges across AI/ML, Web3, FinTech, and Cloud Systems, and compete for a prize pool of ₹1,00,000+ with industry mentors and angel scouts.',
    category: 'Hackathon',
    mode: 'in-person',
    venue: 'JIT Central Computing Complex & Auditorium 2',
    date: '2026-10-24',
    time: '09:00 AM - 09:00 AM (24 Hours)',
    registrationDeadline: '2026-10-22T23:59:59Z',
    bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    fee: 299,
    currency: 'INR',
    capacity: 120,
    registeredCount: 88,
    checkedInCount: 42,
    tags: ['AI/ML', 'Web3', 'Prize ₹1L+', 'Hackathon', 'Overnight'],
    isFeatured: true,
    isSoldOut: false,
    organizerEmail: 'acm.chair@jyothyit.ac.in',
    organizerPhone: '+91 98450 12345',
    createdAt: '2026-09-15T10:00:00Z',
    speakers: [
      { name: 'Dr. Arvind Sharma', role: 'Staff AI Researcher', company: 'Google DeepMind', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
      { name: 'Nisha V. Rao', role: 'Engineering Director', company: 'Atlassian India', avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80' }
    ],
    schedule: [
      { time: '09:00 AM', title: 'Check-in, Kit Distribution & Breakfast' },
      { time: '10:30 AM', title: 'Opening Keynote & Problem Statements Release' },
      { time: '11:00 AM', title: 'Hacking Begins (Round 1 Ideation)' },
      { time: '04:00 PM', title: 'Mentorship Checkpoint & Architecture Review' },
      { time: '08:30 PM', title: 'Dinner & Midnight Algorithmic Trivia' },
      { time: '08:00 AM', title: 'Code Freeze & Project Submission' },
      { time: '10:00 AM', title: 'Grand Jury Pitches & Awards Ceremony' }
    ],
    perks: [
      'Official ACM National Hackathon Certificate',
      'Exclusive JITACM Cyber-Hacker T-Shirt & Swag Kit',
      'Continuous RedBull & Catering (4 meals + refreshments)',
      'Direct interview fast-tracks for top 5 teams',
      'AWS & GitHub Cloud Credits'
    ],
    rules: [
      'Teams must consist of 2 to 4 undergraduate students.',
      'All code must be written during the 24-hour hackathon period.',
      'Plagiarism or pre-built repositories will lead to immediate disqualification.',
      'Carrying college ID cards and JITACM digital passes is mandatory.'
    ]
  },
  {
    id: 'evt-genai-masterclass',
    title: 'Hands-on Generative AI & LLM Systems Workshop',
    slug: 'genai-masterclass',
    tagline: 'From RAG pipelines to fine-tuned autonomous agents in production.',
    description: 'A deep-dive technical workshop designed to take you from foundational Transformer architectures to deploying scalable Agentic workflows with LangChain, Vector Databases, and custom multimodal models. Hands-on coding exercises with real GPU notebooks provided.',
    category: 'Workshop',
    mode: 'hybrid',
    venue: 'AI Research Lab (Block B, 3rd Floor) & Live Stream',
    date: '2026-10-18',
    time: '10:00 AM - 04:30 PM',
    registrationDeadline: '2026-10-17T18:00:00Z',
    bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    fee: 149,
    currency: 'INR',
    capacity: 75,
    registeredCount: 68,
    checkedInCount: 15,
    tags: ['GenAI', 'LLMs', 'RAG', 'Python', 'Hands-on'],
    isFeatured: true,
    isSoldOut: false,
    organizerEmail: 'tech.acm@jyothyit.ac.in',
    organizerPhone: '+91 94812 67890',
    createdAt: '2026-09-18T10:00:00Z',
    speakers: [
      { name: 'Karthik Sundaram', role: 'Principal ML Engineer', company: 'Cisco Systems', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' }
    ],
    schedule: [
      { time: '10:00 AM', title: 'Foundations of Attention & LLM Architectures' },
      { time: '11:30 AM', title: 'Building Hybrid RAG with Vector Search' },
      { time: '01:00 PM', title: 'Lunch & Networking Break' },
      { time: '02:00 PM', title: 'Agentic Tool-Calling & Evaluators Lab' },
      { time: '03:45 PM', title: 'Deploying High-Throughput APIs & Wrap-up' }
    ],
    perks: [
      'ACM Generative AI Specialization Certificate',
      'Free $50 GPU Compute Credits',
      'Production-ready boilerplate code repositories',
      'Complimentary Lunch & ACM stickers pack'
    ],
    rules: [
      'Participants must bring a laptop with Python 3.10+ installed or a modern browser for Colab.',
      'Basic familiarity with Python and basic data structures is recommended.'
    ]
  },
  {
    id: 'evt-bytebattle-5',
    title: 'ByteBattle 5.0: ICPC-Style Competitive Coding Clash',
    slug: 'bytebattle-5',
    tagline: '3 hours, 7 algorithmic challenges, pure intellectual adrenaline.',
    description: 'Test your problem-solving speed, data structures mastery, and mathematical intuition in ByteBattle 5.0. Ranked contest on our private arena with immediate live leaderboards, freeze-time excitement, and ACM trophies for the top speed coders.',
    category: 'Competition',
    mode: 'in-person',
    venue: 'JIT High Performance Computing Center (Lab 1 & 2)',
    date: '2026-10-12',
    time: '02:00 PM - 05:30 PM',
    registrationDeadline: '2026-10-11T20:00:00Z',
    bannerUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    fee: 0, // Free event
    currency: 'INR',
    capacity: 100,
    registeredCount: 94,
    checkedInCount: 0,
    tags: ['DSA', 'Competitive Coding', 'Free Entry', 'ICPC Style'],
    isFeatured: false,
    isSoldOut: false,
    organizerEmail: 'competitions.acm@jyothyit.ac.in',
    organizerPhone: '+91 91234 56789',
    createdAt: '2026-09-20T10:00:00Z',
    schedule: [
      { time: '02:00 PM', title: 'System Setup & Contest Practice Warm-up' },
      { time: '02:30 PM', title: 'Contest Commences (7 Problem Statements)' },
      { time: '05:00 PM', title: 'Contest Ends & Scoreboard Unfreezing' },
      { time: '05:15 PM', title: 'Editorial Discussion & Prize Distribution' }
    ],
    perks: [
      'Ranked ACM Merit Badges',
      'Direct qualification for JIT Inter-College ICPC Team',
      'Certificates of Distinction for Top 10% coders',
      'Free snacks and beverage vouchers'
    ],
    rules: [
      'Individual participation only.',
      'Supported languages: C++, Java, Python, Rust.',
      'Strict zero-tolerance policy on code similarity or AI tools.'
    ]
  },
  {
    id: 'evt-cybersphere-summit',
    title: 'CyberSphere 2026: Cloud Security & Red Teaming Summit',
    slug: 'cybersphere-summit',
    tagline: 'Deconstruct zero-days, exploit cloud primitives, defend enterprise perimeters.',
    description: 'An intensive technical summit featuring live demonstrations of kernel exploitation, AWS IAM privilege escalation, Active Directory attack paths, and automated purple teaming. Includes a 2-hour mini Capture The Flag (CTF) arena.',
    category: 'Tech Talk',
    mode: 'in-person',
    venue: 'Auditorium 1, Silver Jubilee Block',
    date: '2026-11-04',
    time: '10:00 AM - 04:00 PM',
    registrationDeadline: '2026-11-02T23:59:59Z',
    bannerUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
    fee: 199,
    currency: 'INR',
    capacity: 90,
    registeredCount: 45,
    checkedInCount: 0,
    tags: ['Cybersecurity', 'CTF', 'Cloud Security', 'Red Teaming'],
    isFeatured: false,
    isSoldOut: false,
    organizerEmail: 'cyber.acm@jyothyit.ac.in',
    organizerPhone: '+91 98860 54321',
    createdAt: '2026-09-25T10:00:00Z',
    speakers: [
      { name: 'Aditya Nair', role: 'Lead Threat Researcher', company: 'CrowdStrike', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' }
    ],
    schedule: [
      { time: '10:00 AM', title: 'Modern Cloud Breach Anatomies' },
      { time: '11:45 AM', title: 'Interactive Live Exploit Breakdown' },
      { time: '01:00 PM', title: 'Networking Lunch' },
      { time: '02:00 PM', title: 'Speed CTF Challenge Arena' },
      { time: '03:30 PM', title: 'CTF Walkthroughs & Trophies' }
    ],
    perks: [
      'Official CyberSphere Badge & Certificate',
      'Exclusive 3-Month TryHackMe / HackTheBox VIP Vouchers',
      'Summit Lunch & Cybersecurity toolkits bundle'
    ],
    rules: [
      'Target environments during the live CTF are isolated sandboxes.',
      'Attacking unauthorized campus infrastructure will result in permanent expulsion from ACM.'
    ]
  },
  {
    id: 'evt-devsprint-web3',
    title: 'ACM DevSprint: Building Scalable Web3 Microservices',
    slug: 'devsprint-web3',
    tagline: 'Smart contract security, high-throughput RPCs, and decentralized storage.',
    description: 'Learn how to architect enterprise-grade decentralized systems with EVM contracts, Zero Knowledge proofs, and distributed indexing with GraphQL. Perfect for developers looking to build next-generation fintech protocols.',
    category: 'Workshop',
    mode: 'hybrid',
    venue: 'Seminar Hall 3 & Discord Stream',
    date: '2026-11-12',
    time: '01:30 PM - 05:30 PM',
    registrationDeadline: '2026-11-10T23:59:59Z',
    bannerUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80',
    fee: 99,
    currency: 'INR',
    capacity: 60,
    registeredCount: 60,
    checkedInCount: 0,
    tags: ['Web3', 'Blockchain', 'Smart Contracts', 'Sold Out Test'],
    isFeatured: false,
    isSoldOut: true, // Example sold-out event to test overbooking UX
    organizerEmail: 'web3.acm@jyothyit.ac.in',
    organizerPhone: '+91 97400 11223',
    createdAt: '2026-09-22T10:00:00Z',
    schedule: [
      { time: '01:30 PM', title: 'Solidity Pitfalls & Gas Optimization Tricks' },
      { time: '03:00 PM', title: 'Building Indexers with The Graph & SubQuery' },
      { time: '04:30 PM', title: 'Hands-on ZK-Proof Verification on EVM' }
    ],
    perks: ['Web3 Developer Certificate', 'Testnet Gas Tokens', 'Exclusive Discord Role']
  }
];

// High quality initial seed registrations for immediate demonstration
const SEED_REGISTRATIONS: Registration[] = [
  {
    id: 'reg-001',
    ticketNumber: 'JITACM-2026-C891',
    eventId: 'evt-codestorm-2026',
    eventTitle: 'CodeStorm 2026: 24-Hour National Hackathon',
    eventDate: '2026-10-24',
    eventVenue: 'JIT Central Computing Complex & Auditorium 2',
    attendee: {
      name: 'Pranjali Santani',
      email: 'pranjali.santani@jyothyit.ac.in',
      phone: '+91 98451 22334',
      usn: '1JT22CS092',
      college: 'Jyothy Institute of Technology',
      branch: 'Computer Science & Engineering',
      semester: '6th Semester',
      teamName: 'Team Algorhythm'
    },
    payment: {
      orderId: 'ORD_JIT_884102',
      paymentId: 'PAY_SIM_99214481',
      amount: 299,
      currency: 'INR',
      status: 'paid',
      method: 'UPI',
      paidAt: '2026-10-01T14:22:10Z',
      idempotencyKey: 'IDEMP_991823901',
      transactionHash: '0x8f192b49128ca81920de01824192bfa9102'
    },
    status: 'confirmed',
    registeredAt: '2026-10-01T14:22:15Z',
    qrToken: generateTicketQRToken('JITACM-2026-C891', 'evt-codestorm-2026', '1JT22CS092'),
    checkIn: {
      isCheckedIn: false
    }
  },
  {
    id: 'reg-002',
    ticketNumber: 'JITACM-2026-G104',
    eventId: 'evt-genai-masterclass',
    eventTitle: 'Hands-on Generative AI & LLM Systems Workshop',
    eventDate: '2026-10-18',
    eventVenue: 'AI Research Lab (Block B, 3rd Floor) & Live Stream',
    attendee: {
      name: 'Rahul K. Sharma',
      email: 'rahul.sharma@jyothyit.ac.in',
      phone: '+91 97410 88221',
      usn: '1JT22IS045',
      college: 'Jyothy Institute of Technology',
      branch: 'Information Science & Engineering',
      semester: '6th Semester'
    },
    payment: {
      orderId: 'ORD_JIT_771920',
      paymentId: 'PAY_SIM_88192014',
      amount: 149,
      currency: 'INR',
      status: 'paid',
      method: 'Card',
      paidAt: '2026-10-02T11:15:30Z',
      idempotencyKey: 'IDEMP_881920149',
      transactionHash: '0x718a992e1049c8192ba019e092182049182'
    },
    status: 'confirmed',
    registeredAt: '2026-10-02T11:15:35Z',
    qrToken: generateTicketQRToken('JITACM-2026-G104', 'evt-genai-masterclass', '1JT22IS045'),
    checkIn: {
      isCheckedIn: true,
      checkedInAt: '2026-10-04T09:45:00Z',
      verifiedBy: 'ACM Registration Desk 1'
    }
  },
  {
    id: 'reg-003',
    ticketNumber: 'JITACM-2026-B330',
    eventId: 'evt-bytebattle-5',
    eventTitle: 'ByteBattle 5.0: ICPC-Style Competitive Coding Clash',
    eventDate: '2026-10-12',
    eventVenue: 'JIT High Performance Computing Center (Lab 1 & 2)',
    attendee: {
      name: 'Aditi Deshmukh',
      email: 'aditi.d@jyothyit.ac.in',
      phone: '+91 94480 33441',
      usn: '1JT23AI012',
      college: 'Jyothy Institute of Technology',
      branch: 'Artificial Intelligence & Data Science',
      semester: '4th Semester'
    },
    payment: {
      orderId: 'ORD_FREE_441029',
      paymentId: 'FREE_PASS_CLAIMED',
      amount: 0,
      currency: 'INR',
      status: 'free',
      method: 'Free Pass',
      paidAt: '2026-10-03T16:05:12Z',
      idempotencyKey: 'IDEMP_FREE_33091',
      transactionHash: '0x0000000000000000000000000000000000'
    },
    status: 'confirmed',
    registeredAt: '2026-10-03T16:05:15Z',
    qrToken: generateTicketQRToken('JITACM-2026-B330', 'evt-bytebattle-5', '1JT23AI012'),
    checkIn: {
      isCheckedIn: false
    }
  }
];

class StorageService {
  // Read events from localStorage with seed fallback
  getEvents(): EventItem[] {
    try {
      const data = localStorage.getItem(EVENTS_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error loading events:', e);
    }
    // Initialize with seed
    this.saveEvents(SEED_EVENTS);
    return SEED_EVENTS;
  }

  saveEvents(events: EventItem[]) {
    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
      console.error('Error saving events:', e);
    }
  }

  getEventById(id: string): EventItem | undefined {
    return this.getEvents().find((e) => e.id === id);
  }

  // Read registrations from localStorage
  getRegistrations(): Registration[] {
    try {
      const data = localStorage.getItem(REGISTRATIONS_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error loading registrations:', e);
    }
    this.saveRegistrations(SEED_REGISTRATIONS);
    return SEED_REGISTRATIONS;
  }

  saveRegistrations(registrations: Registration[]) {
    try {
      localStorage.setItem(REGISTRATIONS_STORAGE_KEY, JSON.stringify(registrations));
    } catch (e) {
      console.error('Error saving registrations:', e);
    }
  }

  getRegistrationsByEmailOrUSN(identifier: string): Registration[] {
    const clean = identifier.trim().toLowerCase();
    return this.getRegistrations().filter(
      (r) =>
        r.attendee.email.toLowerCase() === clean ||
        r.attendee.usn.toLowerCase() === clean
    );
  }

  /**
   * Concurrency Guard & Atomic Slot Reservation
   * Prevents overbooking and duplicate registrations
   */
  reserveSlotAndRegister(params: {
    eventId: string;
    attendee: Registration['attendee'];
    paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'Free Pass';
    idempotencyKey: string;
  }): { registration: Registration; event: EventItem } {
    const events = this.getEvents();
    const eventIndex = events.findIndex((e) => e.id === params.eventId);

    if (eventIndex === -1) {
      throw new Error('Event not found.');
    }

    const event = events[eventIndex];

    // 1. Check Deadline
    const now = new Date();
    if (new Date(event.registrationDeadline) < now) {
      throw new Error(`Registration closed on ${new Date(event.registrationDeadline).toLocaleDateString()}.`);
    }

    // 2. Concurrency & Overbooking Guard
    if (event.isSoldOut || event.registeredCount >= event.capacity) {
      // Mark as sold out immediately
      events[eventIndex].isSoldOut = true;
      this.saveEvents(events);
      throw new Error(`Registration failed: '${event.title}' is completely booked! (Capacity: ${event.capacity} reached).`);
    }

    // 3. Duplicate Registration Guard (USN + Email)
    const registrations = this.getRegistrations();
    const cleanUSN = params.attendee.usn.trim().toUpperCase();
    const cleanEmail = params.attendee.email.trim().toLowerCase();

    const existingReg = registrations.find(
      (r) =>
        r.eventId === params.eventId &&
        r.status === 'confirmed' &&
        (r.attendee.usn.trim().toUpperCase() === cleanUSN ||
         r.attendee.email.trim().toLowerCase() === cleanEmail)
    );

    if (existingReg) {
      throw new Error(
        `Duplicate registration! Attendee with USN "${cleanUSN}" or Email "${cleanEmail}" already holds confirmed ticket ${existingReg.ticketNumber} for this event.`
      );
    }

    // 4. Check Idempotency Key (prevents duplicate payment / click bursts)
    const existingIdemp = registrations.find(
      (r) => r.payment.idempotencyKey === params.idempotencyKey
    );
    if (existingIdemp) {
      return { registration: existingIdemp, event };
    }

    // 5. Generate secure ticket number & tokens
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const ticketNumber = `JITACM-2026-${randomSuffix}`;
    const qrToken = generateTicketQRToken(ticketNumber, event.id, cleanUSN);

    const isFree = event.fee === 0;
    const paymentId = isFree ? `FREE_${Date.now()}` : `PAY_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const orderId = `ORD_JIT_${Math.floor(100000 + Math.random() * 900000)}`;
    const txHash = '0x' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const newRegistration: Registration = {
      id: `reg-${Date.now()}-${randomSuffix}`,
      ticketNumber,
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      eventVenue: event.venue,
      attendee: {
        ...params.attendee,
        usn: cleanUSN,
        email: cleanEmail,
      },
      payment: {
        orderId,
        paymentId,
        amount: event.fee,
        currency: event.currency,
        status: isFree ? 'free' : 'paid',
        method: isFree ? 'Free Pass' : params.paymentMethod,
        paidAt: new Date().toISOString(),
        idempotencyKey: params.idempotencyKey,
        transactionHash: txHash,
      },
      status: 'confirmed',
      registeredAt: new Date().toISOString(),
      qrToken,
      checkIn: {
        isCheckedIn: false,
      },
    };

    // 6. Atomically update event count and status
    events[eventIndex].registeredCount += 1;
    if (events[eventIndex].registeredCount >= events[eventIndex].capacity) {
      events[eventIndex].isSoldOut = true;
    }

    registrations.unshift(newRegistration);

    this.saveEvents(events);
    this.saveRegistrations(registrations);

    return { registration: newRegistration, event: events[eventIndex] };
  }

  /**
   * Venue QR Scanner Verification Terminal
   */
  verifyAndCheckInTicket(tokenOrTicketNumber: string, activeEventIdFilter?: string): CheckInVerificationResult {
    const raw = tokenOrTicketNumber.trim();
    const registrations = this.getRegistrations();
    const events = this.getEvents();

    let targetRegistration: Registration | undefined;

    // Check if scanned is a signed JITACM QR token
    if (raw.startsWith('JITACM|')) {
      const decoded = parseTicketQRToken(raw);
      if (!decoded) {
        return {
          success: false,
          code: 'INVALID_TOKEN',
          message: 'Security Alert: QR token format invalid or corrupted signature.',
        };
      }
      targetRegistration = registrations.find(
        (r) => r.ticketNumber === decoded.ticketNumber && r.eventId === decoded.eventId
      );
    } else {
      // Direct ticket number input (e.g. JITACM-2026-C891) or USN
      targetRegistration = registrations.find(
        (r) =>
          r.ticketNumber.toUpperCase() === raw.toUpperCase() ||
          r.attendee.usn.toUpperCase() === raw.toUpperCase()
      );
    }

    if (!targetRegistration) {
      return {
        success: false,
        code: 'INVALID_TOKEN',
        message: 'Ticket Not Found: No registration matching this ticket or attendee USN exists in the database.',
      };
    }

    const event = events.find((e) => e.id === targetRegistration!.eventId);

    // Event filter check (if organizer is scanning at a specific event door)
    if (activeEventIdFilter && activeEventIdFilter !== 'all' && targetRegistration.eventId !== activeEventIdFilter) {
      return {
        success: false,
        code: 'EVENT_MISMATCH',
        registration: targetRegistration,
        event,
        message: `Ticket belongs to "${targetRegistration.eventTitle}", but scanner is configured for another event!`,
      };
    }

    // Double Check-In Detection
    if (targetRegistration.checkIn.isCheckedIn) {
      return {
        success: false,
        code: 'ALREADY_CHECKED_IN',
        alreadyCheckedIn: true,
        registration: targetRegistration,
        event,
        checkedInAt: targetRegistration.checkIn.checkedInAt,
        message: `Duplicate check-in warning: Already checked in at ${new Date(
          targetRegistration.checkIn.checkedInAt || ''
        ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}!`,
      };
    }

    // Success Check-in!
    targetRegistration.checkIn = {
      isCheckedIn: true,
      checkedInAt: new Date().toISOString(),
      verifiedBy: 'JITACM QR Security Terminal #1',
    };

    // Update event checked-in count
    if (event) {
      event.checkedInCount = (event.checkedInCount || 0) + 1;
      this.saveEvents(events);
    }

    this.saveRegistrations(registrations);

    return {
      success: true,
      code: 'CHECK_IN_SUCCESS',
      registration: targetRegistration,
      event,
      checkedInAt: targetRegistration.checkIn.checkedInAt,
      message: `Verified successfully! Entry approved for ${targetRegistration.attendee.name} (${targetRegistration.attendee.usn}).`,
    };
  }

  // Admin Event Management
  createEvent(newEvent: Omit<EventItem, 'id' | 'registeredCount' | 'checkedInCount' | 'createdAt'>): EventItem {
    const events = this.getEvents();
    const id = `evt-${Date.now()}`;
    const slug = newEvent.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const event: EventItem = {
      ...newEvent,
      id,
      slug,
      registeredCount: 0,
      checkedInCount: 0,
      createdAt: new Date().toISOString(),
      isSoldOut: false,
    };
    events.unshift(event);
    this.saveEvents(events);
    return event;
  }

  updateEvent(id: string, updates: Partial<EventItem>): EventItem {
    const events = this.getEvents();
    const index = events.findIndex((e) => e.id === id);
    if (index === -1) throw new Error('Event not found.');
    events[index] = { ...events[index], ...updates };
    this.saveEvents(events);
    return events[index];
  }

  deleteEvent(id: string) {
    const events = this.getEvents().filter((e) => e.id !== id);
    this.saveEvents(events);
  }

  // Reset to seed data
  resetAllData() {
    localStorage.removeItem(EVENTS_STORAGE_KEY);
    localStorage.removeItem(REGISTRATIONS_STORAGE_KEY);
    this.saveEvents(SEED_EVENTS);
    this.saveRegistrations(SEED_REGISTRATIONS);
  }
}

export const storageService = new StorageService();
