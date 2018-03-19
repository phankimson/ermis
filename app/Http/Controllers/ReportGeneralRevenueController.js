'use strict'
const General = use('App/Model/PosGeneral')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const Option = use('App/Model/Option')  // EDIT
const Inventory = use('App/Model/Inventory')  // EDIT

var moment = require('moment')

class ReportGeneralRevenueController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "report-general-revenue"  // EDIT
      this.room = "report-revenue"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('report_general_revenue.title')  // EDIT
      const date_range = yield Option.query().where("code","MAX_DATE_RANGER_REPORT").first()
      const end_date = moment().format('DD/MM/YYYY')
      const start_date = moment().subtract((date_range.value - 1), 'days').format('DD/MM/YYYY')
      const stock = yield Inventory.query().where('active',1).orderBy('id', 'desc').fetch()
      const show = yield response.view('pos/pages/report_general_revenue', {key : this.key ,title: title , end_date:end_date , start_date :start_date , stock: stock.toJSON()})  // EDIT
      response.send(show)
  }
  * get (request, response) {
     try {
        const data = JSON.parse(request.input('data'))
        const general = yield General.query()
                        .TypeWhereNot('inventory_id',data.inventory)
                        .where('active',data.active)
                        .whereBetween('date_voucher',[moment(data.start_date ,"YYYY-MM-DD").format('YYYY-MM-DD'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD') ])
                        .sum("total_number as quantity")
                        .sum("total_amount as amount")
                        .whereIn('type',[5,6])
                        .select("date_voucher","type")
                        .groupByRaw('date_voucher, inventory_id , type')
        var arr = []
        for(var g of general){
          arr.push({date_voucher : g.date_voucher ,
                    description : g.type == 5 ? Antl.formatMessage('store.sell_daily') + ' - '+ moment(g.date_voucher).format('DD/MM/YYYY') : Antl.formatMessage('return.pay_daily')+ ' - '+ moment(g.date_voucher).format('DD/MM/YYYY'),
                    quantity : g.type == 5 ? g.quantity : (-g.quantity),
                    amount : g.type == 5 ? g.amount : (-g.amount)
                  })
        }
        response.json({ status: true , data : arr})
      }catch(e){
        response.json({ status: false , error : true , message: Antl.formatMessage('messages.error')+' ' + e.message })
      }
  }

}
module.exports = ReportGeneralRevenueController
