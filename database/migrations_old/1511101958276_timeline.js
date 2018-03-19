'use strict'

const Schema = use('Schema')

class TimelineTableSchema extends Schema {

  up () {
    this.create('timeline', (table) => {
      table.increments()
      table.string('user_id').notNullable()
      table.string('title',20).notNullable()
      table.string('message',255).notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('timeline')
  }

}

module.exports = TimelineTableSchema
