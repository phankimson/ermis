'use strict'

const UserPermission = use('App/Model/UserPermission')
const Inventory = use('App/Model/Inventory')
const Company = use('App/Model/Company')
const User = use('App/Model/User')
const Bitmask = use('App/Classes/bitmask-ermis')

class PermissionInventory {

* handle (request, response, next) {
    const Antl = use('Antl')
    const lang = Antl.getLocale()
    const link = request.url()
    const load = ['manage','pos','store','account','edu']
    var manage = ''
    var skip = false
    const skip_load = ['login','logout','block']
    var i = 0
    for(i in load){
      if(link.search(load[i]) > 0){
          manage = load[i]
          break
      }
    }
    for(var s in skip_load){
      if(link == '/'+manage+'/'+skip_load[s]){
          skip = true
          break
      }
    }
    response.viewInstance.global('type', parseInt(i)+1)
    if(link != '/' && skip == false && manage != '' && request.method() == "GET"){
      const session = request.currentUser
      const inventory = yield request.session.get('inventory')
      const shiftId = yield request.session.get('shiftId')
          if(session && inventory){
              response.viewInstance.global('inventory', inventory)
              const inventory_name = yield Inventory.findBy('id',inventory)
              const company_name = yield Company.findBy('id',inventory_name.company)
              response.viewInstance.global('company',company_name.toJSON())
              response.viewInstance.global('inventory',inventory_name.toJSON())
              if(!shiftId){
                 yield request.session.put('shiftId', 1)
              }
              var permission = 0;
              if(session.role == 1 || session.role == 2){
                permission = 63
              }else{
                const per = yield UserPermission.query().where('user_id',session.id).where('inventory_id',inventory).innerJoin('menu', 'menu.id', 'user_permission.menu_id').where('menu.link',link.substr(1)).first()
                if(per){
                permission = per.permission;
                }
              }
              var bitmask = new Bitmask();
              var arr = bitmask.getPermissions(permission)
              if(arr.v === true){
                 yield request.session.put('permission', JSON.stringify(arr))
                 response.viewInstance.global('permission', JSON.stringify(arr))
              }else{
                response.redirect(skip_load[2]+'?lang=' + lang)
                 return
              }
          }else{
              yield request.auth.logout()
              yield request.session.forget('inventory')
              yield request.session.forget('shiftId')
              response.redirect(skip_load[0]+'?lang=' + lang)
              return
          }
      }
    yield next
  }
}

module.exports = PermissionInventory
