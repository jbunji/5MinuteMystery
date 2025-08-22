import { PrismaClient, MysteryType, Difficulty, EvidenceType } from '@prisma/client'
import { mysteryGenerator, GeneratedMystery } from '@/lib/ai/mystery-generator'
import crypto from 'crypto'

const prisma = new PrismaClient()

export class MysteryService {
  // Encrypt solution data
  private encryptSolution(solution: any): string {
    const algorithm = 'aes-256-gcm'
    const key = crypto.scryptSync(
      process.env.NEXTAUTH_SECRET || 'dev-secret',
      'salt',
      32
    )
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    
    let encrypted = cipher.update(JSON.stringify(solution), 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag()
    
    return JSON.stringify({
      encrypted,
      authTag: authTag.toString('hex'),
      iv: iv.toString('hex'),
    })
  }

  // Decrypt solution data
  private decryptSolution(encryptedData: string): any {
    const { encrypted, authTag, iv } = JSON.parse(encryptedData)
    const algorithm = 'aes-256-gcm'
    const key = crypto.scryptSync(
      process.env.NEXTAUTH_SECRET || 'dev-secret',
      'salt',
      32
    )
    
    const decipher = crypto.createDecipheriv(
      algorithm,
      key,
      Buffer.from(iv, 'hex')
    )
    decipher.setAuthTag(Buffer.from(authTag, 'hex'))
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return JSON.parse(decrypted)
  }

  // Generate and save a new mystery
  async createMystery(
    type: MysteryType,
    difficulty: Difficulty,
    isDaily: boolean = false
  ) {
    try {
      // Generate mystery using AI
      const generatedMystery = await mysteryGenerator.generateMystery(type, difficulty)
      
      // Calculate estimated time based on difficulty
      const estimatedTimes = {
        EASY: 5,
        MEDIUM: 7,
        HARD: 10,
        EXPERT: 15,
      }
      
      // Create mystery in database
      const mystery = await prisma.mystery.create({
        data: {
          title: generatedMystery.title,
          synopsis: generatedMystery.synopsis,
          type,
          difficulty,
          estimatedTime: estimatedTimes[difficulty],
          isDaily,
          caseData: generatedMystery as any,
          solution: this.encryptSolution(generatedMystery.solution),
          evidence: {
            create: generatedMystery.evidence.map((ev, index) => ({
              type: ev.type.toUpperCase() as EvidenceType,
              name: ev.name,
              description: ev.description,
              content: ev as any,
              isRedHerring: ev.isRedHerring,
              discoveryOrder: index + 1,
            })),
          },
        },
        include: {
          evidence: true,
        },
      })
      
      return mystery
    } catch (error) {
      console.error('Error creating mystery:', error)
      throw new Error('Failed to create mystery')
    }
  }

  // Get daily mystery
  async getDailyMystery() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let dailyMystery = await prisma.mystery.findFirst({
      where: {
        isDaily: true,
        createdAt: {
          gte: today,
        },
      },
      include: {
        evidence: {
          orderBy: {
            discoveryOrder: 'asc',
          },
        },
      },
    })
    
    // If no daily mystery exists, create one
    if (!dailyMystery) {
      const types = Object.values(MysteryType)
      const randomType = types[Math.floor(Math.random() * types.length)]
      dailyMystery = await this.createMystery(randomType, 'MEDIUM', true)
    }
    
    return dailyMystery
  }

  // Get mystery by ID (without solution)
  async getMystery(id: string) {
    const mystery = await prisma.mystery.findUnique({
      where: { id },
      include: {
        evidence: {
          orderBy: {
            discoveryOrder: 'asc',
          },
        },
      },
    })
    
    if (!mystery) {
      throw new Error('Mystery not found')
    }
    
    // Remove solution from response
    const { solution, ...mysteryWithoutSolution } = mystery
    return mysteryWithoutSolution
  }

  // Start playing a mystery
  async startMystery(userId: string, mysteryId: string) {
    // Check if user already started this mystery
    const existing = await prisma.userMystery.findUnique({
      where: {
        userId_mysteryId: {
          userId,
          mysteryId,
        },
      },
    })
    
    if (existing && existing.completedAt) {
      throw new Error('Mystery already completed')
    }
    
    if (existing) {
      return existing
    }
    
    // Create new attempt
    const attempt = await prisma.userMystery.create({
      data: {
        userId,
        mysteryId,
      },
    })
    
    return attempt
  }

