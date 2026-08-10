const Coupon = require('../models/Coupon')

class CouponService {
  async validateCoupon(code, userId, subtotal) {
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    })

    if (!coupon) {
      return { valid: false, message: 'Invalid or expired coupon code' }
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, message: 'Coupon usage limit reached' }
    }

    if (subtotal < coupon.minimumOrder) {
      return { 
        valid: false, 
        message: `Minimum order of $${coupon.minimumOrder} required for this coupon` 
      }
    }

    // Check per user limit
    const userUsage = await this.getUserCouponUsage(coupon._id, userId)
    if (userUsage >= coupon.perUserLimit) {
      return { valid: false, message: 'You have already used this coupon' }
    }

    let discount = 0
    if (coupon.discountType === 'percentage') {
      discount = (subtotal * coupon.discountValue) / 100
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount
      }
    } else {
      discount = coupon.discountValue
    }

    return {
      valid: true,
      coupon,
      discount,
      message: `Coupon applied! You saved $${discount.toFixed(2)}`,
    }
  }

  async getUserCouponUsage(couponId, userId) {
    // Implementation to track user coupon usage
    // You would need a CouponUsage model for this
    return 0
  }

  async applyCoupon(couponId, userId) {
    const coupon = await Coupon.findById(couponId)
    if (coupon) {
      coupon.usedCount += 1
      await coupon.save()
    }
    return coupon
  }
}

module.exports = new CouponService()