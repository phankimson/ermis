'use strict'

const Lucid = use('Lucid')

class ServerUser extends Lucid {
  static get connection () {
  return 'mysql_server'
}
  static boot () {
   super.boot()
   this.addHook('beforeCreate', 'User.encryptPassword')
   this.addHook('beforeCreate', 'User.validate')
   this.addHook('beforeUpdate', 'User.validate')
 }

  static get table () {
    return 'users'
  }
   static get primaryKey () {
    return 'id'
  }
  static get hidden () {
   return ['password']
 }

 static get createTimestamp () {
   return 'created_at'
 }
 static get updateTimestamp () {
  return 'updated_at'
  }

 static scopeTypeWhere (builder,column,value) {
   if(value){
    builder.where(column,value)
   }
    builder.whereNotNull(column)
  }
  static scopeOrTypeWhere (builder,column,value) {
    if(value){
     builder.orWhere(column,value)
    }
     builder.whereNotNull(column)
   }
  static scopeTypeWhereIn (builder,column,value) {
    if(value){
     builder.whereIn(column,value)
    }
     builder.whereNotNull(column)
   }
   static scopeTypeWhereNot (builder,column,value) {
     if(value){
      builder.where(column,value)
     }
      builder.whereNot(column,0)
    }
    static scopeOrTypeWhereNot (builder,column,value) {
      if(value){
       builder.orWhere(column,value)
      }
       builder.whereNot(column,0)
     }

  apiTokens () {
    return this.hasMany('App/Model/Token')
  }

}

module.exports = ServerUser
