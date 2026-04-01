# LesCordistes.com - Marketplace Platform

A production-ready freemium SaaS marketplace connecting clients with rope access technicians (cordistes).

## Features

### For Clients
- **Free Job Posting**: Post missions via a 5-step wizard without registration
- **Multi-step Form**: Location, category, details, photos, and contact information
- **Email Verification**: Jobs are validated by admin before going live

### For Professionals (Cordistes)
- **Free Tier**: Browse missions with basic information (title, city, description)
- **Credit System**: Unlock leads using a pay-as-you-go credit model

### Admin Dashboard
- **Job Moderation**: Approve or reject pending missions
- **User Management**: View registered professionals
- **Protected Routes**: Admin-only access

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom Safety Orange (#FF6B00) branding
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6

## Getting Started

### Prerequisites

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env.local` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

### Database Setup

1. Go to your Supabase SQL Editor
2. Run the SQL schema from `supabase-schema.sql`
3. This will create:
   - `profiles` table with RLS policies
   - `jobs` table with RLS policies
   - Storage bucket for job photos
   - Automated triggers for profile creation

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── layout/          # Header, Footer
│   ├── wizard/          # Job posting wizard steps
│   ├── JobCard.tsx      # Job listing card with blur logic
│   └── ProtectedRoute.tsx
├── pages/
│   ├── Landing.tsx      # Home page
│   ├── JobBoard.tsx     # Marketplace
│   ├── PostJob.tsx      # Job posting wizard
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Profile.tsx
│       └── Credits.tsx
│   └── admin/
│       └── Dashboard.tsx
├── hooks/
│   └── useAuth.ts       # Authentication hook
├── lib/
│   ├── supabase.ts      # Supabase client
│   └── database.types.ts
├── types/
│   └── index.ts         # TypeScript types
├── App.tsx              # Router setup
└── main.tsx             # Entry point
```

## Key Features Implementation

### Blur Logic for Non-Subscribers

The `JobCard` component conditionally renders contact information:
- **Not logged in**: Shows blurred placeholder with "Register" CTA
- **Pro user (Locked)**: Shows blurred placeholder with "Unlock Lead" button (1 credit)
- **Pro user (Unlocked)**: Shows full contact details (name, email, phone, address)

### Row Level Security (RLS)

Supabase RLS policies ensure:
- Everyone can view live jobs (basic info)
- Only professionals who unlocked the lead can access `client_contact_info`
- Only admins can approve/reject jobs
- Users can only update their own profiles

### Multi-Step Wizard

The job posting wizard includes:
1. **Location**: City, department, address
2. **Category**: Visual selection with icons
3. **Details**: Title, description, height, difficulty
4. **Photos**: Drag & drop upload (max 5)
5. **Contact**: Name, email, phone with validation

## Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Credit Model

- **Free**: Browse missions, see basic info
- **Unlock Lead (1 credit)**: 
  - Full contact details
  - Direct messaging
- **Credit Packs**:
  - 5 credits: 45€
  - 10 credits: 80€
  - 20 credits: 140€

## Admin Access

To create an admin user:
1. Register a normal account
2. In Supabase, update the `profiles` table:
   ```sql
   UPDATE profiles 
   SET role = 'admin' 
   WHERE email = 'your@email.com';
   ```

## License

MIT
