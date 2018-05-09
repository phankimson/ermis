'use strict'
const Data = use('App/Model/Option')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')

class OptionController{
  constructor () {
      this.type = 1  // EDIT
      this.key = "option"  // EDIT
      this.download = "Option.xlsx"  // EDIT
      this.room = "option"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('option.title')  // EDIT
      const data = yield Data.query().where('type',this.type).orderBy('id', 'desc').fetch()
      const show = yield response.view('manage/pages/option', {key : this.key ,room : this.room ,title: title , data: data.toJSON()})  // EDIT
      response.send(show)
  }
  * get (request, response){
    try{
    const data = JSON.parse(request.input('data'))
    const arr = yield Data.query().where('type',data).orderBy('id', 'desc').fetch()
    if(arr){
        response.json({ status: true  , data : arr})
    }else{
        response.json({ status: false , message: Antl.formatMessage('messages.no_data') })
    }
    }catch(e){
      response.json({ status: false , error : true , message: Antl.formatMessage('messages.error')+' ' + e.message })
    }
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
          result.type = data.type
          result.code = data.code
          result.title = data.title
          result.value = data.value
          result.value1 = data.value1
          result.value2 = data.value2
          result.value3 = data.value3
          result.value4 = data.value4
          result.value5 = data.value5
          result.active = data.active
          result.date = data.date
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
        result.type = data.type
        result.code = data.code
        result.title = data.title
        result.value = data.value
        result.value1 = data.value1
        result.value2 = data.value2
        result.value3 = data.value3
        result.value4 = data.value4
        result.value5 = data.value5
        result.active = data.active
        result.date = data.date
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
module.exports = OptionController
