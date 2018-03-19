'use strict'
const General = use('App/Model/PosGeneral')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const Option = use('App/Model/Option')  // EDIT
const Inventory = use('App/Model/Inventory')  // EDIT
const Shift = use('App/Model/Shift') //EDIT

var moment = require('moment')

class ReportShiftRevenueController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "report-shift-revenue"  // EDIT
      this.room = "report-revenue"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('report_shift_revenue.title')  // EDIT
      const end_date = moment().format('DD/MM/YYYY')
      const shift = yield Shift.query().where('active',1).orderBy('id', 'desc').fetch()
      const stock = yield Inventory.query().where('active',1).orderBy('id', 'desc').fetch()
      const show = yield response.view('pos/pages/report_shift_revenue', {key : this.key ,title: title , end_date:end_date , shift_list : shift.toJSON() , stock: stock.toJSON()})  // EDIT
      response.send(show)
  }
  * get (request, response) {
     try {
        const data = JSON.parse(request.input('data'))
        const general = yield General.query()
                        .TypeWhereNot('inventory_id',data.inventory)
                        .where('pos_general.active',data.active)
                        .innerJoin('payment', 'payment.general', 'pos_general.id')
                        .innerJoin('shift', 'shift.id', 'payment.shift')
                        .innerJoin('payment_method', 'payment_method.id', 'payment.payment_method')
                        .TypeWhereNot('payment.shift',data.shift)
                        .whereBetween('date_voucher',[moment(data.start_date ,"YYYY-MM-DD").format('YYYY-MM-DD'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD') ])
                        .whereIn('type',[5,6])
                        .select("pos_general.date_voucher","pos_general.voucher","pos_general.type","shift.name as shift","pos_general.description","payment_method.name as payment_method","pos_general.total_amount","payment.total_amount as total_payment","payment.payment","payment.refund")
        var arr = []
        for(var g of general){
          arr.push({date_voucher : g.date_voucher ,
                    voucher : g.voucher ,
                    shift : g.shift,
                    description : g.type == 5 ? Antl.formatMessage('store.sell_daily') + ' - '+ moment(g.date_voucher).format('DD/MM/YYYY') : Antl.formatMessage('return.pay_daily')+ ' - '+ moment(g.date_voucher).format('DD/MM/YYYY'),
                    payment_method : g.payment_method,
                    total_amount : g.type == 5 ? g.total_amount : (-g.total_amount),
                    total_discount : g.type == 5 ? (g.total_amount - g.total_payment) : (-g.total_amount + g.total_payment),
                    total_payment : g.type == 5 ? g.total_payment : (-g.total_payment),
                    payment : g.type == 5 ? g.payment : (-g.payment),
                    refund : g.type == 5 ? g.refund : (-g.refund)
                  })
        }
        response.json({ status: true , data : arr})
      }catch(e){
        response.json({ status: false , error : true , message: Antl.formatMessage('messages.error')+' ' + e.message })
      }
  }

}
module.exports = ReportShiftRevenueController
