'use strict'
const Hash = use('Hash')
const Antl = use('Antl')
const User = use('App/Model/User')
const Option = use('App/Model/Option')
const Helpers = use('Helpers')
const fs = require('fs')
const HistoryAction = use('App/Classes/HistoryAction')

class UserController {
  * login (request, response) {
    const data = JSON.parse(request.input('data'))
    const username = data.username
    const password = data.password
    const captcha = data['g-recaptcha-response']
    try {
    const login = yield request.auth.attempt(username,password)
    if (login  && captcha != "") {
      const user = yield request.auth.getUser()
      // Lưu lịch sử đăng nhập
      let hs = new HistoryAction()
      var rs = hs.insertRecord(1,user.id,0,'')
      yield rs.save()
      //
      response.json({ status: true , message : Antl.formatMessage('messages.login_success')})
      return
    }
    response.json({ status: false , message: Antl.formatMessage('messages.login_fail')})
    } catch (e) {
    response.json({ status: false ,error : true , message: Antl.formatMessage('messages.error')+' ' + e.message})
    }
  }


      * doRegister(request, response) {
        try{
          const data = JSON.parse(request.input('data'))
          const check = yield User.query().where('username',data.username).orWhere('email',data.email).first()
          if(check && check.id != data.id){
            response.json({ status: false, message: Antl.formatMessage('messages.duplicate_username')  })
          }else{
           const user = new User()
           user.fullname = data.fullname
           user.firstname = data.firstname
           user.lastname = data.lastname
           user.phone = data.phone
           user.birthday = data.birthday?data.birthday:'0000-00-00'
           user.jobs = data.jobs
           user.address = data.address
           user.city = data.city
           user.country = data.country
           user.about = data.about
           user.identity_card = data.identity_card
           user.username = data.username
           user.email = data.email
           user.password = data.password
           yield user.save()
            response.json({ status: true , message: Antl.formatMessage('messages.register_success')})
         }
        }catch(e){
          response.json({ status: false ,error : true, message: Antl.formatMessage('messages.error')+' ' + e.message})
        }

    }

    * updateProfile(request, response) {
      try{
        const data = JSON.parse(request.input('data'))
        const user = yield User.findBy('id',request.currentUser.id);
        user.fullname = data.fullname
        user.firstname = data.firstname
        user.lastname = data.lastname
        user.phone = data.phone
        user.birthday = data.birthday?data.birthday:'0000-00-00'
        user.jobs = data.jobs
        user.address = data.address
        user.city = data.city
        user.country = data.country
        user.about = data.about
        user.identity_card = data.identity_card
        user.email = data.email
        yield user.save()
         response.json({ status: true , message: Antl.formatMessage('messages.update_success')})
      }catch(e){
        response.json({ status: false ,error : true, message: Antl.formatMessage('messages.error')+' ' + e.message})
      }

    }
    * changePassword(request, response) {
      try{
        const data = JSON.parse(request.input('data'))
        const user = yield User.findBy('id',request.currentUser.id);
        const checkpassword = yield Hash.verify(data.password, user.password)
        const new_password = yield Hash.make(data.npassword)
        if(checkpassword && user.password != new_password && data.npassword == data.rpassword){
          user.password = new_password
          yield user.save()
          yield request.auth.logout()
           response.json({ status: true , message: Antl.formatMessage('messages.change_password_success')})
        }else{
           response.json({ status: false , message: Antl.formatMessage('messages.change_password_fail')})
        }
      }catch(e){
        response.json({ status: false ,error : true, message: Antl.formatMessage('messages.error')+' ' + e.message})
      }

    }
    * updateAvatar (request, response) {
      try{
        const avatar = request.file('avatar', {
          maxSize: '2mb',
          allowedExtensions: ['jpg', 'png', 'jpeg']
        })

        const user = yield User.findBy('id',request.currentUser.id);
        const option = yield Option.query().where("code","PATH_UPLOAD_AVATAR").first()

        const fileName = `${new Date().getTime()}.${avatar.extension()}`
        const path_upload = option.value + user.id +'/'+ fileName
        yield avatar.move(Helpers.publicPath(option.value + user.id+'/'), fileName)

        if (!avatar.moved()) {
          response.badRequest(avatar.errors())
          return
        }

        // delete old avatar
        if(user.avatar){
           fs.unlink(Helpers.publicPath(user.avatar), (err) => {});
        }

        user.avatar = path_upload
        yield user.save()
       response.json({ status: true , data : user ,message: Antl.formatMessage('messages.update_success')})
      }catch(e){
        response.json({ status: false ,error : true, message: Antl.formatMessage('messages.error')+' ' + e.message})
      }

 }
}
module.exports = UserController
