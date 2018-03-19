'use strict'

const Lucid = use('Lucid')

class Customer extends Lucid {

  static boot () {
   super.boot()
   this.addHook('beforeCreate', 'Customer.validate')
   this.addHook('beforeUpdate', 'Customer.validate')
 }
  static get table () {
    return 'customer'
  }
  static get createTimestamp () {
    return 'created_at'
  }
  static get updateTimestamp () {
   return 'updated_at'
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
       detail (){
     return this
     .hasMany('App/Model/PosGeneral','id','subject')
     .where('subject_key','customer')
    }

}

module.exports = Customer
