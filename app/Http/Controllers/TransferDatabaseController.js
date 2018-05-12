'use strict'
const Antl = use('Antl')
const Helpers = use('Helpers')
const Option = use('App/Model/Option')  // EDIT
const ServerModel = use('App/Model/ServerModel')  // EDIT
const ServerMarialGoods = use('App/Model/ServerMarialGoods')  // EDIT
const ServerSize = use('App/Model/ServerSize')  // EDIT
const Model = use('App/Model/Model')  // EDIT
const MarialGoods = use('App/Model/MarialGoods')  // EDIT
const Size = use('App/Model/Size')  // EDIT

var moment = require('moment')
class TransferDatabaseController{
  constructor () {
      this.type = ""  // EDIT
      this.key = "transfer-database"  // EDIT
      this.room = "transfer-database"  // EDIT
    }
  * show (request, response){
      const title = Antl.formatMessage('transfer_database.title')  // EDIT
      const end_date = moment().format('DD/MM/YYYY')
      const show = yield response.view('pos/pages/transfer_database', {key : this.key ,room : this.room,title: title , end_date:end_date })  // EDIT
      response.send(show)
  }
  * sync (request, response){
    try {
      const data = JSON.parse(request.input('data'))
      if(data.model){
        const smg = yield ServerModel.query()
        .whereBetween('updated_at',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD 00:00:00'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD 23:59:59') ])
        .fetch()
        for(var k of smg.toJSON()){
          const mg = yield Model.find(k.id)
          if(mg){
            if(k.created_at != k.updated_at){
              mg.fill(k)
              yield mg.save()
            }
          }else{
            yield Model.create(k)
          }
        }
      }
      if(data.size){
        const smg = yield ServerSize.query()
        .whereBetween('updated_at',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD 00:00:00'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD 23:59:59') ])
        .fetch()
        for(var k of smg.toJSON()){
          const mg = yield Size.find(k.id)
          if(mg){
            if(k.created_at != k.updated_at){
              mg.fill(k)
              yield mg.save()
            }
          }else{
            yield Size.create(k)
          }
        }
      }
      if(data.marial_goods){
        const smg = yield ServerMarialGoods.query()
        .whereBetween('updated_at',[moment(data.start_date , "YYYY-MM-DD").format('YYYY-MM-DD 00:00:00'),moment(data.end_date , "YYYY-MM-DD").format('YYYY-MM-DD 23:59:59') ])
        .fetch()
        for(var k of smg.toJSON()){
          const mg = yield MarialGoods.find(k.id)
          if(mg){
            if(k.created_at != k.updated_at){
              mg.fill(k)
              yield mg.save()
            }
          }else{
            yield MarialGoods.create(k)
          }
        }
      }
      response.json({ status: true , message: Antl.formatMessage('messages.update_success') })
    } catch (e) {
    response.json({ status: false , message: Antl.formatMessage('messages.update_fail') + e.message})
    }
  }


}
module.exports = TransferDatabaseController
