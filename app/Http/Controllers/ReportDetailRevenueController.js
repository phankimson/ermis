'use strict'
const Data = use('App/Model/PosGeneral')  // EDIT
const Detail = use('App/Model/PosDetail')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const Option = use('App/Model/Option')  // EDIT
const Shift = use('App/Model/Shift') //EDIT
const Inventory = use('App/Model/Inventory')  // EDIT

var moment = require('moment')

class ReportDetailRevenueController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "report-detail-revenue"  // EDIT
      this.room = "report-revenue"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('report_detail_revenue.title')  // EDIT
      const end_date = moment().format('DD/MM/YYYY')
      const stock = yield Inventory.query().where('active',1).orderBy('id', 'desc').fetch()
      const shift = yield Shift.query().where('active',1).orderBy('id', 'desc').fetch()
      const show = yield response.view('pos/pages/report_detail_revenue', {key : this.key ,title: title , end_date:end_date  , shift_list : shift.toJSON() , stock : stock.toJSON()})  // EDIT
      response.send(show)
  }
  * get (request, response) {
     try {
       const data = JSON.parse(request.input('data'))
       const detail = yield Detail.query()
                       .innerJoin('pos_general', 'pos_general.id', 'pos_detail.general_id')
                       .innerJoin('unit', 'unit.id', 'pos_detail.unit')
                       .innerJoin('payment', 'payment.general', 'pos_general.id')
                       .innerJoin('shift', 'shift.id', 'payment.shift')
                       .TypeWhereNot('pos_general.inventory_id',data.inventory)
                       .TypeWhereNot('payment.shift',data.shift)
                       .where('pos_general.active',data.active)
                       .whereBetween('date_voucher',[moment(data.start_date ,"YYYY-MM-DD").format('YYYY-MM-DD'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD') ])
                       .whereIn('pos_general.type',[5,6])
                       .select("pos_general.date_voucher","pos_general.voucher","shift.name as shift","pos_general.description","pos_general.type","pos_detail.barcode","pos_detail.item_name","unit.name as unit","pos_detail.quantity","pos_detail.price","pos_detail.amount")
       var arr = []
       for(var g of detail){
         arr.push({date_voucher : g.date_voucher ,
                   voucher : g.voucher ,
                   description : g.description ,
                   barcode : g.barcode ,
                   item_name : g.item_name ,
                   shift : g.shift,
                   unit : g.unit ,
                   quantity : g.type == 5 ? g.quantity : (-g.quantity),
                   price : g.price ,
                   amount : g.type == 5 ? g.amount : (-g.amount)
                 })
       }
       response.json({ status: true , data : arr})
     }catch(e){
       response.json({ status: false , error : true , message: Antl.formatMessage('messages.error')+' ' + e.message })
     }
  }
}
module.exports = ReportDetailRevenueController
