import { NextRequest, NextResponse } from 'next/server'
import { mysteryService } from '@/lib/services/mystery-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const mystery = await mysteryService.getMystery(params.id)
    return NextResponse.json({ mystery })
  } catch (error) {
    console.error('Error fetching mystery:', error)
    return NextResponse.json(
      { error: 'Mystery not found' },
      { status: 404 }
    )
  }
}