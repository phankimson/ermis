'use strict'
const Hash = use('Hash')
const Antl = use('Antl')
const User = use('App/Model/User')
const HistoryAction = use('App/Classes/HistoryAction')

class PosUserController {

  * login (request, response) {
    const data = JSON.parse(request.input('data'))
    const username = data.username
    const password = data.password
    const inventory = data.inventory
    const captcha = data['g-recaptcha-response']
    try {
    const login = yield request.auth.attempt(username,password)
    if (login) {
      const user = yield request.auth.getUser()
      yield request.session.put({ inventory: inventory })
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
    response.json({ status: false , message: Antl.formatMessage('messages.error')+' ' + e.message})
    }
  }
}
module.exports = PosUserController
