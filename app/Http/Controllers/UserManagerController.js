'use strict'
const Hash = use('Hash')
const Data = use('App/Model/User')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const Inventory = use('App/Model/Inventory')  // EDIT

class UserManagerController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "user"  // EDIT
      this.download = "User.xlsx"  // EDIT
      this.room = "user"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('user.title')  // EDIT
      const data = yield Data.query().orderBy('id', 'desc').fetch()
      const inventory = yield Inventory.query().where('active', 1).fetch()
      const show = yield response.view('manage/pages/user', {key : this.key ,room : this.room,title: title , data: data.toJSON() , inventory :inventory.toJSON()  })  // EDIT
      response.send(show)
  }

  * save (request, response){
    try{
   const permission = JSON.parse(yield request.session.get('permission'))
    const data = JSON.parse(request.input('data'))
    if(data){
      const check = yield Data.query().where('username',data.username).orWhere('email',data.email).first()
      if(check && check.id != data.id){
        response.json({ status: false, message: Antl.formatMessage('messages.duplicate_username')  })
      }else{
      var result = ''
        if(data.id != null){
         result =  yield Data.findBy('id', data.id)
         result.password = (data.password != "") ? yield Hash.make(data.password) : result.password
        }else{
         result = new Data()
          result.password = data.password
        }
          if(permission.a || permission.e){
          result.barcode = data.barcode
          result.username = data.username
          result.fullname = data.fullname
          result.firstname = data.firstname
          result.lastname = data.lastname
          result.identity_card = data.identity_card
          result.birthday = data.birthday?data.birthday:'0000-00-00'
          result.phone = data.phone
          result.email = data.email
          result.address = data.address
          result.city = data.city
          result.jobs = data.jobs
          result.country = data.country
          result.about = data.about
          result.role = data.role
          result.stock_default = data.stock_default
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
             response.json({ status: false   , message: Antl.formatMessage('messages.no_data')})
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
        result.barcode = data.barcode
        result.username = data.username
        result.password = data.password
        result.fullname = data.fullname
        result.firstname = data.firstname
        result.lastname = data.lastname
        result.identity_card = data.identity_card
        result.birthday = data.birthday?data.birthday:'0000-00-00'
        result.phone = data.phone
        result.email = data.email
        result.address = data.address
        result.city = data.city
        result.jobs = data.jobs
        result.country = data.country
        result.about = data.about
        result.role = data.role
        result.active = data.active
        result.stock_default = data.stock_default
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
module.exports = UserManagerController
