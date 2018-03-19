'use strict'
const Antl = use('Antl')
const Helpers = use('Helpers')
const Option = use('App/Model/Option')  // EDIT

class ConfigController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "config"  // EDIT
      this.room = "config"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('config.title')  // EDIT
      const data = yield Option.query().where("active","1").fetch()
      const show = yield response.view('manage/pages/config', {key : this.key ,title: title , data: data.toJSON() })  // EDIT
      response.send(show)
  }
  * cancel (request, response){
    try {
      const data = JSON.parse(request.input('data'))
      const arr = yield Option.query().where("active","1").fetch()
      response.json({ status: true , data : arr.toJSON() })
    } catch (e) {
    response.json({ status: false , message: Antl.formatMessage('messages.no_data')})
    }
  }
  * save (request, response){
    try {
      const data = JSON.parse(request.input('data'))
        for(let k in data){
          var code = k.split("-")
          const option = yield Option.findBy('code',code[0])
          if(code[1] == 1 ){
            option.value = data[k]
          }else if(code[1] == 2){
            option.value1 = data[k]
          }else if(code[1] == 3){
            option.value2 = data[k]
          }else if(code[1] == 4){
            option.value3 = data[k]
          }else if(code[1] == 5){
            option.value4 = data[k]
          }else if(code[1] == 6){
            option.value5 = data[k]
          }
          yield option.save()
        }
      response.json({ status: true , message: Antl.formatMessage('messages.update_success') })
    } catch (e) {
    response.json({ status: false , message: Antl.formatMessage('messages.update_fail')})
    }
  }


}
module.exports = ConfigController
