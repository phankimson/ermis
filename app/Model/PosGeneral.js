'use strict'

const Lucid = use('Lucid')

class PosGeneral extends Lucid {

  static get table () {
    return 'pos_general'
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

       detail () {
         return this
         .hasMany('App/Model/PosDetail','id','general_id')
         .innerJoin('unit', 'unit.id', 'pos_detail.unit')
         .innerJoin('goods_size', 'goods_size.id', 'pos_detail.item_id')
         .innerJoin('size', 'size.id', 'goods_size.size')
         .where('pos_detail.active',1)
         .orderBy('pos_detail.id', 'desc')
         .select("pos_detail.*","goods_size.barcode as code","unit.name as unit","size.name as size")
       }
       payment () {
         return this
         .hasOne('App/Model/Payment','id','general')
         .where('active',1)
         .orderBy('id', 'desc')
       }

}

module.exports = PosGeneral
