'use strict'
const Data = use('App/Model/PosGeneral')  // EDIT
const Detail = use('App/Model/PosDetail')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const Option = use('App/Model/Option')  // EDIT

class InvoiceManageController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "invoice-report"  // EDIT
      this.room = "invoice"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('invoice_manage.title')  // EDIT
      const page = 1
      const option = yield Option.query().where("code","MAX_ITEM_MANAGE_VOUCHER").first()
      const data = yield Data.query()
      .innerJoin('inventory','inventory.id','pos_general.inventory_id')
      .innerJoin('customer','customer.id', 'pos_general.subject')
      .innerJoin('payment','payment.general', 'pos_general.id')
      .innerJoin('payment_method','payment_method.id', 'payment.payment_method')
      .whereIn('type',[5,6])
      .orderBy('id', 'desc')
      .with('detail')
      .select('pos_general.*','inventory.name as inventory_name','inventory.phone as inventory_phone','inventory.address as inventory_address',
      'customer.name as customer_name','customer.phone as customer_phone','customer.address as customer_address','payment_method.name as payment_method')
      .paginate(page,option.value)
      data.toJSON().page = Math.ceil(data.toJSON().total / data.toJSON().perPage)
      const show = yield response.view('pos/pages/invoice_manage', {key : this.key,room : this.room  ,title: title , data: data.toJSON() })  // EDIT
      response.send(show)
  }
   * load (request, response){
     try{
     const data = JSON.parse(request.input('data'))
     const arr = yield Data.query()
     .innerJoin('inventory','inventory.id','pos_general.inventory_id')
     .innerJoin('customer','customer.id', 'pos_general.subject')
     .innerJoin('payment','payment.general', 'pos_general.id')
     .innerJoin('payment_method','payment_method.id', 'payment.payment_method')
     .whereIn('type',[5,6])
     .where('pos_general.id',data)
     .orderBy('id', 'desc')
     .with('detail')
     .select('pos_general.*','inventory.name as inventory_name','inventory.phone as inventory_phone','inventory.address as inventory_address',
     'customer.name as customer_name','customer.phone as customer_phone','customer.address as customer_address','payment_method.name as payment_method')
     .first()
     if(arr){
         response.json({ status: true  , data : arr})
     }else{
         response.json({ status: false , message: Antl.formatMessage('messages.no_data') })
     }
   }
 }catch(e){
   response.json({ status: false ,error : true , message: Antl.formatMessage('messages.error')+' ' + e.message })
 }
}
module.exports = InvoiceManageController
