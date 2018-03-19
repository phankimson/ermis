'use strict'
const HistoryAction = use('App/Classes/HistoryAction')

class HomeController{
    * index (request, response){
        const index = yield response.view('index')
        response.send(index)
    }

    * show (request, response){
        const index = yield response.view('manage.pages.index')
        response.send(index)
    }

     * login (request, response){
        const session = request.currentUser
        if(!session){
        const index = yield response.view('login')
        response.send(index)
        }else{
        response.redirect('index')
        }
    }
      * register(request, response) {
        const index = yield response.view('register')
        response.send(index)
    }

    * profile(request, response) {
      const index = yield response.view('profile')
      response.send(index)
  }

       * logout(request, response) {
         // Lưu lịch sử
         let hs = new HistoryAction()
         var rs = hs.insertRecord(0,request.currentUser.id,0,'')
         yield rs.save()
         //
        yield request.auth.logout()
        yield request.session.forget('inventory')
        yield request.session.forget('shiftId')
        return response.redirect('/')
    }

     * block (request, response){
        const index = yield response.view('block')
        response.send(index)
    }

}
module.exports = HomeController
