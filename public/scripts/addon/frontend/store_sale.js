var Ermis = function () {
  var $kGrid = jQuery('#grid');
  var $kGridBarcode = jQuery('#grid_barcode');
  var myWindow1 = jQuery("#form-window-barcode");
  var $kWindow1 = '';
  var myWindow2 = jQuery("#form-window-payment");
  var $kWindow2 = '';
  var voucher = '';
  var dataObj = [];
  var tabs_count = 1;
  var room = [];
  var search = false;

  var initWsConnectRoom = function(){
    var client = Client.connect('data')
    room = Client.joinRoom(client,Ermis.room)
  }

  var initLoadPrintData = function () {
    jQuery.each(Ermis.print_data, function (k, d) {
    var obj = {};
        obj.id = tabs_count;
        obj.voucher = d.voucher;
        obj.detail = d.detail;
        obj.general = d.id;
        obj.discount_percent = d.discount_percent;
        obj.discount = d.discount;
        obj.subject = d.subject;
        obj.description = d.description;
        obj.total_number = d.total_number;
        obj.total_amount = d.total_amount;
        obj.print = true;
      dataObj.push(obj)
      if(k == 0 && k+1 < Ermis.print_data.length ){
        initAddTabs(null,2)
      }else if(k+1 < Ermis.print_data.length){
        initAddTabs(null,0)
      }
      });
      UIkit.switcher('#invoice_tabs').show(1);
  };

  var SearchCoupon = function(){
    jQuery('input[name=coupon_code]').on('blur',function(){
      var obj = {};
      obj.val = jQuery(this).val();
      obj.type = jQuery('input[type=radio][name=coupon_type]:checked').val();
      var postdata = { data: JSON.stringify(obj)};
      RequestURLWaiting(Ermis.link+'-search', 'json', postdata, function (result) {
               if (result.status === true) {
                 if(obj.type == 'coupon'){
                   jQuery('input[name=coupon]').val(FormatNumber(result.data.value));
                   var total_amount = jQuery('input[name="total_amount"]').val()?parseInt(ConvertNumber(jQuery('input[name="total_amount"]').val())):0;
                   var coupon = result.data.value;
                   jQuery('input[name="payment"]').data("kendoNumericTextBox").value(total_amount-coupon);
                   var payment = jQuery('input[name="payment"]').data("kendoNumericTextBox").value();
                   jQuery('input[name="refund"]').val(FormatNumber(payment-total_amount+coupon));
                 }else{
                   if(result.data.discount_percent){
                      jQuery('input[name=discount_percent_special]').data("kendoNumericTextBox").value(result.data.discount_percent);
                   }
                   if(result.data.discount){
                      jQuery('input[name=discount_special]').data("kendoNumericTextBox").value(result.data.discount);
                   }
                   initCaculationDiscount();
                   jQuery("input[name=discount_percent_special]").data("kendoNumericTextBox").enable(false);
                   jQuery("input[name=discount_special]").data("kendoNumericTextBox").enable(false);
                   search = true;
                 }
               }else{
                 kendo.alert(result.message);
               }
          }, true);
    })
  }

  var changeCoupon = function(){
    jQuery('input[type=radio][name=coupon_type]').on('change',function(){
      var v = jQuery(this).val()
      if(v == ''){
        jQuery("input[name=discount_percent_special]").data("kendoNumericTextBox").enable();
        jQuery("input[name=discount_special]").data("kendoNumericTextBox").enable();
        jQuery('.coupon_content').addClass("hidden");
        jQuery('.coupon_code_content').addClass("hidden");
      }else if(v == 'coupon'){
        jQuery('.coupon_content').removeClass("hidden");
        jQuery('.coupon_code_content').removeClass("hidden");
      }else{
        jQuery('.coupon_content').addClass("hidden");
        jQuery('.coupon_code_content').removeClass("hidden");
      }
    })
  }

  var BindItem = function(v){
    jQuery(".item_sub").not('.load_item').remove();
    jQuery.each(v, function (k, d) {
      var copy = jQuery(".item_sub:eq(0)").clone(true);
      copy.removeClass('hidden').removeClass('load_item');
      copy.find('.gallery_grid_item a').not('.add_item').attr('href',d.image?UrlString(d.image):UrlString('images/product.png'));
      copy.find('.gallery_grid_item img').attr('src',d.image?UrlString(d.image):UrlString('images/product.png'));
      copy.find('.add_item').attr('data-id',d.code);
      copy.find('.reduce_item').attr('data-id',d.id);
      copy.find('.gallery_image_title').text(d.code);
      copy.find('.uk-text-muted').text(d.name+'-'+d.size);
      jQuery(".gallery_grid").append(copy);
    });
  }

  var initCaculationDiscount = function(){
    var discount_percent_special = jQuery('input[name="discount_percent_special"]').val()?parseInt(jQuery('input[name="discount_percent_special"]').val()):0;
    var discount_special = jQuery('input[name="discount_special"]').val()?parseInt(jQuery('input[name="discount_special"]').val()):0;
    var total_amount = parseInt(ConvertNumber(jQuery('#amount_total').text()));
    var coupon = parseInt(ConvertNumber(jQuery('input[name="coupon"]').val()));
    jQuery('input[name="total_amount"]').val(FormatNumber(total_amount*(1-(discount_percent_special/100))-discount_special));
    var payment = jQuery('input[name="payment"]').data("kendoNumericTextBox").value();
    jQuery('input[name="refund"]').val(FormatNumber(payment-total_amount*(1-(discount_percent_special/100))-discount_special+coupon));
  }

  var initOpenPayment = function(){
    jQuery("input[name=discount_percent_special]").data("kendoNumericTextBox").enable();
    jQuery("input[name=discount_special]").data("kendoNumericTextBox").enable();
    jQuery("input[name='total_amount']").val(jQuery("#amount_total").text());
    jQuery("input[name='payment']").data("kendoNumericTextBox").value(jQuery("#amount_total").text());
    jQuery('input[name="discount_percent_special"]').val(0);
    jQuery('input[name="discount_special"]').val(0);
    jQuery("input[name='refund']").val(0);
    jQuery("input[name='coupon']").val(0);
    jQuery("input[name='coupon_code']").val("");
    jQuery('#none[name=coupon_type]').prop( "checked", true );
    jQuery('.coupon_content').addClass("hidden");
    jQuery('.coupon_code_content').addClass("hidden");
  }
  var initBlurDiscountPayment = function(){
    jQuery('input[name="discount_percent_special"],input[name="discount_special"]').on("blur",function(){
    initCaculationDiscount();
    })
    jQuery('input[name="payment"]').on("blur",function(){
      var total_amount = jQuery('input[name="total_amount"]').val()?parseInt(ConvertNumber(jQuery('input[name="total_amount"]').val())):0;
      var payment = jQuery('input[name="payment"]').data("kendoNumericTextBox").value();
      var coupon = parseInt(ConvertNumber(jQuery('input[name="coupon"]').val()));
      jQuery('input[name="refund"]').val(FormatNumber(payment-total_amount+coupon));
    })
  }
  var initStatus = function(status){
    if(status == 0){
    //jQuery("#barcode").on("blur",initScanBarcode)
    jQuery(".add_item").on("click",initScanBarcode)
    jQuery(".reduce_item").on("click",initReduceItem)
    jQuery('.barcode').on('click', initBarcodeForm);
    jQuery('#payment').on('click', initPaymentForm);
    jQuery('.cancel-window').on('click', initClose);
    jQuery('#close_tabs').on('click', initCloseTabs);
    jQuery('#add_tabs').on('click', initAddTabs);
    jQuery('.voucher').val(voucher);
    jQuery('input[name="description"]').val(transText.sell_daily+' - '+moment().format('DD/MM/YYYY'));
    jQuery('.agree-payment').on('click', initAgreePayment);
    jQuery('#exchange').data("kendoDropDownList").bind('change',initChangeExChange);
    jQuery("#print").addClass('disabled').attr("readonly","readonly");
    jQuery("#print").off('click');
    }else if(status == 1){ // Add new carts
      jQuery("#print").off('click');
      jQuery("#print").addClass('disabled').attr("readonly");
      jQuery("#print").off('click');
      jQuery('#payment').on('click', initPaymentForm);
      jQuery('#close_tabs').on('click', initCloseTabs);
      jQuery("#payment").removeClass('disabled').removeAttr("readonly");
      jQuery("#close_tabs").removeClass('disabled').removeAttr("readonly");
      jQuery("#form-action").find('input','select').not('input[name="discount_percent"],input[name="discount"],input[name="voucher"]').removeClass('disabled').removeAttr("readonly");
      jQuery('.voucher').val(voucher);
      jQuery('input[name="description"]').val(transText.sell_daily+' - '+moment().format('DD/MM/YYYY'));
      var grid = $kGrid.data('kendoGrid');
      grid.dataSource.data([]);
    }else if(status == 2){ // Payment success
      jQuery('#payment').off('click');
      jQuery('#close_tabs').off('click');
      jQuery("#payment").addClass('disabled').attr("readonly","readonly");
      jQuery("#close_tabs").addClass('disabled').attr("readonly","readonly");
      jQuery("#print").removeClass('disabled').removeAttr("readonly");
      jQuery("#print").on('click',initPrint);
      jQuery("#form-action").find('input','select').addClass('disabled').attr("readonly","readonly");
    }else if(status == 3){ // Change
      jQuery("#print").off('click');
      jQuery("#print").addClass('disabled').attr("readonly");
      jQuery("#print").off('click');
      jQuery('#payment').on('click', initPaymentForm);
      jQuery('#close_tabs').on('click', initCloseTabs);
      jQuery("#payment").removeClass('disabled').removeAttr("readonly");
      jQuery("#close_tabs").removeClass('disabled').removeAttr("readonly");
      jQuery("#form-action").find('input','select').not('input[name="discount_percent"],input[name="discount"],input[name="voucher"]').removeClass('disabled').removeAttr("readonly");
    }else if(status == 4){
      // Payment complete
       jQuery('select[name="payment_method"]').data('kendoDropDownList').value(1);
       jQuery('input[name="discount_percent_special"]').data("kendoNumericTextBox").value(0);
       jQuery('input[name="discount_special"]').data("kendoNumericTextBox").value(0);
       jQuery('input[name="rate"]').val(0);
       jQuery('input[name="total_exchange"]').val(0);
       jQuery('#exchange').data('kendoDropDownList').value(0);
    }
  }
  var getId = function(){
    var id = 0;
     if(jQuery("#tabs_dropdown").hasClass('uk-active')){
        id = jQuery('#tabs_dropdown li.uk-active').attr("data-id");
     }else{
        id = jQuery('#invoice_tabs li.uk-active').attr("data-id");
     }
     return parseInt(id)
  }
  var initLoadDiscountCustomer = function(){
    var subject = $("select[name='subject']").data("kendoDropDownList");
    subject.bind('change', function (e) {
     var dataItem = e.sender.dataItem();
     var postdata = { data: JSON.stringify(dataItem)};
     RequestURLWaiting(Ermis.link+'-customer', 'json', postdata, function (result) {
              if (result.status === true) {
                if(result.data){
                  if(result.data.accumulative == 0){
                    if(result.data.discount > 0){
                      jQuery('input[name=discount]').val(result.data.discount);
                    }
                    if(result.data.discount_percent > 0){
                      jQuery('input[name=discount_percent]').val(result.data.discount_percent);
                    }
                  }else{
                    if(result.data.discount > 0){
                      jQuery('input[name=discount]').val(jQuery('input[name=discount_default]').val()+result.data.discount);
                    }
                    if(result.data.discount_percent > 0){
                      jQuery('input[name=discount_percent]').val(jQuery('input[name=discount_percent_default]').val()+result.data.discount_percent);
                    }
                  }
                }else{
                    jQuery('input[name=discount]').val(jQuery('input[name=discount_default]').val());
                    jQuery('input[name=discount_percent]').val(jQuery('input[name=discount_percent_default]').val());
                }
                var value = parseInt(ConvertNumber(jQuery('#amount_total').text())) - (parseInt(ConvertNumber(jQuery('#amount_total').text())) * jQuery('input[name=discount_percent]').val())/100 + jQuery('input[name=discount]').val();
                jQuery('#amount_total').text(FormatNumber(value))
              }else{
                 kendo.alert(result.message);
              }
         }, true);
    });
  }

  var initPrint = function(e){
    var jQuerylink = jQuery(e.target);
    e.preventDefault();
    if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
    var $kprint = jQuery('#printbill');
    var id = getId();
     var general = 0;
     var filteredObj = dataObj.find(function(item, i){
     if(item.id === id){
       general = item.general;
       return i;
     }
     });

    var postdata = { data: JSON.stringify(general)};
    RequestURLWaiting(Ermis.link+'-print', 'json', postdata, function (result) {
        if (result.status === true) {
          var ret = '';
          jQuery('.customer_p').text(result.data.customer);
          jQuery('.voucher_p').text(result.data.voucher);
          jQuery('.date_p').text(FormatDate(result.data.date_voucher));
          jQuery('.user_p').text(result.data.user);
          jQuery('.shift_p').text(result.data.payment.shift);
          jQuery.each(result.data.detail,function(k,v){
                    ret += '<tr style="text-align: center;font-size:12px"><td>'+v.item_name+'</td><td>'+FormatNumber(v.price)+'</td><td>'+v.quantity+'</td><td>'+FormatNumber(parseInt(v.quantity*v.price))+'</td></tr>';
                    });
                    ret +='<tr style="color:red;font-weight: bold;text-align: center;font-size:12px"><td style="border-top:1px solid black">Tổng cộng</td><td style="border-top:1px solid black"></td><td style="border-top:1px solid black">'+result.data.total_number+'</td><td style="border-top:1px solid black">'+FormatNumber(result.data.total_amount)+'</td></tr>';
                    ret +='<tr style="color:red;font-weight: bold;text-align: center;font-size:12px"><td>Thanh toán</td><td></td><td></td><td>'+FormatNumber(result.data.payment.total_amount)+'</td></tr>';
                    ret +='<tr style="color:red;font-weight: bold;text-align: center;font-size:12px"><td>Tiền thối</td><td></td><td></td><td>'+FormatNumber(result.data.payment.refund)+'</td></tr>';
                    $kprint.find('span').not('.clear').text('');
                    $kprint.find('tbody').append(ret);
                    $kprint.removeClass('hidden');
                    setTimeout(function(){
                    $kprint.print();
                    }, 300);
                    initStatus(1);
                    initRemoveCards(null,id);
                    setTimeout(function(){
                      $kprint.addClass('hidden');
                      $kprint.find('tbody').empty();
                    }, 1000);

          }else{
              kendo.alert(result.message);
          }
    }, true);
    }
    jQuerylink.data('lockedAt', +new Date());
  }

  var initChangeExChange = function(e){
    var data = e.sender.value();
    var postdata = { data: JSON.stringify(data)};
    RequestURLWaiting(Ermis.link+'-exchange', 'json', postdata, function (result) {
        if (result.status === true) {
            var total_amount = ConvertNumber(jQuery('input[name="total_amount"]').val());
            jQuery('input[name="rate"]').val(FormatNumber(result.data.rate));
            jQuery('#date_rate').text(FormatDate(result.data.date));
            jQuery('input[name="total_exchange"]').val(kendo.toString(total_amount/result.data.rate, "n"));
        } else {
           kendo.alert(result.message);
           jQuery('input[name="rate"]').val("");
           jQuery('#date_rate').text("");
           jQuery('input[name="total_exchange"]').val("");
        }
    }, true);
  }

  var initSavePayment = function(comfirm,obj){
    if(comfirm){
      obj.detail = $kGrid.data("kendoGrid").dataSource.data();
      obj.discount_percent = jQuery('input[name="discount_percent"]').val()?jQuery('input[name="discount_percent"]').val():0;
      obj.discount = jQuery('input[name="discount"]').val()?jQuery('input[name="discount"]').val():0;
      obj.subject = jQuery('select[name="subject"]').data('kendoDropDownList').value();
      obj.description = jQuery('input[name="description"]').val();
      obj.total_number = ConvertNumber(jQuery('#quantity_total').text());
      obj.total_amount = ConvertNumber(jQuery('#amount_total').text());
      obj.payment_method = jQuery('select[name="payment_method"]').data("kendoDropDownList").value();
      obj.total_amount_payment = ConvertNumber(jQuery('input[name="total_amount"]').val());
      obj.payment = jQuery('input[name="payment"]').val();
      obj.rate = ConvertNumber(jQuery('input[name="rate"]').val());
      obj.exchange = jQuery('#exchange').data("kendoDropDownList").value()?jQuery('#exchange').data("kendoDropDownList").value():0;
      obj.coupon_code = jQuery('input[name="coupon_code"]').val();
      obj.coupon_type = jQuery('input[type=radio][name=coupon_type]:checked').val();
      obj.total_exchange = jQuery('input[name="total_exchange"]').val();
      var postdata = { data: JSON.stringify(obj)};
      RequestURLWaiting(Ermis.link+'-payment', 'json', postdata, function (result) {
          if (result.status === true) {
             kendo.alert(result.message);
             search = true;
             var inventory_name = jQuery('#time_shift').find('span').eq(0).text().split('-');
             room.emit('client-send-invoice', { d :result.general , v : result.voucher , obj : obj, i : inventory_name[0]})
             initStatus(2);
             $kWindow2.close();
             jQuery('input[name="voucher"]').val(result.voucher);
             var id = getId();
             initUpdateCards(id,result.voucher,result.general)
             initStatus(4)
          } else {
             kendo.alert(result.message);
          }
      }, true);
    }else{
     kendo.alert(transText.you_not_permission_special);
    }
  }

  var initAgreePayment = function(e){
    var jQuerylink = jQuery(e.target);
    e.preventDefault();
    if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
        $.when(KendoUiConfirm(transText.are_you_sure, transText.message)).then(function (confirmed) {
            if (confirmed) {
                var obj = {}; var crit = false; var comfirm = false ;
                obj.refund = ConvertNumber(jQuery('input[name="refund"]').val());
                if(obj.refund >= 0 ){
                  obj.discount_percent_special = jQuery('input[name="discount_percent_special"]').val()?parseInt(jQuery('input[name="discount_percent_special"]').val()):0;
                  obj.discount_special = jQuery('input[name="discount_special"]').val()?parseInt(jQuery('input[name="discount_special"]').val()):0;
                  obj.coupon = ConvertNumber(jQuery('input[name="coupon"]').val()) ? ConvertNumber(jQuery('input[name="coupon"]').val()): 0;
                  if(!Ermis.per.s && (obj.discount_percent_special != 0 || obj.discount_special != 0) && search == false){
                      kendo.prompt(transText.please_tick_barcode).then(function (data) {
                      var checkdata = { data: JSON.stringify(data)};
                      RequestURLWaiting(Ermis.link+'-check', 'json', checkdata, function (result) {
                          if (result.status === true) {
                            comfirm = true ;
                            initSavePayment(comfirm,obj);
                          } else {
                             kendo.alert(result.message);
                          }
                      }, true);
                     })
                  }else{
                      comfirm = true;
                      initSavePayment(comfirm,obj);
                  }

                  }else{
                  kendo.alert(transText.payment_is_missing);
                  }
                }
        });
    }
    jQuerylink.data('lockedAt', +new Date());
  }
  var initUpdateCards = function($id,v,g){
    var index = -1;
    var filteredObj = dataObj.find(function(item, i){
    if(item.id === $id){
      index = i;
      return i;
    }
    });
    if(index >= 0){
      dataObj[index].voucher = v;
      dataObj[index].general = g;
      dataObj[index].print = true;
      dataObj[index].detail = $kGrid.data("kendoGrid").dataSource.data();
      dataObj[index].discount_percent = jQuery('input[name="discount_percent"]').val();
      dataObj[index].discount = jQuery('input[name="discount"]').val();
      dataObj[index].subject = jQuery('select[name="subject"]').data('kendoDropDownList').value();
      dataObj[index].description = jQuery('input[name="description"]').val();
      dataObj[index].total_number = jQuery('#quantity_total').val();
      dataObj[index].total_amount = jQuery('#amount_total').val();
    }else{
        var obj = {};
        obj.id = $id;
        obj.general = g
        obj.voucher = v
        obj.detail = $kGrid.data("kendoGrid").dataSource.data();
        obj.discount_percent = jQuery('input[name="discount_percent"]').val();
        obj.discount = jQuery('input[name="discount"]').val();
        obj.subject = jQuery('select[name="subject"]').data('kendoDropDownList').value();
        obj.description = jQuery('input[name="description"]').val();
        obj.total_number = jQuery('#quantity_total').val();
        obj.total_amount = jQuery('#amount_total').val();
        obj.print = true
        dataObj.push(obj)
    }
  }

  var initAddCards = function($elem,$id){
    var id = parseInt($id?$id:jQuery($elem).attr('data-id'));
    if(dataObj.filter(x => x.id === id ).length > 0){
    var index = -1;
    var filteredObj = dataObj.find(function(item, i){
    if(item.id === id && item.print == false){
      index = i;
      return i;
    }
    });
    if(index >= 0){
      dataObj[index].voucher = jQuery('input[name="voucher"]').val();
      dataObj[index].detail = $kGrid.data("kendoGrid").dataSource.data();
      dataObj[index].discount_percent = jQuery('input[name="discount_percent"]').val();
      dataObj[index].discount = jQuery('input[name="discount"]').val();
      dataObj[index].subject = jQuery('select[name="subject"]').data('kendoDropDownList').value();
      dataObj[index].description = jQuery('input[name="description"]').val();
      dataObj[index].total_number = jQuery('#quantity_total').val();
      dataObj[index].total_amount = jQuery('#amount_total').val();
    }
  }else{
    var obj = {};
        obj.id = id;
        obj.voucher = jQuery('input[name="voucher"]').val();
        obj.detail = $kGrid.data("kendoGrid").dataSource.data();
        obj.discount_percent = jQuery('input[name="discount_percent"]').val();
        obj.discount = jQuery('input[name="discount"]').val();
        obj.subject = jQuery('select[name="subject"]').data('kendoDropDownList').value();
        obj.description = jQuery('input[name="description"]').val();
        obj.total_number = jQuery('#quantity_total').val();
        obj.total_amount = jQuery('#amount_total').val();
        obj.print = false
        obj.general = 0
      dataObj.push(obj)
    }
  }

  var initBindData = function($elem,$id){
    var id = parseInt($id?$id:jQuery($elem).attr('data-id'));
    var data = dataObj.filter(x => x.id === id);
    data = data[0];
    if(data){
      jQuery('input[name="voucher"]').val(data.voucher);
      jQuery('input[name="discount_percent"]').val(data.discount_percent);
      jQuery('input[name="discount"]').val(data.discount);
      jQuery('input[name="description"]').val(data.description);
      jQuery('select[name="subject"]').data('kendoDropDownList').value(data.subject);
      var grid = $kGrid.data('kendoGrid');
      grid.dataSource.data([]);
      if(data.detail.length > 0){
        grid.dataSource.data(data.detail);
    }
      if(data.print == true){
        initStatus(2)
      }else{
        initStatus(3)
      }
  }else{
      initStatus(1)
  }
}

  var initRemoveCards = function($elem,$id){
    var id = parseInt($id?$id:jQuery($elem).attr('data-id'));
    dataObj = dataObj.filter(x => x.id != id)
  }


  var initCloseTabs = function(e){
    var jQuerylink = jQuery(e.target);
    e.preventDefault();
    if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
    $.when(KendoUiConfirm(transText.are_you_sure, transText.message)).then(function (confirmed) {
        if (confirmed) {
      var count_li_tabs = jQuery("#invoice_tabs").find("li").not('#tabs_dropdown').length;
      if(count_li_tabs <= 1 || jQuery("#invoice_tabs li.uk-active").hasClass('load_tabs')){
       kendo.alert(transText.can_not_skip);
     }else{
       var count_li_dropdown = jQuery("#tabs_dropdown").find("li").length;
       if(jQuery('#tabs_dropdown ul li').hasClass('uk-active')){
         jQuery('#tabs_dropdown li.uk-active').remove();
         if(count_li_dropdown  == 1){
           jQuery('#tabs_dropdown_name').text("List");
           jQuery('#tabs_dropdown').addClass("uk-hidden");
           jQuery("#invoice_tabs li").not('.load_tabs').last().addClass('uk-active');
         }else{
           jQuery('#tabs_dropdown_name').text(jQuery('#tabs_dropdown li').last().text());
           jQuery('#tabs_dropdown li').last().addClass('uk-active');
         }
       }else{
         jQuery("#invoice_tabs li.uk-active").not('#tabs_dropdown').remove();
         if(count_li_tabs - count_li_dropdown <= 4 && count_li_dropdown > 1){
          jQuery('#tabs_dropdown li').first().addClass('uk-active').appendTo("#invoice_tabs");
          jQuery('#tabs_dropdown_name').text(jQuery('#tabs_dropdown li').last().text());
        }else if(count_li_tabs - count_li_dropdown <= 4 && count_li_dropdown == 1){
           jQuery('#tabs_dropdown li').first().addClass('uk-active').appendTo("#invoice_tabs");
           jQuery('#tabs_dropdown').addClass('uk-hidden');
         }else{
           UIkit.switcher('#invoice_tabs').show(count_li_tabs-1);
         }

       }
       var id = '';
        if(jQuery("#tabs_dropdown").hasClass('uk-active')){
           id = jQuery('#tabs_dropdown li.uk-active').attr("data-id");
        }else{
           id = jQuery('#invoice_tabs li.uk-active').attr("data-id");
        }
          initBindData(null,id);

     }
   }
 });
  }
  jQuerylink.data('lockedAt', +new Date());
  }
  var initAddTabs = function(e,status){
      var count_li = jQuery("#invoice_tabs").find("li").not('#tabs_dropdown').length;
      var copy = jQuery("#invoice_tabs").find(".load_tabs:eq(0)").clone(true);
      if(status == null){
        initAddCards(null,count_li);
      }
      copy.removeClass("load_tabs , uk-hidden");
      copy.find("a").text(transText.carts+" "+(tabs_count+1));
      copy.attr("data-id",tabs_count+1);
      if(count_li < 4 ){
        jQuery("#invoice_tabs").append(copy);
        UIkit.switcher('#invoice_tabs').show(count_li+1);
      }else{
        jQuery('#tabs_dropdown_name').text(transText.carts+" "+(tabs_count+1))
        jQuery('#tabs_dropdown ul li').removeClass('uk-active');
        copy.addClass('uk-active');
        copy.addClass('tabs_dropdown_item');
        jQuery('#tabs_dropdown ul').append(copy);
        jQuery('#tabs_dropdown').removeClass('uk-hidden');
        UIkit.switcher('#invoice_tabs').show(0);
      }
      tabs_count++
      if(status == null){
        initStatus(1)
      }else if(status == 2){
        initStatus(2)
      }
  }
  var initChangeTabs = function(){
    jQuery('#invoice_tabs').on('change.uk.tab', function(event, active , previous ){
      var id = '';
      if(!jQuery(active.first()).hasClass('uk-tab-responsive')){
        jQuery("#invoice_tabs li.uk-tab-responsive").last().not('#tabs_dropdown').remove();
        jQuery("#tabs_dropdown_name").text("List");
        id = jQuery("#tabs_dropdown li.uk-active")?jQuery("#tabs_dropdown li.uk-active").attr('data-id'):jQuery("#invoice_tabs li.uk-active").attr('data-id');
        jQuery("#tabs_dropdown li").removeClass("uk-active");
      }
      if(id){
        initAddCards(null,id)
      }else if(!previous){
        var count_li_tabs = jQuery("#invoice_tabs").find("li").not('#tabs_dropdown').length;
        initAddCards(null,count_li_tabs)
      }else{
        initAddCards(previous)
      }
      initBindData(active)
    });
    jQuery(document).on('click', '.tabs_dropdown_item a', function () {
      jQuery('#tabs_dropdown ul li').removeClass('uk-active');
      jQuery(this).parent("li").addClass("uk-active");
      jQuery("#tabs_dropdown_name").text(jQuery(this).text());
      jQuery("#tabs_dropdown").removeClass("uk-open");
      jQuery("#tabs_dropdown").find('.uk-dropdown').removeClass('uk-dropdown-active, uk-dropdown-shown');
      var id = jQuery(this).parent("li").attr('data-id');
        initBindData(null,id)
    })
  }
  var initShowDropDown = function(){
    jQuery('#tabs_dropdown').on('show.uk.dropdown', function(){
      var id = jQuery('.tabs_dropdown_item.uk-active').attr('data-id');
      if(id){
         initAddCards(null,id)
      }
    });
  }
  var initReduceItem = function(e){
    var id = getId();
    var data = dataObj.filter(x => x.id === id);
    data = data[0];
    if(data == undefined){
      data = [];
      data.print = false;
    }
    if(data.print != true){
      var value = jQuery(e.currentTarget).attr("data-id");
      var grid = $kGrid.data("kendoGrid");
      var dataItem  = grid.dataSource.get(value);
      if(dataItem){
        var row = grid.tbody.find("tr[data-uid='" + dataItem.uid + "']");
        if(dataItem.quantity - 1 == 0){
          grid.removeRow(row);
        }else{
          var selectedItem = grid.dataItem(row);
          selectedItem.set("quantity", dataItem.quantity - 1);
        }
      }else{
        kendo.alert(transText.barcode_not_found);
      }
    }else{
      kendo.alert(transText.already_paid);
    }
  }

  var initScanBarcode = function(e){
    var id = getId();
    var data = dataObj.filter(x => x.id === id);
    data = data[0];
    if(data == undefined){
      data = [];
      data.print = false;
    }
    if(data.print != true){
    var obj = {};
    var $this = e.currentTarget ? e.currentTarget : e
    obj.value = jQuery($this).val()?jQuery($this).val():jQuery($this).attr("data-id");
    obj.id = data.general;
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
              selectedItem.set("quantity", dataItem.quantity + 1);
            }else{
              i.quantity = 1 ;
              grid.dataSource.insert(0 , i);
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
  }else{
    kendo.alert(transText.already_paid);
  }
  }

  initToolTip = function(){
    var template = kendo.template($("#toolTipTemplate").html());
    //initialize tooltip to grid tbody with filter cells with given CSS class
     tooltip = $("#grid tbody").kendoTooltip({
         filter: "tr",
         position: "top",
         width: 100,
         show: function (e) {
            //get current target row
            var currentRow = this.target().closest("tr");
            var grid = $kGrid.data("kendoGrid");
            //get current row dataItem
            var dataItem = grid.dataItem(currentRow);

            //pass the dataItem to the template
            var generatedTemplate = template(dataItem);
            //set the generated template to the content of the tooltip
            this.content.html(generatedTemplate);
        },
    }).data("kendoTooltip");
  }

  var initKendoGridBarcode = function () {
     var grid = $kGridBarcode.kendoGrid({
          dataSource: {
              pageSize : 20,
              data: []
          },
          scrollable: {
           virtual: true
          },
          selectable: "multiple, row",
          height: jQuery(window).height() * 0.5,
          sortable: true,
          pageable: true,
          filterable: true,
          columns: Ermis.columns_barcode
     }).data("kendoGrid");

     grid.thead.kendoTooltip({
       filter: "th",
       content: function (e) {
           var target = e.target; // element for which the tooltip is shown
           return $(target).text();
       }
   });

     grid.table.on("click", ".k-checkbox", selectRow);
      //bind click event to the checkbox
      //grid.table.on("click", ".k-checkbox" , selectRow);
      jQuery('#header-chb-b').change(function(ev){
          var checked = ev.target.checked;
          $kGridBarcode.find('.k-checkbox').not("#header-chb-b").each(function (idx, item) {
              if(checked){
                  if(!$(item).closest('tr').is('.k-state-selected')){
                      $(item).click();
                  }
              } else {
                  if($(item).closest('tr').is('.k-state-selected')){
                      $(item).click();
                  }
              }
          });

      });

      jQuery(".choose_barcode").bind("click", function () {
        var id = getId();
        var data = dataObj.filter(x => x.id === id);
        data = data[0];
        if(data == undefined){
          data = [];
          data.print = false;
        }
        if(data.print != true){
          var checked = [];
          for(var i of checkedData){
            var grid = $kGrid.data("kendoGrid");
            var dataItem  = grid.dataSource.get(i.id);
            if(dataItem){
              var row = grid.tbody.find("tr[data-uid='" + dataItem.uid + "']");
              var selectedItem = grid.dataItem(row);
              selectedItem.set("quantity", dataItem.quantity + 1);
            }else{
              i.quantity = 1 ;
              grid.dataSource.insert(0 , i);
              $kGridBarcode.find('.k-checkbox[id="'+i.id+'"]').click();
            }
          }
          $kWindow1.close();
          checkedData = [];
        }else{
          kendo.alert(transText.already_paid);
        }
      });
      var checkedData = [];

      //on click of the checkbox:
      function selectRow() {
          var checked = this.checked,
              row = $(this).closest("tr"),
              grid = $kGridBarcode.data("kendoGrid"),
              dataItem = grid.dataItem(row);
          if (checked) {
             checkedData.push(dataItem)
              //-select the row
              row.addClass("k-state-selected");
          } else {
              checkedData = checkedData.filter(x => x.id != dataItem.id)
              //-remove selection
              row.removeClass("k-state-selected");
          }
      }
  };
  var initKendoUiDropList = function () {
      jQuery(".droplist").kendoDropDownList({
          filter: "startswith"
      });
  };

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
  var initKendoUiDialog = function () {

      $kWindow1 = myWindow1.kendoWindow({
          width: "800px",
          title: "",
          visible: false,
          actions: [
              "Pin",
              "Minimize",
              "Maximize",
              "Close"
          ],
          modal: true
      }).data("kendoWindow").center();

      $kWindow1.title("Tìm kiếm hàng hóa");

      $kWindow2 = myWindow2.kendoWindow({
          width: "600px",
          title: "",
          visible: false,
          actions: [
              "Pin",
              "Minimize",
              "Maximize",
              "Close"
          ],
          modal: true
      }).data("kendoWindow").center();

      $kWindow1.title("Tìm kiếm hàng hóa");
      $kWindow2.title("Thanh toán");
  };
  var initBarcodeForm = function () {
      $kWindow1.open();
  };
  var initPaymentForm = function () {
    var detail = $kGrid.data("kendoGrid").dataSource.data();
    if(detail.length > 0){
      initOpenPayment();
      $kWindow2.open();
    }else{
      kendo.alert(transText.no_item_in_cards);
    }
  };

  var initGetDataBarcode = function () {
    jQuery('#search_barcode').on('click', function () {
        var obj = {};
        var filter = GetAllDataForm('#form-window-barcode', 2);
        jQuery.each(filter.columns, function (k, col) {
            if (col.key === 'text' || col.key === 'password' || col.key === 'number') {
                obj[col.field] = jQuery('input[name="' + col.field + '"]').val().trim();
            } else if (col.key === 'select' && jQuery('select[name = ' + col.field + ']').hasClass("droplist")) {
                obj[col.field] = jQuery('.droplist[name="' + col.field + '"]').data('kendoDropDownList').value();
            } else if (col.key === 'select' && jQuery('select[name = ' + col.field + ']').hasClass("multiselect")) {
                var arr = jQuery('.multiselect[name="' + col.field + '"]').data('kendoMultiSelect').value();
                obj[col.field] = arr.join();
            } else if (col.key === 'textarea') {
                obj[col.field] = jQuery('textarea[name="' + col.field + '"]').val();
            }  else if (col.key === 'checkbox') {
                if (jQuery('input[name="' + col.field + '"]').parent().hasClass('checked')) {
                    if (col.type === 'boolean') {
                        obj[col.field] = true;
                    } else if (col.type === 'number'){
                        obj[col.field] = 1;
                    }else {
                        obj[col.field] = '1';
                    }
                } else {
                    if (col.type === 'boolean') {
                        obj[col.field] = false;
                    }else if (col.type === 'number'){
                        obj[col.field] =  0;
                    } else {
                        obj[col.field] = '0';
                    }
                }
            } else if (col.key === 'radio') {
                obj[col.field] = jQuery('input[name="' + col.field + '"]:checked').val();
            }
        });

        var postdata = { data: JSON.stringify(obj) };
        RequestURLWaiting(Ermis.link+'-load', 'json', postdata, function (result) {
            if (result.status === true) {
                var grid = $kGridBarcode.data("kendoGrid");
                var ds = new kendo.data.DataSource({ data: result.data , pageSize : 20});
                grid.setDataSource(ds);
                grid.dataSource.page(1);
            }else{
               kendo.alert(result.message);
            }
        }, true);
    });
  };

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
      var grid = $kGrid.kendoGrid({
          dataSource: dataSource,
          save: function (data) {
              var grid = this;
              setTimeout(function () {
                  grid.refresh();
              });
          },
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

  var initDeleteRow = function(e){
    $(document).on('click', 'a.delete_row', function (e) {
      var $this = e.currentTarget;
      $.when(KendoUiConfirm(transText.are_you_sure, transText.message)).then(function (confirmed) {
          if (confirmed) {
         var currentrow = jQuery($this).closest('tr');
         currentrow.remove();
         var grid = $kGrid.data('kendoGrid');
         var currItem = grid.dataSource.getByUid(jQuery(currentrow).data('uid'));
         grid.dataSource.remove(currItem);
          return false;
          }
      });
    });
    $(document).on('click', '#delete_row_all', function () {
      $.when(KendoUiConfirm(transText.are_you_sure, transText.message)).then(function (confirmed) {
          if (confirmed) {
          var grid = $kGrid.data('kendoGrid');
          grid.dataSource.data([]);
          return false;
          }
      });
    });
  }

  var initClose = function (e) {
      var jQuerylink = jQuery(e.target);
      e.preventDefault();
      if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
          if ($kWindow1.element.is(":hidden") === false) {
              $kWindow1.close();
          }else if ($kWindow2.element.is(":hidden") === false) {
              $kWindow2.close();
          }
      }
      jQuerylink.data('lockedAt', +new Date());
  };

  var initKeyCode = function () {
      jQuery(document).keyup(function (e) {
          if (e.keyCode === 13) {
            if(e.target.id == "barcode"){
              initScanBarcode(e.target);
            }
          }
      });
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

  var initPaging = function(){
    jQuery('[data-uk-pagination]').on('select.uk.pagination', function(e, pageIndex){
      var value = jQuery("#select_toolbar").val();
      var page = pageIndex+1;
      var postdata = { data: JSON.stringify({value : value , page : page}) };
      RequestURLWaiting(Ermis.link+'-page', 'json', postdata, function (result) {
          if (result.status === true) {
              BindItem(result.data);
          } else {
              kendo.alert(result.message);
          }
      }, true);
  });
  }
  var initChangeSelect = function(){
    jQuery("#select_toolbar").on("change",function(){
      var value = jQuery(this).val();
      var postdata = { data: JSON.stringify(value) };
      RequestURLWaiting(Ermis.link+'-filter', 'json', postdata, function (result) {
          if (result.status === true) {
              BindItem(result.data);
          } else {
              kendo.alert(result.message);
          }
      }, true);
    })
  }

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

    return {

        init: function () {
          initLoadPrintData();
          initKendoGrid();
          initKendoUiDropList();
          initVoucherMasker();
          initStatus(0);
          initKendoUiNumber();
          initKendoUiNumberPrice();
          initKendoUiPercent();
          initToolTip();
          initKeyCode();
          initGetDataBarcode();
          initKendoGridBarcode();
          initKendoUiDialog();
          initPaging();
          initChangeSelect();
          initDeleteRow();
          initChangeTabs();
          initShowDropDown();
          initBlurDiscountPayment();
          initWsConnectRoom();
          initLoadDiscountCustomer();
          changeCoupon();
          SearchCoupon();
        }

    };

}();

jQuery(document).ready(function () {
    Ermis.init();
});
