'use strict'

const Size = exports = module.exports = {}

Size.methodName = function * (next) {
  // {this} belongs to model instance
  yield next
}

Size.validate = function * (next) {
  if (!this.code) {
    throw new Error('Code is required')
  }else if(!this.name){
    throw new Error('Name is required')
  }
  yield next
}
