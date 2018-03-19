var Charts = function () {
        var mg_linked_charts_id1 = '#mg_chart_linked_revenue',
            mg_linked_charts_id2 = '#mg_chart_linked_cost';
  var initChartsCostRevenue = function(data1,data2){
    // linked charts
    setTimeout(function(){
          mg_linked_charts_id1_height = $(mg_linked_charts_id1).height(),
          mg_linked_charts_id2_height = $(mg_linked_charts_id2).height();

        if ($(mg_linked_charts_id1).length && $(mg_linked_charts_id2).length) {
          var mg_linked_charts_id1_width = $(mg_linked_charts_id1).width(),
              mg_linked_charts_id2_width = $(mg_linked_charts_id2).width();

              data = MG.convert.date(data1, 'date');
              MG.data_graphic({
                  data: data,
                  linked: true,
                  width: mg_linked_charts_id1_width,
                  height: mg_linked_charts_id1_height,
                  xax_count: 4,
                  target: mg_linked_charts_id1
              });

              data = MG.convert.date(data2, 'date');
              MG.data_graphic({
                  data: data,
                  area: false,
                  linked: true,
                  width: mg_linked_charts_id2_width,
                  height: mg_linked_charts_id2_height,
                  xax_count: 4,
                  target: mg_linked_charts_id2
              });

        }

     }, 100);


  }
  var ch_distributed_series = '';
  var initChartlist = function(data5){
    setTimeout(function(){
      // distributed series
      ch_distributed_series = new Chartist.Bar('#chartist_distributed_series', {
          labels: data5.labels,
          series: data5.series
      }, {
          distributeSeries: true
      });
     }, 100);
  }

  var initChartlistCustomer = function(data4){
    var data = {
      labels: data4.labels,
      series: data4.series
    };


    var options = {
        labelInterpolationFnc: function(value) {
            return value[0]
        }
    };

    var responsiveOptions = [
        ['screen and (max-width: 767px)', {
            chartPadding: 50,
            labelOffset: 50,
            labelDirection: 'explode',
            labelInterpolationFnc: function(value) {
                return value;
            }
        }],
        ['screen and (min-width: 768px)', {
            chartPadding: 30,
            labelOffset: 60,
            labelDirection: 'explode',
            labelInterpolationFnc: function(value) {
                return value;
            }
        }],
        ['screen and (min-width: 1024px)', {
            labelOffset: 55,
            chartPadding: 30
        }]
    ];
      setTimeout(function(){
    var ch_pie_custom_labels = new Chartist.Pie('#chartist_pie_custom_labels', data, options, responsiveOptions);
    $window.on('resize',function() {
        ch_pie_custom_labels.update();
    });
    //
     }, 100);
  }
  var initChartDefault = function(data3){
    // simple pie chart
    var data = {
      series: data3.series
    };

    var sum = function(a, b) { return a + b };

    var ch_simple_pie = new Chartist.Pie('#chartist_simple_pie', data, {
        labelInterpolationFnc: function(value) {
          var index = -1
          var filteredObj = data.series.find(function(item, i){
          if(item === value){
            index = i;
            return i;
          }
          });
            return data3.labels[index]+ ' ' +Math.round(value / data.series.reduce(sum) * 100) + '%' ;
        }
    });
    $window.on('resize',function() {
        ch_simple_pie.update();
    });
  }
  // date range

  var $dp_start = $('#uk_dp_start'),
      $dp_end = $('#uk_dp_end');
  var date_range =  function() {

      var start_date = UIkit.datepicker($dp_start, {
          format:'DD.MM.YYYY'
      });

      var end_date = UIkit.datepicker($dp_end, {
          format:'DD.MM.YYYY'
      });

      $dp_start.on('change',function() {
          end_date.options.minDate = $dp_start.val();
          setTimeout(function() {
              $dp_end.focus();
          },300);
      });

      $dp_end.on('change',function() {
          start_date.options.maxDate = $dp_end.val();
      });
  }

  var initGetData = function(){
    var obj = {};
     obj.start_date = $dp_start.val();
     obj.end_date = $dp_end.val();
     obj.inventory = jQuery("#stock").val();
     var postdata = { data: JSON.stringify(obj) };
     RequestURLWaiting('charts-get', 'json', postdata, function (result) {
         if (result.status === true) {
           initChartsCostRevenue(result.revenue,result.cost)
           initChartDefault(result.gender);
           initChartlistCustomer(result.goods);
           initChartlist(result.size)
         }else {
             kendo.alert(result.message);
         }
     }, true);
  }

  var initStatus = function(){
    jQuery("#get_data").on("click",initGetData);
    $window.on('debouncedresize', function () {
        initChartsCostRevenue();
    })

    $window.on('resize',function() {
        ch_distributed_series.update();
    });
  }
    return {

        init: function () {
          date_range();
          initChartsCostRevenue(Charts.revenue,Charts.cost);
          initChartlist(Charts.size);
          initChartlistCustomer(Charts.goods);
          initChartDefault(Charts.gender);
          initStatus();
        }

    };

}();

jQuery(document).ready(function () {
    Charts.init();
});
