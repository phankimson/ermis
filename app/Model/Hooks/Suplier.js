'use strict'

const Suplier = exports = module.exports = {}

Suplier.methodName = function * (next) {
  // {this} belongs to model instance
  yield next
}

Suplier.validate = function * (next) {
  if (!this.code) {
    throw new Error('Code is required')
  }else if(!this.name){
    throw new Error('Name is required')
  }
  yield next
}
