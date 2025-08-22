import OpenAI from 'openai'
import { z } from 'zod'
import { MysteryType, Difficulty } from '@prisma/client'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Schema for generated mystery
const GeneratedMysterySchema = z.object({
  title: z.string(),
  synopsis: z.string(),
  setting: z.object({
    location: z.string(),
    time: z.string(),
    atmosphere: z.string(),
  }),
  characters: z.array(z.object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
    description: z.string(),
    alibi: z.string().optional(),
    motive: z.string().optional(),
    secrets: z.array(z.string()),
  })),
  timeline: z.array(z.object({
    time: z.string(),
    event: z.string(),
    visibility: z.enum(['public', 'hidden', 'partial']),
    involvedCharacters: z.array(z.string()),
  })),
  evidence: z.array(z.object({
    id: z.string(),
    type: z.enum(['document', 'photo', 'testimony', 'physical', 'digital']),
    name: z.string(),
    description: z.string(),
    revealsInfo: z.string(),
    isRedHerring: z.boolean(),
    discoveryCondition: z.string().optional(),
  })),
  solution: z.object({
    culpritId: z.string(),
    motive: z.string(),
    method: z.string(),
    keyEvidence: z.array(z.string()),
    explanation: z.string(),
  }),
  redHerrings: z.array(z.object({
    characterId: z.string(),
    suspiciousActivity: z.string(),
    explanation: z.string(),
  })),
})

export type GeneratedMystery = z.infer<typeof GeneratedMysterySchema>

interface MysteryTemplate {
  type: MysteryType
  difficulty: Difficulty
  settings: string[]
  motives: string[]
  evidenceTypes: string[]
  redHerringCount: number
  suspectCount: number
}

const MYSTERY_TEMPLATES: Record<MysteryType, MysteryTemplate> = {
  MURDER: {
    type: 'MURDER',
    difficulty: 'MEDIUM',
    settings: ['mansion', 'office building', 'restaurant', 'theater', 'cruise ship'],
    motives: ['inheritance', 'revenge', 'jealousy', 'blackmail', 'business rivalry'],
    evidenceTypes: ['fingerprints', 'witness testimony', 'security footage', 'financial records', 'threatening letter'],
    redHerringCount: 2,
    suspectCount: 5,
  },
  THEFT: {
    type: 'THEFT',
    difficulty: 'EASY',
    settings: ['museum', 'jewelry store', 'art gallery', 'bank', 'private collection'],
    motives: ['greed', 'desperation', 'revenge', 'thrill', 'professional job'],
    evidenceTypes: ['security logs', 'footprints', 'tool marks', 'witness accounts', 'digital traces'],
    redHerringCount: 2,
    suspectCount: 4,
  },
  DISAPPEARANCE: {
    type: 'DISAPPEARANCE',
    difficulty: 'HARD',
    settings: ['small town', 'university campus', 'mountain resort', 'research facility', 'island retreat'],
    motives: ['escape', 'kidnapping', 'accident cover-up', 'witness protection', 'personal crisis'],
    evidenceTypes: ['last known location', 'personal belongings', 'communication records', 'travel documents', 'psychological profile'],
    redHerringCount: 3,
    suspectCount: 6,
  },
  FRAUD: {
    type: 'FRAUD',
    difficulty: 'EXPERT',
    settings: ['corporate office', 'investment firm', 'charity organization', 'tech startup', 'government agency'],
    motives: ['greed', 'covering losses', 'lifestyle maintenance', 'revenge', 'ideological'],
    evidenceTypes: ['financial records', 'email trails', 'forged documents', 'insider testimony', 'audit reports'],
    redHerringCount: 3,
    suspectCount: 5,
  },
  ESPIONAGE: {
    type: 'ESPIONAGE',
    difficulty: 'EXPERT',
    settings: ['embassy', 'tech company', 'military base', 'research lab', 'international summit'],
    motives: ['ideology', 'money', 'coercion', 'revenge', 'double agent'],
    evidenceTypes: ['encrypted messages', 'dead drops', 'surveillance footage', 'communication intercepts', 'behavioral analysis'],
    redHerringCount: 4,
    suspectCount: 6,
  },
}

