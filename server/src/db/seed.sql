-- ============================================================================
-- JITACM Event & Registration Platform - Initial Database Seed Data
-- ============================================================================

-- Seed Verified JITACM Chapter Events
INSERT INTO events (
    id, slug, title, tagline, description, category, mode, venue,
    event_date, event_time, registration_deadline, banner_url,
    fee_paise, currency, capacity, registered_count, checked_in_count,
    tags, is_featured, is_published, organizer_email, organizer_phone,
    perks, rules, schedule, speakers
) VALUES 
(
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'codestorm-2026',
    'CodeStorm 2026: 24-Hour National Hackathon',
    'Build, hack, deploy. 24 hours of non-stop computing innovation.',
    'CodeStorm is JITACM''s flagship annual hackathon bringing together the brightest engineering minds across the nation. Form your squad of 2-4, tackle challenges across AI/ML, Web3, FinTech, and Cloud Systems, and compete for a prize pool of ₹1,00,000+ with industry mentors and angel scouts.',
    'Hackathon',
    'in-person',
    'JIT Central Computing Complex & Auditorium 2',
    '2026-10-24',
    '09:00 AM - 09:00 AM (24 Hours)',
    '2026-10-22 23:59:59+00',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    29900,
    'INR',
    120,
    88,
    42,
    ARRAY['AI/ML', 'Web3', 'Prize ₹1L+', 'Hackathon', 'Overnight'],
    TRUE,
    TRUE,
    'acm.chair@jyothyit.ac.in',
    '+91 98450 12345',
    '[
        "Official ACM National Hackathon Certificate",
        "Exclusive JITACM Cyber-Hacker T-Shirt & Swag Kit",
        "Continuous RedBull & Catering (4 meals + refreshments)",
        "Direct interview fast-tracks for top 5 teams",
        "AWS & GitHub Cloud Credits"
    ]'::jsonb,
    '[
        "Teams must consist of 2 to 4 undergraduate students.",
        "All code must be written during the 24-hour hackathon period.",
        "Plagiarism or pre-built repositories will lead to immediate disqualification.",
        "Carrying college ID cards and JITACM digital passes is mandatory."
    ]'::jsonb,
    '[
        {"time": "09:00 AM", "title": "Check-in, Kit Distribution & Breakfast"},
        {"time": "10:30 AM", "title": "Opening Keynote & Problem Statements Release"},
        {"time": "11:00 AM", "title": "Hacking Begins (Round 1 Ideation)"},
        {"time": "04:00 PM", "title": "Mentorship Checkpoint & Architecture Review"},
        {"time": "08:30 PM", "title": "Dinner & Midnight Algorithmic Trivia"},
        {"time": "08:00 AM", "title": "Code Freeze & Project Submission"},
        {"time": "10:00 AM", "title": "Grand Jury Pitches & Awards Ceremony"}
    ]'::jsonb,
    '[
        {"name": "Dr. Arvind Sharma", "role": "Staff AI Researcher", "company": "Google DeepMind", "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"},
        {"name": "Nisha V. Rao", "role": "Engineering Director", "company": "Atlassian India", "avatarUrl": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80"}
    ]'::jsonb
),
(
    'b2c3d4e5-f6a1-4b5c-9d0e-1f2a3b4c5d6e',
    'genai-masterclass',
    'Hands-on Generative AI & LLM Systems Workshop',
    'From RAG pipelines to fine-tuned autonomous agents in production.',
    'A deep-dive technical workshop designed to take you from foundational Transformer architectures to deploying scalable Agentic workflows with LangChain, Vector Databases, and custom multimodal models. Hands-on coding exercises with real GPU notebooks provided.',
    'Workshop',
    'hybrid',
    'AI Research Lab (Block B, 3rd Floor) & Live Stream',
    '2026-10-18',
    '10:00 AM - 04:30 PM',
    '2026-10-17 18:00:00+00',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    14900,
    'INR',
    75,
    68,
    15,
    ARRAY['GenAI', 'LLMs', 'RAG', 'Python', 'Hands-on'],
    TRUE,
    TRUE,
    'tech.acm@jyothyit.ac.in',
    '+91 94812 67890',
    '[
        "ACM Generative AI Specialization Certificate",
        "Free $50 GPU Compute Credits",
        "Production-ready boilerplate code repositories",
        "Complimentary Lunch & ACM stickers pack"
    ]'::jsonb,
    '[
        "Participants must bring a laptop with Python 3.10+ installed or a modern browser for Colab.",
        "Basic familiarity with Python and data structures is recommended."
    ]'::jsonb,
    '[
        {"time": "10:00 AM", "title": "Foundations of Attention & LLM Architectures"},
        {"time": "11:30 AM", "title": "Building Hybrid RAG with Vector Search"},
        {"time": "01:00 PM", "title": "Lunch & Networking Break"},
        {"time": "02:00 PM", "title": "Agentic Tool-Calling & Evaluators Lab"},
        {"time": "03:45 PM", "title": "Deploying High-Throughput APIs & Wrap-up"}
    ]'::jsonb,
    '[
        {"name": "Karthik Sundaram", "role": "Principal ML Engineer", "company": "Cisco Systems", "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"}
    ]'::jsonb
),
(
    'c3d4e5f6-a1b2-4c5d-0e1f-2a3b4c5d6e7f',
    'bytebattle-5',
    'ByteBattle 5.0: ICPC-Style Competitive Coding Clash',
    '3 hours, 7 algorithmic challenges, pure intellectual adrenaline.',
    'Test your problem-solving speed, data structures mastery, and mathematical intuition in ByteBattle 5.0. Ranked contest on our private arena with immediate live leaderboards, freeze-time excitement, and ACM trophies for the top speed coders.',
    'Competition',
    'in-person',
    'JIT High Performance Computing Center (Lab 1 & 2)',
    '2026-10-12',
    '02:00 PM - 05:30 PM',
    '2026-10-11 20:00:00+00',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    0,
    'INR',
    100,
    94,
    0,
    ARRAY['DSA', 'Competitive Coding', 'Free Entry', 'ICPC Style'],
    FALSE,
    TRUE,
    'competitions.acm@jyothyit.ac.in',
    '+91 91234 56789',
    '[
        "Ranked ACM Merit Badges",
        "Direct qualification for JIT Inter-College ICPC Team",
        "Certificates of Distinction for Top 10% coders",
        "Free snacks and beverage vouchers"
    ]'::jsonb,
    '[
        "Individual participation only.",
        "Supported languages: C++, Java, Python, Rust.",
        "Strict zero-tolerance policy on code similarity or AI tools."
    ]'::jsonb,
    '[
        {"time": "02:00 PM", "title": "System Setup & Contest Practice Warm-up"},
        {"time": "02:30 PM", "title": "Contest Commences (7 Problem Statements)"},
        {"time": "05:00 PM", "title": "Contest Ends & Scoreboard Unfreezing"},
        {"time": "05:15 PM", "title": "Editorial Discussion & Prize Distribution"}
    ]'::jsonb,
    '[]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;
