'use strict'
const Hash = use('Hash')
const Antl = use('Antl')
const User = use('App/Model/User')
const HistoryAction = use('App/Classes/HistoryAction')
const General = use('App/Model/PosGeneral')  // EDIT
const Detail = use('App/Model/PosDetail')  // EDIT
const Customer = use('App/Model/Customer')  // EDIT
const Voucher = use('App/Model/NumberIncreases')  // EDIT
const VoucherMask = use('App/Classes/VoucherMask')  // EDIT
const Payment= use('App/Model/Payment')  // EDIT
const Menu = use('App/Model/Menu')  // EDIT
const GoodsInventory = use('App/Model/GoodsInventory')  // EDIT
const Option = use('App/Model/Option')  // EDIT

var moment = require('moment')
var uuidv1 = require('uuid/v1')
class PosShopReturnController {
  constructor () {
      this.type = 5  // EDIT Sale = 5
      this.return = 6  // EDIT Return = 6
      this.key = "store-return"  // EDIT
      this.menu = "store_return"
      this.voucher = 'RETURN_INVOICE_%'
      this.room = "invoice"
      this.subject_key = "customer"
    }
    * show (request, response) {
      const inventory = yield request.session.get('inventory')
      const subject = yield Customer.query().where('active',1).fetch()
      const voucher = yield Voucher.query().where('inventory',inventory).where('code','LIKE',this.voucher).first()
      const index = yield response.view('pos-shop.pages.return', {key : this.key , room : this.room ,subject : subject.toJSON(),voucher : voucher})
      response.send(index)
    }

    * scan (request, response){
      const data = JSON.parse(request.input('data'))
      var arr = []
      try{
        if(data.id){
          arr = yield Detail.query()
          .where('general_id',data.id)
          .where('barcode',data.value)
          .first()
          if(arr){
              response.json({ status: true  , data : arr })
          }else{
              response.json({ status: false , message: Antl.formatMessage('messages.barcode_not_found')  })
          }
        }else{
          response.json({ status: false , message: Antl.formatMessage('messages.barcode_not_found')  })
        }
      } catch (e) {
        response.json({ status: false , error : true , message: Antl.formatMessage('messages.error')+' ' + e.message })
      }
    }
    *payment (request, response){
     try{
      const data = JSON.parse(request.input('data'))
        if(data){
      const inventory = yield request.session.get('inventory')
      const shift = yield request.session.get('shiftId')
      const user = yield request.auth.getUser()
      const action = 2
      // Lưu số nhảy
      const voucher = yield Voucher.query().where('inventory',inventory).where('code','LIKE',this.voucher).first()

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

      const arr =  yield General.find(data.id)

      const general = new General()
      general.uuid =  uuidv1()
      general.inventory_id = inventory
      general.type = this.return
      general.voucher = v
      general.description = data.description
      general.date_voucher = moment().format('YYYY-MM-DD')
      general.subject = arr.subject
      general.subject_key = this.subject_key
      general.total_number = data.total_number
      general.total_amount = data.total_amount
      general.inventory_receipt = inventory
      general.discount_percent = arr.discount_percent
      general.discount = arr.discount_percent
      general.total_discount = (data.total_amount / (1-arr.discount_percent/100) + arr.discount) - data.total_amount
      general.user = user.id
      general.status = 1
      general.active = 1
      yield general.save()
      for(var d of data.detail){
        var detail = []
        if(d.quantity_receipt > 0){
          const arr_d = yield Detail.find(d.id)
          arr_d.quantity_receipt = d.quantity_receipt + arr_d.quantity_receipt
          yield arr_d.save()

          detail = new Detail()
          detail.uuid =  uuidv1()
          detail.general_id = general.id
          detail.item_id = arr_d.item_id
          detail.item_name = arr_d.item_name
          detail.barcode = arr_d.barcode
          detail.unit = arr_d.unit
          detail.quantity = d.quantity_receipt
          detail.purchase_price = arr_d.purchase_price
          detail.purchase_amount = d.quantity_receipt * arr_d.purchase_price
          detail.price = arr_d.price
          detail.amount = (arr_d.price * d.quantity_receipt)*(1-(arr_d.discount_percent/100))-arr_d.discount
          detail.discount_percent = arr_d.discount_percent?arr_d.discount_percent:0
          detail.discount = arr_d.discount?arr_d.discount:0
          detail.total_discount = (arr_d.price * d.quantity_receipt)*(arr_d.discount_percent/100)+arr_d.discount
          detail.status = 1
          detail.active = 1
          yield detail.save()

          // Lưu số tồn
          const balance = yield GoodsInventory.query().where('inventory',inventory).where('goods_size',d.item_id).first()
          if(balance){
            balance.quantity = balance.quantity + d.quantity_receipt
            balance.retail = balance.retail - d.quantity_receipt
            yield balance.save()
          }else{
            const balance = new GoodsInventory()
            balance.goods_size = d.item_id
            balance.quantity = d.quantity_receipt
            balance.retail = 0 - d.quantity_receipt
            balance.inventory = inventory
            yield balance.save()
          }
          // End
        }
      }
      const arr_p = yield Payment.findBy('general',data.id)
      const payment = new Payment()
      payment.general = general.id
      payment.payment_method = arr_p.payment_method
      payment.discount = arr_p.discount_special
      payment.discount_percent = arr_p.discount_percent_special
      payment.total_amount = data.total_amount_payment
      payment.payment = data.total_amount_payment
      payment.refund = 0
      payment.shift = shift
      payment.status = 0 // chưa in
      payment.active = 1
      yield payment.save()

      // Lưu lịch sử
      const menu = yield Menu.query().where('code',this.menu).first()
      let hs = new HistoryAction()
      var rs = hs.insertRecord(action,user.id,menu.id,JSON.stringify(general)+'@'+JSON.stringify(detail)+'@'+JSON.stringify(payment))
      yield rs.save()
      //

      response.json({ status: true  , message: Antl.formatMessage('messages.return_success') , voucher : v , general : general.id})
      }else{
          response.json({ status: false  , message: Antl.formatMessage('messages.return_is_missing')})
      }
    }catch(e){
      response.json({ status: false , message: Antl.formatMessage('messages.return_error')})
    }
    }

    * find (request, response){
      try{
        const inventory = yield request.session.get('inventory')
        const data = JSON.parse(request.input('data'))
        const date_range = yield Option.query().where('code','DATE_RANGE_RETURN').first()
        const arr =  yield General.query()
        .where('type',this.type)
        .where('active',1)
        .where('status',1)
        .where('inventory_id',inventory)
        .whereBetween('date_voucher',[moment().subtract((date_range.value - 1), 'days')
        .format('YYYY-MM-DD'),moment().format('YYYY-MM-DD') ])
        .where('voucher',data).with('detail','payment').first()
        if(arr){
          response.json({ status: true  , data : arr })
        }else{
          response.json({ status: false  , message: Antl.formatMessage('messages.no_data') })
        }
      }catch(e){
        response.json({ status: false , error : true , message: Antl.formatMessage('messages.error')+' ' + e.message })
      }

    }


}
module.exports = PosShopReturnController
