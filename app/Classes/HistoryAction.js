'use strict'

const HistoryActionModel = use('App/Model/HistoryAction')

class HistoryAction {

  insertRecord (type,user,menu,data) {
      const result = new HistoryActionModel()
          result.type = type
          result.user = user
          result.menu = menu
          result.data = data
          return result
  }

}

module.exports = HistoryAction
