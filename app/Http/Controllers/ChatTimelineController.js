'use strict'
const Antl = use('Antl')
const Chat = use('App/Model/Chat')
const Timeline = use('App/Model/Timeline')
const Option = use('App/Model/Option')
class ChatTimelineController{
  * timeline(request, response) {
    try{
      const data = JSON.parse(request.input('data'))
      const timeline = new Timeline()
      timeline.user_id = request.currentUser.id
      timeline.title = data.type
      timeline.message = data.message
      yield timeline.save()
      response.json({ status: true })
    }catch(e){
      response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error')+' ' + e.message })
    }
  }
  * chat(request, response) {
    try{
      const data = JSON.parse(request.input('data'))
      const chat = new Chat()
      chat.user_send = request.currentUser.id
      chat.user_receipt = data.user_receipt
      chat.message = data.message
      yield chat.save()
      response.json({ status: true })
    }catch(e){
      response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error')+' ' + e.message })
    }

  }
  * viewMore(request, response) {
    try{
      const page = request.input('data')
      // options
      const option = yield Option.query().where("code","MAX_TIMELINE").first()
      const data = yield Timeline.query().innerJoin('users', 'users.id', 'timeline.user_id').orderBy('timeline.created_at', 'desc').select('timeline.*','users.username').paginate(page,option.value)
      if(data.toJSON().data.length > 0){
        response.json({ status: true , data : data.toJSON().data})
      }else{
        response.json({ status: false , message: Antl.formatMessage('messages.no_data_found')})
      }
    }catch(e){
      response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error')+' ' + e.message })
    }

  }
  * loadChatUser(request, response) {
    try{
      const arr = JSON.parse(request.input('data'))
      const user_session = request.currentUser.id
      const page = arr.page
      const user_receipt = parseInt(arr.user_receipt)
      // options
      const option = yield Option.query().where("code","MAX_LOAD_CHAT").first()
      const data = yield Chat.query().where({user_send : user_receipt , user_receipt : user_session}).orWhere({user_receipt : user_receipt , user_send : user_session}).orderBy('created_at', 'desc').paginate(page,option.value)

      if(data.toJSON().data.length > 0){
        response.json({ status: true , data : data.toJSON().data})
      }else{
        response.json({ status: false , message: Antl.formatMessage('messages.no_data_found')})
      }
    }catch(e){
      response.json({ status: false , error : true ,  message: Antl.formatMessage('messages.error')+' ' + e.message })
    }
  }

}
module.exports = ChatTimelineController
