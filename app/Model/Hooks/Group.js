'use strict'

const Group = exports = module.exports = {}

Group.methodName = function * (next) {
  // {this} belongs to model instance
  yield next
}

Group.validate = function * (next) {
  if (!this.code) {
    throw new Error('Code is required')
  }else if(!this.name){
    throw new Error('Name is required')
  }
  yield next
}
