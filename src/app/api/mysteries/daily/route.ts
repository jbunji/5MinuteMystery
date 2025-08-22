import { NextResponse } from 'next/server'
import { mysteryService } from '@/lib/services/mystery-service'

export async function GET() {
  try {
    const dailyMystery = await mysteryService.getDailyMystery()
    
    // Remove sensitive data
    const { solution, ...mysteryData } = dailyMystery
    
    return NextResponse.json({
      mystery: mysteryData,
    })
  } catch (error) {
    console.error('Error fetching daily mystery:', error)
    return NextResponse.json(
      { error: 'Failed to fetch daily mystery' },
      { status: 500 }
    )
  }
}