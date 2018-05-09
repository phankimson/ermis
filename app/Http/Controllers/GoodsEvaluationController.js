'use strict'
const GoodsWarning = use('App/Model/GoodsWarning')  // EDIT
const GoodsInventory = use('App/Model/GoodsInventory')  // EDIT
const Inventory = use('App/Model/Inventory')  // EDIT
const MarialGoods = use('App/Model/MarialGoods')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const Option = use('App/Model/Option')  // EDIT

class GoodsEvaluationController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "goods-evaluation"  // EDIT
      this.room = "goods-evaluation"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('goods_evaluation.title')  // EDIT
      const page = 1
      const option = yield Option.query().where("code","MAX_ITEM_EVALUATION").first()
      const inventory = yield request.session.get('inventory')
      const stock = yield Inventory.query().where('active',1).orderBy('id', 'desc').fetch()
      const item = yield MarialGoods.query().where('active',1).orderBy('id', 'desc').fetch()
      const warning = yield GoodsWarning.query().where('active',1).orderBy('id', 'desc').fetch()
      const data = yield GoodsInventory.query()
                    .innerJoin('goods_size', 'goods_size.id', 'goods_inventory.goods_size')
                    .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
                    .innerJoin('unit', 'unit.id', 'marial_goods.unit')
                    .innerJoin('size', 'size.id', 'goods_size.size')
                    .TypeWhere('goods_inventory.inventory', inventory)
                    .select('goods_size.*','goods_inventory.*','unit.name as unit','marial_goods.name as name','size.name as size').paginate(page,option.value)
      data.toJSON().page = Math.ceil(data.toJSON().total / data.toJSON().perPage)
      const show = yield response.view('pos/pages/goods_evaluation', {key : this.key ,room : this.room ,title: title , data: data.toJSON() ,item :item.toJSON(),stock:stock.toJSON(),warning:warning.toJSON() })  // EDIT
      response.send(show)
  }
  * page (request, response){
    try{
      const page = JSON.parse(request.input('data'))
      const option = yield Option.query().where("code","MAX_ITEM_EVALUATION").first()
      const inventory = yield request.session.get('inventory')
      const warning = yield GoodsWarning.query().where('active',1).orderBy('id', 'desc').fetch()
      const data = yield GoodsInventory.query()
                    .innerJoin('goods_size', 'goods_size.id', 'goods_inventory.goods_size')
                    .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
                    .innerJoin('unit', 'unit.id', 'marial_goods.unit')
                    .innerJoin('size', 'size.id', 'goods_size.size')
                    .TypeWhere('goods_inventory.inventory', inventory)
                    .select('goods_size.*','goods_inventory.*','unit.name as unit','marial_goods.name as name','size.name as size').paginate(page,option.value)
      if(data.toJSON().data.length > 0){
        response.json({ status: true , data : data.toJSON().data ,warning:warning.toJSON()})
      }else{
        response.json({ status: false , message: Antl.formatMessage('messages.no_data_found')})
      }
    }catch(e){
        response.json({ status: false , error : false , message: Antl.formatMessage('messages.error')+' ' + e.message})
    }

  }
  * filter (request, response){
      try{
      const data = JSON.parse(request.input('data'))
      const warning = yield GoodsWarning.query().where('active',1).orderBy('id', 'desc').fetch()
      const arr = yield GoodsInventory.query()
                    .innerJoin('goods_size', 'goods_size.id', 'goods_inventory.goods_size')
                    .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
                    .innerJoin('unit', 'unit.id', 'marial_goods.unit')
                    .innerJoin('size', 'size.id', 'goods_size.size')
                    .TypeWhereIn('goods_size.goods',eval(data.item_search))
                    .TypeWhere('goods_inventory.inventory',data.inventory_search)
                    .select('goods_size.*','goods_inventory.*','unit.name as unit','marial_goods.name as name','size.name as size').fetch()
      if(arr.toJSON().length > 0){
        response.json({ status: true , data : arr.toJSON() ,warning:warning.toJSON()})
      }else{
        response.json({ status: false , message: Antl.formatMessage('messages.no_data_found')})
      }
    }catch(e){
        response.json({ status: false , error : false , message: Antl.formatMessage('messages.error')+' ' + e.message})
    }
  }

}
module.exports = GoodsEvaluationController
