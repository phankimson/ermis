'use strict'

const Schema = use('Schema')

class HistoryLogsTableSchema extends Schema {

  up () {
    this.create('history_logs', (table) => {
      table.increments()
      table.string('user_id').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('history_logs')
  }

}

module.exports = UsersTableSchema
