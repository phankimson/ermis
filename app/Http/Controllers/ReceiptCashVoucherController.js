'use strict'
const Antl = use('Antl')
const Helpers = use('Helpers')
const Menu = use('App/Model/Menu')
const Inventory = use('App/Model/Inventory')  // EDIT
const Company = use('App/Model/Company')  // EDIT
const Option = use('App/Model/Option')  // EDIT
const Closing = use('App/Model/Closing')  // EDIT
const PrintTemplate = use('App/Model/PrintTemplate')  // EDIT
const Voucher = use('App/Model/NumberIncreases')  // EDIT
const General = use('App/Model/PosGeneral')  // EDIT
const Detail = use('App/Model/PosCash')  // EDIT
const VoucherMask = use('App/Classes/VoucherMask')  // EDIT
const HistoryAction = use('App/Classes/HistoryAction')  // EDIT
const Database = use('Database')
var moment = require('moment')

class ReceiptCashVoucherController{
  constructor () {
      this.type = 7  // EDIT Receipt = 7
      this.key = "receipt-cash-voucher"  // EDIT
      this.menu = "pos_receipt_cash_voucher"
      this.voucher = 'RECEIPT_CASH'
      this.print = 'PTCN%'
    }

    * show (request, response){
        const title = Antl.formatMessage('receipt_cash_voucher.title')  // EDIT
        const inventory = yield request.session.get('inventory')
        const voucher = yield Voucher.query().where('code',this.voucher).first()
        const print = yield PrintTemplate.query().where('code', 'LIKE', this.print ).fetch()
        const show = yield response.view('pos/pages/receipt_cash_voucher', {key : this.key ,title: title , voucher : voucher, print : print.toJSON()})  // EDIT
        response.send(show)
    }
    * get (request, response){
      try {
          const data = JSON.parse(request.input('data'))
          var arr = yield Database.table(data.filter_type).where('active', 1).select("*","id as subject")
          if (data.filter_value != "" && data.filter_value != null)
              {
                  if (data.filter_field == "code")
                  {
                      arr = yield Database.table(data.filter_type).where('active', 1).where("code","LIKE",'%'+data.filter_value+'%').select("*","id as subject")
                  }
                  else if (data.filter_field == "name")
                  {
                      arr = yield Database.table(data.filter_type).where('active', 1).where("name","LIKE",'%'+data.filter_value+'%').select("*","id as subject")
                  }
                  else if (data.filter_field == "address")
                  {
                      arr = yield Database.table(data.filter_type).where('active', 1).where("address","LIKE",'%'+data.filter_value+'%').select("*","id as subject")
                  }
                  else if (data.filter_field == "tax_code")
                  {
                      arr = yield Database.table(data.filter_type).where('active', 1).where("tax_code","LIKE",'%'+data.filter_value+'%').select("*","id as subject")
                  }
                  else if (data.filter_field == "phone")
                  {
                      arr =  yield Database.table(data.filter_type).where('active', 1).where("phone","LIKE",'%'+data.filter_value+'%').select("*","id as subject")
                  }
                  else if (data.filter_field == "email")
                  {
                      arr = yield Database.table(data.filter_type).where('active', 1).where("email","LIKE",'%'+data.filter_value+'%').select("*","id as subject")
                  }
                  else if (data.filter_field == "full_name_contact")
                  {
                       arr = yield Database.table(data.filter_type).where('active', 1).where("full_name_contact","LIKE",'%'+data.filter_value+'%').select("*","id as subject")
                  }
              }

          if(arr){
              response.json({ status: true  , data : arr })
          }else{
              response.json({ status: false , message: Antl.formatMessage('messages.no_data') })
          }
      } catch (e) {
        response.json({ status: false , error : true , message: Antl.formatMessage('messages.error')+' ' + e.message })
      }
    }

    * save (request, response){
      try {
            const data = JSON.parse(request.input('data'))
            if(data){
              const closing = yield Closing.query().where('date',moment(data.date_voucher,"YYYY-MM-DD").format("MM/YYYY")).count('* as total')
              if(closing[0].total == 0){
                var general = []
                var status = 0
                var action = 0
                var removeId = []
                const inventory = yield request.session.get('inventory')
                const permission = JSON.parse(yield request.session.get('permission'))
                const user = yield request.auth.getUser()
                if(data.id){
                  general = yield General.find(data.id)
                  var v = general.voucher
                  action = 4
                }else{
                  action = 2
                  general = new General()
                  general.user = user.id
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
                 }
                 if(permission.p){
                   status = 1
                 }
                 //
                  general.inventory_id = inventory
                  general.type = this.type
                  general.voucher = v
                  general.description = data.description
                  general.date_voucher = data.date_voucher
                  general.traders = data.traders
                  general.subject = data.subject
                  general.subject_key = data.subject_key
                  general.total_amount = data.total_amount
                  general.status = status
                  general.active = 1
                  yield general.save()
                  for(var d of data.detail){
                    var detail = []
                    if(d.detail){
                      detail = yield Detail.find(d.detail)
                    }else{
                      detail = new Detail()
                    }
                    detail.general_id = general.id
                    detail.description = d.description
                    detail.amount = d.amount
                    detail.invoice = d.invoice
                    detail.lot_number = d.lot_number
                    detail.order = d.order
                    detail.contract = d.contract
                    detail.status = status
                    detail.active = 1
                    yield detail.save()
                    removeId.push(detail.id)
                  }
                  var remove = yield Detail.query().where("general_id",general.id).whereNotIn('id',removeId).fetch()
                  for(var r of remove.toJSON()){
                    const r_detail = yield Detail.find(r.id)
                    yield r_detail.delete()
                  }


                  // Lưu lịch sử
                  const menu = yield Menu.query().where('code',this.menu).first()
                  let hs = new HistoryAction()
                  var rs = hs.insertRecord(action,request.currentUser.id,menu.id,JSON.stringify(general)+'@'+JSON.stringify(detail))
                  yield rs.save()
                  //
                  var detail_load = yield Detail.query().where("pos_cash.general_id",general.id).orderBy('id', 'desc').fetch()
                  response.json({ status: true  , message: Antl.formatMessage('messages.update_success') , voucher_name : v , dataId :  general.id , detail :  detail_load.toJSON()})
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
              general = yield General.query().where('pos_general.id',data)
              .innerJoin(general.subject_key, general.subject_key+'.id', 'pos_general.subject')
              .select('pos_general.*',general.subject_key+'.code',general.subject_key+'.name').first()
          var detail = yield Detail.query().where("pos_cash.general_id",data).orderBy('id', 'desc').fetch()
        response.json({ status: true  , general : general , detail : detail.toJSON() })
        }else{
        response.json({ status: false  , message: Antl.formatMessage('messages.update_fail')})
        }
        } catch (e) {
        response.json({ status: false , message: Antl.formatMessage('messages.update_error')})
        }
    }
}
module.exports = ReceiptCashVoucherController
