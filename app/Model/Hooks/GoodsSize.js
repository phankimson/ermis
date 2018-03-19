'use strict'

const GoodsSize = exports = module.exports = {}

GoodsSize.methodName = function * (next) {
  // {this} belongs to model instance
  yield next
}

GoodsSize.validate = function * (next) {
  if(!this.price){
    throw new Error('Price is required')
  }else if(!this.purchase_price){
    throw new Error('Purchase Price is required')
  }else if(!this.barcode){
    throw new Error('Barcode Price is required')
  }
  yield next
}
