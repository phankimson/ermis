'use strict'
const Data = use('App/Model/PosGeneral')  // EDIT
const Detail = use('App/Model/PosDetail')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const Option = use('App/Model/Option')  // EDIT
const Size = use('App/Model/Size')  // EDIT
const MarialGoods = use('App/Model/MarialGoods')  // EDIT
const GoodsSize = use('App/Model/GoodsSize')  // EDIT
const Initial = use('App/Model/Initial')  // EDIT
const Inventory = use('App/Model/Inventory')  // EDIT
var moment = require('moment')

class UpdatePurchasePriceController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "report-detail-inventory"  // EDIT
      this.room = "report-inventory"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('report_detail_inventory.title')  // EDIT
      const date_range = yield Option.query().where("code","MAX_DATE_RANGER_REPORT").first()
      const end_date = moment().format('DD/MM/YYYY')
      const start_date = moment().subtract((date_range.value - 1), 'days').format('DD/MM/YYYY')
      //const item = yield GoodsSize.query().where('goods_size.active',1).orderBy('goods_size.id', 'desc')
      //.innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
      //.innerJoin('size', 'size.id', 'goods_size.size').select('goods_size.id','goods_size.barcode','marial_goods.name as name','size.name as size')
      //.fetch()
      const show = yield response.view('pos/pages/update_purchase_price', {key : this.key ,title: title , end_date:end_date , start_date :start_date })  // EDIT
      response.send(show)
  }

}
module.exports = UpdatePurchasePriceController
