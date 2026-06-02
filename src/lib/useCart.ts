import { useState, useEffect } from 'react'

export interface CartItem {
  product_id: string
  name: string
  price: number
  quantity: number
  image_url?: string
}

const CART_KEY = 'victoriosa_cart'

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CART_KEY)
    if (stored) {
      try {
        setItems(JSON.parse(stored))
      } catch (err) {
        console.error('Failed to load cart:', err)
      }
    }
    setLoaded(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(CART_KEY, JSON.stringify(items))
    }
  }, [items, loaded])

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.product_id === item.product_id)
      if (existing) {
        return prev.map(i =>
          i.product_id === item.product_id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      }
      return [...prev, item]
    })
  }

  const removeItem = (product_id: string) => {
    setItems(prev => prev.filter(i => i.product_id !== product_id))
  }

  const updateQuantity = (product_id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(product_id)
    } else {
      setItems(prev =>
        prev.map(i =>
          i.product_id === product_id ? { ...i, quantity } : i
        )
      )
    }
  }

  const clear = () => {
    setItems([])
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const count = items.reduce((sum, item) => sum + item.quantity, 0)

  return {
    items,
    total,
    count,
    addItem,
    removeItem,
    updateQuantity,
    clear,
    loaded,
  }
}
