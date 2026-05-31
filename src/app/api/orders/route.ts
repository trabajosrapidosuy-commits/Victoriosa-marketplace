import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// POST: Create order
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()

    const { customer_name, customer_email, customer_phone, customer_address, items } = body

    if (!customer_name || !customer_email || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate total amount
    let totalAmount = 0
    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('retail_price')
        .eq('id', item.product_id)
        .single()

      if (product) {
        totalAmount += product.retail_price * item.quantity
      }
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name,
        customer_email,
        customer_phone: customer_phone || null,
        customer_address: customer_address || null,
        order_number: orderNumber,
        status: 'pending',
        total_amount: totalAmount,
        currency: 'UYU',
      })
      .select()
      .single()

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 })
    }

    // Create order items
    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('retail_price')
        .eq('id', item.product_id)
        .single()

      if (product) {
        await supabase.from('order_items').insert({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: product.retail_price,
          subtotal: product.retail_price * item.quantity,
        })
      }
    }

    // TODO: Send WhatsApp notification to customer

    return NextResponse.json({ order }, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: `Server error: ${String(err)}` },
      { status: 500 }
    )
  }
}
