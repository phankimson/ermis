'use strict'

const Customer = exports = module.exports = {}

Customer.methodName = function * (next) {
  // {this} belongs to model instance
  yield next
}

Customer.validate = function * (next) {
  if (!this.code) {
    throw new Error('Code is required')
  }else if(!this.name){
    throw new Error('Name is required')
  }
  yield next
}
