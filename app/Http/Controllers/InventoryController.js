'use strict'
const Data = use('App/Model/Inventory')  // EDIT
const Company = use('App/Model/Company')
const Antl = use('Antl')
const Helpers = use('Helpers')

class InventoryController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "inventory"  // EDIT
      this.download = "Inventory.xlsx"  // EDIT
      this.room = "inventory"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('inventory.title')  // EDIT
      const data = yield Data.query().orderBy('id', 'desc').fetch()
      const company = yield Company.query().where('active',1).fetch()
      const show = yield response.view('manage/pages/inventory', {key : this.key ,title: title , data: data.toJSON() , company : company.toJSON()})  // EDIT
      response.send(show)
  }

  * save (request, response){
    try{
   const permission = JSON.parse(yield request.session.get('permission'))
    const data = JSON.parse(request.input('data'))
    if(data){
      const check = yield Data.query().where('code',data.code).first()
      if(check && check.id != data.id){
        response.json({ status: false, message: Antl.formatMessage('messages.duplicate_code')  })
      }else{
      var result = ''
        if(data.id != null){
         result =  yield Data.findBy('id', data.id)
        }else{
         result = new Data()
        }
          if(permission.a || permission.e){
          result.code = data.code
          result.name = data.name
          result.name_en = data.name_en
          result.address = data.address
          result.manager = data.manager
          result.phone = data.phone
          result.fax = data.fax
          result.email = data.email
          result.company = data.company
          result.description = data.description
          result.active = data.active
          yield result.save()
          response.json({ status: true , message: Antl.formatMessage('messages.update_success') , data : result})
            }else{
              response.json({ status: false , message: Antl.formatMessage('messages.you_not_permission')})
            }
              }
         }else{
           response.json({ status: false, message: Antl.formatMessage('messages.no_data')  })
           }
         }catch(e){
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
             yield arr.delete()
             response.json({ status: true , message: Antl.formatMessage('messages.delete_success')})
           }else{
             response.json({ status: false , message: Antl.formatMessage('messages.you_are_not_permission_delete')})
           }
         }else{
             response.json({ status: false , message: Antl.formatMessage('messages.no_data') })
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
        result.code = data.code
        result.name = data.name
        result.name_en = data.name_en
        result.address = data.address
        result.manager = data.manager
        result.phone = data.phone
        result.fax = data.fax
        result.email = data.email
        result.company = data.company
        result.description = data.description
        result.active = data.active
        yield result.save()
        arr_push.push(result)
      }
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
module.exports = InventoryController
