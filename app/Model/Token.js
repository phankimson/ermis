'use strict'

const Lucid = use('Lucid')

class Token extends Lucid {
  static get table () {
    return 'tokens'
  }
  user () {
    return this.belongsTo('App/Model/User')
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
}

module.exports = Token
