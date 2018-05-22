'use strict'
const CheckGoodsGeneral = use('App/Model/CheckGoodsGeneral')  // EDIT
const CheckGoods = use('App/Model/CheckGoods')  // EDIT
const Closing = use('App/Model/Closing')  // EDIT
const ClosingBalance = use('App/Model/ClosingBalance')  // EDIT
const GoodsInventory = use('App/Model/GoodsInventory')  // EDIT
const Voucher = use('App/Model/NumberIncreases')  // EDIT
const GoodsSize = use('App/Model/GoodsSize')  // EDIT
const Initial = use('App/Model/Initial')  // EDIT
const Detail = use('App/Model/PosDetail')  // EDIT
const General = use('App/Model/PosGeneral')  // EDIT
const IDetail = use('App/Model/PosImportDetail')  // EDIT
const IGeneral = use('App/Model/PosImportGeneral')  // EDIT
const Stock = use('App/Model/Inventory')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const HistoryAction = use('App/Classes/HistoryAction')
const VoucherMask = use('App/Classes/VoucherMask')  // EDIT
const Convert = use('App/Classes/Convert')  // EDIT
const Menu = use('App/Model/Menu')
const NumberIncreases = use('App/Model/NumberIncreases')
var moment = require('moment')
var uuidv1 = require('uuid/v1')
class CheckGoodsController{
  constructor () {
      this.type = "1"  // EDIT
      this.key = "check-goods"  // EDIT
      this.menu = "pos_check_goods"  // EDIT
      this.room = "check-goods"  // EDIT
      this.voucher = 'CHECK_GOODS'
    }
  * show (request, response){
      const title = Antl.formatMessage('check_goods.title')  // EDIT
      const inventory = yield request.session.get('inventory')
      const stock = yield Stock.query().where('active',1).orderBy('id', 'desc').fetch()
      const show = yield response.view('pos/pages/check_goods', {key : this.key ,room : this.room ,title: title , stock : stock.toJSON() })  // EDIT
      response.send(show)
  }

  * bind (request, response){
    try{
      const data = JSON.parse(request.input('data'))
      const general = yield CheckGoodsGeneral.find(data)
      const arr = yield CheckGoods.query()
      .innerJoin('goods_size', 'goods_size.id', 'check_goods.goods_size')
      .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
      .innerJoin('unit', 'unit.id', 'marial_goods.unit')
      .where('check_goods.general',data)
      .select('check_goods.*','unit.name as unit','goods_size.barcode','goods_size.name as item').fetch()
      if(arr){
        response.json({ status: true  , data : arr , general : general})
      }else{
        response.json({ status: false , message: Antl.formatMessage('messages.no_data') })
      }
    }catch(e){
      response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error')+' ' + e.message })
    }
  }

