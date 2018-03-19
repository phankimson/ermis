'use strict'

const Schema = use('Schema')

class HistoryActionTableSchema extends Schema {

  up () {
    this.create('history_action', (table) => {
      table.increments()
      table.string('type')
      table.string('user_id').notNullable()
      table.string('menu_id').notNullable()
      table.string('data').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('history_action')
  }

}

module.exports = HistoryActionTableSchema
