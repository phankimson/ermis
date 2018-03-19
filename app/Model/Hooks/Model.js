'use strict'

const Model = exports = module.exports = {}

Model.methodName = function * (next) {
  // {this} belongs to model instance
  yield next
}

Model.validate = function * (next) {
  if (!this.code) {
    throw new Error('Code is required')
  }else if(!this.name){
    throw new Error('Name is required')
  }
  yield next
}
