'use strict'
const Data = use('App/Model/PosGeneral')  // EDIT
const Detail = use('App/Model/PosDetail')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const Option = use('App/Model/Option')  // EDIT
const Size = use('App/Model/Size')  // EDIT
const MarialGoods = use('App/Model/MarialGoods')  // EDIT
const GoodsSize = use('App/Model/GoodsSize')  // EDIT
const GoodsInventory = use('App/Model/GoodsInventory')  // EDIT
const Initial = use('App/Model/Initial')  // EDIT
const Inventory = use('App/Model/Inventory')  // EDIT
var moment = require('moment')

class ReportGeneralInventoryController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "report-general-inventory"  // EDIT
      this.room = "report-inventory"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('report_general_inventory.title')  // EDIT
      const date_range = yield Option.query().where("code","MAX_DATE_RANGER_REPORT").first()
      const end_date = moment().format('DD/MM/YYYY')
      const start_date = moment().subtract((date_range.value - 1), 'days').format('DD/MM/YYYY')
      const size = yield Size.query().where('active',1).orderBy('id', 'desc').fetch()
      const item = yield MarialGoods.query().where('active',1).orderBy('id', 'desc').fetch()
      const stock = yield Inventory.query().where('active',1).orderBy('id', 'desc').fetch()
      const show = yield response.view('pos/pages/report_general_inventory', {key : this.key ,room : this.room,title: title , end_date:end_date , start_date :start_date , size : size.toJSON() , item : item.toJSON() , stock: stock.toJSON()})  // EDIT
      response.send(show)
  }
  * get (request, response) {
     try {
        const data = JSON.parse(request.input('data'))
        const goodsize1 = yield Initial.query()
        .innerJoin('goods_size', 'goods_size.id', 'initial.item')
        .innerJoin('size', 'size.id', 'goods_size.size')
        .where('initial.inventory',data.inventory)
        .where('goods_size.active',1).TypeWhere('goods_size.goods',data.item)
        .TypeWhere('goods_size.size',data.size)
        .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
        .innerJoin('unit', 'unit.id', 'marial_goods.unit')
        .select('goods_size.*','unit.name as unit','marial_goods.name as name','size.name as size').fetch()
        const goodsize2 = yield GoodsInventory.query()
        .innerJoin('goods_size', 'goods_size.id', 'goods_inventory.goods_size')
        .innerJoin('size', 'size.id', 'goods_size.size')
        .where('goods_inventory.inventory',data.inventory)
        .where('goods_size.active',1).TypeWhere('goods_size.goods',data.item)
        .TypeWhere('goods_size.size',data.size)
        .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
        .innerJoin('unit', 'unit.id', 'marial_goods.unit')
        .select('goods_size.*','unit.name as unit','marial_goods.name as name','size.name as size').fetch()
        var goodsize = goodsize1.toJSON().concat(goodsize2.toJSON())
        var arr = []
            for(var d of goodsize){
                if(arr.filter(x => x.id === d.id).length == 0){
                   // Số đầu kỳ
                   const opening_balance = yield Initial.query().where('item',d.id).TypeWhere('inventory',data.inventory).where('type',1).sum('quantity as q').sum('amount as a')
                   const opening_receipt = yield Detail.query().where('pos_detail.item_id',d.id)
                  .innerJoin('pos_general', 'pos_general.id', 'pos_detail.general_id')
                  .TypeWhereNot('pos_general.inventory_receipt',data.inventory).where('pos_general.active',data.active).whereIn('pos_general.status',[1,2])
                  .where('pos_general.date_voucher','<',moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'))
                  .sum('pos_detail.quantity as q').sum('pos_detail.'+data.price+' as a')
                   const opening_issue = yield Detail.query().where('pos_detail.item_id',d.id)
                  .innerJoin('pos_general', 'pos_general.id', 'pos_detail.general_id')
                  .TypeWhereNot('pos_general.inventory_issue',data.inventory).where('pos_general.active',data.active).whereIn('pos_general.status',[1,2])
                  .where('pos_general.date_voucher','<',moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'))
                  .sum('pos_detail.quantity as q').sum('pos_detail.'+data.price+' as a').sum('pos_detail.total_discount as d')
                   // Số phát sinh nhập
                   const receipt_inventory = yield Detail.query().where('pos_detail.item_id',d.id)
                  .innerJoin('pos_general', 'pos_general.id', 'pos_detail.general_id')
                  .TypeWhereNot('pos_general.inventory_receipt',data.inventory).where('pos_general.active',data.active).whereIn('pos_general.status',[1,2])
                  .whereBetween('pos_general.date_voucher',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD') ])
                  .sum('pos_detail.quantity as q').sum('pos_detail.'+data.price+' as a')
                  // Số phát sinh xuất
                  const issue_inventory = yield Detail.query().where('pos_detail.item_id',d.id)
                 .innerJoin('pos_general', 'pos_general.id', 'pos_detail.general_id')
                 .TypeWhereNot('pos_general.inventory_issue',data.inventory).where('pos_general.active',data.active).whereIn('pos_general.status',[1,2])
                 .whereBetween('pos_general.date_voucher',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD') ])
                 .sum('pos_detail.quantity as q').sum('pos_detail.'+data.price+' as a').sum('pos_detail.total_discount as d')
                 // Số cuối kỳ
                 const closing_balance_quantity = opening_balance[0].q +opening_receipt[0].q - opening_issue[0].q + receipt_inventory[0].q - issue_inventory[0].q
                 const closing_balance_amount = opening_balance[0].a + opening_receipt[0].a -  opening_issue[0].a + receipt_inventory[0].a - issue_inventory[0].a
                 const closing_balance_discount = opening_issue[0].d + issue_inventory[0].d
                 const quantity_opening = opening_balance[0].q +opening_receipt[0].q - opening_issue[0].q
                 const amount_opening = (data.price == "amount")? (opening_balance[0].a +opening_receipt[0].a - opening_issue[0].a) : (opening_balance[0].a +opening_receipt[0].a - opening_issue[0].a - opening_issue[0].d )
                 const amount_issue = (data.price == "amount")? issue_inventory[0].a : (issue_inventory[0].a + issue_inventory[0].d)
                 const amount_closing = (data.price == "amount")? closing_balance_amount : (closing_balance_amount - closing_balance_discount)
                   if(closing_balance_quantity > 0 ){
                     arr.push({id : d.id ,
                               barcode : d.barcode ,
                               item : d.name+ ' - ' + d.size,
                               unit : d.unit ,
                               price : (data.price == "amount")? d.price : d.purchase_price,
                               quantity_opening : quantity_opening,
                               quantity_receipt : receipt_inventory[0].q ,
                               quantity_issue : issue_inventory[0].q ,
                               quantity_closing: closing_balance_quantity ,
                               amount_opening:  amount_opening ,
                               amount_receipt : receipt_inventory[0].a,
                               amount_issue : amount_issue,
                               amount_closing : amount_closing })
                   }
                 }
               }
        response.json({ status: true  , data : arr})
      }catch(e){
        response.json({ status: false , error : true , message: Antl.formatMessage('messages.error')+' ' + e.message })
      }
  }

}
module.exports = ReportGeneralInventoryController