  * load (request, response){
    try{
      const data = JSON.parse(request.input('data'))
      var startDate = moment([moment(data.date,"MM/YYYY").format('YYYY'), moment(data.date,"MM/YYYY").format('MM') - 1]).format("YYYY-MM-DD")
      var endDate = moment(data.date,"DD/MM/YYYY").format('YYYY-MM-DD')
      var lastMonth = moment([moment(data.date,"DD/MM/YYYY").format('YYYY'), moment(data.date,"DD/MM/YYYY").format('MM') - 2]).format("MM/YYYY")
      const closing = yield Closing.query().where('date',lastMonth).where('active',1).first()
      var arr = []
      if(closing){
        const goodsize1 = yield Initial.query()
        .innerJoin('goods_size', 'goods_size.id', 'initial.item')
        .where('goods_size.active',1)
        .where('initial.inventory',data.stock)
        .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
        .innerJoin('unit', 'unit.id', 'marial_goods.unit')
        .select('goods_size.*','unit.name as unit').fetch()
        const goodsize2 = yield GoodsInventory.query()
        .innerJoin('goods_size', 'goods_size.id', 'goods_inventory.goods_size')
        .where('goods_size.active',1)
        .where('goods_inventory.inventory',data.stock)
        .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
        .innerJoin('unit', 'unit.id', 'marial_goods.unit')
        .select('goods_size.*','unit.name as unit').fetch()
        var goodsize = goodsize1.toJSON().concat(goodsize2.toJSON())
        for(var d of goodsize){
        var check = arr.filter(x => x.id == d.id)
        if(check.length == 0){
        const closing_balance = yield ClosingBalance.query().where('date',lastMonth).where('inventory',data.stock).where('goods_size',d.id).first()
        const initial = yield Initial.query().where('inventory',data.stock).where('item',d.id).where('type',1).first()
        var a = 0
        var b = 0
        var c = 0
        var e = 0
        if(closing_balance){
          a = closing_balance.balance
          b = closing_balance.balance_amount
        }
        if(initial){
          c = initial.quantity
          e = initial.amount
        }
        // Số phát sinh nhập
        const receipt_inventory = yield Detail.query().where('pos_detail.item_id',d.id)
       .innerJoin('pos_general', 'pos_general.id', 'pos_detail.general_id')
       .TypeWhereNot('pos_general.inventory_receipt',data.stock).where('pos_general.active',1).whereIn('pos_general.status',[1,2])
       .whereBetween('pos_general.date_voucher',[moment(startDate , "YYYY-MM-DD").format('YYYY-MM-DD'),moment(endDate, "YYYY-MM-DD").format('YYYY-MM-DD') ])
       .sum('pos_detail.quantity as q').sum('pos_detail.amount as a')
       // Số phát sinh xuất
       const issue_inventory = yield Detail.query().where('pos_detail.item_id',d.id)
      .innerJoin('pos_general', 'pos_general.id', 'pos_detail.general_id')
      .TypeWhereNot('pos_general.inventory_issue',data.stock).where('pos_general.active',1).whereIn('pos_general.status',[1,2])
      .whereBetween('pos_general.date_voucher',[moment(startDate , "YYYY-MM-DD").format('YYYY-MM-DD'),moment(endDate, "YYYY-MM-DD").format('YYYY-MM-DD') ])
      .sum('pos_detail.quantity as q').sum('pos_detail.amount as a')
      var balance = a + c + receipt_inventory[0].q - issue_inventory[0].q
      var balance_amount = b + e + receipt_inventory[0].a  - issue_inventory[0].a
      if(balance > 0 && balance_amount > 0){
        arr.push({id : d.id ,
                  goods : d.id ,
                  barcode : d.barcode ,
                  item : d.name ,
                  unit : d.unit ,
                  price : d.price ,
                  balance : a + c + receipt_inventory[0].q - issue_inventory[0].q,
                  balance_amount : b + e + receipt_inventory[0].a  - issue_inventory[0].a ,
                  check : 0 ,
                  check_amount: 0 ,
                  difference:  0,
                  difference_amount : 0
          })
      }

          }
      }
        response.json({ status: true  , data : arr})
      }else{
        response.json({ status: false , message: Antl.formatMessage('messages.not_closed_period')+' '+lastMonth})
      }
    }catch(e){
      response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error')+' ' + e.message })
    }
  }

