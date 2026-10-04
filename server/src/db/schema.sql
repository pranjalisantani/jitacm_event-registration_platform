-- ============================================================================
-- JITACM Event & Registration Platform - Production Database Schema (PostgreSQL)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'organizer', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE event_category AS ENUM ('Hackathon', 'Workshop', 'Tech Talk', 'Competition', 'Ideathon', 'Cultural Tech');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE event_mode AS ENUM ('in-person', 'virtual', 'hybrid');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE registration_status AS ENUM ('confirmed', 'pending_payment', 'cancelled', 'refunded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('free', 'pending', 'paid', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('UPI', 'Card', 'NetBanking', 'Free Pass');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usn VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    college VARCHAR(150) DEFAULT 'Jyothy Institute of Technology',
    branch VARCHAR(100) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    role user_role DEFAULT 'student',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Events Table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(200) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    tagline VARCHAR(300),
    description TEXT NOT NULL,
    category event_category NOT NULL,
    mode event_mode DEFAULT 'in-person',
    venue VARCHAR(200) NOT NULL,
    event_date DATE NOT NULL,
    event_time VARCHAR(100) NOT NULL,
    registration_deadline TIMESTAMPTZ NOT NULL,
    banner_url TEXT NOT NULL,
    fee_paise INTEGER NOT NULL DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'INR',
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    registered_count INTEGER NOT NULL DEFAULT 0,
    checked_in_count INTEGER NOT NULL DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    organizer_email VARCHAR(150) NOT NULL,
    organizer_phone VARCHAR(20) NOT NULL,
    perks JSONB DEFAULT '[]',
    rules JSONB DEFAULT '[]',
    schedule JSONB DEFAULT '[]',
    speakers JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Invariant: registered_count cannot exceed capacity
    CONSTRAINT chk_capacity_limit CHECK (registered_count <= capacity)
);

-- 4. Temporary Seat Reservations Table (Concurrency & Overbooking Guard)
CREATE TABLE IF NOT EXISTS seat_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reservation_token VARCHAR(100) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_consumed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Registrations Table
CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(30) UNIQUE NOT NULL,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    team_name VARCHAR(100),
    status registration_status DEFAULT 'confirmed',
    qr_token_signature TEXT NOT NULL,
    is_checked_in BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMPTZ,
    verified_by VARCHAR(100),
    device_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Anti-duplicate registration constraint
    CONSTRAINT uq_user_event UNIQUE (event_id, user_id)
);

-- 6. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    razorpay_order_id VARCHAR(100) UNIQUE,
    razorpay_payment_id VARCHAR(100) UNIQUE,
    razorpay_signature VARCHAR(255),
    amount_paise INTEGER NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status payment_status NOT NULL,
    method payment_method NOT NULL,
    idempotency_key VARCHAR(120) UNIQUE NOT NULL,
    paid_at TIMESTAMPTZ,
    raw_webhook_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Gate Admissions & Check-in Audit Logs
CREATE TABLE IF NOT EXISTS check_in_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    gate_operator_id UUID REFERENCES users(id),
    device_info TEXT,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for high-throughput queries
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_ticket ON registrations(ticket_number);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_idemp ON payments(idempotency_key);
