'use strict'

const Style = exports = module.exports = {}

Style.methodName = function * (next) {
  // {this} belongs to model instance
  yield next
}

Style.validate = function * (next) {
  if (!this.code) {
    throw new Error('Code is required')
  }else if(!this.name){
    throw new Error('Name is required')
  }
  yield next
}