  * save (request, response){
    try {
    const data = JSON.parse(request.input('data'))
    const permission = JSON.parse(yield request.session.get('permission'))
    const user = yield request.auth.getUser()
    if(permission.a || permission.e){
    if(data){
      // Lưu số nhảy
      const voucher = yield Voucher.query().where('code',this.voucher).first()

      // Load Phiếu tự động
        let vm = new VoucherMask()
        var v = vm.Convert(voucher)
        const number = voucher.value + 1
        const length_number = voucher.length_number
        if((number+"").length > voucher.length_number){
          voucher.value = 1
          voucher.length_number = length_number + 1
        }else{
          voucher.value = number
        }
        yield voucher.save()
          const convert = new Convert()
          const general = new CheckGoodsGeneral()
          general.date = moment(data.date , "DD/MM/YYYY").format('YYYY-MM-DD')
          general.inventory = data.stock
          general.voucher = v
          general.total_balance = convert.Number(data.balance_total)
          general.total_balance_amount = convert.Number(data.balance_amount_total)
          general.total_check = convert.Number(data.check_total)
          general.total_check_amount = convert.Number(data.check_amount_total)
          general.total_difference = convert.Number(data.difference_total)
          general.total_difference_amount = convert.Number(data.difference_amount_total)
          general.active = 1
          yield general.save()
          // Tạo phiếu NK
          const general_c = new General()
          general_c.uuid =  uuidv1()
          general_c.inventory_id = data.stock
          general_c.type = 10
          general_c.voucher = v
          general_c.description = 'Điều chỉnh tăng sau kiểm kê ngày '+ data.date
          general_c.date_voucher = moment(data.date , "DD/MM/YYYY").format('YYYY-MM-DD')
          general_c.subject = general.id
          general_c.subject_key = 'check_goods_general'
          general_c.inventory_receipt = data.stock
          general_c.user = user.id
          general_c.status = 1
          general_c.active = 1
          yield general_c.save()
          // Tạo phiếu XK
          const general_k = new General()
          general_k.uuid =  uuidv1()
          general_k.inventory_id = data.stock
          general_k.type = 11
          general_k.voucher = v
          general_k.description = 'Điều chỉnh giảm sau kiểm kê ngày '+ data.date
          general_k.date_voucher = moment(data.date , "DD/MM/YYYY").format('YYYY-MM-DD')
          general_k.subject = general.id
          general_k.subject_key = 'check_goods_general'
          general_k.inventory_issue = data.stock
          general_k.user = user.id
          general_k.status = 1
          general_k.active = 1
          yield general_k.save()
          var total_amount_c = 0
          var total_amount_k = 0
          var total_quantity_c = 0
          var total_quantity_k = 0
          for(var d of data.detail){
            const goods = yield GoodsSize.query().where('goods_size.id',d.goods)
                          .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
                          .select('goods_size.*',"marial_goods.unit").first()
            const detail = new CheckGoods()
            detail.general = general.id
            detail.goods_size = d.goods
            detail.price = d.price
            detail.balance = d.balance
            detail.balance_amount = d.balance_amount
            detail.check = d.check
            detail.check_amount = goods.price * d.check
            detail.difference = d.check - d.balance
            detail.difference_amount = (d.check - d.balance)*goods.price
            detail.active = 1
            yield detail.save()
            if(detail.difference != 0 || detail.difference_amount != 0){
            const detail_r = new Detail()
            detail_r.uuid = uuidv1()
            if(detail.difference>0){
              detail_r.general_id = general_c.id
              detail_r.quantity = detail.difference
              detail_r.amount = detail.difference_amount
              detail_r.purchase_amount = goods.purchase_price * detail.difference
              total_amount_c += detail.difference_amount
              total_quantity_c += detail.difference
            }else{
              detail_r.quantity = 0-detail.difference
              total_quantity_k += 0-detail.difference
              if(detail.difference_amount>0){
                detail_r.amount = detail.difference_amount
                total_amount_k += detail.difference_amount
              }else{
                detail_r.amount = 0-detail.difference_amount
                total_amount_k += 0-detail.difference_amount
              }
              detail_r.purchase_amount = 0-(goods.purchase_price * detail.difference)
              detail_r.general_id = general_k.id
            }
            detail_r.item_id = d.goods
            detail_r.item_name = goods.name
            detail_r.barcode = goods.barcode
            detail_r.unit = goods.unit
            detail_r.price = goods.price
            detail_r.purchase_price = goods.purchase_price
            detail_r.status = 1
            detail_r.active = 1
            yield detail_r.save()

            // Lưu số tồn
            const balance = yield GoodsInventory.query().where('inventory',data.stock).where('goods_size',d.goods).first()
            if(balance){
              balance.quantity = balance.quantity + detail.difference
              yield balance.save()
            }else{
              const balance = new GoodsInventory()
              balance.goods_size = d.goods
              balance.quantity = detail.difference
              balance.inventory = data.stock
              yield balance.save()
            }
            // End

            }
          }

          general_c.total_number = total_quantity_c
          general_c.total_amount = total_amount_c
          yield general_c.save()

          general_k.total_number = total_quantity_k
          general_k.total_amount = total_amount_k
          yield general_k.save()
          // Lưu lịch sử
          const menu = yield Menu.query().where('code',this.menu).first()
          let hs = new HistoryAction()
          var rs = hs.insertRecord(6,request.currentUser.id,menu.id,JSON.stringify(data))
          yield rs.save()
          //
       response.json({ status: true , message: Antl.formatMessage('messages.update_success')})
    }else{
      response.json({ status: false , message: Antl.formatMessage('messages.no_data') })
      }
    }else{
       response.json({ status: false , message: Antl.formatMessage('messages.you_not_permission') })
     }
    } catch (e) {
    response.json({ status: false , message: Antl.formatMessage('messages.update_error')+' '+e.message})
    }
  }

  * downloadExcel (request, response){
    response.download(Helpers.storagePath("CheckGoods.xlsx"))
  }

