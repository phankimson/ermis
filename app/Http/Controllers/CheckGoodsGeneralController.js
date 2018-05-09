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
const PrintTemplate = use('App/Model/PrintTemplate')  // EDIT
const Inventory = use('App/Model/Inventory')  // EDIT
const Company = use('App/Model/Company')  // EDIT
const Option = use('App/Model/Option')  // EDIT
const Docso = use('App/Classes/docso')
const Database = use('Database')
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
      const show = yield response.view('pos/pages/check_goods_general', {key : this.key ,room : this.room ,title: title , data : data.toJSON() })  // EDIT
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

  * prints (request, response){
    try {
    const data = JSON.parse(request.input('data'))
    const print = yield PrintTemplate.query().where('id', data.voucher ).first()
      const general = yield General.query().where('subject',data.id).where('type',data.type).where('subject_key','check_goods_general').first()
      const detail = yield Detail.query().where("pos_detail.general_id",general.id)
          .innerJoin('unit', 'unit.id', 'pos_detail.unit')
          .innerJoin('goods_size', 'goods_size.id', 'pos_detail.item_id')
          .innerJoin('size', 'size.id', 'goods_size.size')
          .select("pos_detail.*","pos_detail.id as detail","unit.name as unit","size.name as size").orderBy('id', 'desc').fetch()
      const stock = yield request.session.get('inventory')
      const inventory = yield Inventory.query().where('id',stock).first()
      const company = yield Company.query().where('id',inventory.company).first()
      const signer = yield Option.query().where('code','SIGNER').first()
      let hs = new Docso()
      var reps = {
          "{company}": company.name,
          "{company_address}": company.address,
          "{day}": moment(general.date_voucher , "YYYY-MM-DD").format('DD'),
          "{month}": moment(general.date_voucher , "YYYY-MM-DD").format('MM'),
          "{year}": moment(general.date_voucher , "YYYY-MM-DD").format('YYYY'),
          "{voucher}" : general.voucher,
          "{subject}" : general.description,
          "{number}" : general.total_number,
          "{amount}" : Antl.formatNumber(general.total_amount),
          "{amount_letter}" : hs.docso.doc(general.total_amount) +" đồng",
          "{warehouse}" : inventory.name,
          "{warehouse_place}" : inventory.address,
          "{chief_accountant}" : signer.value1,
          "{storekeeper}" : signer.value3,
          "{writer}" : signer.value4,
          "{day_voucher}" : moment().format('DD'),
          "{month_voucher}" : moment().format('MM'),
          "{year_voucher}" : moment().format('YYYY'),
        };
        var template = print.text
        for (var val in reps) {
          template = template.split(val).join(reps[val]);
        }
      var detail_content = ''
      var l = 1
          for(let d of detail){
            detail_content += "<tr style = 'height:25%;'><td style = 'width:6.22837%;text-align:center;vertical-align:top;border-width:1px;border-style:solid;border-color:#595959;'>" + l + "</td >";
            detail_content += "<td style = 'width:30.6805%;text-align:center;vertical-align:top;border-width:1px;border-style:solid;border-color:#595959;' ><span style = 'text-align:center;background-color:#ffffff;'>" + d.item_name + "</span></td>";
            detail_content += "<td style = 'width:7.7278%;text-align:center;vertical-align:top;border-width:1px;border-style:solid;border-color:#595959;' ><span style = 'text-align:center;background-color:#ffffff;'>" + d.barcode + "</span></td>";
            detail_content += "<td style = 'width:8.41984%;text-align:center;vertical-align:top;border-width:1px;border-style:solid;border-color:#595959;' ><span style = 'text-align:center;background-color:#ffffff;'>" + d.unit + "</span></td>";
            detail_content += "<td style = 'width:10.6113%;text-align:center;vertical-align:top;border-width:1px;border-style:solid;border-color:#595959;' ><span style = 'text-align:center;background-color:#ffffff;'>" + Antl.formatNumber(d.quantity) + "</span></td>";
            detail_content += "<td style = 'width:8.65052%;text-align:center;vertical-align:top;border-width:1px;border-style:solid;border-color:#595959;' ><span style = 'text-align:center;background-color:#ffffff;'></span></td>";
            detail_content += "<td style = 'width:11.534%;text-align:center;vertical-align:top;border-width:1px;border-style:solid;border-color:#595959;' ><span style = 'text-align:center;background-color:#ffffff;'>" +  Antl.formatNumber(d.price)+ "</span></td>";
            detail_content += "<td style = 'width:16.1476%;text-align:center;vertical-align:top;border-width:1px;border-style:solid;border-color:#595959;' ><span style = 'text-align:center;background-color:#ffffff;'>" + Antl.formatNumber(d.amount)+ "</span></td>";
            detail_content += "</tr>";
            l++
          }
          response.json({ status: true , print_content: template , detail_content : detail_content})

      } catch (e) {
    response.json({ status: false , error : true , message: Antl.formatMessage('messages.no_data') + e.message})
      }
  }
}
module.exports = CheckGoodsGeneralController
