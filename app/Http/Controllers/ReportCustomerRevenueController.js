'use strict'
const Data = use('App/Model/PosGeneral')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const Option = use('App/Model/Option')  // EDIT
const Shift = use('App/Model/Shift') //EDIT
const Inventory = use('App/Model/Inventory')  // EDIT

var moment = require('moment')

class ReportCustomerRevenueController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "report-customer-revenue"  // EDIT
      this.room = "report-customer"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('report_customer_revenue.title')  // EDIT
      const end_date = moment().format('DD/MM/YYYY')
      const stock = yield Inventory.query().where('active',1).orderBy('id', 'desc').fetch()
      const shift = yield Shift.query().where('active',1).orderBy('id', 'desc').fetch()
      const show = yield response.view('pos/pages/report_customer_revenue', {key : this.key ,room : this.room,title: title , end_date:end_date  , shift_list : shift.toJSON() , stock : stock.toJSON()})  // EDIT
      response.send(show)
  }
  * get (request, response) {
     try {
       const data = JSON.parse(request.input('data'))
       const general = yield Data.query()
                       .where('subject_key','customer')
                       .innerJoin('payment', 'payment.general', 'pos_general.id')
                       .innerJoin('customer', 'customer.id', 'pos_general.subject')
                       .TypeWhereNot('pos_general.inventory_id',data.inventory)
                       .where('pos_general.active',data.active)
                       .whereBetween('date_voucher',[moment(data.start_date ,"YYYY-MM-DD").format('YYYY-MM-DD'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD') ])
                       .whereIn('pos_general.type',[5,6])
                       .select("pos_general.date_voucher","pos_general.voucher","customer.name as customer","pos_general.description","pos_general.type","pos_general.total_discount as general_discount","payment.total_discount as payment_discount","payment.total_amount as total_payment","pos_general.total_number","pos_general.total_amount")
       var arr = []
       for(var g of general){
         arr.push({date_voucher : g.date_voucher ,
                   voucher : g.voucher ,
                   description : g.description ,
                   customer : g.customer,
                   quantity : g.type == 5 ? g.total_number : (-g.total_number),
                   discount : g.type == 5 ? g.general_discount+ g.payment_discount : -(g.general_discount+ g.payment_discount),
                   amount : g.type == 5 ? g.total_amount : (-g.total_amount),
                   payment : g.type == 5 ? g.total_payment : (-g.total_payment)
                 })
       }
       response.json({ status: true , data : arr})
     }catch(e){
       response.json({ status: false , error : true , message: Antl.formatMessage('messages.error')+' ' + e.message })
     }
  }
}
module.exports = ReportCustomerRevenueController
