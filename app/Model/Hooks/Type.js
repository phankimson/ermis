'use strict'

const Type = exports = module.exports = {}

Type.methodName = function * (next) {
  // {this} belongs to model instance
  yield next
}

Type.validate = function * (next) {
  if (!this.code) {
    throw new Error('Code is required')
  }else if(!this.name){
    throw new Error('Name is required')
  }
  yield next
}
