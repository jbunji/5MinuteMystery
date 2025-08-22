# Technical Specification: Micro-Story Mystery Generator

## System Architecture

### High-Level Architecture
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Web Client    │     │  Mobile Client  │     │  Steam Client   │
│    (React)      │     │ (React Native)  │     │   (Electron)    │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┴───────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │    CDN (CloudFlare)     │
                    └────────────┬────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │   API Gateway (AWS)     │
                    └────────────┬────────────┘
                                 │
         ┌───────────┬───────────┴───────────┬───────────┐
         │           │                       │           │
┌────────┴───┐ ┌─────┴──────┐ ┌────────────┴───┐ ┌─────┴──────┐
│ Auth       │ │ Mystery    │ │ AI Generation  │ │ Community  │
│ Service    │ │ API        │ │ Service        │ │ API        │
└────────────┘ └─────┬──────┘ └────────────────┘ └────────────┘
                     │
              ┌──────┴──────┐
              │  Database   │
              │ PostgreSQL  │
              └─────────────┘
```

## Database Schema

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    subscription_tier VARCHAR(20) DEFAULT 'free',
    subscription_expires_at TIMESTAMP,
    cases_solved INTEGER DEFAULT 0,
    accuracy_rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    preferences JSONB DEFAULT '{}'
);

-- Mystery templates table
CREATE TABLE mystery_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL, -- 'murder', 'theft', 'disappearance'
    difficulty VARCHAR(20) NOT NULL, -- 'easy', 'medium', 'hard', 'expert'
    template_data JSONB NOT NULL,
    usage_count INTEGER DEFAULT 0,
    avg_completion_time INTEGER, -- in seconds
    avg_accuracy DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Generated mysteries table
CREATE TABLE mysteries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES mystery_templates(id),
    title VARCHAR(200) NOT NULL,
    synopsis TEXT NOT NULL,
    case_data JSONB NOT NULL, -- Full mystery data
    solution JSONB NOT NULL, -- Encrypted solution
    difficulty VARCHAR(20) NOT NULL,
    estimated_time INTEGER, -- in minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_daily BOOLEAN DEFAULT false,
    theme VARCHAR(50)
);

-- User mystery attempts table
CREATE TABLE user_mysteries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mystery_id UUID REFERENCES mysteries(id) ON DELETE CASCADE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    time_spent INTEGER, -- in seconds
    submission JSONB,
    score INTEGER,
    accuracy DECIMAL(3,2),
    hints_used INTEGER DEFAULT 0,
    is_correct BOOLEAN,
    UNIQUE(user_id, mystery_id)
);

-- Evidence table
CREATE TABLE evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mystery_id UUID REFERENCES mysteries(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'document', 'photo', 'testimony', 'physical'
    name VARCHAR(100) NOT NULL,
    description TEXT,
    content JSONB NOT NULL,
    is_red_herring BOOLEAN DEFAULT false,
    discovery_order INTEGER
);

-- Achievements table
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    requirement_type VARCHAR(50), -- 'cases_solved', 'accuracy', 'streak', 'speed'
    requirement_value INTEGER,
    points INTEGER DEFAULT 10
);

-- User achievements table
CREATE TABLE user_achievements (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id),
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, achievement_id)
);

-- Case packs table
CREATE TABLE case_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    mystery_ids UUID[] NOT NULL,
    theme VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- User purchases table
CREATE TABLE user_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_type VARCHAR(50) NOT NULL, -- 'subscription', 'case_pack', 'hints'
    product_id VARCHAR(100),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    platform VARCHAR(20), -- 'web', 'ios', 'android', 'steam'
    transaction_id VARCHAR(255) UNIQUE,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Community cases table
CREATE TABLE community_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    case_data JSONB NOT NULL,
    difficulty VARCHAR(20),
    play_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2),
    rating_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'featured'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tags VARCHAR(50)[] DEFAULT '{}'
);
```

## API Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/verify
POST   /api/auth/reset-password
```

### Mysteries
```
GET    /api/mysteries/daily
GET    /api/mysteries/browse
GET    /api/mysteries/:id
POST   /api/mysteries/:id/start
POST   /api/mysteries/:id/submit
GET    /api/mysteries/:id/evidence
POST   /api/mysteries/:id/hint
GET    /api/mysteries/:id/solution
```

### User Progress
```
GET    /api/users/profile
GET    /api/users/stats
GET    /api/users/history
GET    /api/users/achievements
PUT    /api/users/preferences
```

### Community
```
GET    /api/community/cases
POST   /api/community/cases
GET    /api/community/cases/:id
POST   /api/community/cases/:id/rate
POST   /api/community/cases/:id/report
```

### Store
```
GET    /api/store/packs
GET    /api/store/packs/:id
POST   /api/store/purchase
GET    /api/store/history
```

## Mystery Generation System

### Template Structure
```typescript
interface MysteryTemplate {
  id: string;
  type: 'murder' | 'theft' | 'disappearance' | 'fraud';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  structure: {
    setting: Setting;
    characters: CharacterTemplate[];
    timeline: TimelineEvent[];
    evidence: EvidenceTemplate[];
    solution: SolutionTemplate;
  };
  constraints: {
    minSuspects: number;
    maxSuspects: number;
    redHerrings: number;
    criticalEvidence: number;
  };
}

