'use strict'
const Data = use('App/Model/PosGeneral')  // EDIT
const Detail = use('App/Model/PosDetail')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const Option = use('App/Model/Option')  // EDIT
const GoodsSize = use('App/Model/GoodsSize')  // EDIT
const Closing = use('App/Model/Closing')  // EDIT
var moment = require('moment')

class UpdatePurchasePriceController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "update-purchase-price"  // EDIT
      this.room = "update-purchase-price"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('update_purchase_price.title')  // EDIT
      const date_range = yield Option.query().where("code","MAX_DATE_RANGER_REPORT").first()
      const end_date = moment().format('DD/MM/YYYY')
      const start_date = moment().subtract((date_range.value - 1), 'days').format('DD/MM/YYYY')
      const show = yield response.view('pos/pages/update_purchase_price', {key : this.key ,title: title , end_date:end_date , start_date :start_date })  // EDIT
      response.send(show)
  }
  * update  (request, response){
    try {
         const data = JSON.parse(request.input('data'))
         if(data){
           const closing = yield Closing.query().where('date',moment(data.date_voucher,"YYYY-MM-DD").format("MM/YYYY")).where('active',1).count('* as total')
           if(closing[0].total == 0){
             var startDate = moment([moment(data.date,"MM/YYYY").format('YYYY'), moment(data.date,"MM/YYYY").format('MM') - 1]).format("YYYY-MM-DD")
             var endDate = moment(startDate).endOf('month').format("YYYY-MM-DD")
             if(data.item){
               const goods_size = yield GoodsSize.find(data.item)
               const arr = yield Detail.query()
              .innerJoin('pos_general','pos_general.id','pos_detail.general_id')
              .where('pos_detail.item_id', data.item)
              .whereBetween('pos_general.date_voucher',[startDate,endDate ]).where('pos_detail.active',1).select('pos_detail.id','pos_detail.item_id','pos_detail.quantity','pos_detail.purchase_price').fetch()
              for(let d of arr){

                if(d.purchase_price != goods_size.purchase_price){
                  const result = yield Detail.find(d.id)
                        result.purchase_price = goods_size.purchase_price
                        result.purchase_amount = d.quantity * goods_size.purchase_price
                  yield result.save()
                }

              }

             }else{
               const arr = yield Detail.query()
              .innerJoin('pos_general','pos_general.id','pos_detail.general_id')
              .whereBetween('pos_general.date_voucher',[startDate,endDate ]).where('pos_detail.active',1).select('pos_detail.id','pos_detail.item_id','pos_detail.quantity','pos_detail.purchase_price').fetch()
                for(let d of arr){
                  const goods_size = yield GoodsSize.find(d.item_id)
                  console.log(d.purchase_price + ' '+ goods_size.purchase_price)
                  if(d.purchase_price != goods_size.purchase_price){
                      console.log(d.item_id)
                    const result = yield Detail.find(d.id)
                          result.purchase_price = goods_size.purchase_price
                          result.purchase_amount = d.quantity * goods_size.purchase_price
                    yield result.save()
                  }
                }
             }
             response.json({ status: true , message: Antl.formatMessage('messages.update_success') })
           }else{
            response.json({ status: false , message: Antl.formatMessage('messages.locked_period') })
           }
           }else{
           response.json({ status: false  , message: Antl.formatMessage('messages.update_fail')})
           }
       } catch (e) {
       response.json({ status: false , message: Antl.formatMessage('messages.update_error')+' '+e.message})
       }
  }

}
module.exports = UpdatePurchasePriceController
