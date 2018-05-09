'use strict'
const Detail = use('App/Model/PosDetail')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const Option = use('App/Model/Option')  // EDIT
const Inventory = use('App/Model/Inventory')  // EDIT
const GoodsSize = use('App/Model/GoodsSize') //EDIT

var moment = require('moment')

class ReportCostRevenueController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "report-cost-revenue"  // EDIT
      this.room = "report-revenue"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('report_shift_revenue.title')  // EDIT
      const date_range = yield Option.query().where("code","MAX_DATE_RANGER_REPORT").first()
      const end_date = moment().format('DD/MM/YYYY')
      const start_date = moment().subtract((date_range.value - 1), 'days').format('DD/MM/YYYY')
      const stock = yield Inventory.query().where('active',1).orderBy('id', 'desc').fetch()
      const show = yield response.view('pos/pages/report_cost_revenue', {key : this.key ,room : this.room,title: title , start_date:start_date , end_date:end_date , stock: stock.toJSON()})  // EDIT
      response.send(show)
  }
  * get (request, response) {
     try {
        const data = JSON.parse(request.input('data'))
        const goodsize = yield GoodsSize.query()
        .where('goods_size.active',1)
        .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
        .innerJoin('unit', 'unit.id', 'marial_goods.unit')
        .innerJoin('size', 'size.id', 'goods_size.size')
        .has('detail')
        .select('goods_size.*','unit.name as unit','marial_goods.name as name','size.name as size').fetch()
        var arr = []
        for(var d of goodsize){

          const sell = yield Detail.query().where('pos_detail.item_id',d.id)
         .innerJoin('pos_general', 'pos_general.id', 'pos_detail.general_id')
         .whereIn('pos_general.type',[4,5])
         .TypeWhereNot('pos_general.inventory_issue',data.inventory).where('pos_general.active',data.active).whereIn('pos_general.status',[1,2])
         .whereBetween('pos_general.date_voucher',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD') ])
         .sum('pos_detail.quantity as q').sum('pos_detail.amount as a').sum('pos_detail.purchase_amount as p')

         const returns = yield Detail.query().where('pos_detail.item_id',d.id)
        .innerJoin('pos_general', 'pos_general.id', 'pos_detail.general_id')
        .whereIn('pos_general.type',[6])
        .TypeWhereNot('pos_general.inventory_issue',data.inventory).where('pos_general.active',data.active).whereIn('pos_general.status',[1,2])
        .whereBetween('pos_general.date_voucher',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD') ])
        .sum('pos_detail.quantity as q').sum('pos_detail.amount as a').sum('pos_detail.purchase_amount as p')
          if( sell[0].q - returns[0].q != 0  && sell[0].a - returns[0].a != 0 && sell[0].p - returns[0].p != 0){
            arr.push({barcode : d.barcode ,
                      item : d.name ,
                      unit : d.unit,
                      size : d.size,
                      quantity : sell[0].q - returns[0].q,
                      price : d.price,
                      amount : sell[0].a - returns[0].a,
                      purchase_price : d.purchase_price,
                      purchase_amount :sell[0].p - returns[0].p,
                    })
          }

        }
        response.json({ status: true , data : arr , message: Antl.formatMessage('messages.no_data')})
      }catch(e){
        response.json({ status: false , error : true , message: Antl.formatMessage('messages.error')+' ' + e.message })
      }
  }

}
module.exports = ReportCostRevenueController
