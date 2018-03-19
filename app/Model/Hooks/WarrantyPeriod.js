'use strict'

const WarrantyPeriod = exports = module.exports = {}

WarrantyPeriod.methodName = function * (next) {
  // {this} belongs to model instance
  yield next
}

WarrantyPeriod.validate = function * (next) {
  if (!this.code) {
    throw new Error('Code is required')
  }else if(!this.name){
    throw new Error('Name is required')
  }
  yield next
}
