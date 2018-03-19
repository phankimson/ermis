'use strict'
const Shift = use('App/Model/Shift')
const GoodsSize = use('App/Model/GoodsSize')  // EDIT
const Option = use('App/Model/Option')  // EDIT
const Type = use('App/Model/Type')  // EDIT
const VoucherMask = use('App/Classes/VoucherMask')  // EDIT
const Voucher = use('App/Model/NumberIncreases')  // EDIT
const Customer = use('App/Model/Customer')  // EDIT
const PaymentMethod = use('App/Model/PaymentMethod')  // EDIT
const Payment= use('App/Model/Payment')  // EDIT
const User= use('App/Model/User')  // EDIT
const Discount = use('App/Model/Discount')  // EDIT
const ExchangeRate = use('App/Model/ExchangeRate')  // EDIT
const General = use('App/Model/PosGeneral')  // EDIT
const Detail = use('App/Model/PosDetail')  // EDIT
const Bitmask = use('App/Classes/bitmask-ermis')
const Menu = use('App/Model/Menu')  // EDIT
const HistoryAction = use('App/Classes/HistoryAction')  // EDIT
const GoodsInventory = use('App/Model/GoodsInventory')  // EDIT
const DiscountCoupon = use('App/Model/DiscountCoupon')  // EDIT
const Antl = use('Antl')

