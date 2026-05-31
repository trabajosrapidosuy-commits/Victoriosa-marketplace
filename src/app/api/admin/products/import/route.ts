import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// POST: Import products from CSV/JSON
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const importMethod = formData.get('method') as string || 'csv'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Verify user is supplier or admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || (profile.role !== 'supplier' && profile.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse file content
    const content = await file.text()
    let products = []

    if (importMethod === 'csv') {
      products = parseCSV(content)
    } else if (importMethod === 'json') {
      try {
        products = JSON.parse(content)
      } catch {
        return NextResponse.json(
          { error: 'Invalid JSON format' },
          { status: 400 }
        )
      }
    }

    // Validate products
    const validation = validateProducts(products)
    if (!validation.valid) {
      return NextResponse.json(
        { error: `Invalid products: ${validation.errors.join(', ')}` },
        { status: 400 }
      )
    }

    // Create import record
    const { data: importRecord, error: importError } = await supabase
      .from('supplier_imports')
      .insert({
        supplier_id: session.user.id,
        import_method: importMethod,
        file_name: file.name,
        product_count: products.length,
        status: 'processing',
      })
      .select()
      .single()

    if (importError) {
      return NextResponse.json({ error: importError.message }, { status: 500 })
    }

    // Insert products
    let imported_count = 0
    let failed_count = 0
    const insertedProducts = []

    for (const product of products) {
      try {
        const margin = product.margin_percentage || 75
        const retail_price = product.supplier_cost + (product.supplier_cost * margin / 100)

        const { data: inserted, error } = await supabase
          .from('products')
          .insert({
            sku: product.sku,
            name: product.name,
            description: product.description || null,
            category: product.category || 'General',
            supplier_id: session.user.id,
            supplier_cost: product.supplier_cost,
            margin_percentage: margin,
            retail_price,
            status: 'draft', // Always draft
            image_url: product.image_url || null,
            stock_quantity: product.stock_quantity || 0,
          })
          .select()
          .single()

        if (error) {
          failed_count++
        } else {
          imported_count++
          insertedProducts.push(inserted)
        }
      } catch {
        failed_count++
      }
    }

    // Update import record
    await supabase
      .from('supplier_imports')
      .update({
        imported_count,
        failed_count,
        status: failed_count === 0 ? 'completed' : 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', importRecord.id)

    return NextResponse.json({
      import_id: importRecord.id,
      total: products.length,
      imported_count,
      failed_count,
      products: insertedProducts,
    })
  } catch (err) {
    return NextResponse.json(
      { error: `Server error: ${String(err)}` },
      { status: 500 }
    )
  }
}

// Helper: Parse CSV
function parseCSV(content: string) {
  const lines = content.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim())
  const products = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    const product: any = {}

    headers.forEach((header, idx) => {
      const key = header.toLowerCase()
      const value = values[idx]

      if (key === 'supplier_cost' || key === 'margin_percentage' || key === 'stock_quantity') {
        product[key] = parseFloat(value) || 0
      } else {
        product[key] = value || null
      }
    })

    if (product.sku && product.name) {
      products.push(product)
    }
  }

  return products
}

// Helper: Validate products
function validateProducts(products: any[]) {
  const errors: string[] = []

  if (!Array.isArray(products)) {
    return { valid: false, errors: ['Products must be an array'] }
  }

  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    if (!product.sku || typeof product.sku !== 'string') {
      errors.push(`Row ${i + 1}: Missing or invalid SKU`)
    }
    if (!product.name || typeof product.name !== 'string') {
      errors.push(`Row ${i + 1}: Missing or invalid name`)
    }
    if (product.supplier_cost === undefined || isNaN(product.supplier_cost)) {
      errors.push(`Row ${i + 1}: Missing or invalid supplier_cost`)
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.slice(0, 5), // Return first 5 errors
  }
}
