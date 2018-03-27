'use strict'
const Hash = use('Hash')
const Antl = use('Antl')
const User = use('App/Model/User')
const HistoryAction = use('App/Classes/HistoryAction')

class PosShopUserController {

  * login (request, response) {
    const data = JSON.parse(request.input('data'))
    const username = data.username
    const password = data.password
    const shiftId = data.radio
    const captcha = data['g-recaptcha-response']
    try {
    const login = yield request.auth.attempt(username,password)
    if (login  && captcha != "") {
      const user = yield request.auth.getUser()
      if(user.stock_default != 0){
      yield request.session.put({ inventory: user.stock_default , shiftId: shiftId })
      // Lưu lịch sử đăng nhập
      let hs = new HistoryAction()
      var rs = hs.insertRecord(1,user.id,0,'')
      yield rs.save()
      //
      response.json({ status: true , message : Antl.formatMessage('messages.login_success')})
      return
      }else{
        yield request.auth.logout()
        yield request.session.forget('inventory')
        yield request.session.forget('shiftId')
        response.json({ status: false , message: Antl.formatMessage('messages.account_not_inventory')})
        return
      }
    }
    response.json({ status: false , message: Antl.formatMessage('messages.login_fail')})
    return
    } catch (e) {
    response.json({ status: false , message: Antl.formatMessage('messages.login_fail')})
    return
    }
  }
}
module.exports = PosShopUserController
