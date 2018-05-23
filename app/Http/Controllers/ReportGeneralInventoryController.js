'use strict'
const Data = use('App/Model/PosGeneral')  // EDIT
const Detail = use('App/Model/PosDetail')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const Option = use('App/Model/Option')  // EDIT
const Size = use('App/Model/Size')  // EDIT
const MarialGoods = use('App/Model/MarialGoods')  // EDIT
const GoodsSize = use('App/Model/GoodsSize')  // EDIT
const GoodsInventory = use('App/Model/GoodsInventory')  // EDIT
const Initial = use('App/Model/Initial')  // EDIT
const Inventory = use('App/Model/Inventory')  // EDIT
var moment = require('moment')

class ReportGeneralInventoryController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "report-general-inventory"  // EDIT
      this.room = "report-inventory"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('report_general_inventory.title')  // EDIT
      const date_range = yield Option.query().where("code","MAX_DATE_RANGER_REPORT").first()
      const end_date = moment().format('DD/MM/YYYY')
      const start_date = moment().subtract((date_range.value - 1), 'days').format('DD/MM/YYYY')
      const size = yield Size.query().where('active',1).orderBy('id', 'desc').fetch()
      const item = yield MarialGoods.query().where('active',1).orderBy('id', 'desc').fetch()
      const stock = yield Inventory.query().where('active',1).orderBy('id', 'desc').fetch()
      const show = yield response.view('pos/pages/report_general_inventory', {key : this.key ,room : this.room,title: title , end_date:end_date , start_date :start_date , size : size.toJSON() , item : item.toJSON() , stock: stock.toJSON()})  // EDIT
      response.send(show)
  }
  * get (request, response) {
     try {
        const data = JSON.parse(request.input('data'))
        const goodsize1 = yield Initial.query()
        .innerJoin('goods_size', 'goods_size.id', 'initial.item')
        .innerJoin('size', 'size.id', 'goods_size.size')
        .where('initial.inventory',data.inventory)
        .where('goods_size.active',1).TypeWhere('goods_size.goods',data.item)
        .TypeWhere('goods_size.size',data.size)
        .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
        .innerJoin('unit', 'unit.id', 'marial_goods.unit')
        .select('goods_size.*','unit.name as unit','marial_goods.name as name','size.name as size').fetch()
        const goodsize2 = yield GoodsInventory.query()
        .innerJoin('goods_size', 'goods_size.id', 'goods_inventory.goods_size')
        .innerJoin('size', 'size.id', 'goods_size.size')
        .where('goods_inventory.inventory',data.inventory)
        .where('goods_size.active',1).TypeWhere('goods_size.goods',data.item)
        .TypeWhere('goods_size.size',data.size)
        .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
        .innerJoin('unit', 'unit.id', 'marial_goods.unit')
        .with('opening_receipt')
        .scope('opening_receipt', (builder) => {
          builder.TypeWhereNot('pos_general.inventory_receipt',data.inventory).where('pos_general.active',data.active)
          .where('pos_general.date_voucher','<',moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'))
          .sum('pos_detail.quantity as q').sum('pos_detail.'+data.price+' as a')
        })
        .select('goods_size.*','unit.name as unit','marial_goods.name as name','size.name as size').first()
        const a = yield goodsize2.opening_receipt().fetch()
        console.log(a)
        var goodsize = goodsize1.toJSON().concat(goodsize2.toJSON())
        var arr = []

        response.json({ status: true  , data : arr})
      }catch(e){
        response.json({ status: false , error : true , message: Antl.formatMessage('messages.error')+' ' + e.message })
      }
  }

}
module.exports = ReportGeneralInventoryController
