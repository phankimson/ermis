'use strict'
const Data = use('App/Model/PosGeneral')  // EDIT
const Detail = use('App/Model/PosDetail')  // EDIT
const Antl = use('Antl')
const Helpers = use('Helpers')
const Option = use('App/Model/Option')  // EDIT

class ApprovedInventoryVoucherController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "approved-inventory-voucher"  // EDIT
      this.room = "approved-inventory-voucher"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('approved_inventory_voucher.title')  // EDIT
      const page = 1
      const option = yield Option.query().where("code","MAX_ITEM_APPROVED").first()
      const data = yield Data.query()
      .leftJoin('inventory as t1','t1.id','pos_general.inventory_receipt')
      .leftJoin('inventory as t2','t2.id','pos_general.inventory_issue')
      .orderBy('id', 'desc')
      .whereIn('type',[1,2,3,4])
      .select('pos_general.*','t1.name as inventory_receipt','t2.name as inventory_issue')
      .paginate(page,option.value)
      data.toJSON().page = Math.ceil(data.toJSON().total / data.toJSON().perPage)
      const show = yield response.view('pos/pages/approved_inventory_voucher', {key : this.key ,room : this.room ,title: title , data: data.toJSON() })  // EDIT
      response.send(show)
  }
  * page (request, response){
    try{
      const page = JSON.parse(request.input('data'))
      const option = yield Option.query().where("code","MAX_ITEM_APPROVED").first()
      const data = yield Data.query()
      .leftJoin('inventory as t1','t1.id','pos_general.inventory_receipt')
      .leftJoin('inventory as t2','t2.id','pos_general.inventory_issue')
      .orderBy('id', 'desc')
      .whereIn('type',[1,2,3,4])
      .select('pos_general.*','t1.name as inventory_receipt','t2.name as inventory_issue')
      .paginate(page,option.value)
      if(data.toJSON().data.length > 0){
        response.json({ status: true , data : data.toJSON().data})
      }else{
        response.json({ status: false , message: Antl.formatMessage('messages.no_data_found')})
      }
    }catch(e){
        response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error')+' '+ e.message })
    }

  }
  * filter (request, response){
    try{
      const data = JSON.parse(request.input('data'))
      if(data.field_search == 'date_voucher'){
        data.value_search = moment(data.value_search , "DD/MM/YYYY").format('YYYY-MM-DD')
      }
      if(data.value_search != ''){
      const arr = yield Data.query()
      .leftJoin('inventory as t1','t1.id','pos_general.inventory_receipt')
      .leftJoin('inventory as t2','t2.id','pos_general.inventory_issue')
      .where('pos_general.'+data.field_search,"LIKE",'%'+data.value_search+'%')
      .TypeWhere('pos_general.active',data.active_search)
      .TypeWhereIn('pos_general.status',eval(data.status_search))
      .select('pos_general.*','t1.name as inventory_receipt','t2.name as inventory_issue')
      .whereIn('type',[1,2,3,4])
      .orderBy('pos_general.created_at','desc')
      .fetch()
      console.log(arr)
      if(arr.toJSON().length > 0){
        response.json({ status: true , data : arr.toJSON()})
      }else{
        response.json({ status: false , message: Antl.formatMessage('messages.no_data_found')})
      }
    }else{
      const page = 1
      const option = yield Option.query().where("code","MAX_ITEM_APPROVED").first()
      const arr = yield Data.query()
      .leftJoin('inventory as t1','t1.id','pos_general.inventory_receipt')
      .leftJoin('inventory as t2','t2.id','pos_general.inventory_issue')
      .orderBy('id', 'desc')
      .whereIn('type',[1,2,3,4])
      .select('pos_general.*','t1.name as inventory_receipt','t2.name as inventory_issue')
      .paginate(page,option.value)
      if(arr.toJSON().data.length > 0){
        response.json({ status: true , page : true , data : arr.toJSON().data})
      }else{
        response.json({ status: false , message: Antl.formatMessage('messages.no_data_found')})
      }
    }

    }catch(e){
        response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error')+' '+ e.message })
    }

  }
  * status (request, response){
    try{
      const permission = JSON.parse(yield request.session.get('permission'))
      if(permission.p){
        const data = JSON.parse(request.input('data'))
        const arr = yield Data.find(data)
        arr.status = 1
        yield arr.save()
        const detail = yield Detail.query().where('general_id',data).fetch()
          for(var d of detail){
            d.status = 1
            yield d.save()
          }
         response.json({ status: true })
      }else{
        response.json({ status: false , message: Antl.formatMessage('messages.you_not_permission_approved')})
      }
    }catch(e){
      response.json({ status: false  ,error : true , message: Antl.formatMessage('messages.update_error')})
    }

  }

}
module.exports = ApprovedInventoryVoucherController
