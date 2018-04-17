'use strict'
const Hash = use('Hash')
const General = use('App/Model/PosGeneral')  // EDIT
const Detail = use('App/Model/PosDetail')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const HistoryAction = use('App/Classes/HistoryAction')
const Docso = use('App/Classes/docso')
const Menu = use('App/Model/Menu')
const Inventory = use('App/Model/Inventory')  // EDIT
const Company = use('App/Model/Company')  // EDIT
const Option = use('App/Model/Option')  // EDIT
const Closing = use('App/Model/Closing')  // EDIT
const PrintTemplate = use('App/Model/PrintTemplate')  // EDIT
const GoodsInventory = use('App/Model/GoodsInventory')  // EDIT
const GoodsSize = use('App/Model/GoodsSize')  // EDIT
const Goods = use('App/Model/MarialGoods')  // EDIT
const Model = use('App/Model/Model')  // EDIT
const Size = use('App/Model/Size')  // EDIT
const Style = use('App/Model/Style')  // EDIT
const Database = use('Database')

var moment = require('moment')
var fs = require('fs')


class ReceiptInventoryGeneralController{
  constructor () {
      this.type = 1  // EDIT Receipt = 1 , Issue = 2 , Transfer = 3
      this.key = "receipt-inventory-general"  // EDIT
      this.menu = "pos_receipt_inventory"
      this.print = 'PNK%'
    }
  * show (request, response){
      const title = Antl.formatMessage('receipt_inventory_general.title')  // EDIT
      const date_range = yield Option.query().where('code','DATE_RANGE_INVENTORY').first()
      const end_date = moment().format('DD/MM/YYYY')
      const start_date = moment().subtract((date_range.value - 1), 'days').format('DD/MM/YYYY')
      const inventory = yield request.session.get('inventory')
      const data = yield General.query().where('inventory_id', inventory)
      .where('type', this.type)
      .where('inventory_id', inventory)
      .whereBetween('date_voucher',[moment().subtract((date_range.value - 1), 'days')
      .format('YYYY-MM-DD'),moment().format('YYYY-MM-DD') ]).fetch()
      const print = yield PrintTemplate.query().where('code', 'LIKE', this.print).fetch()
      const show = yield response.view('pos/pages/receipt_inventory_general', {key : this.key ,title: title , data: data.toJSON() , end_date : end_date , start_date : start_date , print : print.toJSON() })  // EDIT
      response.send(show)
  }
  * get (request, response){
    try {
        const data = JSON.parse(request.input('data'))
        const inventory = yield request.session.get('inventory')
        var arr = []
        if(data.active != "" && data.active != null){
          arr = yield General.query().where('inventory_id', inventory).where('type', this.type).whereBetween('date_voucher',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD') ]).where('active',data.active).fetch()
        }else{
          arr = yield General.query().where('inventory_id', inventory).where('type', this.type).whereBetween('date_voucher',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD') ]).fetch()
            }
        if(arr){
            response.json({ status: true  , data : arr.toJSON() })
          }else{
            response.json({ status: false , message: Antl.formatMessage('messages.no_data')  })
        }
    } catch (e) {
      response.json({ status: false , error : true , message: Antl.formatMessage('messages.error')+' ' +e.message })
    }
  }

  * detail (request, response){
    try {
        const data = JSON.parse(request.input('data'))
        const arr = yield Detail.query().where("pos_detail.general_id",data)
            .innerJoin('unit', 'unit.id', 'pos_detail.unit')
            .innerJoin('goods_size', 'goods_size.id', 'pos_detail.item_id')
            .innerJoin('size', 'size.id', 'goods_size.size')
            .select("pos_detail.*","pos_detail.id as detail","unit.name as unit","size.name as size").orderBy('id', 'desc').fetch()
        if(arr){
            response.json({ status: true  , data : arr.toJSON() })
        }else{
            response.json({ status: false , message: Antl.formatMessage('messages.no_data')  })
        }
      } catch (e) {
      response.json({ status: false , error : true , message: Antl.formatMessage('messages.error')+' ' + e.message })
      }
  }
      * unwrite (request, response){
        try {
        const data = JSON.parse(request.input('data'))
        if(data){
        const action = 4
        const arr = yield General.find(data)
        const closing = yield Closing.query().where('date',moment(arr.date_voucher,"YYYY-MM-DD").format("MM/YYYY")).where('active',1).count('* as total')
        if(closing[0].total == 0){
        const detail = yield Detail.query().where('general_id',data).fetch()
        // Lưu lịch sử
        const menu = yield Menu.query().where('code',this.menu).first()
        let hs = new HistoryAction()
        var rs = hs.insertRecord(action,request.currentUser.id,menu.id,JSON.stringify(arr)+'@'+JSON.stringify(detail))
        yield rs.save()
        //
        arr.active = 0
        yield arr.save()
        //DETAIL
          for(let d of detail){
            d.active = 0
            yield d.save()
            // Lưu số tồn
            const balance = yield GoodsInventory.query().where('inventory',arr.inventory_id).where('goods_size',d.item_id).first()
            if(balance){
              balance.quantity = balance.quantity - d.quantity
              yield balance.save()
            }
            // End
          }
        response.json({ status: true , message: Antl.formatMessage('messages.unrecored_success') })
      }else{
       response.json({ status: false , message: Antl.formatMessage('messages.locked_period') })
      }
      }else{
      response.json({ status: false  , message: Antl.formatMessage('messages.unrecored_fail')})
      }
    } catch (e) {
      response.json({ status: false , message: Antl.formatMessage('messages.unrecored_error')})
    }
  }
  * write (request, response){
    try {
          const data = JSON.parse(request.input('data'))
          if(data){
            const action = 4
            const arr = yield General.find(data)
            const closing = yield Closing.query().where('date',moment(arr.date_voucher,"YYYY-MM-DD").format("MM/YYYY")).where('active',1).count('* as total')
            if(closing[0].total == 0){
              const detail = yield Detail.query().where('general_id',data).fetch()
              // Lưu lịch sử
              const menu = yield Menu.query().where('code',this.menu).first()
              let hs = new HistoryAction()
              var rs = hs.insertRecord(action,request.currentUser.id,menu.id,JSON.stringify(arr)+'@'+JSON.stringify(detail))
              yield rs.save()
              //
              arr.active = 1
              yield arr.save()
              // DELTAIL
                for(let d of detail){
                  d.active = 1
                  yield d.save()
                  // Lưu số tồn
                  const balance = yield GoodsInventory.query().where('inventory',arr.inventory_id).where('goods_size',d.item_id).first()
                  if(balance){
                    balance.quantity = balance.quantity + d.quantity
                    yield balance.save()
                  }
                  // End
                }
              response.json({ status: true , message: Antl.formatMessage('messages.recored_success') })
            }else{
             response.json({ status: false , message: Antl.formatMessage('messages.locked_period') })
            }
          }else{
            response.json({ status: false  , message: Antl.formatMessage('messages.recored_fail')})
          }

    } catch (e) {
    response.json({ status: false , message: Antl.formatMessage('messages.recored_error')})
    }
  }
  * delete (request, response){
    try {
          const data = JSON.parse(request.input('data'))
          if(data){
            const action = 5
            const arr = yield General.find(data)
            const closing = yield Closing.query().where('date',moment(arr.date_voucher,"YYYY-MM-DD").format("MM/YYYY")).where('active',1).count('* as total')
            if(closing[0].total == 0){
            const detail = yield Detail.query().where('general_id',data).fetch()
            // Lưu lịch sử
            const menu = yield Menu.query().where('code',this.menu).first()
            let hs = new HistoryAction()
            var rs = hs.insertRecord(action,request.currentUser.id,menu.id,JSON.stringify(arr)+'@'+JSON.stringify(detail))
            yield rs.save()
            //
            yield arr.delete()
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
      response.json({ status: false , message: Antl.formatMessage('messages.delete_error')})
    }
  }
  * prints (request, response){
    try {
    const data = JSON.parse(request.input('data'))
    const print = yield PrintTemplate.query().where('id', data.voucher ).first()
    if(data.voucher == 1){
      const general = yield General.find(data.id)
      const detail = yield Detail.query().where("pos_detail.general_id",data.id)
          .innerJoin('unit', 'unit.id', 'pos_detail.unit')
          .innerJoin('goods_size', 'goods_size.id', 'pos_detail.item_id')
          .innerJoin('size', 'size.id', 'goods_size.size')
          .select("pos_detail.*","pos_detail.id as detail","unit.name as unit","size.name as size").orderBy('id', 'desc').fetch()
      const stock = yield request.session.get('inventory')
      const inventory = yield Inventory.query().where('id',stock).first()
      const company = yield Company.query().where('id',inventory.company).first()
      const signer = yield Option.query().where('code','SIGNER').first()
      const subject = yield Database.table(general.subject_key).where('id',general.subject).first()
      let hs = new Docso()
      var reps = {
          "{company}": company.name,
          "{company_address}": company.address,
          "{day}": moment(general.date_voucher , "YYYY-MM-DD").format('DD'),
          "{month}": moment(general.date_voucher , "YYYY-MM-DD").format('MM'),
          "{year}": moment(general.date_voucher , "YYYY-MM-DD").format('YYYY'),
          "{voucher}" : general.voucher,
          "{subject}" : subject.name,
          "{number}" : general.total_number,
          "{amount}" : general.total_amount,
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
      }else if(data.voucher == 2){
        const format = yield Option.query().where('code','FORMAT_BARCODE').first()
        var detail_content = ''
        var y = 1
        let baseUrl = request.secure()? 'https://' : 'http://'
        baseUrl += request.headers().host + '/'
          const detail = yield Detail.query().where("general_id",data.id).orderBy('barcode', 'desc').fetch()
          for(let d of detail){
            const goods_size = yield GoodsSize.query().where('id',d.item_id).first()
            const size = yield Size.query().where('id',goods_size.size).first()
            const goods = yield Goods.query().where('id',goods_size.goods).first()
            const model = yield Model.query().where('id',goods.model).first()
            const style = yield Style.query().where('id',goods.style).first()
            var i = 1
            for( i ; i <= d.quantity ; i++){
              detail_content +='<div class="label">';
              detail_content +='<p class="child">childrenswear</p>';
              detail_content +='<img class="logo-img" src="'+baseUrl+'images/logo-intem.png">';
              detail_content +='<p class="style">Style : <span>'+model.name+' </span></p>';
              detail_content +='<p class="size">Size : <span>'+size.name+' </span></p>';
              detail_content +='<p class="color">Color : <span>'+style.name+' </span></p>';
              detail_content +='<p class="company">Công ty TNHH G&G Lô 10, 86B Trần Phú - NT.Tel : 058.3526079</p>';
              detail_content +='<p class="price">'+Antl.formatNumber(d.price)+' VNĐ</p>';
              detail_content +='<svg class="barcode" jsbarcode-format="'+format.value+'"  jsbarcode-value="'+d.barcode+'"  jsbarcode-height="45" jsbarcode-fontsize="25" jsbarcode-textPosition="bottom" jsbarcode-fontoptions="bold"></svg>';
              detail_content +='</div>';
              if(y % 3 == 0){
              detail_content += '<div class="page-break"></div>';
              }
              y++
            }
          }
          detail_content += '<script src="'+baseUrl+'scripts/JsBarcode.all.min.js'+'"></script>'
          detail_content += '<script> JsBarcode(".barcode").init();</script>'

            var template = print.text
          response.json({ status: true , print_content: template , section_content : detail_content })
      }else if(data.voucher == 6){
        const format = yield Option.query().where('code','FORMAT_BARCODE').first()
        var detail_content = ''
        var y = 1
        let baseUrl = request.secure()? 'https://' : 'http://'
        baseUrl += request.headers().host + '/'
          const detail = yield Detail.query().where("general_id",data.id).orderBy('barcode', 'desc').fetch()
          for(let d of detail){
            const goods_size = yield GoodsSize.query().where('id',d.item_id).first()
            const size = yield Size.query().where('id',goods_size.size).first()
            const goods = yield Goods.query().where('id',goods_size.goods).first()
            const model = yield Model.query().where('id',goods.model).first()
            const style = yield Style.query().where('id',goods.style).first()
            var i = 1
            for( i ; i <= d.quantity ; i++){
              detail_content +='<div class="label">';
              detail_content +='<img class="logo-img" src="'+baseUrl+'images/logo-intem.png">';
              detail_content +='<p class="style">Style/Mã hàng : <span>'+model.name+' </span></p>';
              detail_content +='<p class="size">Size/Kích cỡ : <span>'+size.name+' </span></p>';
              detail_content +='<p class="color">Color/Màu : <span>'+style.name+' </span></p>';
              detail_content +='<svg class="barcode" jsbarcode-format="'+format.value+'"  jsbarcode-value="'+d.barcode+'"  jsbarcode-height="45" jsbarcode-fontsize="20" jsbarcode-textPosition="bottom" jsbarcode-fontoptions="bold"></svg>';
              detail_content +='<p class="price">'+Antl.formatNumber(d.price)+' VNĐ</p>';
              detail_content +='<p class="company">Nhà phân phối</p>';
              detail_content +='<p class="company">Công ty TNHH G&G</p>';
              detail_content +='<p class="company">Địa chỉ : Lô 19 - 86B Trần Phú, Nha Trang</p>';
              detail_content +='<p class="company">ĐT: (+84)58 3526 079</p>';
              detail_content +='<p class="company">Email: mariana@gustavo-gano.com</p>';
              detail_content +='<p class="company">Web: www.gustavo-gano.com</p>';
              detail_content +='</div>';
              if(y % 2 == 0){
              detail_content += '<div class="page-break"></div>';
              }
              y++
            }
          }
          detail_content += '<script src="'+baseUrl+'scripts/JsBarcode.all.min.js'+'"></script>'
          detail_content += '<script> JsBarcode(".barcode").init();</script>'

            var template = print.text
          response.json({ status: true , print_content: template , section_content : detail_content })
      }else if(data.voucher == 7){
        const detail = yield Detail.query().where("pos_detail.general_id",data.id)
        .innerJoin('goods_size', 'goods_size.id', 'pos_detail.item_id')
        .leftJoin('size', 'size.id', 'goods_size.size')
        .leftJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
        .leftJoin('model', 'model.id', 'marial_goods.model')
        .leftJoin('style', 'style.id', 'marial_goods.style')
        .orderBy('pos_detail.barcode', 'desc')
        .select('pos_detail.*','size.name as size','model.name as model','style.name as style').fetch()
var data_ex='STT\tBar Code\tFULL NAME\tSTYLE\tSIZE\tCOLOR\tPRICE\tSL\t\n'
for (var i = 0; i < detail.toJSON().length; i++) {
    data_ex=data_ex+(i+1)+'\t'+detail.toJSON()[i].barcode+'\t'+detail.toJSON()[i].item_name+'\t'+detail.toJSON()[i].model+'\t'+detail.toJSON()[i].size+'\t'+detail.toJSON()[i].style+'\t'+Antl.formatNumber(detail.toJSON()[i].price)+'\t'+detail.toJSON()[i].quantity+'\n';
 }
 // delete old
 if(Helpers.storagePath('IntemBarcode.xls')){
    fs.unlink(Helpers.storagePath('IntemBarcode.xls'), (err) => {});
 }
fs.appendFile(Helpers.storagePath('IntemBarcode.xls'), data_ex, (err) => {
    if (err) throw err;
 });
  response.json({ status: true , download : true})
}

      } catch (e) {
    response.json({ status: false , error : true , message: Antl.formatMessage('messages.error')+' ' + e.message})
      }
  }

  * downloadExcel (request, response){
    response.download(Helpers.storagePath('IntemBarcode.xls'))
  }

}
module.exports = ReceiptInventoryGeneralController
