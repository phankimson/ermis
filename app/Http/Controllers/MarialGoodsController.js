'use strict'
const Data = use('App/Model/MarialGoods')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const fs = require('fs')
const HistoryAction = use('App/Classes/HistoryAction')
const Menu = use('App/Model/Menu')
const Size = use('App/Model/Size')
const Gender = use('App/Model/Gender')
const Type = use('App/Model/Type')
const Group = use('App/Model/Group')
const Style = use('App/Model/Style')
const Origin = use('App/Model/Origin')
const Unit = use('App/Model/Unit')
const WarrantyPeriod = use('App/Model/WarrantyPeriod')
const NumberIncreases = use('App/Model/NumberIncreases')
const Option = use('App/Model/Option')
const GoodsSize = use('App/Model/GoodsSize')
const Model = use('App/Model/Model')
const Discount = use('App/Model/Discount')

class MarialGoodsController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "marial-goods"  // EDIT
      this.menu = "pos_marial_goods"  // EDIT
      this.download = "MarialGoods.xlsx"  // EDIT
      this.barcode = "BARCODE_ITEM"
      this.room = "marial-goods"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('marial_goods.title')  // EDIT
      const data = yield Data.query().orderBy('id', 'desc').fetch()
      const size = yield Size.query().where('active',1).orderBy('id', 'desc').fetch()
      const gender = yield Gender.query().where('active',1).orderBy('id', 'desc').fetch()
      const type_ = yield Type.query().where('active',1).orderBy('id', 'desc').fetch()
      const group = yield Group.query().where('active',1).orderBy('id', 'desc').fetch()
      const style = yield Style.query().where('active',1).orderBy('id', 'desc').fetch()
      const origin = yield Origin.query().where('active',1).orderBy('id', 'desc').fetch()
      const unit = yield Unit.query().where('active',1).orderBy('id', 'desc').fetch()
      const model = yield Model.query().where('active',1).orderBy('id', 'desc').fetch()
      const discount = yield Discount.query().where('type',1).where('active',1).orderBy('id', 'desc').fetch()
      const warranty_period = yield WarrantyPeriod.query().where('active',1).orderBy('id', 'desc').fetch()

      const show = yield response.view('pos/pages/marial_goods', {key : this.key ,title: title , data: data.toJSON() , model : model.toJSON(), size : size.toJSON() , gender : gender.toJSON() , type_ : type_.toJSON() , group : group.toJSON() , style : style.toJSON() , origin : origin.toJSON() , unit : unit.toJSON(), discount : discount.toJSON() , warranty_period : warranty_period.toJSON() })  // EDIT
      response.send(show)
  }

  * load (request, response){
    try{
    const arr = yield NumberIncreases.query().where('code',this.barcode).first()
    if(arr){
        response.json({ status: true  , data : arr})
    }else{
        response.json({ status: false  , message: Antl.formatMessage('messages.no_data') })
    }
    }catch(e){
      response.json({ status: false , error : true , message: Antl.formatMessage('messages.error')+' ' + e.message })
    }
  }
  * save (request, response){
    try {
     const data = JSON.parse(request.input('data'))
     const permission = JSON.parse(yield request.session.get('permission'))
    const image = request.file('image', {
      maxSize: '2mb',
      allowedExtensions: ['jpg', 'png', 'jpeg']
    })

    if(data){
      const check = yield Data.query().where('code',data.code).orWhere('barcode',data.code).first()
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

         // Lưu số nhảy
         const arr = yield NumberIncreases.query().where('code',this.barcode).first()
         const number = arr.value + 1
         const length_number = arr.length_number
         if((number+"").length > arr.length_number){
           arr.value = 1
           arr.length_number = length_number + 1
         }else{
           arr.value = number
         }
         yield arr.save()

        }
         if(permission.a || permission.e){
          result.nature = data.nature
          result.code = data.code
          result.name = data.name
          result.name_en = data.name_en
          result.barcode = data.barcode
          result.warranty_period = data.warranty_period
          result.unit = data.unit
          result.group = data.group
          result.maximum_stock = data.maximum_stock
          result.minimum_stock = data.minimum_stock
          result.description = data.description
          result.origin = data.origin
          result.type = data.type
          result.style = data.style
          result.gender = data.gender
          result.model = data.model
          result.size = data.size
          result.discount = data.discount
          result.price = data.price
          result.price_policy = data.price_policy
          result.purchase_price = data.purchase_price
          result.account_cost = data.account_cost
          result.tax = data.tax
          result.account_revenue = data.account_revenue
          result.excise_taxes = data.excise_taxes
          result.account_warehouse = data.account_warehouse
          result.import_tax_rate = data.import_tax_rate
          result.default_warehouse = data.default_warehouse
          result.export_tax_rate = data.export_tax_rate
          result.direct_materials = data.direct_materials
          result.indirect_materials = data.indirect_materials
          result.direct_labor = data.direct_labor
          result.indirect_labor = data.indirect_labor
          result.depreciation = data.depreciation
          result.cost_purchase_outside = data.cost_purchase_outside
          result.other_costs = data.other_costs
          result.active = data.active
          yield result.save()
          // Lưu hình ảnh
          if(image){
            const option = yield Option.query().where("code","PATH_UPLOAD_IMAGE").first()

            const fileName = `${new Date().getTime()}.${image.extension()}`
            const path_upload = option.value + result.id +'/'+ fileName
            yield image.move(Helpers.publicPath(option.value + result.id+'/'), fileName)

            if (!image.moved()) {
              response.badRequest(image.errors())
              return
            }

            // delete old avatar
            if(result.image){
               fs.unlink(Helpers.publicPath(result.image), (err) => {});
            }

            result.image = path_upload
            yield result.save()
          }

          // Lưu lịch sử
          const menu = yield Menu.query().where('code',this.menu).first()
          let hs = new HistoryAction()
          var rs = hs.insertRecord(action,request.currentUser.id,menu.id,JSON.stringify(result))
          yield rs.save()
          //
          // SAVE Goods Size
          if(data.size != ""){
          var temp = new Array()
          temp = data.size.split(",")
          for (var a in temp ) {
              temp[a] = parseInt(temp[a], 10);
          }
            const size = yield Size.query().whereIn('id',temp).fetch()

            if(data.id != null){
              for(let s of size){
                const goods = yield GoodsSize.query().where('goods',data.id).where('size',s.id).first()
                if(goods){
                  goods.maximum_stock = data.maximum_stock
                  goods.minimum_stock = data.minimum_stock
                  goods.price = data.price
                  goods.purchase_price = data.purchase_price
                  yield goods.save()
                }else{
                  const goods = new GoodsSize()
                  goods.barcode = data.barcode + s.code
                  goods.name = data.name + ' ('+ s.name+')'
                  goods.goods = result.id
                  goods.size = s.id
                  goods.maximum_stock = data.maximum_stock
                  goods.minimum_stock = data.minimum_stock
                  goods.price = data.price
                  goods.purchase_price = data.purchase_price
                  goods.active = data.active
                  yield goods.save()
                }
              }
            }else{
                for(let s of size){
                  const goods = new GoodsSize()
                  goods.barcode = data.barcode + s.code
                  goods.name = data.name + ' ('+ s.name+')'
                  goods.goods = result.id
                  goods.size = s.id
                  goods.maximum_stock = data.maximum_stock
                  goods.minimum_stock = data.minimum_stock
                  goods.price = data.price
                  goods.purchase_price = data.purchase_price
                  goods.active = data.active
                  yield goods.save()
                }
            }
          }


          response.json({ status: true , message: Antl.formatMessage('messages.update_success') , data : result})
        }else{
           response.json({ status: false , message: Antl.formatMessage('messages.you_not_permission') })
         }
        }
       }else{
         response.json({ status: false , message: Antl.formatMessage('messages.no_data') })
         }
      } catch (e) {
       response.json({ status: false , message: Antl.formatMessage('messages.update_fail')})
       }
     }
  * delete (request, response){
    try {
      const permission = JSON.parse(yield request.session.get('permission'))
    const data = request.input('data')
    if(data){
        if(permission.d){
        const arr = yield Data.findBy('id', data)
        const goods_size = yield GoodsSize.query().where('goods',data).fetch()
        // Lưu lịch sử
        const menu = yield Menu.query().where('code',this.menu).first()
        let hs = new HistoryAction()
        var rs = hs.insertRecord(5,request.currentUser.id,menu.id,JSON.stringify(arr)+'@'+JSON.stringify(goods_size))
        yield rs.save()
        // Goods size delete
        for(let d of goods_size){
          yield d.delete()
        }
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
        result.nature = data.nature
        result.code = data.code
        result.name = data.name
        result.name_en = data.name_en
        result.barcode = data.barcode
        result.warranty_period = data.warranty_period
        result.unit = data.unit
        result.group = data.group
        result.maximum_stock = data.maximum_stock
        result.minimum_stock = data.minimum_stock
        result.description = data.description
        result.origin = data.origin
        result.type = data.type
        result.style = data.style
        result.gender = data.gender
        result.size = data.size
        result.discount = data.discount
        result.price = data.price
        result.price_policy = data.price_policy
        result.purchase_price = data.purchase_price
        result.account_cost = data.account_cost
        result.tax = data.tax
        result.account_revenue = data.account_revenue
        result.excise_taxes = data.excise_taxes
        result.account_warehouse = data.account_warehouse
        result.import_tax_rate = data.import_tax_rate
        result.default_warehouse = data.default_warehouse
        result.export_tax_rate = data.export_tax_rate
        result.direct_materials = data.direct_materials
        result.indirect_materials = data.indirect_materials
        result.direct_labor = data.direct_labor
        result.indirect_labor = data.indirect_labor
        result.depreciation = data.depreciation
        result.cost_purchase_outside = data.cost_purchase_outside
        result.other_costs = data.other_costs
        result.active = data.active
        yield result.save()
        arr_push.push(result)
        if(data.size != "" && data.size != null){
          // SAVE Goods Size
          var temp = new Array()
        temp = data.size.split(",")
          for (var a in temp ) {
              temp[a] = parseInt(temp[a], 10);
          }
          const size = yield Size.query().whereIn('id',temp).fetch()

            for(let s of size){
              const goods = new GoodsSize()
              goods.barcode = data.barcode + s.code
              goods.name = data.name
              goods.goods = result.id
              goods.size = s.id
              goods.maximum_stock = data.maximum_stock
              goods.minimum_stock = data.minimum_stock
              goods.price = data.price
              goods.purchase_price = data.purchase_price
              goods.active = data.active
              yield goods.save()
            }
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
module.exports = MarialGoodsController
