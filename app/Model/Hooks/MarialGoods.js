'use strict'

const MarialGoods = exports = module.exports = {}

MarialGoods.methodName = function * (next) {
  // {this} belongs to model instance
  yield next
}

MarialGoods.validate = function * (next) {
  if (!this.code) {
    throw new Error('Code is required')
  }else if(!this.name){
    throw new Error('Name is required')
  }else if(!this.price){
    throw new Error('Price is required')
  }else if(!this.purchase_price){
    throw new Error('Purchase Price is required')
  }else if(!this.barcode){
    throw new Error('Barcode Price is required')
  }
  yield next
}
