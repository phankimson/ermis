'use strict'
const Permission = use('App/Model/UserPermission')
const Bitmask = use('App/Classes/bitmask-ermis')
const Antl = use('Antl')
class PermissionController{
  * show (request, response){
      const show = yield response.view('permission')
      response.send(show)
  }
  * get (request, response){
    try{
      const data = request.input('data')
      const count_per = yield Permission.query().where("user_id",data).count('* as total')
      const lst_per = yield Permission.query().where("user_id",data).fetch()
      const arr_per = lst_per.toJSON()
      let arr = []
      if(count_per['0'].total > 0){
        for(let p of arr_per){
           var bitmask = new Bitmask()
           var per = bitmask.getPermissions(p.permission)
           per.id = p.id
           per.menu = p.menu_id
           var convert = JSON.parse(JSON.stringify(per))
           arr.push(convert)
        }
        response.json({ status: true  , data : arr})
      }else{
        response.json({ status: false  , message: Antl.formatMessage('messages.no_data') })
      }
    }catch(e){
        response.json({ status: false , error : true , message: Antl.formatMessage('messages.error')+' ' + e.message })
    }

  }
  * save (request, response){
    try{
    const permission = JSON.parse(yield request.session.get('permission'))
     const data = JSON.parse(request.input('data'))
    if(permission.a || permission.e){
     if(data){
       for(let d of data){
         if(d.id != null){
          var result = yield Permission.findBy('id', d.id)
         }else{
          var result = new Permission()
         }
           result.user_id = d.user
           result.menu_id = d.menu
           result.permission = d.permission
           yield result.save()
       }
        response.json({ status: true , message: Antl.formatMessage('messages.update_success')})
     }else{
       response.json({ status: false , message: Antl.formatMessage('messages.no_data')})
     }
   }else{
      response.json({ status: false , message: Antl.formatMessage('messages.you_not_permission')})
   }
   }catch(e){
     response.json({ status: false , message: Antl.formatMessage('messages.update_fail')})
   }
   }

}
module.exports = PermissionController
