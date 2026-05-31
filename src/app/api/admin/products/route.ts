import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Product, CreateProductRequest, UpdateProductRequest } from '@/types/database'

// GET: List products (for admin/supplier)
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user role
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profileError || !profile || (profile.role !== 'admin' && profile.role !== 'supplier')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Suppliers see only their own products, admins see all
    let query = supabase.from('products').select('*')
    
    if (profile.role === 'supplier') {
      query = query.eq('supplier_id', session.user.id)
    }

    const { data: products, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ products })
  } catch (err) {
    return NextResponse.json(
      { error: `Server error: ${String(err)}` },
      { status: 500 }
    )
  }
}

// POST: Create product
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || (profile.role !== 'supplier' && profile.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body: CreateProductRequest = await request.json()

    // Validate required fields
    if (!body.sku || !body.name || !body.category || !body.supplier_cost) {
      return NextResponse.json(
        { error: 'Missing required fields: sku, name, category, supplier_cost' },
        { status: 400 }
      )
    }

    // Calculate retail price
    const margin = body.margin_percentage || 75
    const retail_price = body.supplier_cost + (body.supplier_cost * margin / 100)

    // Create product (always as draft)
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        sku: body.sku,
        name: body.name,
        description: body.description || null,
        category: body.category,
        supplier_id: session.user.id,
        supplier_cost: body.supplier_cost,
        margin_percentage: margin,
        retail_price,
        status: 'draft', // Always draft, never auto-publish
        image_url: body.image_url || null,
        stock_quantity: body.stock_quantity || 0,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ product }, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: `Server error: ${String(err)}` },
      { status: 500 }
    )
  }
}

// PUT: Update product
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
    const { product_id, ...updates } = body

    if (!product_id) {
      return NextResponse.json(
        { error: 'Missing product_id' },
        { status: 400 }
      )
    }

    // Check if user owns this product or is admin
    const { data: product } = await supabase
      .from('products')
      .select('supplier_id, supplier_cost, margin_percentage')
      .eq('id', product_id)
      .single()

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (product.supplier_id !== session.user.id && profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // If margin updated, recalculate retail price
    if (updates.supplier_cost !== undefined || updates.margin_percentage !== undefined) {
      const supplier_cost = updates.supplier_cost ?? product.supplier_cost
      const margin = updates.margin_percentage ?? product.margin_percentage
      updates.retail_price = supplier_cost + (supplier_cost * margin / 100)
    }

    const { data: updated, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', product_id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ product: updated })
  } catch (err) {
    return NextResponse.json(
      { error: `Server error: ${String(err)}` },
      { status: 500 }
    )
  }
}

// DELETE: Delete product
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const product_id = searchParams.get('id')

    if (!product_id) {
      return NextResponse.json(
        { error: 'Missing product id parameter' },
        { status: 400 }
      )
    }

    // Check ownership
    const { data: product } = await supabase
      .from('products')
      .select('supplier_id')
      .eq('id', product_id)
      .single()

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (product.supplier_id !== session.user.id && profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Only admins can delete; suppliers can archive
    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can delete. Use status=archived to hide.' },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', product_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: `Server error: ${String(err)}` },
      { status: 500 }
    )
  }
}
