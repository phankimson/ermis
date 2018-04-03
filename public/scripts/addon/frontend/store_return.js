var Ermis = function () {
  var $kGrid = jQuery('#grid');
  var voucher = '';
  var dataId = '';
  var c = false;
  var room = [];

  var initWsConnectRoom = function(){
    var client = Client.connect('data')
    room = Client.joinRoom(client,Ermis.room)
  }

  var initStatus = function (status){
    var action =  jQuery("#form-action");
    shortcut.add(key + "S", function (e) { initCancel(e); });
    shortcut.add(key + "C", function (e) { initReturnPayment(e); });
    if(status == 0){
     action.find('input[name="voucher"]').val(voucher);
     action.find('input[name="date_voucher"]').val(moment().format('DD/MM/YYYY'));
     action.find('input[name="description"]').val(transText.pay_daily+' - '+moment().format('DD/MM/YYYY'));
     jQuery(".cancel").on("click",initCancel)
     jQuery(".payment").on("click",initReturnPayment)
    //jQuery("#barcode").on("blur",initScanBarcode)
    //jQuery("#voucher").on("blur",initBlurSaleInvoice)
    jQuery(".print").addClass('disabled').attr("readonly","readonly");
    jQuery(".print").off('click');
  }else if(status == 1){//Cancel
    jQuery("#form-load").find('input','select').val("");
    action.find('input[name="total_number"],input[name="discount_percent"],input[name="discount"],input[name="discount_percent_special"],input[name="discount_special"],input[name="total_amount"]').val("");
    action.find('input[name="voucher"]').val(voucher);
    jQuery("#voucher").val("");
    jQuery('select[name="subject"]').data("kendoDropDownList").value(1)
    action.find('input[name="description"]').val(transText.pay_daily+' - '+moment().format('DD/MM/YYYY'));
    var grid = $kGrid.data('kendoGrid');
    grid.dataSource.data([]);
      }
  }

  var initLoadBill = function(data){
    dataId = data.id;
    var load = jQuery("#form-load");
    load.find('input[name="voucher"]').val(data.voucher);
    load.find('input[name="date_voucher"]').val(FormatDate(data.date_voucher));
    load.find('input[name="description"]').val(data.description);
    load.find('input[name="total_number"]').val(FormatNumber(data.total_number));
    load.find('input[name="total_amount"]').val(FormatNumber(data.payment.total_amount));
    jQuery('input[name="discount_percent"]').val(data.discount_percent);
    jQuery('input[name="discount"]').val(FormatNumber(data.discount));
    jQuery('input[name="discount_percent_special"]').val(data.payment.discount_percent);
    jQuery('input[name="discount_special"]').val(FormatNumber(data.payment.discount));
    load.find('input[name="payment"]').val(FormatNumber(data.payment.payment));
    load.find('input[name="refund"]').val(FormatNumber(data.payment.refund));
    jQuery('select[name="subject"]').data('kendoDropDownList').value(data.subject);
    var grid = $kGrid.data('kendoGrid');
    grid.dataSource.data([]);
    if(data.detail.length > 0){
      c = true;
      grid.dataSource.data(data.detail);
    }
  }

  var initBlurSaleInvoice = function(e){
    var $this = e.currentTarget ? e.currentTarget : e
    var obj = jQuery($this).val();
    if(obj){
      var postdata = { data: JSON.stringify(obj) };
      RequestURLWaiting(Ermis.link+'-find', 'json', postdata, function (result) {
          if (result.status === true) {
          if(result.data){
              initLoadBill(result.data)
          }else{
              initStatus(1)
          }
          }else{
              kendo.alert(result.message);
          }
      }, true);
    }
  }

  var initReturnPayment = function(e){
    var jQuerylink = jQuery(e.target);
    e.preventDefault();
    if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
        $.when(KendoUiConfirm(transText.are_you_sure, transText.message)).then(function (confirmed) {
            if (confirmed) {
                var load = jQuery("#form-action");
                var obj = {};
                obj.id = dataId;
                obj.description = load.find('input[name="description"]').val();
                obj.total_number = ConvertNumber(jQuery('#quantity_total').text());
                obj.total_amount = ConvertNumber(jQuery('#amount_total').text());
                obj.total_amount_payment = ConvertNumber(load.find('input[name="total_amount"]').val());
                obj.detail = $kGrid.data("kendoGrid").dataSource.data();
                if(obj.detail.length >0 && obj.total_number > 0){
                  var postdata = { data: JSON.stringify(obj)};
                  RequestURLWaiting(Ermis.link+'-payment', 'json', postdata, function (result) {
                      if (result.status === true) {
                         kendo.alert(result.message);
                          var inventory_name = jQuery('#time_shift').find('span').eq(0).text().split('-');
                         room.emit('client-send-invoice', { d :result.general , v : result.voucher , obj : obj , i : inventory_name[0]})
                         initStatus(1);
                      } else {
                         kendo.alert(result.message);
                      }
                  }, true);
                }else{
                    kendo.alert(transText.return_is_missing);
                }
            }
        });
    }
    jQuerylink.data('lockedAt', +new Date());
  }

  var initCancel = function(){
        initStatus(1);
  }
  var initBindTotalAmount = function(){
    jQuery("#form-action").find("input[name='total_number']").val(jQuery("#quantity_return_total").text());
    var discount_percent = jQuery("input[name='discount_percent']").val();
    var discount = ConvertNumber(jQuery("input[name='discount']").val());
    var discount_percent_special = jQuery("input[name='discount_percent_special']").val();
    var discount_special = ConvertNumber(jQuery("input[name='discount_special']").val());
    var amount = ConvertNumber(jQuery("#amount_total").text()) * (1-(discount_percent_special/100)) - ConvertNumber(discount_special);
    jQuery("#form-action").find("input[name='total_amount']").val(FormatNumber(amount));
  }

  var initScanBarcode = function(e){
    var $this = e.currentTarget ? e.currentTarget : e
    var jQuerylink = jQuery(e.target);
    if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
    var obj = {};
    obj.value = jQuery($this).val()?jQuery($this).val():jQuery($this).attr("data-id");
    obj.id = dataId;
    if(obj.value){
      var postdata = { data: JSON.stringify(obj) };
      RequestURLWaiting(Ermis.link+'-scan', 'json', postdata, function (result) {
          if (result.status === true) {
            var i = result.data;
            var grid = $kGrid.data("kendoGrid");
            var dataItem  = grid.dataSource.get(i.id);
            if(dataItem){
              var row = grid.tbody.find("tr[data-uid='" + dataItem.uid + "']");
              var selectedItem = grid.dataItem(row);
             if(dataItem.quantity_receipt < dataItem.quantity){
                  selectedItem.set("quantity_receipt", dataItem.quantity_receipt + 1);
                  initBindTotalAmount();
                }else{
                  kendo.alert(transText.quantity_receipt_alert);
                }
            }
            setTimeout(function() {
              jQuery($this).val("");
              jQuery($this).focus();
            }, 1);
          }else{
              kendo.alert(result.message);
          }
      }, true);
    }
  }
  jQuerylink.data('lockedAt', +new Date());
  }

    var initKendoGrid = function () {
        dataSource = new kendo.data.DataSource({
            data: Ermis.data,
            aggregate: Ermis.aggregate,
            batch: true,
            pageSize: 20,
            schema: {
                model: {
                    id: "id",
                    fields: Ermis.field
                }
            }
        });
        var initKendoUiDropList = function () {
            jQuery(".droplist").kendoDropDownList({
                filter: "startswith"
            });
        };
        var grid = $kGrid.kendoGrid({
            dataSource: dataSource,
            save: function (data) {
                var grid = this;
                setTimeout(function () {
                    grid.refresh();
                });
            },
            dataBound: onDataBound,
            beforeEdit: onBeforeEdit,
            editable: {
                confirmation: false // the confirmation message for destroy command
            },
            height: jQuery(window).height() * 0.5,
            columns: Ermis.columns
        });
        grid.data("kendoGrid").thead.kendoTooltip({
          filter: "th",
          content: function (e) {
              var target = e.target; // element for which the tooltip is shown
              return $(target).text();
          }
      });
    };

    function onDataBound(e) {
              var data = e.sender.dataSource.data();
              if(data.length > 0){
                var model = e.sender.dataSource.at(0);
                if(model){
                model.fields["quantity"].editable = true;
                }
                jQuery.each(data, function (i, v) {
                    if(v){
                        if(c == true){
                        var q = v.quantity - v.quantity_receipt;
                            setTimeout(function() {
                            v.set("edit", true);
                            v.set("quantity", q);
                            v.set("quantity_receipt", 0);
                            c = false;
                            });

                      }
                    }
                });
              }

          }
    function onBeforeEdit(e){
      var data = e.sender.dataSource.at(0);
      data.fields["quantity"].editable = false;
    }

    var initVoucherMasker = function () {
        var data = Ermis.voucher;
        var char = 'x';
        var number = parseInt(data.length_number);
        if (data.suffixed) {
            voucher = data.prefix + char.repeat(number) + data.suffixed;
        } else {
            voucher = data.prefix + char.repeat(number);
        }
    };

  var initKendoUiNumber = function () {
      $(".number").kendoNumericTextBox({
          format: "n0",
          step: 1
      });
  }
  var initKendoUiNumberPrice = function () {
      $(".number-price").kendoNumericTextBox({
          format: "n0",
          step: 1000,
          min : 0
      });
  }

  var initKendoUiPercent = function () {
      $(".percent").kendoNumericTextBox({
          format: "n0",
          max : 100,
          min : 0
      });
  }
  var initKendoUiDropList = function () {
      jQuery(".droplist").kendoDropDownList({
          filter: "startswith"
      });
  };

  QuantityEditor = function(container, options){
    // create an input element
            var input = $("<input name='" + options.field + "'/>");
            // append it to the container
            input.appendTo(container);
            // initialize a Kendo UI numeric text box and set max value
            input.kendoNumericTextBox({
                max: options.model.quantity,
                min: 0
            });
            input.bind("change",function(){
              setTimeout(function(){ initBindTotalAmount(); }, 100);
            })
  };

  QREditable = function(dataItem){
    return dataItem.quantity_receipt < dataItem.quantity;
  };


        calculatePriceAggregateDiscount = function () {
            var grid = $kGrid.data("kendoGrid");
            var data = grid.dataSource.data();
            var discount_percent = jQuery('input[name="discount_percent"]').val();
            var discount = jQuery('input[name="discount"]').val();
            if(discount_percent == null){
              discount_percent = 0;
            }
            if(discount == null){
              discount = 0;
            }
            var total = 0;
            for (var i = 0; i < data.length; i++) {
              if(data[i].discount_percent == null){
                data[i].discount_percent = 0;
              }
              if(data[i].discount == null){
                data[i].discount = 0;
              }
                if (data[i].quantity > 0 && data[i].price > 0) {
                    var check = data[i].price.toString().indexOf(",");
                    if (data[i].price !== 0 && check !== -1) {
                        data[i].price = data[i].price.replace(/\,/g, "");
                    }
                    total += data[i].quantity * data[i].price*(1-(data[i].discount_percent/100))-data[i].discount;
                }else if(data[i].quantity > 0 && data[i].purchase_price > 0){
                  var check = data[i].purchase_price.toString().indexOf(",");
                  if (data[i].purchase_price !== 0 && check !== -1) {
                      data[i].purchase_price = data[i].purchase_price.replace(/\,/g, "");
                  }
                    total += (data[i].quantity * data[i].purchase_price)*(1-(data[i].discount_percent/100))-data[i].discount;
                }
            }
            total = total * (1-(discount_percent/100)) - discount
            return kendo.toString(total, 'n0');
        };

        calculateQuantityReturn = function () {
            var grid = $kGrid.data("kendoGrid");
            var data = grid.dataSource.data();
            var discount_percent = jQuery('input[name="discount_percent"]').val();
            var discount = jQuery('input[name="discount"]').val();
            if(discount_percent == null){
              discount_percent = 0;
            }
            if(discount == null){
              discount = 0;
            }
            var total = 0;
            for (var i = 0; i < data.length; i++) {
              if(data[i].discount_percent == null){
                data[i].discount_percent = 0;
              }
              if(data[i].discount == null){
                data[i].discount = 0;
              }
                if (data[i].quantity_receipt > 0 && data[i].price > 0) {
                    var check = data[i].price.toString().indexOf(",");
                    if (data[i].price !== 0 && check !== -1) {
                        data[i].price = data[i].price.replace(/\,/g, "");
                    }
                    total += data[i].quantity_receipt * data[i].price*(1-(data[i].discount_percent/100))-data[i].discount;
                }else if(data[i].quantity_receipt > 0 && data[i].purchase_price > 0){
                  var check = data[i].purchase_price.toString().indexOf(",");
                  if (data[i].purchase_price !== 0 && check !== -1) {
                      data[i].purchase_price = data[i].purchase_price.replace(/\,/g, "");
                  }
                    total += (data[i].quantity_receipt * data[i].purchase_price)*(1-(data[i].discount_percent/100))-data[i].discount;
                }
            }
            total = total * (1-(discount_percent/100)) - discount
            return kendo.toString(total, 'n0');
        };
  calculateAmountDiscount = function (quantity, price , discount_percent , discount) {
      var check = price.toString().indexOf(",");
      if (price !== 0 && check !== -1) {
          price = price.replace(/\,/g, "");
      }
      if(discount_percent == null){
        discount_percent = 0;
      }
      if(discount == null){
        discount = 0;
      }
      amount = (quantity * price)*(1-(discount_percent/100))-discount;
      return kendo.toString(amount, 'n0');
  };
  var initKeyCode = function () {
      jQuery(document).keyup(function (e) {
          if (e.keyCode === 13) {
            if(e.target.id == "barcode"){
              initScanBarcode(e.target);
            }else if(e.target.id == "voucher"){
              initBlurSaleInvoice(e.target);
            }
          }
      });
  };

    return {

        init: function () {
          initKendoGrid();
          initVoucherMasker();
          initStatus(0);
          initKendoUiNumber();
          initKendoUiNumberPrice();
          initKendoUiPercent();
          initKendoUiDropList();
          initKeyCode();
          initWsConnectRoom();
        }

    };

}();

jQuery(document).ready(function () {
    Ermis.init();
});
