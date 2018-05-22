'use strict'
const Antl = use('Antl')
const Helpers = use('Helpers')
const Option = use('App/Model/Option')  // EDIT
const ServerModel = use('App/Model/Server/ServerModel')  // EDIT
const ServerMarialGoods = use('App/Model/Server/ServerMarialGoods')  // EDIT
const ServerSize = use('App/Model/Server/ServerSize')  // EDIT
const ServerGroup = use('App/Model/Server/ServerGroup')  // EDIT
const ServerType = use('App/Model/Server/ServerType')  // EDIT
const ServerOrigin = use('App/Model/Server/ServerOrigin')  // EDIT
const ServerGender = use('App/Model/Server/ServerGender')  // EDIT
const ServerUnit = use('App/Model/Server/ServerUnit')  // EDIT
const ServerWarrantyPeriod = use('App/Model/Server/ServerWarrantyPeriod')  // EDIT
const ServerGoodsSize = use('App/Model/Server/ServerGoodsSize')  // EDIT
const ServerStyle = use('App/Model/Server/ServerStyle')  // EDIT
const ServerObjectGroup = use('App/Model/Server/ServerObjectGroup')  // EDIT
const ServerCustomer = use('App/Model/Server/ServerCustomer')  // EDIT
const ServerSuplier = use('App/Model/Server/ServerSuplier')  // EDIT
const ServerDiscount = use('App/Model/Server/ServerDiscount')  // EDIT
const ServerCoupon = use('App/Model/Server/ServerCoupon')  // EDIT
const ServerDiscountCoupon = use('App/Model/Server/ServerDiscountCoupon')  // EDIT
const ServerCustomerCoupon = use('App/Model/Server/ServerCustomerCoupon')  // EDIT
const ServerInitial = use('App/Model/Server/ServerInitial')  // EDIT
const ServerExchangeRate = use('App/Model/Server/ServerExchangeRate')  // EDIT
const ServerShift = use('App/Model/Server/ServerShift')  // EDIT
const ServerUser = use('App/Model/Server/ServerUser')  // EDIT
const ServerInventory = use('App/Model/Server/ServerInventory')  // EDIT
const ServerClosing = use('App/Model/Server/ServerClosing')  // EDIT
const ServerClosingBalance = use('App/Model/Server/ServerClosingBalance')  // EDIT
const ServerPaymentMethod = use('App/Model/Server/ServerPaymentMethod')  // EDIT
const ServerPosDetail = use('App/Model/Server/ServerPosDetail')  // EDIT
const ServerPosGeneral = use('App/Model/Server/ServerPosGeneral')  // EDIT
const ServerGoodsInventory = use('App/Model/Server/ServerGoodsInventory')  // EDIT
const ServerPayment = use('App/Model/Server/ServerPayment')  // EDIT
const Model = use('App/Model/Model')  // EDIT
const MarialGoods = use('App/Model/MarialGoods')  // EDIT
const Size = use('App/Model/Size')  // EDIT
const Group = use('App/Model/Group')  // EDIT
const Type = use('App/Model/Type')  // EDIT
const Origin = use('App/Model/Origin')  // EDIT
const Gender = use('App/Model/Gender')  // EDIT
const Unit = use('App/Model/Unit')  // EDIT
const WarrantyPeriod = use('App/Model/WarrantyPeriod')  // EDIT
const GoodsSize = use('App/Model/GoodsSize')  // EDIT
const Style = use('App/Model/Style')  // EDIT
const ObjectGroup = use('App/Model/ObjectGroup')  // EDIT
const Customer = use('App/Model/Customer')  // EDIT
const Suplier = use('App/Model/Suplier')  // EDIT
const Discount = use('App/Model/Discount')  // EDIT
const Coupon = use('App/Model/Coupon')  // EDIT
const DiscountCoupon = use('App/Model/DiscountCoupon')  // EDIT
const CustomerCoupon = use('App/Model/CustomerCoupon')  // EDIT
const Initial = use('App/Model/Initial')  // EDIT
const ExchangeRate = use('App/Model/ExchangeRate')  // EDIT
const Shift = use('App/Model/Shift')  // EDIT
const User = use('App/Model/User')  // EDIT
const Inventory = use('App/Model/Inventory')  // EDIT
const Closing = use('App/Model/Closing')  // EDIT
const ClosingBalance = use('App/Model/ClosingBalance')  // EDIT
const PaymentMethod = use('App/Model/PaymentMethod')  // EDIT
const PosDetail = use('App/Model/PosDetail')  // EDIT
const PosGeneral = use('App/Model/PosGeneral')  // EDIT
const GoodsInventory = use('App/Model/GoodsInventory')  // EDIT
const Payment = use('App/Model/Payment')  // EDIT

