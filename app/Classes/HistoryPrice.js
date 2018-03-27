'use strict'

const HistoryPriceModel = use('App/Model/HistoryPrice')

class HistoryPrice {

  insertRecord (goods_size,type,price) {
      const result = new HistoryPriceModel()
          result.goods_size = goods_size
          result.type = type
          result.price = price
          return result
  }

}

module.exports = HistoryPrice
