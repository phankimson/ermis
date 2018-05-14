'use strict'

const Lucid = use('Lucid')

class CustomerCoupon extends Lucid {

  static boot () {
   super.boot()
   this.addHook('beforeCreate', 'CustomerCoupon.validate')
   this.addHook('beforeUpdate', 'CustomerCoupon.validate')
 }
  static get table () {
    return 'customer_coupon'
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
   static scopeCheckDateRange (builder,column1,column2,value) {
      builder.where(column1,'>=',value).where(column2,'<=',value)
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

module.exports = CustomerCoupon
