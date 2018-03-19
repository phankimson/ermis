'use strict'
const Data = use('App/Model/Customer')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const HistoryAction = use('App/Classes/HistoryAction')
const Group = use('App/Model/ObjectGroup')  // EDIT
const Menu = use('App/Model/Menu')
const Discount = use('App/Model/Discount')

class CustomerController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "customer"  // EDIT
      this.menu = "pos_customer"  // EDIT
      this.download = "Customer.xlsx"  // EDIT
      this.group = 2 // EDIT
      this.room = "customer"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('customer.title')  // EDIT
      const data = yield Data.query().orderBy('id', 'desc').fetch()
      const group = yield Group.query().where('active', 1).where('type',this.group).orderBy('id', 'desc').fetch()
      const discount = yield Discount.query().where('type',3).where('active',1).orderBy('id', 'desc').fetch()
      const show = yield response.view('pos/pages/customer', {key : this.key ,title: title , data: data.toJSON() , discount : discount.toJSON() , group : group.toJSON()})  // EDIT
      response.send(show)
  }

  * save (request, response){
      try {
    const permission = JSON.parse(yield request.session.get('permission'))
    const data = JSON.parse(request.input('data'))
    if(data){
      const check = yield Data.query().where('code',data.code).first()
      if(check && check.id != data.id){
        response.json({ status: false, message: Antl.formatMessage('messages.duplicate_code')  })
      }else{
      var result = ''
      var action = 0
        if(data.id != null){
         result =  yield Data.findBy('id', data.id)
         var action = 4
        }else{
         result = new Data()
         var action = 2
        }
          if(permission.a || permission.e){
        result.group = data.group
        result.level = data.level
        result.code = data.code
        result.name = data.name
        result.name_en = data.name_en
        result.address = data.address
        result.tax_code = data.tax_code
        result.phone = data.phone
        result.fax = data.fax
        result.email = data.email
        result.website = data.website
        result.bank_account = data.bank_account
        result.bank_name = data.bank_name
        result.full_name_contact = data.full_name_contact
        result.address_contact = data.address_contact
        result.email_contact = data.email_contact
        result.telephone1_contact = data.telephone1_contact
        result.telephone2_contact = data.telephone2_contact
        result.country = data.country
        result.regions = data.regions
        result.area = data.area
        result.distric = data.distric
        result.marketing = data.marketing
        result.company_size = data.company_size
        result.account = data.account
        result.maximum_debt = data.maximum_debt
        result.debt_limit = data.debt_limit
        result.cost_object = data.cost_object
        result.discount = data.discount
        result.payment_method = data.payment_method
        result.price_policy = data.price_policy
        result.active = data.active
          yield result.save()
          // Lưu lịch sử
          const menu = yield Menu.query().where('code',this.menu).first()
          let hs = new HistoryAction()
          var rs = hs.insertRecord(action,request.currentUser.id,menu.id,JSON.stringify(result))
          yield rs.save()
          //
          response.json({ status: true , message: Antl.formatMessage('messages.update_success') , data : result})
        }else{
           response.json({ status: false , message: Antl.formatMessage('messages.you_not_permission') })
         }
        }
       }else{
         response.json({ status: false , message: Antl.formatMessage('messages.no_data') })
         }
       } catch (e) {
       response.json({ status: false , message: Antl.formatMessage('messages.update_fail')})
       }
     }
     * delete (request, response){
       try{
       const permission = JSON.parse(yield request.session.get('permission'))
       const data = request.input('data')
       if(data){
         if(permission.d){
           const arr = yield Data.findBy('id', data)
           // Lưu lịch sử
           const menu = yield Menu.query().where('code',this.menu).first()
           let hs = new HistoryAction()
           var rs = hs.insertRecord(5,request.currentUser.id,menu.id,JSON.stringify(arr))
           yield rs.save()
           //
           yield arr.delete()
           response.json({ status: true , message: Antl.formatMessage('messages.delete_success')})
         }else{
           response.json({ status: false , message: Antl.formatMessage('messages.you_are_not_permission_delete')})
         }
       }else{
           response.json({ status: false ,message: Antl.formatMessage('messages.no_data')  })
       }
       }catch(e){
         response.json({ status: false , message: Antl.formatMessage('messages.delete_fail')})
       }
     }
  * downloadExcel (request, response){
    response.download(Helpers.storagePath(this.download))
  }

  * import (request, response){
    try{
    const permission = JSON.parse(yield request.session.get('permission'))
    if(permission.a){
    const file = request.file('files', {
      allowedExtensions: ['xls', 'xlsx']
    })

    var XLSX = require('xlsx')
    var workbook = XLSX.readFile(file[1].tmpPath())
    var sheet_name_list = workbook.SheetNames
    const arr = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]])
    if(arr){
      let arr_push = []
      for(let data of arr){
        var result = new Data()
        result.group = data.group
        result.level = data.level
        result.code = data.code
        result.name = data.name
        result.name_en = data.name_en
        result.address = data.address
        result.tax_code = data.tax_code
        result.phone = data.phone
        result.fax = data.fax
        result.email = data.email
        result.website = data.website
        result.bank_account = data.bank_account
        result.bank_name = data.bank_name
        result.full_name_contact = data.full_name_contact
        result.address_contact = data.address_contact
        result.email_contact = data.email_contact
        result.telephone1_contact = data.telephone1_contact
        result.telephone2_contact = data.telephone2_contact
        result.country = data.country
        result.regions = data.regions
        result.area = data.area
        result.distric = data.distric
        result.marketing = data.marketing
        result.company_size = data.company_size
        result.account = data.account
        result.maximum_debt = data.maximum_debt
        result.debt_limit = data.debt_limit
        result.cost_object = data.cost_object
        result.discount = data.discount
        result.payment_method = data.payment_method
        result.price_policy = data.price_policy
        result.active = data.active
        yield result.save()
        arr_push.push(result)
      }
      // Lưu lịch sử
      const menu = yield Menu.query().where('code',this.menu).first()
      let hs = new HistoryAction()
      var rs = hs.insertRecord(6,request.currentUser.id,menu.id,JSON.stringify(arr))
      yield rs.save()
      //
      response.json({ status: true , message: Antl.formatMessage('messages.success_import') , data : arr_push})
    }else{
      response.json({ status: false , message: Antl.formatMessage('messages.no_data')})
    }

    yield file[1].delete()
   }else{
    response.json({ status: false , message: Antl.formatMessage('messages.you_are_not_permission_add')})
    }
  }catch(e){
    response.json({ status: false , message: Antl.formatMessage('messages.failed_import')})
    }
  }
}
module.exports = CustomerController
