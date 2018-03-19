'use strict'

const Origin = exports = module.exports = {}

Origin.methodName = function * (next) {
  // {this} belongs to model instance
  yield next
}

Origin.validate = function * (next) {
  if (!this.code) {
    throw new Error('Code is required')
  }else if(!this.name){
    throw new Error('Name is required')
  }
  yield next
}
