import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// PUT: Bulk update product margins and prices
export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { product_ids, margin_percentage, category } = body

    // Verify user is admin or supplier
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || (profile.role !== 'supplier' && profile.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get products to update (only supplier's own products unless admin)
    let query = supabase.from('products').select('id, supplier_cost, margin_percentage')

    if (profile.role === 'supplier') {
      query = query.eq('supplier_id', session.user.id)
    }

    if (product_ids && product_ids.length > 0) {
      query = query.in('id', product_ids)
    }

    if (category) {
      query = query.eq('category', category)
    }

    const { data: products, error: fetchError } = await query

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!products || products.length === 0) {
      return NextResponse.json(
        { error: 'No products found to update' },
        { status: 404 }
      )
    }

    // Update all products with new margin
    const updates = products.map((p: { id: string; supplier_cost: number }) => ({
      id: p.id,
      margin_percentage,
      retail_price: p.supplier_cost + (p.supplier_cost * margin_percentage / 100),
    }))

    let updateQuery = supabase.from('products').upsert(updates)
    const { error: updateError } = await updateQuery

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      updated_count: products.length,
      new_margin: margin_percentage,
    })
  } catch (err) {
    return NextResponse.json(
      { error: `Server error: ${String(err)}` },
      { status: 500 }
    )
  }
}
