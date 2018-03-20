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
const Stock = use('App/Model/Inventory')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const HistoryAction = use('App/Classes/HistoryAction')
const VoucherMask = use('App/Classes/VoucherMask')  // EDIT
const Convert = use('App/Classes/Convert')  // EDIT
const Menu = use('App/Model/Menu')
const NumberIncreases = use('App/Model/NumberIncreases')
var moment = require('moment')

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
      const show = yield response.view('pos/pages/check_goods', {key : this.key ,title: title , stock : stock.toJSON() })  // EDIT
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
        const goodsize1 = yield GoodsSize.query()
        .where('goods_size.active',1)
        .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
        .innerJoin('unit', 'unit.id', 'marial_goods.unit')
        .has('initial')
        .select('goods_size.*','unit.name as unit').fetch()
        const goodsize2 = yield GoodsSize.query()
        .where('goods_size.active',1)
        .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
        .innerJoin('unit', 'unit.id', 'marial_goods.unit')
        .has('detail')
        .select('goods_size.*','unit.name as unit').fetch()
        var goodsize = goodsize1.toJSON().concat(goodsize2.toJSON())
        for(var d of goodsize){
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
          general_c.inventory_id = data.stock
          general_c.type = 10
          general_c.voucher = v
          general_c.description = 'Điều chỉnh sau kiểm kê ngày '+ data.date
          general_c.date_voucher = moment(data.date , "DD/MM/YYYY").format('YYYY-MM-DD')
          general_c.subject = general.id
          general_c.subject_key = 'check_goods_general'
          general_c.inventory_receipt = data.stock
          general_c.user = user.id
          general_c.status = 1
          general_c.active = 1
          yield general_c.save()
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
            detail_r.general_id = general_c.id
            detail_r.item_id = d.goods
            detail_r.item_name = goods.name
            detail_r.barcode = goods.barcode
            detail_r.unit = goods.unit
            detail_r.quantity = detail.difference
            detail_r.price = goods.price
            detail_r.amount = detail.difference_amount
            detail_r.purchase_price = goods.purchase_price
            detail_r.purchase_amount = goods.purchase_price * detail.difference
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
    response.json({ status: false , message: Antl.formatMessage('messages.update_error')})
    }
  }

  * downloadExcel (request, response){
    response.download(Helpers.storagePath("CheckGoods.xlsx"))
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
    if(arr){
      for(let d of arr){
      const goodsize = yield GoodsSize.query()
      .where('goods_size.active',1).where('goods_size.barcode',d.barcode)
      .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
      .innerJoin('unit', 'unit.id', 'marial_goods.unit')
      .select('goods_size.*','unit.name as unit').first()
      var index = -1;
      if(data.filter(x => x.id === goodsize.id).length > 0){
      var filteredObj = data.find(function(item, i){
      if(item.id === goodsize.id){
        index = i;
        return i;
      }
      });
        data[index].check = data[index].check + 1
      }else{
        data.push({id : goodsize.id ,
                  barcode : goodsize.barcode ,
                  item : goodsize.name ,
                  unit : goodsize.unit ,
                  price : goodsize.price ,
                  balance : 0,
                  balance_amount : 0,
                  check : 1
          })
      }

    }
      response.json({ status: true , message: Antl.formatMessage('messages.success_import') , data : data})
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