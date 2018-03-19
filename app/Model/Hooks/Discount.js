'use strict'

const Discount = exports = module.exports = {}

Discount.methodName = function * (next) {
  // {this} belongs to model instance
  yield next
}

Discount.validate = function * (next) {
  if (!this.code) {
    throw new Error('Code is required')
  }else if(!this.name){
    throw new Error('Name is required')
  }
  yield next
}