  * get (request, response){
  try {
    const data = JSON.parse(request.input('data'))
    const arr = yield IGeneral.query()
    .whereBetween('date_voucher',[moment(data.start_date , "DD/MM/YYYY").format('YYYY-MM-DD'),moment(data.end_date , "DD/MM/YYYY").format('YYYY-MM-DD') ])
    .where('active',1).fetch()
    if(arr){
        response.json({ status: true  , data : arr.toJSON() })
    }else{
        response.json({ status: false , message: Antl.formatMessage('messages.no_data') })
    }
  } catch (e) {
    response.json({ status: false , error : true , message: Antl.formatMessage('messages.error')+' ' + e.message})
  }
  }

  * processed (request, response){
    const da = JSON.parse(request.input('data'))
    var data = []
    var message = ''
    var s = 0
    var e = 0
    var d = Object.keys(da).map(function(k) { return da[k] })
    const arr = yield IDetail.query().whereIn('general',d).fetch()
    if(arr){
      for(let d of arr.toJSON()){
      const goodsize = yield GoodsSize.query()
      .where('goods_size.active',1).where('goods_size.id',d.item_id)
      .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
      .innerJoin('unit', 'unit.id', 'marial_goods.unit')
      .select('goods_size.*','unit.name as unit').first()
      if(goodsize){
        var index = -1;
        if(data.filter(x => x.id === goodsize.id).length > 0){
        var filteredObj = data.find(function(item, i){
        if(item.id === goodsize.id){
          index = i;
          return i;
        }
        });
          data[index].check = data[index].check + parseInt(d.quantity?d.quantity:1)
        }else{
          data.push({
                      id : goodsize.id ,
                      goods : goodsize.id ,
                      barcode : goodsize.barcode ,
                      item : goodsize.name ,
                      unit : goodsize.unit ,
                      price : goodsize.price ,
                      balance : 0,
                      balance_amount :0,
                      check : parseInt(d.quantity?d.quantity:1)
            })
        }
      }
    }
    response.json({ status: true , message: Antl.formatMessage('messages.total_code_imported',{count_sucess : s })+' '+Antl.formatMessage('messages.total_code_error',{count_error : e })+' '+message , data : data})
    }else{
      response.json({ status: false , message: Antl.formatMessage('messages.failed_import')})
    }
  }

  * import (request, response){
    try{
    const file = request.file('files', {
      allowedExtensions: ['xls', 'xlsx']
    })

    var XLSX = require('xlsx')
    var workbook = XLSX.readFile(file[1].tmpPath())
    var sheet_name_list = workbook.SheetNames
    const arr = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]])
    var data = []
    var message = ''
    var s = 0
    var e = 0
    var t = 0
    var r = 0
    const inventory = yield request.session.get('inventory')
    if(arr){
      const general_i = new IGeneral()
      general_i.date_voucher = moment().format('YYYY-MM-DD')
      general_i.description = sheet_name_list[0]
      general_i.active = 1
      yield general_i.save()
      for(let d of arr){
      const goodsize = yield GoodsSize.query()
      .where('goods_size.active',1).where('goods_size.barcode',d.barcode)
      .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
      .innerJoin('unit', 'unit.id', 'marial_goods.unit')
      .select('goods_size.*','unit.name as unit').first()
      if(goodsize){
        const detail_i = new IDetail()
        detail_i.general = general_i.id
        detail_i.barcode = goodsize.barcode
        detail_i.item_id = goodsize.id
        detail_i.item_name = goodsize.name
        detail_i.number = parseInt(d.quantity?d.quantity:1)
        detail_i.active = 1
        yield detail_i.save()
        t +=  parseInt(d.quantity?d.quantity:1)
        r = r + 1
      }else{
        message += d.barcode+','
        e = e +1
      }

    }
      general_i.total_number = t
      general_i.total_row = r
      yield general_i.save()
      response.json({ status: true , message: Antl.formatMessage('messages.total_code_imported',{count_sucess : s })+' '+Antl.formatMessage('messages.total_code_error',{count_error : e })+' '+message , data : data})
    }else{
      response.json({ status: false , message: Antl.formatMessage('messages.failed_import')})
    }

      yield file[1].delete()
    }catch(e){
      response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error')+' ' + e.message })
    }
  }
}
module.exports = CheckGoodsController
