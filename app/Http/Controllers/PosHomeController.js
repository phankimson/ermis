'use strict'
const Inventory = use('App/Model/Inventory')
const Detail = use('App/Model/PosDetail')
const Option = use('App/Model/Option')  // EDIT
const Antl = use('Antl')
const GoodsInventoryController = use('App/Http/Controllers/GoodsInventoryController')

var moment = require('moment')
class PosHomeController{

    * show (request, response){
        const inventory = yield Inventory.query().where('active',1).fetch()
        // Lấy doanh thu tất cả kho
        const date_range = yield Option.query().where("code","DATE_RANGE_CHART").first()
        const end_date = moment().format('DD/MM/YYYY')
        const start_date = moment().subtract((date_range.value - 1), 'days').format('DD/MM/YYYY')
        var revenue = []
        var cost =[]
        const data1 = yield Detail.query()
       .innerJoin('pos_general', 'pos_general.id', 'pos_detail.general_id')
       .whereIn('pos_general.type',[4,5])
       .where('pos_general.active', 1).whereIn('pos_general.status',[1,2])
       .whereBetween('pos_general.date_voucher',[moment(start_date , "YYYY-MM-DD").format('YYYY-MM-DD'),moment(end_date , "YYYY-MM-DD").format('YYYY-MM-DD') ])
       .groupBy('pos_general.date_voucher').select('pos_general.date_voucher as date').sum('pos_detail.amount as amount').sum('pos_detail.purchase_amount as purchase_amount')

         for(var d of data1){
           revenue.push({date : moment(d.date).add(1, 'days').format('YYYY-MM-DD'),
                        value : d.amount
                   })
           cost.push({date : moment(d.date).add(1, 'days').format('YYYY-MM-DD'),
                        value : d.purchase_amount
                   })
         }
         const data2 = yield Detail.query()
        .innerJoin('pos_general', 'pos_general.id', 'pos_detail.general_id')
        .innerJoin('goods_size', 'goods_size.id', 'pos_detail.item_id')
        .innerJoin('size', 'size.id', 'goods_size.size')
        .whereIn('pos_general.type',[4,5])
        .where('pos_general.active', 1).whereIn('pos_general.status',[1,2])
        .whereBetween('pos_general.date_voucher',[moment(start_date , "YYYY-MM-DD").format('YYYY-MM-DD'),moment(end_date , "YYYY-MM-DD").format('YYYY-MM-DD') ])
        .groupBy('goods_size.size').select('size.name').sum('pos_detail.quantity as quantity').orderBy('pos_detail.quantity','desc')
        var labels = []
        var series = []
        var size = {}
        for(var d of data2){
          labels.push(d.name)
          series.push(d.quantity)
        }
        size.labels = labels
        size.series = series

        const data3 = yield Detail.query()
       .innerJoin('pos_general', 'pos_general.id', 'pos_detail.general_id')
       .innerJoin('goods_size', 'goods_size.id', 'pos_detail.item_id')
       .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
       .whereIn('pos_general.type',[4,5])
       .where('pos_general.active', 1).whereIn('pos_general.status',[1,2])
       .whereBetween('pos_general.date_voucher',[moment(start_date , "YYYY-MM-DD").format('YYYY-MM-DD'),moment(end_date , "YYYY-MM-DD").format('YYYY-MM-DD') ])
       .groupBy('goods_size.goods').select('marial_goods.name').sum('pos_detail.quantity as quantity').orderBy('quantity','desc')
       var labels1 = []
       var series1 = []
       var goods = {}
       for(var d of data3){
         labels1.push(d.name)
         series1.push(d.quantity)
       }
       goods.labels = labels1
       goods.series = series1

       const data4 = yield Detail.query()
      .innerJoin('pos_general', 'pos_general.id', 'pos_detail.general_id')
      .innerJoin('goods_size', 'goods_size.id', 'pos_detail.item_id')
      .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
      .innerJoin('gender', 'gender.id', 'marial_goods.gender')
      .whereIn('pos_general.type',[4,5])
      .where('pos_general.active', 1).whereIn('pos_general.status',[1,2])
      .whereBetween('pos_general.date_voucher',[moment(start_date , "YYYY-MM-DD").format('YYYY-MM-DD'),moment(end_date , "YYYY-MM-DD").format('YYYY-MM-DD') ])
      .groupBy('marial_goods.gender').select('gender.name').sum('pos_detail.quantity as quantity').orderBy('quantity','desc')
      var labels2 = []
      var series2 = []
      var gender = {}
      for(var d of data4){
        labels2.push(d.name)
        series2.push(d.quantity)
      }
      gender.labels = labels2
      gender.series = series2

        const index = yield response.view('pos.pages.index',{ stock: inventory.toJSON() ,end_date :end_date,start_date:start_date, revenue : revenue , cost : cost, gender : gender , size : size, goods : goods})
        response.send(index)
    }
    * get (request, response){
      try {
       const data = JSON.parse(request.input('data'))

       const data1 = yield Detail.query()
      .innerJoin('pos_general', 'pos_general.id', 'pos_detail.general_id')
      .whereIn('pos_general.type',[4,5])
      .where('pos_general.active', 1).whereIn('pos_general.status',[1,2])
      .TypeWhere('pos_general.inventory_id',data.inventory)
      .whereBetween('pos_general.date_voucher',[moment(data.start_date  , "DD/MM/YYYY").format('YYYY-MM-DD'),moment(data.end_date, "DD/MM/YYYY").format('YYYY-MM-DD') ])
      .groupBy('pos_general.date_voucher').select('pos_general.date_voucher as date').sum('pos_detail.amount as amount').sum('pos_detail.purchase_amount as purchase_amount')
      var revenue = []
      var cost =[]
        for(var d of data1){
          revenue.push({date : moment(d.date).add(1, 'days').format('YYYY-MM-DD'),
                       value : d.amount
                  })
          cost.push({date : moment(d.date).add(1, 'days').format('YYYY-MM-DD'),
                       value : d.purchase_amount
                  })
        }

        const data2 = yield Detail.query()
       .innerJoin('pos_general', 'pos_general.id', 'pos_detail.general_id')
       .innerJoin('goods_size', 'goods_size.id', 'pos_detail.item_id')
       .innerJoin('size', 'size.id', 'goods_size.size')
       .whereIn('pos_general.type',[4,5])
       .where('pos_general.active', 1).whereIn('pos_general.status',[1,2])
       .TypeWhere('pos_general.inventory_id',data.inventory)
       .whereBetween('pos_general.date_voucher',[moment(data.start_date, "DD/MM/YYYY" ).format('YYYY-MM-DD'),moment(data.end_date, "DD/MM/YYYY").format('YYYY-MM-DD') ])
       .groupBy('goods_size.size').select('size.name').sum('pos_detail.quantity as quantity').orderBy('pos_detail.quantity','desc')
       var labels = []
       var series = []
       var size = {}
       for(var d of data2){
         labels.push(d.name)
         series.push(d.quantity)
       }
       size.labels = labels
       size.series = series

       const data3 = yield Detail.query()
      .innerJoin('pos_general', 'pos_general.id', 'pos_detail.general_id')
      .innerJoin('goods_size', 'goods_size.id', 'pos_detail.item_id')
      .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
      .whereIn('pos_general.type',[4,5])
      .where('pos_general.active', 1).whereIn('pos_general.status',[1,2])
      .TypeWhere('pos_general.inventory_id',data.inventory)
      .whereBetween('pos_general.date_voucher',[moment(data.start_date, "DD/MM/YYYY" ).format('YYYY-MM-DD'),moment(data.end_date, "DD/MM/YYYY" ).format('YYYY-MM-DD') ])
      .groupBy('goods_size.goods').select('marial_goods.name').sum('pos_detail.quantity as quantity').orderBy('quantity','desc')
      var labels1 = []
      var series1 = []
      var goods = {}
      for(var d of data3){
        labels1.push(d.name)
        series1.push(d.quantity)
      }
      goods.labels = labels1
      goods.series = series1

      const data4 = yield Detail.query()
     .innerJoin('pos_general', 'pos_general.id', 'pos_detail.general_id')
     .innerJoin('goods_size', 'goods_size.id', 'pos_detail.item_id')
     .innerJoin('marial_goods', 'marial_goods.id', 'goods_size.goods')
     .innerJoin('gender', 'gender.id', 'marial_goods.gender')
     .whereIn('pos_general.type',[4,5])
     .where('pos_general.active', 1).whereIn('pos_general.status',[1,2])
     .TypeWhere('pos_general.inventory_id',data.inventory)
     .whereBetween('pos_general.date_voucher',[moment(data.start_date, "DD/MM/YYYY").format('YYYY-MM-DD'),moment(data.end_date, "DD/MM/YYYY").format('YYYY-MM-DD') ])
     .groupBy('marial_goods.gender').select('gender.name').sum('pos_detail.quantity as quantity').orderBy('quantity','desc')
     var labels2 = []
     var series2 = []
     var gender = {}
     for(var d of data4){
       labels2.push(d.name)
       series2.push(d.quantity)
     }
     gender.labels = labels2
     gender.series = series2

     response.json({ status: true ,  revenue : revenue , cost : cost, gender : gender , size : size, goods : goods })

     } catch (e) {
     response.json({ status: false , message: Antl.formatMessage('messages.no_data_found')})
     }
    }

     * login (request, response){
        const session = request.currentUser
        if(!session){
        const inventory = yield Inventory.query().where('active',1).fetch()
        const index = yield response.view('pos/pages/login',{ inventory: inventory.toJSON() })
        response.send(index)
        }else{
        response.redirect('index')
        }
    }

}
module.exports = PosHomeController
