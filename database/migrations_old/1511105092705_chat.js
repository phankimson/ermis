'use strict'

const Schema = use('Schema')

class ChatTableSchema extends Schema {

  up () {
    this.create('chat', (table) => {
      table.increments()
      table.string('user_send').notNullable()
      table.string('user_receipt').notNullable()
      table.string('message',255).notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('chat')
  }

}

module.exports = ChatTableSchema
