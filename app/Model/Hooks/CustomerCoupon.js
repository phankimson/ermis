'use strict'

const CustomerCoupon = exports = module.exports = {}

CustomerCoupon.methodName = function * (next) {
  // {this} belongs to model instance
  yield next
}

CustomerCoupon.validate = function * (next) {
  if (!this.code) {
    throw new Error('Code is required')
  }else if(!this.fullname){
    throw new Error('Name is required')
  }
  yield next
}
