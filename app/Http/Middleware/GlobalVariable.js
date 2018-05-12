'use strict'

const Timeline = use('App/Model/Timeline')
const Option = use('App/Model/Option')
const User = use('App/Model/User')
const Menu = use('App/Model/Menu')
const Shift = use('App/Model/Shift')
const HistoryAction = use('App/Model/HistoryAction')
const Chat = use('App/Model/Chat')
class GlobalVariable {

* handle (request, response, next) {
    // options
    const option = yield Option.query().where("code","MAX_TIMELINE").first()
    // Timeline
    const timeline = yield Timeline.query().innerJoin('users', 'users.id', 'timeline.user_id').orderBy('timeline.created_at', 'desc').limit(option.value).select('timeline.*','users.username').fetch()
    response.viewInstance.global('timeline', timeline.toJSON())
    // User All
    const users = yield User.all()
    response.viewInstance.global('users', users.toJSON())
    if(request.currentUser){
      // Chat
      const chat = yield Chat.query().innerJoin('users', 'users.id', 'chat.user_send').where('chat.user_receipt',request.currentUser.id).select('chat.*','users.username','users.avatar').pick(15)
      response.viewInstance.global('chat', chat.toJSON())
      // HistoryAction
      const history_action = yield HistoryAction.query().where('user',request.currentUser.id).pick(15)
      response.viewInstance.global('history_action', history_action.toJSON())
    }
    // Menu all
    const menu = yield Menu.all()
    response.viewInstance.global('menu', menu.toJSON())

    // Shift
    const shiftId = yield request.session.get('shiftId')
    const shift = yield Shift.find(shiftId)
    response.viewInstance.global('shift', shift)
    //
    yield next
  }

}

module.exports = GlobalVariable