  // Submit solution
  async submitSolution(
    userId: string,
    mysteryId: string,
    submission: {
      culpritId: string
      motive: string
      keyEvidence: string[]
    }
  ) {
    const mystery = await prisma.mystery.findUnique({
      where: { id: mysteryId },
    })
    
    if (!mystery) {
      throw new Error('Mystery not found')
    }
    
    const attempt = await prisma.userMystery.findUnique({
      where: {
        userId_mysteryId: {
          userId,
          mysteryId,
        },
      },
    })
    
    if (!attempt) {
      throw new Error('Mystery not started')
    }
    
    if (attempt.completedAt) {
      throw new Error('Mystery already completed')
    }
    
    // Decrypt and check solution
    const solution = this.decryptSolution(mystery.solution as string)
    const isCorrect = 
      submission.culpritId === solution.culpritId &&
      submission.motive.toLowerCase().includes(solution.motive.toLowerCase())
    
    // Calculate score
    const baseScore = isCorrect ? 100 : 0
    const timeBonus = Math.max(0, 20 - Math.floor((Date.now() - attempt.startedAt.getTime()) / 60000))
    const hintPenalty = attempt.hintsUsed * 10
    const score = Math.max(0, baseScore + timeBonus - hintPenalty)
    
    // Update attempt
    const completedAttempt = await prisma.userMystery.update({
      where: { id: attempt.id },
      data: {
        completedAt: new Date(),
        submission: submission as any,
        isCorrect,
        score,
        accuracy: isCorrect ? 1 : 0,
        timeSpent: Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000),
      },
    })
    
    // Update user stats
    if (isCorrect) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          caseSolved: { increment: 1 },
          currentStreak: { increment: 1 },
        },
      })
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: {
          currentStreak: 0,
        },
      })
    }
    
    return {
      ...completedAttempt,
      solution: isCorrect ? null : solution, // Only show solution if wrong
    }
  }

  // Get hint for a mystery
  async getHint(userId: string, mysteryId: string, hintLevel: number) {
    const attempt = await prisma.userMystery.findUnique({
      where: {
        userId_mysteryId: {
          userId,
          mysteryId,
        },
      },
    })
    
    if (!attempt || attempt.completedAt) {
      throw new Error('Invalid mystery attempt')
    }
    
    const mystery = await prisma.mystery.findUnique({
      where: { id: mysteryId },
    })
    
    if (!mystery) {
      throw new Error('Mystery not found')
    }
    
    const caseData = mystery.caseData as GeneratedMystery
    const hints = [
      `Focus on the timeline between ${caseData.timeline[0]?.time} and ${caseData.timeline[caseData.timeline.length - 1]?.time}`,
      `Pay special attention to ${caseData.evidence.find(e => !e.isRedHerring)?.name}`,
      `Consider the motive: it might be related to ${this.getMotiveHint(mystery.type)}`,
      `The culprit had access to ${caseData.setting.location}`,
    ]
    
    // Update hints used
    await prisma.userMystery.update({
      where: { id: attempt.id },
      data: {
        hintsUsed: { increment: 1 },
      },
    })
    
    return hints[Math.min(hintLevel, hints.length - 1)]
  }

  private getMotiveHint(type: MysteryType): string {
    const motiveHints = {
      MURDER: 'personal relationships or financial gain',
      THEFT: 'desperation or professional ambition',
      DISAPPEARANCE: 'escape or protection',
      FRAUD: 'maintaining a lifestyle or covering losses',
      ESPIONAGE: 'ideology or coercion',
    }
    return motiveHints[type]
  }

  // Get user's mystery history
  async getUserMysteries(userId: string) {
    const mysteries = await prisma.userMystery.findMany({
      where: { userId },
      include: {
        mystery: {
          select: {
            id: true,
            title: true,
            type: true,
            difficulty: true,
            estimatedTime: true,
          },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
      take: 20,
    })
    
    return mysteries
  }
}

export const mysteryService = new MysteryService()