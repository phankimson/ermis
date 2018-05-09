'use strict'
const Data = use('App/Model/GoodsWarning')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')

class GoodsWarningController{
  constructor () {
      this.key = "goods-warning"  // EDIT
      this.download = "GoodsWarning.xlsx"  // EDIT
      this.room = "goods-warning"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('goods_warning.title')  // EDIT
      const data = yield Data.query().orderBy('id', 'desc').fetch()
      const show = yield response.view('pos/pages/goods_warning', {key : this.key ,room : this.room  ,title: title , data: data.toJSON()})  // EDIT
      response.send(show)
  }
  * save (request, response){
     try{
    const permission = JSON.parse(yield request.session.get('permission'))
    const data = JSON.parse(request.input('data'))
    if(data){
      var result = ''
        if(data.id != null){
         result =  yield Data.findBy('id', data.id)
        }else{
         result = new Data()
        }
        if(permission.a || permission.e){
        result.description = data.description
        result.quantity = data.quantity
        result.balance = data.balance
        result.color = data.color
        result.active = data.active
        yield result.save()
         response.json({ status: true , message: Antl.formatMessage('messages.update_success') , data : result})
       }else{
         response.json({ status: false , message: Antl.formatMessage('messages.you_not_permission')})
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
        result.description = data.description
        result.quantity = data.quantity
        result.balance = data.balance
        result.color = data.color
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
module.exports = GoodsWarningController
