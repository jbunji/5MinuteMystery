# 5 Minute Mystery 🔍

An AI-powered mystery game where players solve procedurally generated cases in just 5-10 minutes. Perfect for coffee breaks!

## Features

- **Infinite Mysteries**: AI-generated cases mean endless unique content
- **Quick Sessions**: Designed for 5-10 minute play sessions
- **Noir Aesthetic**: Atmospheric dark theme with detective ambiance
- **Progression System**: Track stats, earn achievements, climb ranks
- **Daily Challenges**: New featured mystery every 24 hours
- **Community Cases**: Create and share your own mysteries

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Prisma ORM, PostgreSQL
- **AI**: OpenAI GPT-4 for mystery generation
- **Auth**: NextAuth.js
- **State**: Zustand
- **UI Components**: Radix UI

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/jbunji/5MinuteMystery.git
cd 5MinuteMystery
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
npm run db:push
npm run db:generate
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start solving mysteries!

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
│   ├── ui/          # Base UI components
│   ├── mystery/     # Mystery-related components
│   └── home/        # Homepage components
├── lib/             # Utilities and helpers
├── hooks/           # Custom React hooks
├── types/           # TypeScript type definitions
└── styles/          # Global styles and themes
```

## Key Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Type checking
npm run db:push      # Push database schema
npm run db:studio    # Open Prisma Studio
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
