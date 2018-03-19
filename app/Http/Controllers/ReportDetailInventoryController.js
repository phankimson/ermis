'use strict'
const Data = use('App/Model/PosGeneral')  // EDIT
const Detail = use('App/Model/PosDetail')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const Option = use('App/Model/Option')  // EDIT
const Size = use('App/Model/Size')  // EDIT
const MarialGoods = use('App/Model/MarialGoods')  // EDIT
const GoodsSize = use('App/Model/GoodsSize')  // EDIT
const Initial = use('App/Model/Initial')  // EDIT
const Inventory = use('App/Model/Inventory')  // EDIT
var moment = require('moment')

class ReportDetailInventoryController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "report-detail-inventory"  // EDIT
      this.room = "report-inventory"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('report_detail_inventory.title')  // EDIT
      const date_range = yield Option.query().where("code","MAX_DATE_RANGER_REPORT").first()
      const end_date = moment().format('DD/MM/YYYY')
      const start_date = moment().subtract((date_range.value - 1), 'days').format('DD/MM/YYYY')
      const stock = yield Inventory.query().where('active',1).orderBy('id', 'desc').fetch()
      const item = yield GoodsSize.query().where('goods_size.active',1).orderBy('goods_size.id', 'desc')
      .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
      .innerJoin('size', 'size.id', 'goods_size.size').select('goods_size.id','goods_size.barcode','marial_goods.name as name','size.name as size')
      .fetch()
      const show = yield response.view('pos/pages/report_detail_inventory', {key : this.key ,title: title , end_date:end_date , start_date :start_date , item : item.toJSON() , stock : stock.toJSON()})  // EDIT
      response.send(show)
  }
  * get (request, response) {
     try {
        const data = JSON.parse(request.input('data'))
        if(data.item){
          // Lấy số đầu kỳ
          const opening_balance = yield Initial.query().where('item',data.item).TypeWhere('inventory',data.inventory).where('type',1).sum('quantity as q').sum('amount as a')
          const opening_receipt = yield Detail.query().where('pos_detail.item_id',data.item)
         .innerJoin('pos_general', 'pos_general.id', 'pos_detail.general_id')
         .TypeWhereNot('pos_general.inventory_receipt',data.inventory).where('pos_general.active',data.active).whereIn('pos_general.status',[1,2])
         .where('pos_general.date_voucher','<',moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'))
         .sum('pos_detail.quantity as q').sum('pos_detail.'+data.price+' as a')
          const opening_issue = yield Detail.query().where('pos_detail.item_id',data.item)
         .innerJoin('pos_general', 'pos_general.id', 'pos_detail.general_id')
         .TypeWhereNot('pos_general.inventory_issue',data.inventory).where('pos_general.active',data.active).whereIn('pos_general.status',[1,2])
         .where('pos_general.date_voucher','<',moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'))
         .sum('pos_detail.quantity as q').sum('pos_detail.'+data.price+' as a').sum('pos_detail.total_discount as d')

          const detail = yield Detail.query().where('pos_detail.item_id',data.item)
         .innerJoin('pos_general', 'pos_general.id', 'pos_detail.general_id')
         .OrTypeWhereMuti('pos_general.inventory_issue','pos_general.inventory_receipt',data.inventory,data.inventory).where('pos_general.active',data.active).whereIn('pos_general.status',[1,2])
         .whereBetween('pos_general.date_voucher',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD') ]).fetch()
          var quantity_receipt = 0
          var amount_receipt = 0
          var quantity_issue = 0
          var amount_issue = 0
          var arr = []
              arr.push({
                description : Antl.formatMessage('report_inventory.opening_balance'),
                date_voucher : "",
                price : 0,
                quantity_receipt : 0,
                amount_receipt : 0,
                quantity_issue : 0,
                amount_issue : 0,
                quantity_balance : opening_balance[0].q + opening_receipt[0].q - opening_issue[0].q,
                amount_balance :  (data.price == "amount")? (opening_balance[0].a +opening_receipt[0].a - opening_issue[0].a) : (opening_balance[0].a +opening_receipt[0].a - opening_issue[0].a - opening_issue[0].d ),
              })
              for(var d of detail.toJSON()){
                // Số đầu kỳ
                var a = (d.inventory_receipt == data.inventory)? d.quantity : 0
                var b = (d.inventory_receipt == data.inventory)? eval('d.'+data.price) : 0
                var c = (d.inventory_issue == data.inventory)? d.quantity : 0
                var d = (d.inventory_issue == data.inventory)? (data.price == "amount") ? eval('d.'+data.price) : eval('d.'+data.price) + d.total_discount : 0
                  arr.push({
                    id : d.id,
                    date_voucher : d.date_voucher,
                    voucher : d.voucher,
                    description : d.description,
                    price : (data.price == "amount")? d.price : d.purchase_price,
                    quantity_receipt : a,
                    amount_receipt :  b,
                    quantity_issue : c,
                    amount_issue :  d,
                    quantity_balance : 0,
                    amount_balance : 0,
                  })
                  quantity_receipt += a
                  amount_receipt += b
                  quantity_issue += c
                  amount_issue += d
                //
              }

              arr.push({
                date_voucher : "",
                description : Antl.formatMessage('report_inventory.closing_balance'),
                price : 0,
                quantity_receipt : 0,
                amount_receipt : 0,
                quantity_issue : 0,
                amount_issue : 0,
                quantity_balance : opening_balance[0].q + opening_receipt[0].q - opening_issue[0].q+quantity_receipt-quantity_issue,
                amount_balance :  (data.price == "amount")? (opening_balance[0].a +opening_receipt[0].a - opening_issue[0].a) : (opening_balance[0].a +opening_receipt[0].a - opening_issue[0].a - opening_issue[0].d )+amount_receipt-amount_issue,
              })
              response.json({ status: true  , data : arr})
        }else{
              response.json({ status: false  , message: Antl.formatMessage('messages.please_choose_item')})
        }
      }catch(e){
          response.json({ status: false , error : true , message: Antl.formatMessage('messages.error')+' ' + e.message})
      }
  }
}
module.exports = ReportDetailInventoryController
