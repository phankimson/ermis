'use strict'

const Lucid = use('Lucid')

class Unit extends Lucid {

  static boot () {
   super.boot()
   this.addHook('beforeCreate', 'Unit.validate')
   this.addHook('beforeUpdate', 'Unit.validate')
 }
  static get table () {
    return 'unit'
  }
  static get createTimestamp () {
    return null
  }
  static get updateTimestamp () {
   return null
   }
   static get deleteTimestamp () {
     return null
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

module.exports = Unit
