'use strict'
const Payment = use('App/Model/Payment')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const Option = use('App/Model/Option')  // EDIT
const Customer = use('App/Model/Customer')  // EDIT
const Data = use('App/Model/PosGeneral')  // EDIT
const Detail = use('App/Model/PosCash')  // EDIT

var moment = require('moment')

class ReportDetailDebtController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "report-detail-debt"  // EDIT
      this.room = "report-debt"  // EDIT
      this.subject_key = "customer"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('report_detail_debt.title')  // EDIT
      const end_date = moment().format('DD/MM/YYYY')
      const subject = yield Customer.query().where('active',1).fetch()
      const show = yield response.view('pos/pages/report_detail_debt', {key : this.key ,title: title , end_date:end_date , subject:subject.toJSON()})  // EDIT
      response.send(show)
  }
  * get (request, response) {
     try {
        const data = JSON.parse(request.input('data'))
        const opening_balance = yield Initial.query().where('item',data.subject).where('type',3).sum('debt_account as q').sum('credit_account as a')

        // Lấy số đầu kỳ
        const opening_debt = yield Data.query()
       .where('subject',data.subject).where('subject_key',this.subject_key).where('active',data.active).where('type',1)
       .where('date_voucher','<',moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'))
       .sum('total_amount as q')

       const opening_credit = yield Data.query()
      .where('subject',data.subject).where('subject_key',this.subject_key).where('active',data.active).where('type',7)
      .where('date_voucher','<',moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'))
      .sum('total_amount as q')

      // chi tiết
      const detail = yield Data.query()
     .where('subject',data.subject).where('subject_key',this.subject_key)
     .where('active',data.active).whereIn('type',[1,7])
     .whereBetween('date_voucher',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD') ])
     .fetch()

     var arr = []
     var debt =0
     var credit = 0

     arr.push({
       description : Antl.formatMessage('report_inventory.opening_balance'),
       date_voucher : null,
       debt : 0,
       credit : 0,
       closing : opening_balance[0].q+opening_debt[0].q - opening_credit[0].q-opening_balance[0].a
     })

     for(var d of detail.toJSON()){
       var a = (d.type == 1)? d.total_amount : 0
       var b = (d.type == 7)? d.total_amount : 0
       // Số đầu kỳ
         arr.push({
           id : d.id,
           date_voucher : d.date_voucher,
           voucher : d.voucher,
           description : d.description,
           debt : a ,
           credit : b ,
           closing : 0
         })
       //
       debt += a
       credit += b
     }

     arr.push({
       description : Antl.formatMessage('report_inventory.closing_balance'),
       date_voucher : null,
       debt : 0,
       credit : 0,
       closing : opening_balance[0].q+opening_debt[0].q - opening_credit[0].q + debt - credit-opening_balance[0].a
     })

        response.json({ status: true , data : arr})
      }catch(e){
        response.json({ status: false , error : true , message: Antl.formatMessage('messages.error')+' ' + e.message})
      }
  }

}
module.exports = ReportDetailDebtController