const Database = use('Database')
var moment = require('moment')
class PosShopHomeController{
  constructor () {
      this.type = 5  // EDIT Receipt = 1 , Issue = 2 , Transfer = 3
      this.key = "store-sale"  // EDIT
      this.menu = "store_sale"
      this.voucher = 'SALE_INVOICE_%'
      this.room = "invoice"
      this.subject_key = "customer"
    }
    * show (request, response){
        const page = 1
        const option = yield Option.query().where("code","MAX_ITEM_STORE").first()
        const inventory = yield request.session.get('inventory')
        const type_item = yield Type.query().where("active",1).fetch()
        const subject = yield Customer.query().where('active',1).fetch()
        const voucher = yield Voucher.query().where('inventory',inventory).where('code','LIKE',this.voucher).first()
        const payment_method = yield PaymentMethod.query().where('active',1).fetch()
        const discount = yield Discount.query().where('active',1).where('type',2).CheckDateRange('date_end','date_start',moment().format("YYYY-MM-DD")).first()
        const print_data = yield General.query().where('type',this.type).with('detail','payment')
        .whereHas('payment', (builder) => {
          builder.where('status', 0)
        }).fetch()

        if(discount){
          var d = discount.inventory.split(",")
          var i = false
          for(let a in d){
              if(d[a] == inventory){
                i = true
                break
              }
          }
          if(i == false){
            discount.discount = 0
            discount.discount_percent = 0
          }
        }
        const data  = yield GoodsSize.query().where('goods_size.active',1)
        .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
        .innerJoin('unit', 'unit.id', 'marial_goods.unit')
        .innerJoin('size', 'size.id', 'goods_size.size')
        .leftJoin('discount', 'discount.id', 'marial_goods.discount')
        .select("goods_size.id","goods_size.id as item_id","marial_goods.name as item_name","goods_size.barcode as code","marial_goods.image","marial_goods.name as name","unit.name as unit","goods_size.price","size.name as size","discount.discount","discount.discount_percent")
        .paginate(page,option.value)
        data.toJSON().page = Math.ceil(data.toJSON().total / data.toJSON().perPage)
        const index = yield response.view('pos-shop.pages.index', {key : this.key , room : this.room, discount : discount , subject : subject.toJSON() ,payment_method : payment_method.toJSON(), voucher : voucher ,type_item : type_item.toJSON(),data : data.toJSON(),print_data:print_data.toJSON() })
        response.send(index)
    }
    * search (request, response){
      try{
        const data = JSON.parse(request.input('data'))
        var arr = ''
        if(data.type == 'coupon'){
          arr = yield Database.table(data.type).where('active', 1).where('code',data.val).first().select('value')
        }else{
          arr = yield Database.table(data.type).where('active', 1).where('code',data.val).first().select('discount_percent','discount')
        }
        if(arr){
          response.json({ status: true  , data : arr })
        }else{
          response.json({ status: false  , message: Antl.formatMessage('messages.no_data') })
        }
      }catch(e){
        response.json({ status: false , error : true , message: Antl.formatMessage('messages.error')+' ' + e.message })
      }


    }
    * exchange (request, response){
      try{
        const data = JSON.parse(request.input('data'))
        const arr =  yield ExchangeRate.query().where('active',1).where('type',data).orderBy('id', 'desc').first()
        if(arr){
          response.json({ status: true  , data : arr })
        }else{
          response.json({ status: false  , message: Antl.formatMessage('messages.no_data') })
        }
      }catch(e){
        response.json({ status: false , error : true , message: Antl.formatMessage('messages.error')+' ' + e.message })
      }
    }
    * customer (request, response){
      try{
        const data = JSON.parse(request.input('data'))
        const arr =  yield Customer.query().where('active',1).where('id',data.value).first()
        const discount = yield Discount.query().where('active',1).where('id',arr.discount).CheckDateRange('date_end','date_start',moment().format("YYYY-MM-DD")).first()
        const inventory = yield request.session.get('inventory')
        if(discount){
          var d = discount.inventory.split(",")
          var i = false
          for(let a in d){
              if(d[a] == inventory){
                i = true
                break
              }
          }
          if(i == false){
            discount.discount = 0
            discount.discount_percent = 0
            discount.accumulative = 1
          }
        }
        if(arr){
          response.json({ status: true  , data : discount })
        }else{
          response.json({ status: false  , message: Antl.formatMessage('messages.no_data') })
        }
      }catch(e){
        response.json({ status: false , error : true , message: Antl.formatMessage('messages.error')+' ' + e.message })
      }

    }
    * print (request, response){
      try{
        const data = JSON.parse(request.input('data'))
        const arr = yield General.query().with('detail','payment')
        .innerJoin('customer', 'customer.id', 'pos_general.subject')
        .innerJoin('users', 'users.id', 'pos_general.user')
        .where('pos_general.id',data).select('pos_general.*','customer.name as customer','users.username as user').first()
        const payment = yield Payment.findBy('general',data)
        payment.status = 1 // Print
        payment.print = payment.print + 1 // Print
        yield payment.save()
        if(arr){
            response.json({ status: true , data : arr})
        }else{
            response.json({ status: false ,  message: Antl.formatMessage('messages.no_data') })
        }
      }catch(e){
        response.json({ status: false ,error : true , message: Antl.formatMessage('messages.error')+' ' + e.message})
      }
    }
    * check (request, response){
      try{
      const data = JSON.parse(request.input('data'))
      const user = yield User.findBy('barcode',data)
      const inventory = yield request.session.get('inventory')
      var permission = 0;
      if(user.role == 1 || user.role == 2){
        permission = 63
      }else{
        const per = yield UserPermission.query().where('user_id',session.id).where('inventory_id',inventory).innerJoin('menu', 'menu.id', 'user_permission.menu_id').where('menu.link',link.substr(1)).first()
        if(per){
        permission = per.permission;
        }
      }
      if(permission > 0){
      var bitmask = new Bitmask();
      var arr = bitmask.getPermissions(permission)
      if(arr.s){
          response.json({ status: true })
      }else{
          response.json({ status: false ,  message: Antl.formatMessage('messages.you_not_permission_special') })
      }
    }else{
        response.json({ status: false ,  message: Antl.formatMessage('messages.you_not_permission_special') })
    }
    }catch(e){
      response.json({ status: false , message: Antl.formatMessage('messages.you_not_permission_special')})
    }
    }
    * payment  (request, response){
     try{
        const data = JSON.parse(request.input('data'))
        const inventory = yield request.session.get('inventory')
        const shift = yield request.session.get('shiftId')
        const permission = JSON.parse(yield request.session.get('permission'))
        const user = yield request.auth.getUser()
        if(data){
          if(!permission.s){
            data.discount_percent_special = 0
            data.discount_special = 0
          }
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

          var action = 2
          var general = new General()
          general.inventory_id = inventory
          general.type = this.type
          general.voucher = v
          general.description = data.description
          general.date_voucher = moment().format('YYYY-MM-DD')
          general.subject = data.subject
          general.subject_key = this.subject_key
          general.inventory_issue = inventory
          general.total_number = data.total_number
          general.total_amount = data.total_amount
          general.discount_percent = data.discount_percent
          general.discount = data.discount
          general.total_discount = (data.total_amount / (100-data.discount_percent)*100 + data.discount) - data.total_amount
          general.user = user.id
          general.status = 1
          general.active = 1
          yield general.save()
          for(var d of data.detail){
            var detail = []
              detail = new Detail()
              const goods = yield GoodsSize.query().where('goods_size.id',d.item_id)
                            .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
                            .leftJoin('discount', 'discount.id', 'marial_goods.discount')
                            .select('goods_size.*',"marial_goods.unit","discount.discount","discount.discount_percent").first()
            detail.general_id = general.id
            detail.item_id = d.item_id
            detail.item_name = d.item_name
            detail.barcode = goods.barcode
            detail.unit = goods.unit
            detail.quantity = d.quantity
            detail.purchase_price = goods.purchase_price
            detail.purchase_amount = d.quantity * goods.purchase_price
            detail.price = goods.price
            detail.amount = (goods.price * d.quantity)*(1-(goods.discount_percent/100))-goods.discount
            detail.discount_percent = goods.discount_percent?goods.discount_percent:0
            detail.discount = goods.discount?goods.discount:0
            detail.total_discount = (goods.price * d.quantity)*(goods.discount_percent/100)+goods.discount
            detail.status = 1
            detail.active = 1
            yield detail.save()

            // Lưu số tồn
            const balance = yield GoodsInventory.query().where('inventory',inventory).where('goods_size',d.item_id).first()
            if(balance){
              balance.quantity = balance.quantity - d.quantity
              balance.retail = balance.retail + d.quantity
              yield balance.save()
            }else{
              const balance = new GoodsInventory()
              balance.goods_size = d.item_id
              balance.quantity = 0 - d.quantity
              balance.retail = d.quantity
              balance.inventory = inventory
              yield balance.save()
            }
            // End
          }
          // Lưu payment
          const payment = new Payment()
          payment.general = general.id
          payment.payment_method = data.payment_method
          payment.discount = data.discount_special
          payment.discount_percent = data.discount_percent_special
          payment.total_discount = (data.total_amount_payment / (100-data.discount_percent_special)*100 + parseInt(data.discount_special)) - parseInt(data.total_amount_payment)
          payment.total_amount =  data.total_amount_payment
          payment.payment = data.payment
          payment.refund = data.refund
          payment.coupon_code = data.coupon_code
          payment.coupon_value = data.coupon
          payment.shift = shift
          payment.exchange = data.exchange
          payment.rate = data.rate
          payment.total_exchange = data.total_exchange ? data.total_exchange : 0
          payment.status = 0 // chưa in
          payment.active = 1
          yield payment.save()

          // Luu so lan discount_coupon
          if(data.coupon_type == "discount_coupon"){
            const coupon = yield DiscountCoupon.findBy('code',data.coupon_code)
                  coupon.number = coupon.number + 1
            if(coupon.number + 1 == coupon.times){
                  coupon.active = 0
            }
                yield coupon.save()
          }

          // Lưu lịch sử
          const menu = yield Menu.query().where('code',this.menu).first()
          let hs = new HistoryAction()
          var rs = hs.insertRecord(action,request.currentUser.id,menu.id,JSON.stringify(general)+'@'+JSON.stringify(detail)+'@'+JSON.stringify(payment))
          yield rs.save()
          //

            response.json({ status: true  , message: Antl.formatMessage('messages.payment_success') , voucher : v , general : general.id})
        }else{
            response.json({ status: false  , message: Antl.formatMessage('messages.payment_is_missing')})
        }
      }catch(e){
        response.json({ status: false , message: Antl.formatMessage('messages.payment_error') +' '+ e.message})
      }

    }
    * page (request, response){
      try{
        const page = JSON.parse(request.input('data'))
        const option = yield Option.query().where("code","MAX_ITEM_STORE").first()
        const data  = yield GoodsSize.query().where('goods_size.active',1)
        .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
        .innerJoin('unit', 'unit.id', 'marial_goods.unit')
        .innerJoin('size', 'size.id', 'goods_size.size')
        .leftJoin('discount', 'discount.id', 'marial_goods.discount')
        .select("goods_size.id","goods_size.id as item_id","marial_goods.name as item_name","goods_size.barcode as code","marial_goods.image","marial_goods.name as name","unit.name as unit","goods_size.price","size.name as size","discount.discount","discount.discount_percent")
        .TypeWhere('marial_goods.type',page.value)
        .paginate(page.page,option.value)
        if(data.toJSON().data.length > 0){
          response.json({ status: true , data : data.toJSON().data})
        }else{
          response.json({ status: false , message: Antl.formatMessage('messages.no_data_found')})
        }
      }catch(e){
          response.json({ status: false , error : true , message: Antl.formatMessage('messages.error')+' ' + e.message })
      }

    }
    * filter(request, response){
      try{
        const filter = JSON.parse(request.input('data'))
        const page = 1
        const option = yield Option.query().where("code","MAX_ITEM_STORE").first()
        const data  = yield GoodsSize.query().where('goods_size.active',1)
        .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
        .innerJoin('unit', 'unit.id', 'marial_goods.unit')
        .innerJoin('size', 'size.id', 'goods_size.size')
        .where('marial_goods.type',filter)
        .leftJoin('discount', 'discount.id', 'marial_goods.discount')
        .select("goods_size.id","goods_size.id as item_id","marial_goods.name as item_name","goods_size.barcode as code","marial_goods.image","marial_goods.name as name","unit.name as unit","goods_size.price","size.name as size","discount.discount","discount.discount_percent")
        .paginate(page,option.value)
        if(data.toJSON().data.length > 0){
          response.json({ status: true , data : data.toJSON().data})
        }else{
          response.json({ status: false , message: Antl.formatMessage('messages.no_data_found')})
        }
      }catch(e){
        response.json({ status: false , error : true , message: Antl.formatMessage('messages.error')+' ' + e.message })
      }

    }
    * load (request, response){
      try {
      const data = JSON.parse(request.input('data'))
      const inventory = yield request.session.get('inventory')
      var arr  = yield GoodsSize.query().where('goods_size.active',1)
      .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
      .where('marial_goods.nature',data.filter_nature)
      .innerJoin('unit', 'unit.id', 'marial_goods.unit')
      .innerJoin('size', 'size.id', 'goods_size.size')
      .leftJoin('discount','discount.id', 'marial_goods.discount')
      .select("goods_size.id","goods_size.id as item_id","marial_goods.image","marial_goods.name as item_name","goods_size.barcode as code","marial_goods.name as name","unit.name as unit","goods_size.price","goods_size.purchase_price","size.name as size","discount.discount","discount.discount_percent").fetch()
      if (data.filter_field != "" && data.filter_field != null)
          {
              if (data.filter_field == "barcode")
              {
                  arr = yield GoodsSize.query()
                  .where('goods_size.active',1)
                  .where("goods_size.barcode",data.filter_value)
                  .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
                  .where('marial_goods.nature',data.filter_nature)
                  .innerJoin('unit', 'unit.id', 'marial_goods.unit')
                  .innerJoin('size', 'size.id', 'goods_size.size')
                  .leftJoin('discount', 'discount.id', 'marial_goods.discount')
                  .select("goods_size.id","goods_size.id as item_id","marial_goods.image","marial_goods.name as item_name","goods_size.barcode as code","marial_goods.name as name","unit.name as unit","goods_size.price","goods_size.purchase_price","size.name as size","discount.discount","discount.discount_percent").fetch()
              }
              else if (data.filter_field == "code")
              {
                arr = yield GoodsSize.query()
                .where('goods_size.active',1)
                .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
                .where("marial_goods.code","LIKE",'%'+data.filter_value+'%')
                .where('marial_goods.nature',data.filter_nature)
                .innerJoin('unit', 'unit.id', 'marial_goods.unit')
                .innerJoin('size', 'size.id', 'goods_size.size')
                .leftJoin('discount', 'discount.id', 'marial_goods.discount')
                .select("goods_size.id","goods_size.id as item_id","marial_goods.image","marial_goods.name as item_name","goods_size.barcode as code","marial_goods.name as name","unit.name as unit","goods_size.price","goods_size.purchase_price","size.name as size","discount.discount","discount.discount_percent").fetch()
              }
              else if (data.filter_field == "name")
              {
                arr = yield GoodsSize.query()
                .where('goods_size.active',1)
                .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
                .where("marial_goods.name","LIKE",'%'+data.filter_value+'%')
                .where('marial_goods.nature',data.filter_nature)
                .innerJoin('unit', 'unit.id', 'marial_goods.unit')
                .innerJoin('size', 'size.id', 'goods_size.size')
                .leftJoin('discount', 'discount.id', 'marial_goods.discount')
                .select("goods_size.id","goods_size.id as item_id","marial_goods.image","marial_goods.name as item_name","goods_size.barcode as code","marial_goods.name as name","unit.name as unit","goods_size.price","goods_size.purchase_price","size.name as size","discount.discount","discount.discount_percent").fetch()
              }
              else if (data.filter_field == "name_en")
              {
                arr = yield GoodsSize.query()
                .where('goods_size.active',1)
                .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
                .where("marial_goods.name_en","LIKE",'%'+data.filter_value+'%')
                .where('marial_goods.nature',data.filter_nature)
                .innerJoin('unit', 'unit.id', 'marial_goods.unit')
                .innerJoin('size', 'size.id', 'goods_size.size')
                .leftJoin('discount', 'discount.id', 'marial_goods.discount')
                .select("goods_size.id","goods_size.id as item_id","marial_goods.image","marial_goods.name as item_name","goods_size.barcode as code","marial_goods.name as name","unit.name as unit","goods_size.price","goods_size.purchase_price","size.name as size","discount.discount","discount.discount_percent").fetch()
              }
              else if (data.filter_field == "price")
              {
                arr = yield GoodsSize.query()
                .where('goods_size.active',1)
                .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
                .where("marial_goods.price",data.filter_value)
                .where('marial_goods.nature',data.filter_nature)
                .innerJoin('unit', 'unit.id', 'marial_goods.unit')
                .innerJoin('size', 'size.id', 'goods_size.size')
                .leftJoin('discount', 'discount.id', 'marial_goods.discount')
                .select("goods_size.id","goods_size.id as item_id","marial_goods.image","marial_goods.name as item_name","goods_size.barcode as code","marial_goods.name as name","unit.name as unit","goods_size.price","goods_size.purchase_price","size.name as size","discount.discount","discount.discount_percent").fetch()
              }
          }

      if(arr){
          response.json({ status: true  , data : arr })
      }else{
          response.json({ status: false  , message: Antl.formatMessage('messages.no_data')})
      }
      } catch (e) {
        response.json({ status: false , error : true , message: Antl.formatMessage('messages.error')+' ' + e.message })
      }
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
        if(arr == null){
          arr = yield GoodsSize.query()
          .where('goods_size.active',1)
          .where("goods_size.barcode",data.value)
        .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
        .innerJoin('unit', 'unit.id', 'marial_goods.unit')
        .innerJoin('size', 'size.id', 'goods_size.size')
        .leftJoin('discount', 'discount.id', 'marial_goods.discount')
        .select("goods_size.id","goods_size.id as item_id","marial_goods.image","marial_goods.name as item_name","goods_size.barcode as code","marial_goods.name as name","unit.name as unit","goods_size.price","goods_size.purchase_price","size.name as size","discount.discount","discount.discount_percent").first()
      }
        if(arr){
            response.json({ status: true  , data : arr })
        }else{
            response.json({ status: false , message: Antl.formatMessage('messages.barcode_not_found')  })
        }
      } catch (e) {
        response.json({ status: false , error : true , message: Antl.formatMessage('messages.error')+' ' + e.message })
      }
    }

     * login (request, response){
        const session = request.currentUser
        if(!session){
        const shift = yield Shift.query().where('active',1).fetch()
        const index = yield response.view('pos-shop/pages/login',{ shift: shift.toJSON() })
        response.send(index)
        }else{
        response.redirect('index')
        }
    }

}
module.exports = PosShopHomeController
