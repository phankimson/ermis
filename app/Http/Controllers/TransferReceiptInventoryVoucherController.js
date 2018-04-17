'use strict'
const Antl = use('Antl')
const Helpers = use('Helpers')
const Menu = use('App/Model/Menu')
const Inventory = use('App/Model/Inventory')  // EDIT
const GoodsSize = use('App/Model/GoodsSize')  // EDIT
const Company = use('App/Model/Company')  // EDIT
const Option = use('App/Model/Option')  // EDIT
const Closing = use('App/Model/Closing')  // EDIT
const PrintTemplate = use('App/Model/PrintTemplate')  // EDIT
const General = use('App/Model/PosGeneral')  // EDIT
const Detail = use('App/Model/PosDetail')  // EDIT
const HistoryAction = use('App/Classes/HistoryAction')  // EDIT
const GoodsInventory = use('App/Model/GoodsInventory')  // EDIT
const Database = use('Database')
var moment = require('moment')

class TransferReceiptInventoryVoucherController{
  constructor () {
      this.type = 3  // EDIT Receipt = 1 , Issue = 2 , Transfer = 3
      this.key = "transfer-receipt-inventory-voucher"  // EDIT
      this.menu = "pos_transfer_receipt_inventory_voucher"
      this.voucher = 'INVENTORY_TRANSFER_ISSUE_%'
      this.print = 'PCK%'
    }

    * show (request, response){
        const title = Antl.formatMessage('transfer_receipt_inventory_voucher.title')  // EDIT
        const print = yield PrintTemplate.query().where('code', 'LIKE', this.print).fetch()
        const show = yield response.view('pos/pages/transfer_receipt_inventory_voucher', {key : this.key ,title: title ,  print : print.toJSON() })  // EDIT
        response.send(show)
    }

    * scan (request, response){
      const data = JSON.parse(request.input('data'))
      var arr = null
      try{
        if(data.id){
          arr = yield Detail.query()
          .where('general_id',data.id)
          .where('barcode',data.value)
          .first()
        }
        //if(arr == null){
        //  arr = yield GoodsSize.query()
        //  .where('goods_size.active',1)
        //  .where("goods_size.barcode",data.value)
        //  .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
        //  .innerJoin('unit', 'unit.id', 'marial_goods.unit')
        //  .innerJoin('size', 'size.id', 'goods_size.size')
        //  .select("goods_size.id","goods_size.id as item_id","marial_goods.name as item_name","goods_size.barcode as code","marial_goods.name as name","unit.name as unit","goods_size.price","size.name as size").first()
      //  }
        if(arr){
            response.json({ status: true  , data : arr })
        }else{
            response.json({ status: false , message: Antl.formatMessage('messages.barcode_not_found')  })
        }
      } catch (e) {
        response.json({ status: false , error : true , message: Antl.formatMessage('messages.error')+' ' + e.message })
      }
    }

    * save (request, response){
       try {
            const data = JSON.parse(request.input('data'))
            if(data){
              const closing = yield Closing.query().where('date',moment(data.date_voucher,"YYYY-MM-DD").format("MM/YYYY")).where('active',1).count('* as total')
              if(closing[0].total == 0){
                  const general = yield General.find(data.id)
                  var action = 4
                  general.traders = data.traders
                  general.status = data.status
                  yield general.save()
                  for(var d of data.detail){
                    var quantity = 0
                    var detail = yield Detail.find(d.detail)
                    quantity = detail.quantity_receipt
                    detail.quantity_receipt = d.quantity_receipt
                    detail.status = d.status
                    yield detail.save()

                    // Lưu số tồn
                    const balance = yield GoodsInventory.query().where('inventory',general.inventory_receipt).where('goods_size',d.item_id).first()
                    if(balance){
                      balance.quantity = balance.quantity - quantity + d.quantity_receipt
                      yield balance.save()
                    }else{
                      const balance = new GoodsInventory()
                      balance.goods_size = d.item_id
                      balance.quantity = d.quantity_receipt
                      balance.inventory = general.inventory_receipt
                      yield balance.save()
                    }
                    // End

                  }

                  // Lưu lịch sử
                  const menu = yield Menu.query().where('code',this.menu).first()
                  let hs = new HistoryAction()
                  var rs = hs.insertRecord(action,request.currentUser.id,menu.id,JSON.stringify(general)+'@'+JSON.stringify(detail))
                  yield rs.save()
                  //
                  response.json({ status: true  , message: Antl.formatMessage('messages.update_success') })
              }else{
               response.json({ status: false , message: Antl.formatMessage('messages.locked_period') })
              }
            }else{
            response.json({ status: false  , message: Antl.formatMessage('messages.update_fail')})
            }
        } catch (e) {
        response.json({ status: false , message: Antl.formatMessage('messages.update_error')})
        }
    }
    * bind (request, response){
      try {
      const data = JSON.parse(request.input('data'))
        if(data){
          var general = yield General.find(data)
              general = yield General.query()
              .innerJoin('inventory', 'inventory.id', 'pos_general.inventory_issue')
              .where('pos_general.id',data).select('pos_general.*','inventory.name as inventory_issue').first()
          var detail = yield Detail.query().where("pos_detail.general_id",data)
              .innerJoin('unit', 'unit.id', 'pos_detail.unit')
              .innerJoin('goods_size', 'goods_size.id', 'pos_detail.item_id')
              .innerJoin('size', 'size.id', 'goods_size.size')
              .select("pos_detail.*","pos_detail.id as detail","unit.name as unit","size.name as size").orderBy('id', 'desc').fetch()
        response.json({ status: true  , general : general , detail : detail.toJSON() })
        }else{
        response.json({ status: false  , message: Antl.formatMessage('messages.update_fail')})
        }
          } catch (e) {
            response.json({ status: false , message: Antl.formatMessage('messages.update_error')})
          }
    }
}
module.exports = TransferReceiptInventoryVoucherController
