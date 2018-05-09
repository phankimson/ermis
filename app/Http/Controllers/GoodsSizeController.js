'use strict'
const Data = use('App/Model/GoodsSize')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const HistoryAction = use('App/Classes/HistoryAction')
const Menu = use('App/Model/Menu')
const MarialGoods = use('App/Model/MarialGoods')
const Size = use('App/Model/Size')
const HistoryPrice = use('App/Classes/HistoryPrice')
const HistoryPriceModel = use('App/Model/HistoryPrice')

class GoodsSizeController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "goods-size"  // EDIT
      this.menu = "pos_goods_size"  // EDIT
      this.download = "GoodsSize.xlsx"  // EDIT
      this.room = "goods-size"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('goods_size.title')  // EDIT
      const data = yield Data.query().orderBy('id', 'desc').fetch()
      const goods = yield MarialGoods.query().where('active',1).orderBy('id', 'desc').fetch()
      const size = yield Size.query().where('active',1).orderBy('id', 'desc').fetch()
      const show = yield response.view('pos/pages/goods_size', {key : this.key ,room : this.room  ,title: title , data: data.toJSON() , goods : goods.toJSON() , size : size.toJSON() })  // EDIT
      response.send(show)
  }

  * save (request, response){
      try {
    const data = JSON.parse(request.input('data'))
    const permission = JSON.parse(yield request.session.get('permission'))
    if(data){
      const check = yield Data.query().where('barcode',data.barcode).first()
      if(check && check.id != data.id){
        response.json({ status: false, message: Antl.formatMessage('messages.duplicate_code')  })
      }else{
      var result = ''
      var action = 0
        if(data.id != null){
         result =  yield Data.findBy('id', data.id)
         var action = 4
        }else{
         result = new Data()
         var action = 2
        }
          if(permission.a || permission.e){
          result.barcode = data.barcode
          result.name = data.name
          result.goods = data.goods
          result.size = data.size
          result.maximum_stock = data.maximum_stock
          result.minimum_stock = data.minimum_stock
          result.price = data.price
          result.purchase_price = data.purchase_price
          result.active = data.active
          yield result.save()

          //Lưu lịch sử giá bán
          const his1 = yield HistoryPriceModel.query().where('type',1).where('price',data.price).first()
          if(!his1){
            let hs = new HistoryPrice()
            var rs = hs.insertRecord(result.id,1,result.price)
            yield rs.save()
          }
          //Lưu lịch sử giá mua
          const his2 = yield HistoryPriceModel.query().where('type',2).where('price',data.purchase_price).first()
          if(!his2){
            let hs = new HistoryPrice()
            var rs = hs.insertRecord(result.id,2,result.purchase_price)
            yield rs.save()
          }

          // Lưu lịch sử
          const menu = yield Menu.query().where('code',this.menu).first()
          let hs = new HistoryAction()
          var rs = hs.insertRecord(action,request.currentUser.id,menu.id,JSON.stringify(result))
          yield rs.save()
          //
       response.json({ status: true , message: Antl.formatMessage('messages.update_success') , data : result})
     }else{
        response.json({ status: false , message: Antl.formatMessage('messages.you_not_permission') })
      }
     }
    }else{
      response.json({ status: false , message: Antl.formatMessage('messages.no_data') })
      }
    } catch (e) {
    response.json({ status: false , message: Antl.formatMessage('messages.update_fail')+e.message})
    }
  }
  * delete (request, response){
    try{
    const permission = JSON.parse(yield request.session.get('permission'))
    const data = request.input('data')
    if(data){
      if(permission.d){
        const arr = yield Data.findBy('id', data)
        // Lưu lịch sử
        const menu = yield Menu.query().where('code',this.menu).first()
        let hs = new HistoryAction()
        var rs = hs.insertRecord(5,request.currentUser.id,menu.id,JSON.stringify(arr))
        yield rs.save()
        //
        yield arr.delete()
        response.json({ status: true , message: Antl.formatMessage('messages.delete_success')})
      }else{
        response.json({ status: false , message: Antl.formatMessage('messages.you_are_not_permission_delete')})
      }
    }else{
        response.json({ status: false ,message: Antl.formatMessage('messages.no_data')  })
    }
    }catch(e){
      response.json({ status: false , message: Antl.formatMessage('messages.delete_fail')})
    }
  }
  * downloadExcel (request, response){
    response.download(Helpers.storagePath(this.download))
  }

  * import (request, response){
    try{
    const permission = JSON.parse(yield request.session.get('permission'))
    if(permission.a){
    const file = request.file('files', {
      allowedExtensions: ['xls', 'xlsx']
    })

    var XLSX = require('xlsx')
    var workbook = XLSX.readFile(file[1].tmpPath())
    var sheet_name_list = workbook.SheetNames
    const arr = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]])
    if(arr){
      let arr_push = []
      for(let data of arr){
        var result = new Data()
        result.barcode = data.barcode
        result.name = data.name
        result.goods = data.goods
        result.size = data.size
        result.maximum_stock = data.maximum_stock
        result.minimum_stock = data.minimum_stock
        result.price = data.price
        result.purchase_price = data.purchase_price
        result.active = data.active
        yield result.save()
        arr_push.push(result)

        //Lưu lịch sử giá bán
        const his1 = yield HistoryPriceModel.query().where('type',1).where('price',data.price).first()
        if(!his1){
          let hs = new HistoryPrice()
          var rs = hs.insertRecord(result.id,1,result.price)
          yield rs.save()
          }
          //Lưu lịch sử giá mua
          const his2 = yield HistoryPriceModel.query().where('type',2).where('price',data.purchase_price).first()
          if(!his2){
          let hs = new HistoryPrice()
          var rs = hs.insertRecord(result.id,2,result.purchase_price)
          yield rs.save()
          }

      }
      // Lưu lịch sử
      const menu = yield Menu.query().where('code',this.menu).first()
      let hs = new HistoryAction()
      var rs = hs.insertRecord(6,request.currentUser.id,menu.id,JSON.stringify(arr))
      yield rs.save()
      //
      response.json({ status: true , message: Antl.formatMessage('messages.success_import') , data : arr_push})
    }else{
      response.json({ status: false , message: Antl.formatMessage('messages.no_data')})
    }

    yield file[1].delete()
  }else{
    response.json({ status: false , message: Antl.formatMessage('messages.you_are_not_permission_add')})
  }
  }catch(e){
    response.json({ status: false , message: Antl.formatMessage('messages.failed_import')})
  }
  }
}
module.exports = GoodsSizeController
