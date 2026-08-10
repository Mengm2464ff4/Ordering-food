class CartService {
  constructor() {
    this.storageKey = 'shopping_cart'
  }

  // Get cart from localStorage
  getCart() {
    const cartStr = localStorage.getItem(this.storageKey)
    return cartStr ? JSON.parse(cartStr) : []
  }

  // Save cart to localStorage
  saveCart(cart) {
    localStorage.setItem(this.storageKey, JSON.stringify(cart))
    return cart
  }

  // Clear cart
  clearCart() {
    localStorage.removeItem(this.storageKey)
    return []
  }

  // Add item to cart
  addItem(food, quantity = 1) {
    const cart = this.getCart()
    const existingItem = cart.find(item => item.food === food._id)
    
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.push({
        food: food._id,
        name: food.name,
        price: food.price,
        image: food.image,
        quantity: quantity,
      })
    }
    
    return this.saveCart(cart)
  }

  // Remove item from cart
  removeItem(foodId) {
    const cart = this.getCart()
    const filteredCart = cart.filter(item => item.food !== foodId)
    return this.saveCart(filteredCart)
  }

  // Update item quantity
  updateQuantity(foodId, quantity) {
    const cart = this.getCart()
    const item = cart.find(item => item.food === foodId)
    
    if (item) {
      if (quantity <= 0) {
        return this.removeItem(foodId)
      }
      item.quantity = quantity
      return this.saveCart(cart)
    }
    
    return cart
  }

  // Get cart item count
  getItemCount() {
    const cart = this.getCart()
    return cart.reduce((count, item) => count + item.quantity, 0)
  }

  // Get cart subtotal
  getSubtotal() {
    const cart = this.getCart()
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  // Get delivery fee
  getDeliveryFee() {
    const subtotal = this.getSubtotal()
    return subtotal > 0 ? 2 : 0
  }

  // Get tax amount (10%)
  getTax() {
    return this.getSubtotal() * 0.1
  }

  // Get total amount
  getTotal() {
    const subtotal = this.getSubtotal()
    const delivery = this.getDeliveryFee()
    const tax = this.getTax()
    return subtotal + delivery + tax
  }

  // Check if cart is empty
  isEmpty() {
    return this.getItemCount() === 0
  }

  // Apply promo code
  applyPromoCode(code) {
    const promos = {
      'SAVE10': 10,
      'SAVE20': 20,
      'FREESHIP': 'free_delivery',
      'WELCOME15': 15,
    }
    
    if (promos[code.toUpperCase()]) {
      const promo = promos[code.toUpperCase()]
      let discount = 0
      
      if (promo === 'free_delivery') {
        discount = this.getDeliveryFee()
      } else {
        discount = (this.getSubtotal() * promo) / 100
      }
      
      return {
        valid: true,
        discount,
        code: code.toUpperCase(),
        type: promo === 'free_delivery' ? 'free_delivery' : 'percentage',
        value: promo
      }
    }
    
    return { valid: false, discount: 0 }
  }

  // Get cart summary
  getSummary() {
    const subtotal = this.getSubtotal()
    const delivery = this.getDeliveryFee()
    const tax = this.getTax()
    const total = this.getTotal()
    const itemCount = this.getItemCount()
    
    return {
      subtotal,
      delivery,
      tax,
      total,
      itemCount,
      isEmpty: this.isEmpty(),
    }
  }

  // Merge carts (e.g., after login)
  mergeCarts(localCart, serverCart) {
    const mergedCart = [...serverCart]
    
    localCart.forEach(localItem => {
      const existingItem = mergedCart.find(item => item.food === localItem.food)
      if (existingItem) {
        existingItem.quantity += localItem.quantity
      } else {
        mergedCart.push(localItem)
      }
    })
    
    return this.saveCart(mergedCart)
  }

  // Get cart items formatted for API
  getCartItemsForAPI() {
    const cart = this.getCart()
    return cart.map(item => ({
      food: item.food,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      image: item.image,
    }))
  }

  // Validate cart items (check if all items are still available)
  async validateCart() {
    const cart = this.getCart()
    const validationResults = []
    
    for (const item of cart) {
      try {
        const response = await axios.get(`/foods/${item.food}`)
        const food = response.data
        
        if (!food.isAvailable) {
          validationResults.push({
            food: item.food,
            name: item.name,
            available: false,
            message: `${item.name} is no longer available`
          })
        } else if (food.price !== item.price) {
          validationResults.push({
            food: item.food,
            name: item.name,
            available: true,
            priceChanged: true,
            oldPrice: item.price,
            newPrice: food.price,
            message: `${item.name} price has changed from $${item.price} to $${food.price}`
          })
        } else {
          validationResults.push({
            food: item.food,
            name: item.name,
            available: true,
          })
        }
      } catch (error) {
        validationResults.push({
          food: item.food,
          name: item.name,
          available: false,
          message: `${item.name} is no longer available`
        })
      }
    }
    
    return validationResults
  }
}

export default new CartService()