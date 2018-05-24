'use strict'
const Data = use('App/Model/Closing')  // EDIT
const General = use('App/Model/PosGeneral')  // EDIT
const Detail = use('App/Model/PosDetail')  // EDIT
const ClosingBalance = use('App/Model/ClosingBalance')  // EDIT
const GoodsSize = use('App/Model/GoodsSize')  // EDIT
const GoodsInventory = use('App/Model/GoodsInventory')  // EDIT
const Inventory = use('App/Model/Inventory')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
var moment = require('moment')

class ClosingController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "closing"  // EDIT
      this.room = "closing"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('closing.title')  // EDIT
      const data = yield Data.query().orderBy('id', 'desc').where('active',1).fetch()
      const show = yield response.view('pos/pages/closing', {key : this.key ,room : this.room ,title: title , data: data.toJSON()})  // EDIT
      response.send(show)
  }

  * save (request, response){
    try{
    const data = JSON.parse(request.input('data'))
    if(data){
      const check = yield Data.query().where('date',data.date).where('active',1).first()
      var startDate = moment(data.date,"MM/YYYY").format("YYYY-MM-01")
      var endDate = moment(startDate).endOf('month').format("YYYY-MM-DD")
      const general = yield General.query().whereBetween('date_voucher',[startDate,endDate ]).where('active',0).fetch()
      if(check && check.id != data.id){
        response.json({ status: false, message: Antl.formatMessage('messages.duplicate_date')  })
      }else if (general.toJSON().length > 0){
            var voucher = ''
          for(var d of general.toJSON()){
              voucher += d.voucher+' '
            }
        response.json({ status: false, message: Antl.formatMessage('messages.voucher_not_active')+' @ '+voucher  })
      }else{
        const result =  yield Data.findBy('date', data.date)
        var dataId = []
        if(result){
          result.active = 1
          yield result.save()
          dataId = result
        }else{
         const result = new Data()
         result.name = "Khóa kỳ "+data.date
         result.name_en = "Lock period "+data.date
         result.date = data.date
         result.active = 1
         yield result.save()
         dataId = result
        }

          // Lưu số tồn theo tháng
        const inventory = yield Inventory.query().where('active',1).fetch()
        var lastMonth = moment([moment(data.date,"MM/YYYY").format('YYYY'), moment(data.date,"MM/YYYY").format('MM') - 2]).format("YYYY-MM")
        for(var i of inventory.toJSON()){
          const goodsize = yield GoodsInventory.query()
          .innerJoin('goods_size', 'goods_size.id', 'goods_inventory.goods_size')
          .where('goods_inventory.inventory',i.id)
          .where('goods_size.active',1)
          .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
          .innerJoin('unit', 'unit.id', 'marial_goods.unit')
          .with('inventory','opening_balance','closing_balance')
          .scope('inventory', (builder) => {
            builder.OrMultiWhere('pos_general.inventory_receipt','pos_general.inventory_issue',data.stock).where('pos_general.active',1)
            .whereBetween('pos_general.date_voucher',[moment(startDate , "YYYY-MM-DD").format('YYYY-MM-DD'),moment(endDate, "YYYY-MM-DD").format('YYYY-MM-DD') ])
          })
          .scope('closing_balance', (builder) => {
            builder.where('inventory',i.id)
            .where('date',lastMonth)
          })
          .select('goods_size.*').fetch()
          for(var d of goodsize){
            // Lấy số tháng trước
            const closing_balances = yield d.closing_balance().fetch()
            const bl = closing_balances.first()

            const inventorys = yield d.inventory().fetch()
            var riq = 0
            var ria = 0
            var ripa = 0

            var iiq = 0
            var iia = 0
            var iid = 0
            var iipa = 0

            for(var k of inventorys){
              if(k.inventory_receipt == i.id){
                riq += k.quantity
                ria += k.amount
                ripa += k.purchase_amount
              }else if(k.inventory_issue ==  i.id){
                iiq += k.quantity
                iia += k.amount
                iipa += k.purchase_amount
                iid += k.total_discount?k.total_discount:0
              }
            }
          if(riq + iiq != 0 ){
            var a = 0
            var b = 0
            var c = 0
            if(bl){
              a = bl.balance + riq - iiq
              b = bl.balance_amount + ria - iia
              c = bl.balance_purchase + ripa - iipa
            }else{
              a = riq - iiq
              b = ria - iia - iid
              c = ripa - iipa
              }
              if(a+b+c!=0){

               const balance = yield ClosingBalance.query().where('inventory',i.id).where('closing',dataId.id).where('goods_size',d.id).first()
              if(balance){
                balance.balance = a
                balance.balance_amount = b
                balance.balance_purchase = c
                balance.active = 1
                yield balance.save()
              }else{
                  const balance = new ClosingBalance()
                  balance.closing = dataId.id
                  balance.inventory = i.id
                  balance.goods_size = d.id
                  balance.balance =  a
                  balance.balance_amount = b
                  balance.balance_purchase =  c
                  balance.date = data.date
                  balance.active = 1
                  yield balance.save()
                }
              }
            }
          }
        }

       response.json({ status: true , message: Antl.formatMessage('messages.update_success') , data : dataId})

     }
    }else{
      response.json({ status: false , message: Antl.formatMessage('messages.update_fail')  })
    }
  }catch(e){
    response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error')+' ' + e.message })
  }
  }
  * delete (request, response){
    try{
    const data = request.input('data')
    if(data){
        const arr = yield Data.findBy('id', data)
        arr.active = 0
        yield arr.save()
        const bl = yield ClosingBalance.query().where('closing',data).fetch()
          for(var d of bl.toJSON()){
            const r = yield ClosingBalance.find(d.id)
            r.active = 0
            yield r.save()
          }
        response.json({ status: true , message: Antl.formatMessage('messages.delete_success')})
    }else{
        response.json({ status: false , message: Antl.formatMessage('messages.delete_fail') })
    }
  }catch(e){
    response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error')+' ' + e.message })
  }
  }

}
module.exports = ClosingController
