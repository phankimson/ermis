'use strict'
const CheckGoodsGeneral = use('App/Model/CheckGoodsGeneral')  // EDIT
const CheckGoods = use('App/Model/CheckGoods')  // EDIT
const Closing = use('App/Model/Closing')  // EDIT
const GoodsInventory = use('App/Model/GoodsInventory')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const HistoryAction = use('App/Classes/HistoryAction')
const Menu = use('App/Model/Menu')
const NumberIncreases = use('App/Model/NumberIncreases')
const Detail = use('App/Model/PosDetail')  // EDIT
const General = use('App/Model/PosGeneral')  // EDIT
var moment = require('moment')

class CheckGoodsGeneralController{
  constructor () {
      this.type = "1"  // EDIT
      this.key = "check-goods-general"  // EDIT
      this.menu = "pos_check_goods_general"  // EDIT
      this.room = "check-goods-general"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('check_goods.title')  // EDIT
      const inventory = yield request.session.get('inventory')
      const data = yield CheckGoodsGeneral.query().where('inventory',inventory).where('active',1).orderBy('id', 'desc').fetch()
      const show = yield response.view('pos/pages/check_goods_general', {key : this.key ,title: title , data : data.toJSON() })  // EDIT
      response.send(show)
  }
  * delete(request, response){
    try {
          const data = JSON.parse(request.input('data'))
          if(data){
            const action = 5
            const arr = yield CheckGoodsGeneral.find(data)
            const closing = yield Closing.query().where('date',moment(arr.date_voucher,"YYYY-MM-DD").format("MM/YYYY")).count('* as total')
            if(closing[0].total == 0){
            const arr1 = yield General.query().where('subject',data).where('subject_key','check_goods_general').fetch()
            const detail = yield CheckGoods.query().where('general',data).fetch()

            // Lưu lịch sử
            const menu = yield Menu.query().where('code',this.menu).first()
            let hs = new HistoryAction()
            var rs = hs.insertRecord(action,request.currentUser.id,menu.id,JSON.stringify(arr)+'@'+JSON.stringify(detail))
            yield rs.save()
            //

            yield arr.delete()
            for(let g of arr1){
              const detail1 = yield Detail.query().where('general_id',g.id).fetch()
                  for(let d of detail1){
                    // Lưu số tồn
                    const balance = yield GoodsInventory.query().where('inventory',g.inventory_id).where('goods_size',d.item_id).first()
                    if(balance && g.type == 10){
                      balance.quantity = balance.quantity - d.quantity
                      yield balance.save()
                    }else if(balance && g.type == 11){
                      balance.quantity = balance.quantity + d.quantity
                      yield balance.save()
                    }
                    // End
                    yield d.delete()
                  }
              yield g.delete()
            }
            // DETAIL
              for(let d of detail){
                yield d.delete()
              }

            response.json({ status: true , message: Antl.formatMessage('messages.delete_success') })
          }else{
           response.json({ status: false , message: Antl.formatMessage('messages.locked_period') })
          }
          }else{
            response.json({ status: false ,message: Antl.formatMessage('messages.delete_fail')  })
          }
    } catch (e) {
      response.json({ status: false , message: Antl.formatMessage('messages.delete_error')+' '+ e.message})
    }
  }
}
module.exports = CheckGoodsGeneralController