var moment = require('moment')
class TransferDatabaseController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "transfer-database"  // EDIT
      this.room = "transfer-database"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('transfer_database.title')  // EDIT
      const start_date = moment().subtract(1, 'days').format('DD/MM/YYYY')
      const end_date = moment().format('DD/MM/YYYY')
      const show = yield response.view('pos/pages/transfer_database', {key : this.key ,room : this.room,title: title , end_date:end_date, start_date:start_date })  // EDIT
      response.send(show)
  }
  * sync (request, response){
    try {
      const data = JSON.parse(request.input('data'))
      const inventory = yield request.session.get('inventory')
      if(data.marial_goods){
        const smg = yield ServerModel.query()
        .whereBetween('updated_at',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD 00:00:00'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD 23:59:59') ])
        .fetch()
        for(var k of smg.toJSON()){
          const mg = yield Model.find(k.id)
          if(mg){
            if(mg.updated_at != k.updated_at){
              mg.fill(k)
              yield mg.save()
            }
          }else{
            yield Model.create(k)
          }
        }

        const smg1 = yield ServerSize.query()
        .whereBetween('updated_at',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD 00:00:00'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD 23:59:59') ])
        .fetch()
        for(var k of smg1.toJSON()){
          const mg1 = yield Size.find(k.id)
          if(mg1){
            if(mg1.updated_at != k.updated_at){
              mg1.fill(k)
              yield mg1.save()
            }
          }else{
            yield Size.create(k)
          }
        }

        const smg2 = yield ServerGroup.query()
        .whereBetween('updated_at',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD 00:00:00'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD 23:59:59') ])
        .fetch()
        for(var k of smg2.toJSON()){
          const mg2 = yield Group.find(k.id)
          if(mg2){
            if(mg2.updated_at != k.updated_at){
              mg2.fill(k)
              yield mg2.save()
            }
          }else{
            yield Group.create(k)
          }
        }

        const smg3 = yield ServerType.query()
        .whereBetween('updated_at',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD 00:00:00'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD 23:59:59') ])
        .fetch()
        for(var k of smg3.toJSON()){
          const mg3 = yield Type.find(k.id)
          if(mg3){
            if(mg3.updated_at != k.updated_at){
              mg3.fill(k)
              yield mg3.save()
            }
          }else{
            yield Type.create(k)
          }
        }

        const smg4 = yield ServerOrigin.query()
        .whereBetween('updated_at',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD 00:00:00'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD 23:59:59') ])
        .fetch()
        for(var k of smg4.toJSON()){
          const mg4 = yield Origin.find(k.id)
          if(mg4){
            if(mg4.updated_at != k.updated_at){
              mg4.fill(k)
              yield mg4.save()
            }
          }else{
            yield Origin.create(k)
          }
        }

        const smg5 = yield ServerGender.query()
        .whereBetween('updated_at',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD 00:00:00'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD 23:59:59') ])
        .fetch()
        for(var k of smg5.toJSON()){
          const mg5 = yield Gender.find(k.id)
          if(mg5){
            if(mg5.updated_at != k.updated_at){
              mg5.fill(k)
              yield mg5.save()
            }
          }else{
            yield Gender.create(k)
          }
        }


        const smg6 = yield ServerUnit.query()
        .whereBetween('updated_at',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD 00:00:00'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD 23:59:59') ])
        .fetch()
        for(var k of smg6.toJSON()){
          const mg6 = yield Unit.find(k.id)
          if(mg6){
            if(mg6.updated_at != k.updated_at){
              mg6.fill(k)
              yield mg6.save()
            }
          }else{
            yield Unit.create(k)
          }
        }

        const smg7 = yield ServerWarrantyPeriod.query()
        .whereBetween('updated_at',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD 00:00:00'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD 23:59:59') ])
        .fetch()
        for(var k of smg7.toJSON()){
          const mg7 = yield WarrantyPeriod.find(k.id)
          if(mg7){
            if(mg7.updated_at != k.updated_at){
              mg7.fill(k)
              yield mg7.save()
            }
          }else{
            yield WarrantyPeriod.create(k)
          }
        }


        const smg8 = yield ServerMarialGoods.query()
        .whereBetween('updated_at',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD 00:00:00'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD 23:59:59') ])
        .fetch()
        for(var k of smg8.toJSON()){
          const mg8 = yield MarialGoods.find(k.id)
          if(mg8){
            if(mg8.updated_at != k.updated_at){
              mg8.fill(k)
              yield mg8.save()
            }
          }else{
            yield MarialGoods.create(k)
          }
        }


        const smg9 = yield ServerGoodsSize.query()
        .whereBetween('updated_at',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD 00:00:00'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD 23:59:59') ])
        .fetch()
        for(var k of smg9.toJSON()){
          const mg9 = yield GoodsSize.find(k.id)
          if(mg9){
            if(mg9.updated_at != k.updated_at){
              mg9.fill(k)
              yield mg9.save()
            }
          }else{
            yield GoodsSize.create(k)
          }
        }

        const smg10 = yield ServerStyle.query()
        .whereBetween('updated_at',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD 00:00:00'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD 23:59:59') ])
        .fetch()
        for(var k of smg10.toJSON()){
          const mg10 = yield Style.find(k.id)
          if(mg10){
            if(mg10.updated_at != k.updated_at){
              mg10.fill(k)
              yield mg10.save()
            }
          }else{
            yield Style.create(k)
          }
        }
      }

      if(data.object){

        const smg = yield ServerObjectGroup.query()
        .whereBetween('updated_at',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD 00:00:00'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD 23:59:59') ])
        .fetch()
        for(var k of smg.toJSON()){
          const mg = yield ObjectGroup.find(k.id)
          if(mg){
            if(mg.updated_at != k.updated_at){
              mg.fill(k)
              yield mg.save()
            }
          }else{
            yield ObjectGroup.create(k)
          }
        }

        const smg1 = yield ServerSuplier.query()
        .whereBetween('updated_at',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD 00:00:00'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD 23:59:59') ])
        .fetch()
        for(var k of smg1.toJSON()){
          const mg1 = yield Suplier.find(k.id)
          if(mg1){
            if(mg1.updated_at != k.updated_at){
              mg1.fill(k)
              yield mg1.save()
            }
          }else{
            yield Suplier.create(k)
          }
        }

        const smg2 = yield ServerCustomer.query()
        .whereBetween('updated_at',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD 00:00:00'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD 23:59:59') ])
        .fetch()
        for(var k of smg2.toJSON()){
          const mg2 = yield Customer.find(k.id)
          if(mg2){
            if(mg2.updated_at != k.updated_at){
              mg2.fill(k)
              yield mg2.save()
            }
          }else{
            yield Customer.create(k)
          }
        }

      }

      if(data.policy){
        const smg = yield ServerDiscount.query()
        .whereBetween('updated_at',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD 00:00:00'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD 23:59:59') ])
        .fetch()
        for(var k of smg.toJSON()){
          const mg = yield Discount.find(k.id)
          if(mg){
            if(mg.updated_at != k.updated_at){
              mg.fill(k)
              yield mg.save()
            }
          }else{
            yield Discount.create(k)
          }
        }

        const smg1 = yield ServerCoupon.query()
        .whereBetween('updated_at',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD 00:00:00'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD 23:59:59') ])
        .fetch()
        for(var k of smg1.toJSON()){
          const mg1 = yield Coupon.find(k.id)
          if(mg1){
            if(mg1.updated_at != k.updated_at){
              mg1.fill(k)
              yield mg1.save()
            }
          }else{
            yield Coupon.create(k)
          }
        }

        const smg2 = yield ServerDiscountCoupon.query()
        .whereBetween('updated_at',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD 00:00:00'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD 23:59:59') ])
        .fetch()
        for(var k of smg2.toJSON()){
          const mg2 = yield DiscountCoupon.find(k.id)
          if(mg2){
            if(mg2.updated_at != k.updated_at){
              mg2.fill(k)
              yield mg2.save()
            }
          }else{
            yield DiscountCoupon.create(k)
          }
        }

        const smg3 = yield ServerCustomerCoupon.query()
        .whereBetween('updated_at',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD 00:00:00'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD 23:59:59') ])
        .fetch()
        for(var k of smg3.toJSON()){
          const mg3 = yield CustomerCoupon.find(k.id)
          if(mg3){
            if(mg3.updated_at != k.updated_at){
              mg3.fill(k)
              yield mg3.save()
            }
          }else{
            yield CustomerCoupon.create(k)
          }
        }
      }

      if(data.general){
        const smg = yield ServerInitial.query()
        .whereBetween('updated_at',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD 00:00:00'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD 23:59:59') ])
        .where('inventory', inventory)
        .fetch()
        for(var k of smg.toJSON()){
          const mg = yield Initial.find(k.id)
          if(mg){
            if(mg.updated_at != k.updated_at){
              mg.fill(k)
              yield mg.save()
            }
          }else{
            yield Initial.create(k)
          }
        }

        const smg2 = yield ServerExchangeRate.query()
        .whereBetween('updated_at',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD 00:00:00'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD 23:59:59') ])
        .fetch()
        for(var k of smg2.toJSON()){
          const mg2 = yield ExchangeRate.find(k.id)
          if(mg2){
            if(mg2.updated_at != k.updated_at){
              mg2.fill(k)
              yield mg2.save()
            }
          }else{
            yield ExchangeRate.create(k)
          }
        }

        const smg3 = yield ServerShift.query()
        .whereBetween('updated_at',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD 00:00:00'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD 23:59:59') ])
        .fetch()
        for(var k of smg3.toJSON()){
          const mg3 = yield Shift.find(k.id)
          if(mg3){
            if(mg3.updated_at != k.updated_at){
              mg3.fill(k)
              yield mg3.save()
            }
          }else{
            yield Shift.create(k)
          }
        }

        const smg4 = yield ServerPaymentMethod.query()
        .whereBetween('updated_at',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD 00:00:00'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD 23:59:59') ])
        .fetch()
        for(var k of smg4.toJSON()){
          const mg4 = yield PaymentMethod.find(k.id)
          if(mg4){
            if(mg4.updated_at != k.updated_at){
              mg4.fill(k)
              yield mg4.save()
            }
          }else{
            yield PaymentMethod.create(k)
          }
        }

        const smg5 = yield ServerUser.query()
        .whereBetween('updated_at',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD 00:00:00'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD 23:59:59') ])
        .fetch()
        for(var k of smg5.toJSON()){
          const mg5 = yield User.find(k.id)
          if(mg5){
            if(mg5.updated_at != k.updated_at){
              mg5.fill(k)
              yield mg5.save()
            }
          }else{
            yield User.create(k)
          }
        }

        const smg6 = yield ServerInventory.query()
        .whereBetween('updated_at',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD 00:00:00'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD 23:59:59') ])
        .fetch()
        for(var k of smg6.toJSON()){
          const mg6 = yield Inventory.find(k.id)
          if(mg6){
            if(mg6.updated_at != k.updated_at){
              mg6.fill(k)
              yield mg6.save()
            }
          }else{
            yield Inventory.create(k)
          }
        }
      }

      if(data.major){
        // Đóng / mở kỳ
        const smg = yield ServerClosing.query()
        .whereBetween('updated_at',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD 00:00:00'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD 23:59:59') ])
        .fetch()
        for(var k of smg.toJSON()){
          const mg = yield Closing.find(k.id)
          if(mg){
            if(mg.updated_at != k.updated_at){
              mg.fill(k)
              yield mg.save()
            }
          }else{
            yield Closing.create(k)
          }
        }
        // Số tồn cuối kỳ đóng sổ
        const smg1 = yield ServerClosingBalance.query()
        .whereBetween('updated_at',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD 00:00:00'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD 23:59:59') ])
        .where('inventory', inventory)
        .fetch()
        for(var k of smg1.toJSON()){
          const mg1 = yield ClosingBalance.find(k.id)
          if(mg1){
            if(mg1.updated_at != k.updated_at){
              mg1.fill(k)
              yield mg1.save()
            }
          }else{
            yield ClosingBalance.create(k)
          }
        }

        // Gửi bán hàng
        const smg3 = yield PosGeneral.query()
        .whereBetween('updated_at',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD 00:00:00'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD 23:59:59') ])
        .where('inventory_id', inventory)
        .where('type', 5)
        .fetch()
        for(var k of smg3.toJSON()){
          // Gửi chi tiết
          const dt3 = yield PosDetail.query().where('general_id',k.id).fetch()
            for(var l of dt3.toJSON()){
              const d3 = yield ServerPosDetail.findBy('uuid',l.uuid)
              if(!d3){
                 yield ServerPosDetail.create(l)
                 const siv3 = yield ServerGoodsInventory.query().where('goods_size',l.item_id).where('inventory',inventory).first()
                 if(!siv3){
                   const siv3 = new ServerGoodsInventory()
                   siv3.goods_size = l.item_id
                   siv3.quantity = 0 - l.quantity
                   siv3.retail = 0 + l.quantity
                   siv3.inventory = inventory
                   yield siv3.save()
                 }else{
                   siv3.quantity = siv3.quantity - l.quantity
                   siv3.retail = siv3.retail + l.quantity
                   yield siv3.save()
                 }
              }
            }
          const mg3 = yield ServerPosGeneral.findBy('uuid',k.uuid)
          if(!mg3){
            yield ServerPosGeneral.create(k)
          }

          // Gửi thanh toán
          const py = yield Payment.findBy('id',k.id)
          if(!py){
            yield ServerPayment.create(py)
          }

        }
        // Gửi xuất nhập Kiểm kê
        const smg4 = yield ServerPosGeneral.query()
        .whereBetween('updated_at',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD 00:00:00'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD 23:59:59') ])
        .where('inventory_id', inventory)
        .whereIn('type', [10,11])
        .fetch()
          for(var k of smg3.toJSON()){
            // Gửi chi tiết
            const dt4 = yield ServerPosDetail.query().where('general_id',k.id).fetch()
              for(var l of dt4.toJSON()){
                const d4 = yield PosDetail.findBy('uuid',l.uuid)
                if(!d4){
                   yield PosDetail.create(l)
                   const siv4 = yield GoodsInventory.query().where('goods_size',l.item_id).where('inventory',inventory).first()
                   if(siv4){
                     if(k.type == 10){
                       siv4.quantity = siv4.quantity + l.quantity
                     }else{
                       siv4.quantity = siv4.quantity - l.quantity
                     }
                     yield siv4.save()
                   }else{
                     const balance = new GoodsInventory()
                     balance.goods_size = l.item_id
                    if(k.type == 10){
                     balance.quantity = l.quantity
                     }else{
                     balance.quantity = 0 - l.quantity
                     }
                     balance.inventory = inventory
                     yield balance.save()
                   }
                }
              }
            const mg4 = yield PosGeneral.findBy('uuid',k.uuid)
              if(!mg4){
              yield PosGeneral.create(k)
            }
          }
          // Gửi xuất hàng cho client
          const smg5 = yield ServerPosGeneral.query()
          .whereBetween('updated_at',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD 00:00:00'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD 23:59:59') ])
          .where('inventory_receipt', inventory)
          .where('type',3)
          .fetch()
          for(var k of smg5.toJSON()){
            const dt5 = yield ServerPosDetail.query().where('general_id',k.id).fetch()
              for(var l of dt5.toJSON()){
                const d5 = yield PosDetail.findBy('uuid',l.uuid)
                if(!d5){
                   yield PosDetail.create(l)
                   const siv5 = yield GoodsInventory.query().where('goods_size',l.item_id).where('inventory',k.inventory_issue).first()
                   if(siv5){
                     siv5.quantity = siv5.quantity + l.quantity
                     yield siv5.save()
                   }else{
                     const balance = new GoodsInventory()
                     balance.goods_size = l.item_id
                     balance.quantity = l.quantity
                     balance.inventory = k.inventory_issue
                     yield balance.save()
                   }
                }
              }
            const mg5 = yield PosGeneral.findBy('uuid',k.uuid)
              if(!mg5){
              yield PosGeneral.create(k)
            }
          }

          // Cập nhật trạng thái nhận hàng nhận
          const smg6 = yield PosGeneral.query()
          .whereBetween('updated_at',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD 00:00:00'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD 23:59:59') ])
          .where('inventory_receipt', inventory)
          .where('type',3)
          .fetch()
          for(var k of smg6.toJSON()){
            const dt6 = yield PosDetail.query().where('general_id',k.id).fetch()
              for(var l of dt6.toJSON()){
                const sg6 = yield ServerPosDetail.find(l.id)
                sg6.quantity_receipt = l.quantity_receipt
                sg6.status = l.status
                yield sg6.save()
                const siv6 = yield ServerGoodsInventory.query().where('goods_size',l.item_id).where('inventory',inventory).first()
                if(siv6){
                  siv6.quantity = siv6.quantity + l.quantity_receipt
                  yield siv6.save()
                }else{
                  const balance = new ServerGoodsInventory()
                  balance.goods_size = l.item_id
                  balance.quantity = l.quantity_receipt
                  balance.inventory = inventory
                  yield balance.save()
                }
              }
            const mg6 = yield ServerPosGeneral.findBy('uuid',k.uuid)
              if(mg6){
              mg6.traders = k.traders
              mg6.status = k.status
              yield mg6.save()
            }
          }

          // Gửi Xuất hàng lên server
          const smg7 = yield PosGeneral.query()
          .whereBetween('updated_at',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD 00:00:00'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD 23:59:59') ])
          .where('inventory_issue', inventory)
          .where('type',3)
          .fetch()
          for(var k of smg7.toJSON()){
            const dt7 = yield PosDetail.query().where('general_id',k.id).fetch()
              for(var l of dt7.toJSON()){
                const d7 = yield ServerPosDetail.findBy('uuid',l.uuid)
                if(!d7){
                   yield ServerPosDetail.create(l)
                   const siv7 = yield ServerGoodsInventory.query().where('goods_size',l.item_id).where('inventory',inventory).first()
                   if(siv7){
                     siv7.quantity = siv6.quantity - l.quantity
                     yield siv7.save()
                   }else{
                     const balance = new ServerGoodsInventory()
                     balance.goods_size = l.item_id
                     balance.quantity = 0-l.quantity
                     balance.inventory = inventory
                     yield balance.save()
                   }
                }
              }
              const mg7 = yield ServerPosGeneral.findBy('uuid',k.uuid)
                if(!mg7){
                yield ServerPosGeneral.create(k)
              }
          }

          // Cập nhật trang thái xuất hàng server
          const smg9 = yield ServerPosGeneral.query()
          .whereBetween('updated_at',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD 00:00:00'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD 23:59:59') ])
          .where('inventory_issue', inventory)
          .where('type',3)
          .fetch()

          for(var k of smg9.toJSON()){
            const dt9 = yield ServerPosDetail.query().where('general_id',k.id).fetch()
              for(var l of dt9.toJSON()){
                const sg9 = yield PosDetail.find(l.id)
                sg9.quantity_receipt = l.quantity_receipt
                sg9.status = l.status
                yield sg9.save()
              }
            const mg9 = yield PosGeneral.findBy('uuid',k.uuid)
              if(mg9){
              mg9.traders = k.traders
              mg9.status = k.status
              yield mg9.save()
            }
          }


          // Gửi nhập đổi
          const smg8 = yield PosGeneral.query()
          .whereBetween('updated_at',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD 00:00:00'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD 23:59:59') ])
          .where('inventory_id', inventory)
          .where('type', 6)
          .fetch()
          for(var k of smg8.toJSON()){
            // Gửi chi tiết
            const dt8 = yield PosDetail.query().where('general_id',k.id).fetch()
              for(var l of dt8.toJSON()){
                const d8 = yield ServerPosDetail.findBy('uuid',l.uuid)
                if(!d8){
                   yield ServerPosDetail.create(l)
                   const siv8 = yield ServerGoodsInventory.query().where('goods_size',l.item_id).where('inventory',inventory).first()
                   if(!siv8){
                     const siv8 = new ServerGoodsInventory()
                     siv8.goods_size = l.item_id
                     siv8.quantity = 0 + l.quantity
                     siv8.retail = 0 - l.quantity
                     siv8.inventory = inventory
                     yield siv8.save()
                   }else{
                     siv8.quantity = siv3.quantity + l.quantity
                     siv8.retail = siv3.retail - l.quantity
                     yield siv8.save()
                   }
                }
              }
            const mg8 = yield ServerPosGeneral.findBy('uuid',k.uuid)
            if(!mg8){
              yield ServerPosGeneral.create(k)
            }

      }
    }
      response.json({ status: true , message: Antl.formatMessage('messages.update_success') })
    } catch (e) {
    response.json({ status: false , message: Antl.formatMessage('messages.update_fail') + e.message})
    }
  }


}
module.exports = TransferDatabaseController
