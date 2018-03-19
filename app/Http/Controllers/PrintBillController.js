'use strict'
const Data = use('App/Model/PosGeneral')  // EDIT
const Detail = use('App/Model/PosDetail')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const Option = use('App/Model/Option')  // EDIT

var moment = require('moment')

class PrintBillController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "print-bill"  // EDIT
      this.room = "print-bill"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('print_bill.title')  // EDIT
      const page = 1
      const option = yield Option.query().where("code","MAX_ITEM_APPROVED").first()
      const inventory = yield request.session.get('inventory')
      const data = yield Data.query()
      .where('inventory_id',inventory)
      .innerJoin('customer','customer.id','pos_general.subject')
      .orderBy('id', 'desc')
      .whereIn('type',[5])
      .select('pos_general.*','customer.name as subject')
      .paginate(page,option.value)
      data.toJSON().page = Math.ceil(data.toJSON().total / data.toJSON().perPage)
      const show = yield response.view('pos/pages/print_bill', {key : this.key ,title: title , data: data.toJSON() })  // EDIT
      response.send(show)
  }
  * page (request, response){
    try{
      const page = JSON.parse(request.input('data'))
      const option = yield Option.query().where("code","MAX_ITEM_APPROVED").first()
      const inventory = yield request.session.get('inventory')
      const data = yield Data.query()
      .where('inventory_id',inventory)
      .innerJoin('customer','customer.id','pos_general.subject')
      .orderBy('id', 'desc')
      .whereIn('type',[5])
      .select('pos_general.*','customer.name as subject')
      .paginate(page,option.value)
      if(data.toJSON().data.length > 0){
        response.json({ status: true , data : data.toJSON().data})
      }else{
        response.json({ status: false , message: Antl.formatMessage('messages.no_data_found')})
      }
    }catch(e){
      response.json({ status: false , error : true , message: Antl.formatMessage('messages.error')+' ' + e.message })
    }

  }
  * filter (request, response){
      try{
      const data = JSON.parse(request.input('data'))
      const inventory = yield request.session.get('inventory')
      const arr = yield Data.query()
      .where('inventory_id',inventory)
      .innerJoin('customer','customer.id','pos_general.subject')
      .orderBy('id', 'desc')
      .orWhere('pos_general.voucher',data.voucher_search)
      .where('pos_general.active',data.active_search)
      .whereIn('pos_general.status',eval(data.status_search))
      .orWhere('pos_general.date_voucher',data.date_voucher_search)
      .select('pos_general.*','customer.name as subject')
      .whereIn('type',[5])
      .fetch()
      if(arr.toJSON().length > 0){
        response.json({ status: true , data : arr.toJSON()})
      }else{
        response.json({ status: false , message: Antl.formatMessage('messages.no_data_found')})
      }
    }catch(e){
      response.json({ status: false , error : true , message: Antl.formatMessage('messages.error')+' ' + e.message })
    }
  }


}
module.exports = PrintBillController
