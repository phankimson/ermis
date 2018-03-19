'use strict'

const PaymentMethod = exports = module.exports = {}

PaymentMethod.methodName = function * (next) {
  // {this} belongs to model instance
  yield next
}

PaymentMethod.validate = function * (next) {
  if (!this.code) {
    throw new Error('Code is required')
  }else if(!this.name){
    throw new Error('Name is required')
  }
  yield next
}
