'use strict'
const Antl = use('Antl')
const Helpers = use('Helpers')
const Option = use('App/Model/Option')  // EDIT
const HistoryPrice = use('App/Model/HistoryPrice')  // EDIT
var moment = require('moment')

class ReportHistoryPriceController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "report-history-price"  // EDIT
      this.room = "report-history-price"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('report_history_price.title')  // EDIT
      const date_range = yield Option.query().where("code","MAX_DATE_RANGER_REPORT").first()
      const end_date = moment().format('DD/MM/YYYY')
      const start_date = moment().subtract((date_range.value - 1), 'days').format('DD/MM/YYYY')
      const show = yield response.view('pos/pages/report_history_price', {key : this.key ,title: title , end_date:end_date , start_date :start_date })  // EDIT
      response.send(show)
  }
  * get (request, response) {
     try {
        const data = JSON.parse(request.input('data'))
        if(data.item){
          // Lấy số đầu kỳ
          var arr = yield HistoryPrice.query().where('goods_size',data.item).where('type',data.price).fetch()
              response.json({ status: true  , data : arr.toJSON()})
        }else{
              response.json({ status: false  , message: Antl.formatMessage('messages.please_choose_item')})
        }
      }catch(e){
          response.json({ status: false , error : true , message: Antl.formatMessage('messages.error')+' ' + e.message})
      }
  }
}
module.exports = ReportHistoryPriceController
