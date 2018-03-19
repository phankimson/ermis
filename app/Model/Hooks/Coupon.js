'use strict'

const Coupon = exports = module.exports = {}

Coupon.methodName = function * (next) {
  // {this} belongs to model instance
  yield next
}

Coupon.validate = function * (next) {
  if (!this.code) {
    throw new Error('Code is required')
  }else if(!this.name){
    throw new Error('Name is required')
  }else if(!this.value){
    throw new Error('Value is required')
  }
  yield next
}
