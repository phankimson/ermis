'use strict'
const Data = use('App/Model/PrintTemplate')  // EDIT
const Menu = use('App/Model/Menu')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
var moment = require('moment');

class PrintTemplateController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "print-template"  // EDIT
      this.download = "PrintTemplate.xlsx"  // EDIT
      this.room = "print-template"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('print_template.title')  // EDIT
      const data = yield Data.query().orderBy('id', 'desc').fetch()
      const menu = yield Menu.query().where('active', 1).orderBy('id', 'desc').fetch()
      const show = yield response.view('manage/pages/print_template', {key : this.key ,title: title , data: data.toJSON() , menu : menu.toJSON()})  // EDIT
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
            result.menu = data.menu
            result.code = data.code
            result.name = data.name
            result.name_en = data.name_en
            result.date = data.date
            result.text = data.text
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
        response.json({ status: false ,message: Antl.formatMessage('messages.no_data') })
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
        result.menu = data.menu
        result.code = data.code
        result.name = data.name
        result.name_en = data.name_en
        result.date = data.date
        result.text = data.text
        result.active = data.active
        yield result.save()
        arr_push.push(result)
      }
      response.json({ status: true , message: Antl.formatMessage('messages.success_import') , data : arr_push})
    }else{
      response.json({ status: false , message: Antl.formatMessage('messages.you_are_not_permission_add')})
    }
    }else{
      response.json({ status: false , message: Antl.formatMessage('messages.no_data')})
    }

    yield file[1].delete()
    }catch(e){
      response.json({ status: false , message: Antl.formatMessage('messages.failed_import')})
    }
  }
}
module.exports = PrintTemplateController
