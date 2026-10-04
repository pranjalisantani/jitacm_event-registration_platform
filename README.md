# JITACM Event & Registration Platform

> Centralized event management, ticketing, and check-in platform engineered for the Jyothy Institute of Technology ACM Student Chapter.

---

## 🎯 Features

### Attendee Experience
- **Events Discovery**: Browse upcoming hackathons, workshops, coding competitions, and tech talks with real-time seat availability.
- **Event Synopsis**: View full schedules, speaker details, perks, and participation rules.
- **Registration & Checkout**: Multi-step registration flow with USN validation and simulated payment gateway (UPI, Cards, NetBanking).
- **Digital QR Pass**: Cryptographic scannable passes with instant PNG download and print support.
- **Passbook Wallet**: Centralized view of all registered passes with live check-in statuses.

### Organizer Command Center
- **Event Operations**: Create, edit, and manage events, quotas, fees, and registration deadlines.
- **Attendee Directory**: Searchable participant registry with one-click CSV export.
- **QR Check-In Terminal**: High-speed admission terminal with live visual and auditory feedback (approved, duplicate alert, or rejected).
- **Capacity & Revenue Analytics**: Track registration velocities, fill rates, and revenue across chapter events.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom Aurora Tokens
- **Icons**: Lucide React
- **QR Engine**: QRCode canvas/SVG generator
- **Audio Feedback**: Web Audio API Synthesizer

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/pranjalisantani/jitacm_event-registration_platform.git
cd jitacm_event-registration_platform

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

---

## 📄 License
Academic & Community Use — Jyothy Institute of Technology ACM Student Chapter.
