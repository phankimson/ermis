'use strict'

const Unit = exports = module.exports = {}

Unit.methodName = function * (next) {
  // {this} belongs to model instance
  yield next
}

Unit.validate = function * (next) {
  if (!this.code) {
    throw new Error('Code is required')
  }else if(!this.name){
    throw new Error('Name is required')
  }
  yield next
}
