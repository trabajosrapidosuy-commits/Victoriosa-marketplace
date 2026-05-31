import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// POST: Log WhatsApp interaction
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()

    const { product_id, order_id, event_type, customer_info } = body

    // Log event in analytics
    const { error } = await supabase.from('analytics_events').insert({
      event_type: `whatsapp_${event_type}`,
      product_id,
      order_id,
      data: customer_info || null,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, event: 'logged' })
  } catch (err) {
    return NextResponse.json(
      { error: `Server error: ${String(err)}` },
      { status: 500 }
    )
  }
}

// GET: Get WhatsApp business number
export async function GET() {
  return NextResponse.json({
    whatsapp_number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
    country: 'UY',
    currency: 'UYU',
  })
}
