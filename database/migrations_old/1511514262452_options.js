'use strict'

const Schema = use('Schema')

class OptionsTableSchema extends Schema {

  up () {
    this.create('options', (table) => {
      table.increments()
      table.string('code', 60)
      table.string('title', 100)
      table.string('value', 60)
      table.string('value1', 60)
      table.string('value2', 60)
      table.string('value3', 60)
      table.string('value4', 60)
      table.timestamps()
    })
  }

  down () {
    this.drop('options')
  }

}

module.exports = OptionsTableSchema
