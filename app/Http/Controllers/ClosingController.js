'use strict'
const Data = use('App/Model/Closing')  // EDIT
const General = use('App/Model/PosGeneral')  // EDIT
const Detail = use('App/Model/PosDetail')  // EDIT
const ClosingBalance = use('App/Model/ClosingBalance')  // EDIT
const GoodsSize = use('App/Model/GoodsSize')  // EDIT
const Inventory = use('App/Model/Inventory')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
var moment = require('moment')

class ClosingController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "closing"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('closing.title')  // EDIT
      const data = yield Data.query().orderBy('id', 'desc').where('active',1).fetch()
      const show = yield response.view('pos/pages/closing', {key : this.key ,title: title , data: data.toJSON()})  // EDIT
      response.send(show)
  }

  * save (request, response){
    try{
    const data = JSON.parse(request.input('data'))
    if(data){
      const check = yield Data.query().where('date',data.date).where('active',1).first()
      var startDate = moment([moment(data.date,"MM/YYYY").format('YYYY'), moment(data.date,"MM/YYYY").format('MM') - 1]).format("YYYY-MM-DD")
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
        const goodsize = yield GoodsSize.query()
        .where('active',1)
        .has('detail').fetch()

       if(goodsize.toJSON().length > 0){
        var lastMonth = moment([moment(data.date,"MM/YYYY").format('YYYY'), moment(data.date,"MM/YYYY").format('MM') - 2]).format("YYYY-MM")
        for(var i of inventory.toJSON()){
          for(var d of goodsize.toJSON()){
            // Lấy số tháng trước
            const bl = yield ClosingBalance.query().where('date',lastMonth).where('inventory',i.id).where('goods_size',i.id).first()
            // Số phát sinh nhập
            const receipt_inventory = yield Detail.query().where('pos_detail.item_id',d.id)
           .innerJoin('pos_general', 'pos_general.id', 'pos_detail.general_id')
           .TypeWhereNot('pos_general.inventory_receipt',i.id).where('pos_general.active',1).whereIn('pos_general.status',[1,2])
           .whereBetween('pos_general.date_voucher',[moment(startDate , "YYYY-MM-DD").format('YYYY-MM-DD'),moment(endDate, "YYYY-MM-DD").format('YYYY-MM-DD') ])
           .sum('pos_detail.quantity as q').sum('pos_detail.amount as a').sum('pos_detail.purchase_amount as pa')
           // Số phát sinh xuất
           const issue_inventory = yield Detail.query().where('pos_detail.item_id',d.id)
          .innerJoin('pos_general', 'pos_general.id', 'pos_detail.general_id')
          .TypeWhereNot('pos_general.inventory_issue',i.id).where('pos_general.active',1).whereIn('pos_general.status',[1,2])
          .whereBetween('pos_general.date_voucher',[moment(startDate , "YYYY-MM-DD").format('YYYY-MM-DD'),moment(endDate, "YYYY-MM-DD").format('YYYY-MM-DD') ])
          .sum('pos_detail.quantity as q').sum('pos_detail.amount as a').sum('pos_detail.purchase_amount as pa').sum('pos_detail.total_discount as d')
          if(bl || receipt_inventory || issue_inventory ){
            var a = 0
            var b = 0
            var c = 0
            if(bl){
              a = bl.balance + receipt_inventory[0].q - issue_inventory[0].q
              b = bl.balance_amount + receipt_inventory[0].a - issue_inventory[0].a
              c = bl.balance_purchase + receipt_inventory[0].pa - issue_inventory[0].pa
            }else{
              a =  receipt_inventory[0].q - issue_inventory[0].q
              b =  receipt_inventory[0].a - issue_inventory[0].a  - issue_inventory[0].d
              c =  receipt_inventory[0].pa - issue_inventory[0].pa
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
