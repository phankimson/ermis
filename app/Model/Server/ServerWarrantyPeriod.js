'use strict'

const Lucid = use('Lucid')

class ServerWarrantyPeriod extends Lucid {
  static get connection () {
  return 'mysql_server'
}
  static boot () {
   super.boot()
   this.addHook('beforeCreate', 'WarrantyPeriod.validate')
   this.addHook('beforeUpdate', 'WarrantyPeriod.validate')
 }
  static get table () {
    return 'warranty_period'
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

}

module.exports = ServerWarrantyPeriod
