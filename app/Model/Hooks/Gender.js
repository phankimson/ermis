'use strict'

const Gender = exports = module.exports = {}

Gender.methodName = function * (next) {
  // {this} belongs to model instance
  yield next
}

Gender.validate = function * (next) {
  if (!this.code) {
    throw new Error('Code is required')
  }else if(!this.name){
    throw new Error('Name is required')
  }
  yield next
}