export class MysteryGenerator {
  async generateMystery(type: MysteryType, difficulty: Difficulty): Promise<GeneratedMystery> {
    const template = MYSTERY_TEMPLATES[type]
    const setting = this.randomChoice(template.settings)
    const motive = this.randomChoice(template.motives)
    
    const prompt = this.buildPrompt(type, difficulty, setting, motive, template)
    
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a master mystery writer creating engaging, solvable mysteries for a game. Create mysteries that can be solved in 5-10 minutes with logical deduction.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
        max_tokens: 2000,
      })

      const rawResponse = completion.choices[0].message.content
      if (!rawResponse) throw new Error('No response from AI')
      
      const parsedResponse = JSON.parse(rawResponse)
      const validatedMystery = GeneratedMysterySchema.parse(parsedResponse)
      
      return validatedMystery
    } catch (error) {
      console.error('Error generating mystery:', error)
      throw new Error('Failed to generate mystery')
    }
  }

  private buildPrompt(
    type: MysteryType,
    difficulty: Difficulty,
    setting: string,
    motive: string,
    template: MysteryTemplate
  ): string {
    return `
Generate a ${type.toLowerCase()} mystery with the following specifications:
- Setting: ${setting}
- Difficulty: ${difficulty}
- True culprit's motive: ${motive}
- Number of suspects: ${template.suspectCount}
- Number of red herrings: ${template.redHerringCount}

Requirements:
1. Create a compelling narrative that can be solved in 5-10 minutes
2. Include ${template.suspectCount} distinct characters with believable motives
3. Generate a logical timeline of events
4. Create evidence that leads to the solution when properly analyzed
5. Include ${template.redHerringCount} red herrings that seem suspicious but have innocent explanations
6. Ensure the solution is fair - all necessary clues should be available
7. Make character IDs simple (e.g., "char1", "char2", etc.)
8. Evidence IDs should be simple (e.g., "ev1", "ev2", etc.)

The mystery should follow classic detective fiction rules:
- The criminal must be mentioned early in the story
- All clues must be plainly stated and described
- There must be no supernatural elements
- The solution must be logical and satisfying

Return a JSON object matching this exact structure:
{
  "title": "Engaging mystery title",
  "synopsis": "Brief 2-3 sentence hook",
  "setting": {
    "location": "Specific location name",
    "time": "Time period or specific time",
    "atmosphere": "Mood and ambiance description"
  },
  "characters": [
    {
      "id": "char1",
      "name": "Character Name",
      "role": "Their role/job",
      "description": "Physical and personality description",
      "alibi": "What they claim they were doing",
      "motive": "Potential reason to commit the crime",
      "secrets": ["Secret 1", "Secret 2"]
    }
  ],
  "timeline": [
    {
      "time": "Specific time",
      "event": "What happened",
      "visibility": "public|hidden|partial",
      "involvedCharacters": ["char1", "char2"]
    }
  ],
  "evidence": [
    {
      "id": "ev1",
      "type": "document|photo|testimony|physical|digital",
      "name": "Evidence name",
      "description": "What it is",
      "revealsInfo": "What it tells the detective",
      "isRedHerring": false,
      "discoveryCondition": "Optional: how/when it's found"
    }
  ],
  "solution": {
    "culpritId": "char_id",
    "motive": "Why they did it",
    "method": "How they did it",
    "keyEvidence": ["ev1", "ev2"],
    "explanation": "Full explanation tying everything together"
  },
  "redHerrings": [
    {
      "characterId": "char_id",
      "suspiciousActivity": "What makes them look guilty",
      "explanation": "Innocent reason for the activity"
    }
  ]
}
`
  }

  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)]
  }
}

export const mysteryGenerator = new MysteryGenerator()