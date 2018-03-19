'use strict'

const ObjectGroup = exports = module.exports = {}

ObjectGroup.methodName = function * (next) {
  // {this} belongs to model instance
  yield next
}

ObjectGroup.validate = function * (next) {
  if (!this.code) {
    throw new Error('Code is required')
  }else if(!this.name){
    throw new Error('Name is required')
  }
  yield next
}
