'use strict'
const Hash = use('Hash')
const User = exports = module.exports = {}

User.methodName = function * (next) {
  // {this} belongs to model instance
  yield next
}

User.encryptPassword = function * (next) {
  this.password = yield Hash.make(this.password)
  yield next
}

User.validate = function * (next) {
  if (!this.username) {
    throw new Error('Username is required')
  }else if(!this.email){
    throw new Error('Email is required')
  }
  yield next
}
