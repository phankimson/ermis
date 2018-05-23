'use strict'

const Lucid = use('Lucid')

class GoodsInventory extends Lucid {

  static get table () {
    return 'goods_inventory'
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
    opening_balance(){
      return this.hasMany('App/Model/Initial','id','item')
      .where('type',1)
      .select('inventory','quantity','amount')
    }
   opening_receipt() {
     return this.hasMany('App/Model/PosDetail','id','item_id')
     .innerJoin('pos_general', 'pos_general.id', 'pos_detail.general_id')
     .whereIn('pos_general.status',[1,2])
     .select('pos_detail.item_id','pos_general.inventory_receipt','pos_general.active','pos_general.date_voucher','pos_detail.quantity','pos_detail.amount','pos_detail.purchase_amount')
    }
    receipt_inventory() {
      return this.hasMany('App/Model/PosDetail','id','item_id')
      .innerJoin('pos_general', 'pos_general.id', 'pos_detail.general_id')
      .whereIn('pos_general.status',[1,2])
      .select('pos_detail.item_id','pos_general.inventory_receipt','pos_general.active','pos_general.date_voucher','pos_detail.quantity','pos_detail.amount','pos_detail.purchase_amount')
     }
     issue_inventory() {
       return this.hasMany('App/Model/PosDetail','id','item_id')
       .innerJoin('pos_general', 'pos_general.id', 'pos_detail.general_id')
       .whereIn('pos_general.status',[1,2])
       .select('pos_detail.item_id','pos_general.inventory_issue','pos_general.active','pos_general.date_voucher','pos_detail.quantity','pos_detail.amount','pos_detail.purchase_amount')
      }
    opening_issue() {
      return this.hasMany('App/Model/PosDetail','id','item_id')
      .innerJoin('pos_general', 'pos_general.id', 'pos_detail.general_id')
      .whereIn('pos_general.status',[1,2])
      .select('pos_detail.item_id','pos_general.inventory_issue','pos_general.active','pos_general.date_voucher','pos_detail.quantity','pos_detail.amount','pos_detail.purchase_amount')
     }
}

module.exports = GoodsInventory
