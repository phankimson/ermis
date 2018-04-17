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
const Voucher = use('App/Model/NumberIncreases')  // EDIT
const General = use('App/Model/PosGeneral')  // EDIT
const Detail = use('App/Model/PosDetail')  // EDIT
const VoucherMask = use('App/Classes/VoucherMask')  // EDIT
const HistoryAction = use('App/Classes/HistoryAction')  // EDIT
const GoodsInventory = use('App/Model/GoodsInventory')  // EDIT
const Convert = use('App/Classes/Convert')
const Database = use('Database')
var moment = require('moment')

class IssueInventoryVoucherController{
  constructor () {
      this.type = 2  // EDIT Receipt = 1 , Issue = 2 , Transfer = 3
      this.key = "issue-inventory-voucher"  // EDIT
      this.menu = "pos_issue_inventory_voucher"
      this.voucher = 'INVENTORY_ISSUE_%'
      this.print = 'PXK%'
    }

    * show (request, response){
        const title = Antl.formatMessage('issue_inventory_voucher.title')  // EDIT
        const inventory = yield request.session.get('inventory')
        const voucher = yield Voucher.query().where('inventory',inventory).where('code','LIKE',this.voucher).first()
        const item  = yield GoodsSize.query().where('goods_size.active',1)
        .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
        .innerJoin('unit', 'unit.id', 'marial_goods.unit')
        .innerJoin('size', 'size.id', 'goods_size.size')
        .select("goods_size.id","goods_size.id as item_id","marial_goods.name as item_name","goods_size.barcode as code","marial_goods.name as name","unit.name as unit","goods_size.price","goods_size.purchase_price","size.name as size").fetch()
        const print = yield PrintTemplate.query().where('code', 'LIKE', this.print ).fetch()
        const show = yield response.view('pos/pages/issue_inventory_voucher', {key : this.key ,title: title , voucher : voucher, item : item.toJSON() , print : print.toJSON()})  // EDIT
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
              response.json({ status: false  , message: Antl.formatMessage('messages.no_data') })
          }
      } catch (e) {
        response.json({ status: false , error : true , message: Antl.formatMessage('messages.error')+' ' + e.message })
      }
    }
    * load (request, response){
      try {
      const data = JSON.parse(request.input('data'))
      var arr  = yield GoodsSize.query().where('goods_size.active',1)
      .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
      .where('marial_goods.nature',data.filter_nature)
      .innerJoin('unit', 'unit.id', 'marial_goods.unit')
      .innerJoin('size', 'size.id', 'goods_size.size')
      .select("goods_size.id","goods_size.id as item_id","marial_goods.name as item_name","goods_size.barcode as code","marial_goods.name as name","unit.name as unit","goods_size.price","goods_size.purchase_price","size.name as size").fetch()
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
                  .select("goods_size.id","goods_size.id as item_id","marial_goods.name as item_name","goods_size.barcode as code","marial_goods.name as name","unit.name as unit","goods_size.price","goods_size.purchase_price","size.name as size").fetch()
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
                .select("goods_size.id","goods_size.id as item_id","marial_goods.name as item_name","goods_size.barcode as code","marial_goods.name as name","unit.name as unit","goods_size.price","goods_size.purchase_price","size.name as size").fetch()
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
                .select("goods_size.id","goods_size.id as item_id","marial_goods.name as item_name","goods_size.barcode as code","marial_goods.name as name","unit.name as unit","goods_size.price","goods_size.purchase_price","size.name as size").fetch()
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
                .select("goods_size.id","goods_size.id as item_id","marial_goods.name as item_name","goods_size.barcode as code","marial_goods.name as name","unit.name as unit","goods_size.price","goods_size.purchase_price","size.name as size").fetch()
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
                .select("goods_size.id","goods_size.id as item_id","marial_goods.name as item_name","goods_size.barcode as code","marial_goods.name as name","unit.name as unit","goods_size.price","goods_size.purchase_price","size.name as size").fetch()
              }
              else if (data.filter_field == "purchase_price")
              {
                arr = yield GoodsSize.query()
                .where('goods_size.active',1)
                .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
                .where("marial_goods.purchase_price",data.filter_value)
                .where('marial_goods.nature',data.filter_nature)
                .innerJoin('unit', 'unit.id', 'marial_goods.unit')
                .innerJoin('size', 'size.id', 'goods_size.size')
                .select("goods_size.id","goods_size.id as item_id","marial_goods.name as item_name","goods_size.barcode as code","marial_goods.name as name","unit.name as unit","goods_size.price","goods_size.purchase_price","size.name as size").fetch()
              }
          }

      if(arr){
          response.json({ status: true  , data : arr })
      }else{
          response.json({ status: false  , message: Antl.formatMessage('messages.no_data') })
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
        .select("goods_size.id","goods_size.id as item_id","marial_goods.name as item_name","goods_size.barcode as code","marial_goods.name as name","unit.name as unit","goods_size.price","goods_size.purchase_price","size.name as size").first()
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
    * save (request, response){
       try {
            const data = JSON.parse(request.input('data'))
            if(data){
              const closing = yield Closing.query().where('date',moment(data.date_voucher,"YYYY-MM-DD").format("MM/YYYY")).where('active',1).count('* as total')
              if(closing[0].total == 0){
                var general = []
                var status = 0
                var action = 0
                var removeId = []
                const inventory = yield request.session.get('inventory')
                const permission = JSON.parse(yield request.session.get('permission'))
                if(data.id){
                  general = yield General.find(data.id)
                  var v = general.voucher
                  action = 4
                }else{
                  action = 2
                  general = new General()
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
                  general.inventory_issue = inventory
                  general.total_number = data.total_number
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
                      const goods = yield GoodsSize.query().where('goods_size.id',d.item_id)
                                    .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
                                    .select('goods_size.*',"marial_goods.unit").first()
                    const convert = new Convert()
                    detail.general_id = general.id
                    detail.item_id = d.item_id
                    detail.item_name = d.item_name
                    detail.barcode = goods.barcode
                    detail.unit = goods.unit
                    detail.quantity = d.quantity
                    detail.purchase_price = convert.Number(d.purchase_price)
                    detail.purchase_amount = convert.Number(d.purchase_price) * d.quantity
                    detail.price = convert.Number(d.price)
                    detail.amount = convert.Number(d.price) * d.quantity
                    detail.lot_number = d.lot_number
                    detail.expiry_date = d.expiry_date
                    detail.order = d.order
                    detail.status = status
                    detail.active = 1
                    yield detail.save()
                    removeId.push(detail.id)

                    // Lưu số tồn
                    const balance = yield GoodsInventory.query().where('inventory',inventory).where('goods_size',d.item_id).first()
                    if(balance){
                      balance.quantity = balance.quantity - d.quantity
                        yield balance.save()
                    }else{
                      const balance = new GoodsInventory()
                      balance.goods_size = d.item_id
                      balance.quantity = 0 - d.quantity
                      balance.inventory = inventory
                        yield balance.save()
                    }
                    // End

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
                  var detail_load = yield Detail.query().where("pos_detail.general_id",general.id)
                      .innerJoin('unit', 'unit.id', 'pos_detail.unit')
                      .innerJoin('goods_size', 'goods_size.id', 'pos_detail.item_id')
                      .innerJoin('size', 'size.id', 'goods_size.size')
                      .select("pos_detail.*","pos_detail.id as detail","unit.name as unit","size.name as size").orderBy('id', 'desc').fetch()
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
module.exports = IssueInventoryVoucherController
