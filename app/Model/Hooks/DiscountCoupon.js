'use strict'

const DiscountCoupon = exports = module.exports = {}

DiscountCoupon.methodName = function * (next) {
  // {this} belongs to model instance
  yield next
}

DiscountCoupon.validate = function * (next) {
  if (!this.code) {
    throw new Error('Code is required')
  }else if(!this.name){
    throw new Error('Name is required')
  }
  yield next
}
