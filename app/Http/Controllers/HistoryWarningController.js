'use strict'
const Data = use('App/Model/HistoryWarning')  // EDIT
const Stock = use('App/Model/Inventory')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
var moment = require('moment')
class HistoryWarningController{
  constructor () {
      this.key = "history-warning"  // EDIT
      this.room = "history-warning"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('history_warning.title')  // EDIT
      const date = moment().format('DD/MM/YYYY')
      const data = yield Data.query().orderBy('history_warning.id', 'desc')
      .innerJoin('inventory','inventory.id','history_warning.inventory')
      .where('history_warning.date','=',moment().format('YYYY-MM-DD'))
      .select('history_warning.*','inventory.name as inventory_name')
      .fetch()
      const stock = yield Stock.query().where('active',1).fetch()
      const show = yield response.view('pos/pages/history_warning', {key : this.key,date :date ,stock :stock.toJSON(),data :data.toJSON(), title: title }) // EDIT
      response.send(show)
  }

  * get (request, response){
    try {
        const data = JSON.parse(request.input('data'))
        console.log(data)
        var arr = []
        arr = yield Data.query().orderBy('history_warning.id', 'desc')
        .innerJoin('inventory','inventory.id','history_warning.inventory')
        .where('history_warning.date','=',moment(data,"DD/MM/YYYY").format('YYYY-MM-DD'))
        .select('history_warning.*','inventory.name as inventory_name')
        .fetch()
            if(arr){
                response.json({ status: true  , data : arr.toJSON() })
            }else{
                response.json({ status: false , message: Antl.formatMessage('messages.no_data') })
            }
    } catch (e) {
      response.json({ status: false , error : true , message: Antl.formatMessage('messages.error')+' ' + e.message})
    }
  }

    }
module.exports = HistoryWarningController
