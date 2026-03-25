import { NextRequest, NextResponse } from 'next/server'
import { validateInvoice } from '../src/utils/validation'
import { Invoice, ValidationResult } from '../src/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Basic validation
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Use our validation utility
    const validation: ValidationResult = validateInvoice(body)
    
    if (validation.isValid) {
      // TODO: Add additional AI agent validation logic here
      // For now, just return the validated data
      return NextResponse.json({
        isValid: true,
        data: validation.data
      })
    } else {
      return NextResponse.json({
        isValid: false,
        errors: validation.errors
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