interface GeneratedMystery {
  id: string;
  title: string;
  synopsis: string;
  setting: string;
  characters: Character[];
  timeline: Event[];
  evidence: Evidence[];
  solution: Solution;
  hints: Hint[];
}
```

### AI Integration
```javascript
class MysteryGenerator {
  async generateMystery(template: MysteryTemplate): Promise<GeneratedMystery> {
    // Step 1: Generate base narrative
    const narrative = await this.generateNarrative(template);
    
    // Step 2: Create characters with AI
    const characters = await this.generateCharacters(template, narrative);
    
    // Step 3: Build timeline
    const timeline = this.constructTimeline(template, characters);
    
    // Step 4: Generate evidence
    const evidence = await this.generateEvidence(template, characters, timeline);
    
    // Step 5: Validate solvability
    const validation = this.validateMystery(evidence, template.solution);
    
    if (!validation.isSolvable) {
      return this.regenerateWithConstraints(template, validation.issues);
    }
    
    return this.packageMystery(narrative, characters, timeline, evidence);
  }
  
  private async generateNarrative(template: MysteryTemplate): Promise<string> {
    const prompt = `
      Generate a ${template.type} mystery synopsis with:
      - Setting: ${template.structure.setting}
      - Tone: Classic detective fiction
      - Length: 100-150 words
      - Include: Hook, stakes, and atmosphere
    `;
    
    return await this.aiService.generate(prompt);
  }
}
```

## Frontend Architecture

### React Component Structure
```
src/
├── components/
│   ├── Mystery/
│   │   ├── MysteryView.tsx
│   │   ├── EvidenceList.tsx
│   │   ├── CharacterProfiles.tsx
│   │   ├── Timeline.tsx
│   │   └── SolutionSubmit.tsx
│   ├── Navigation/
│   │   ├── Header.tsx
│   │   └── TabBar.tsx
│   ├── Store/
│   │   ├── CasePackList.tsx
│   │   └── PurchaseModal.tsx
│   └── Community/
│       ├── CaseEditor.tsx
│       └── CaseBrowser.tsx
├── hooks/
│   ├── useMystery.ts
│   ├── useAuth.ts
│   └── useStore.ts
├── services/
│   ├── api.ts
│   ├── auth.ts
│   └── mystery.ts
└── utils/
    ├── validation.ts
    └── formatting.ts
```

### State Management
```typescript
// Redux store structure
interface AppState {
  auth: {
    user: User | null;
    isAuthenticated: boolean;
    subscription: SubscriptionTier;
  };
  mystery: {
    current: Mystery | null;
    evidence: Evidence[];
    notes: Note[];
    timeSpent: number;
    hintsUsed: number;
  };
  ui: {
    loading: boolean;
    errors: Error[];
    theme: 'light' | 'dark' | 'noir';
  };
}
```

## Performance Optimization

### Caching Strategy
- CloudFlare CDN for static assets
- Redis for session management
- LocalStorage for mystery progress
- Service Worker for offline play

### Mystery Generation Optimization
```javascript
class MysteryQueue {
  private queue: GeneratedMystery[] = [];
  private generating = false;
  
  async ensureQueue(userId: string): Promise<void> {
    const userTier = await this.getUserTier(userId);
    const queueSize = userTier === 'premium' ? 10 : 3;
    
    if (this.queue.length < queueSize && !this.generating) {
      this.generating = true;
      await this.generateBatch(queueSize - this.queue.length);
      this.generating = false;
    }
  }
  
  async getNext(): Promise<GeneratedMystery> {
    this.ensureQueue(); // Async refill
    return this.queue.shift() || await this.generateOne();
  }
}
```

## Security Measures

### API Security
```javascript
// Rate limiting
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // requests per window
  standardHeaders: true,
  legacyHeaders: false,
});

// Input validation
const validateSolution = [
  body('suspectId').isUUID(),
  body('motive').isIn(['money', 'revenge', 'love', 'power']),
  body('evidence').isArray().notEmpty(),
  body('reasoning').isLength({ min: 10, max: 1000 })
];

// Solution encryption
const encryptSolution = (solution: Solution): string => {
  return crypto.AES.encrypt(
    JSON.stringify(solution),
    process.env.SOLUTION_SECRET
  ).toString();
};
```

### Anti-Cheat Measures
- Server-side solution validation
- Time-based scoring penalties
- Encrypted evidence ordering
- Session replay detection

## Deployment Configuration

### Docker Setup
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### CI/CD Pipeline
```yaml
# GitHub Actions
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm test
      - run: npm run test:e2e
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to AWS
        run: |
          aws ecs update-service \
            --cluster mystery-prod \
            --service api \
            --force-new-deployment
```

## Monitoring & Analytics

### Metrics to Track
- Mystery completion rate by difficulty
- Average time to solve
- Hint usage patterns
- User retention by mystery type
- Revenue per user segment

### Error Tracking
```javascript
// Sentry integration
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Remove sensitive data
    delete event.user?.email;
    return event;
  }
});
```