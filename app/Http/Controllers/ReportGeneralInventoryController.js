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
        const goodsize = yield GoodsInventory.query()
        .innerJoin('goods_size', 'goods_size.id', 'goods_inventory.goods_size')
        .innerJoin('size', 'size.id', 'goods_size.size')
        .where('goods_inventory.inventory',data.inventory)
        .where('goods_size.active',1).TypeWhere('goods_size.goods',data.item)
        .TypeWhere('goods_size.size',data.size)
        .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
        .innerJoin('unit', 'unit.id', 'marial_goods.unit')
        .with('receipt_inventory','issue_inventory','opening_receipt','opening_issue','opening_balance')
        .scope('receipt_inventory', (builder) => {
          builder.where('pos_general.inventory_receipt',data.inventory).where('pos_general.active',data.active)
          .whereBetween('pos_general.date_voucher',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD') ])
          .sum('pos_detail.quantity as q').sum('pos_detail.'+data.price+' as a')
        })
        .scope('issue_inventory', (builder) => {
          builder.where('pos_general.inventory_issue',data.inventory).where('pos_general.active',data.active)
          .whereBetween('pos_general.date_voucher',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD') ])
          .sum('pos_detail.quantity as q').sum('pos_detail.'+data.price+' as a').sum('pos_detail.total_discount as d')
        })
        .scope('opening_receipt', (builder) => {
          builder.where('pos_general.inventory_receipt',data.inventory).where('pos_general.active',data.active)
          .where('pos_general.date_voucher','<',moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'))
          .sum('pos_detail.quantity as q').sum('pos_detail.'+data.price+' as a')
        })
        .scope('opening_receipt', (builder) => {
          builder.where('pos_general.inventory_issue',data.inventory).where('pos_general.active',data.active)
          .where('pos_general.date_voucher','<',moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'))
          .sum('pos_detail.quantity as q').sum('pos_detail.'+data.price+' as a').sum('pos_detail.total_discount as d')
        })
        .scope('opening_balance', (builder) => {
          builder.where('inventory',data.inventory)
          .sum('quantity as q').sum('amount as a')
        })
        .select('goods_size.*','unit.name as unit','marial_goods.name as name','size.name as size').fetch()
        var arr = []
        for(var d of goodsize){
          const opening_balances = yield d.opening_balance().fetch()
          const opening_balance = opening_balances.first()
          const obq = opening_balance != undefined ? opening_balance.quantity : 0
          const oba = opening_balance ? opening_balance.amount : 0
          console.log(opening_balance)
          const opening_receipts = yield d.opening_receipt().fetch()
          const opening_receipt = opening_receipts.first()
          const orq = opening_receipt ? opening_receipt.quantity : 0
          const ora = opening_receipt ? opening_receipt[data.price] : 0
          const opening_issues = yield d.opening_issue().fetch()
          const opening_issue = opening_issues.first()
          const oiq = opening_issue ? opening_issue.quantity : 0
          const oia = opening_issue ? opening_issue[data.price] : 0
          const oid = opening_issue ? opening_issue.total_discount: 0
          const receipt_inventorys = yield d.receipt_inventory().fetch()
          const receipt_inventory = receipt_inventorys.first()
          const riq = receipt_inventory != undefined ? receipt_inventory.quantity : 0
          const ria = receipt_inventory  ? receipt_inventory[data.price]  : 0
          const issue_inventorys = yield d.issue_inventory().fetch()
          const issue_inventory = issue_inventorys.first()
          const iiq = issue_inventory ? issue_inventory.quantity : 0
          const iia = issue_inventory  ? issue_inventory[data.price]  : 0
          const iid = issue_inventory ? issue_inventory.total_discount : 0
          // Số cuối kỳ
          const closing_balance_quantity = obq + orq - oiq + riq - iiq
          const closing_balance_amount = oba + ora -  oia + ria - iia
          const closing_balance_discount = oid + iid
          const quantity_opening = obq + orq - oiq
          console.log(closing_balance_quantity)
          const amount_opening = (data.price == "amount")? (oba + ora - oia) : (oba + ora - oia - oid )
          const amount_issue = (data.price == "amount")? iia : (iia + iid)
          const amount_closing = (data.price == "amount")? closing_balance_amount : (closing_balance_amount - closing_balance_discount)
            if(closing_balance_quantity > 0 ){
              arr.push({id : d.id ,
                        barcode : d.barcode ,
                        item : d.name+ ' - ' + d.size,
                        unit : d.unit ,
                        price : (data.price == "amount")? d.price : d.purchase_price,
                        quantity_opening : quantity_opening,
                        quantity_receipt : riq,
                        quantity_issue :  iiq,
                        quantity_closing: closing_balance_quantity ,
                        amount_opening:  amount_opening ,
                        amount_receipt : ria,
                        amount_issue : amount_issue,
                        amount_closing : amount_closing })
            }
        }
        response.json({ status: true  , data : arr})
      }catch(e){
        response.json({ status: false , error : true , message: Antl.formatMessage('messages.error')+' ' + e.message })
      }
  }

}
module.exports = ReportGeneralInventoryController
