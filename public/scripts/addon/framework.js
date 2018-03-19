function KendoUiConfirm(message, title) {
    var dfd = new jQuery.Deferred();
    var result = false;
    var kendoContent = '<p class="confirm-message">' + message + '</p><br/><button class="confirm-kendoui k-button">' + transText.yes + '</button><button class="cancel-kendoui k-button uk-margin-small-left">' + transText.no + '</button>';
    var kendoWindow = $("<div />").kendoWindow({
        width: "400px",
        title: title,
        resizable: false,
        modal: true,
        visible: false,
        close: function (e) {
        this.destroy();
        dfd.resolve(result);
    }
    });
    kendoWindow.data("kendoWindow")
     .content(jQuery(kendoContent))
     .center().open();
    kendoWindow.find(".confirm-kendoui,.cancel-kendoui")
       .click(function () {
           if ($(this).hasClass("confirm-kendoui")) {
               result = true;
           }

           kendoWindow.data("kendoWindow").close();
       });
    return dfd.promise();
}

function UrlString (url){
  var hostname = window.location.hostname;
  var port = window.location.port;
  var protocal = window.location.protocol;
  var string = '';
  if(window.location.port){
    string = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/' + url;
  }else{
    string = window.location.protocol + '//' + window.location.hostname + '/' + url;
  }

  return string;
}

function ConvertNumber ($string){
  if($string){
    var check = $string.toString().indexOf(",");
    if ($string !== 0 && check !== -1) {
      return  $string = $string.replace(/\,/g, "");
    }
  }else{
    $string = 0;
  }
    return $string;
}

function UIkitshowNotify (message, status ,timeout,group , pos) {
  thisNotify = UIkit.notify({
      message: message ? message : '',
      status: status ? status : '',
      timeout: timeout ? timeout : 5000,
      group: group ? group : null,
      pos: pos ? pos : 'top-center'
  });
  if(
      (
          ($window.width() < 768)
          && (
              (thisNotify.options.pos == 'bottom-right')
              || (thisNotify.options.pos == 'bottom-left')
              || (thisNotify.options.pos == 'bottom-center')
          )
      )
      || (thisNotify.options.pos == 'bottom-right')
  ) {
      var thisNotify_height = $(thisNotify.element).outerHeight();
      var spacer = $window.width() < 768 ? -6 : 8;
      $body.find('.md-fab-wrapper').css('margin-bottom',thisNotify_height + spacer);
  }
}

var initBarcodeMasker = function (data) {
    var char = '0'; var voucher = "";
    var number = data.length_number;
    if (data.value) {
        voucher = char.repeat(number - (data.value+"").length) + data.value;
    } else {
        voucher = char.repeat(number);
    }
    return voucher
};

var sort_by = function (field, reverse, primer) {

    var key = primer ?
        function (x) { return primer(x[field]); } :
        function (x) { return x[field]; };

    reverse = !reverse ? 1 : -1;

    return function (a, b) {
        return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
    };
    //USE

    // Sort by price high to low
    //homes.sort(sort_by('price', true, parseInt));

    // Sort by city, case-insensitive, A-Z
    //homes.sort(sort_by('city', false, function (a) { return a.toUpperCase() }));
};



function PrintForm(elem,data) {
        elem.print({
        //Use Global styles
        globalStyles: false,
        append : data,
        //Add link with attrbute media=print
        mediaPrint : false,
        //Print in a hidden iframe
        iframe : true,
        //Don't print this
        //noPrintSelector : ".avoid-this",
        deferred: $.Deferred().done(function() { console.log('Printing done', arguments); })
});
}

function GetAllValueForm(elem) {
    var map = {};
    jQuery(elem + ' input').each(function () {
        if (jQuery(this).attr("type") === 'radio') {
            map[jQuery(this).attr("name")] = jQuery('input[name=radio]:checked', '#radio').val();
        } else {
            map[jQuery(this).attr("name")] = jQuery(this).val();
        }
    });
    jQuery(elem + ' textarea').each(function () {
        map[jQuery(this).attr("name")] = jQuery(this).val();
    });
    jQuery(elem + ' select').each(function () {
        map[jQuery(this).attr("name")] = jQuery(this).find('option:selected').val();
    });
    return map;
}

function GetAllDataForm(elem,style) {
    var data = [];
    var column = [];
    if (!style) {
        column = [{ "title": "STT", "template": "<span class='row-number'></span>", "width": 100, "position": 0 }];
    }
    var fields = {};
    jQuery(elem + ' select').each(function () {
        var i = jQuery(this).attr('data-show');
        if (i === true || !i) {
            var k = parseInt(jQuery(this).attr('data-position'));
            var a = jQuery(this).attr('name');
            var c = jQuery(this).attr('data-template');
            var e = jQuery(this).attr('data-title');
            var t = jQuery(this).attr('data-type');
            var w = jQuery(this).attr('data-width');
            var h = jQuery(this).attr('data-hidden') ? true : false;
            var u = jQuery(this).attr('data-nullable') ? true : false;
            var v = jQuery(this).attr('data-value');
            var d = jQuery(this).attr('add-option');
            var r = jQuery(this).attr('data-remove') ? true : false;
            var f = jQuery(this).attr('data-format');
            if (c || c === "") {
                adata = { "field": a, "title": e, "width": w, "template": c,"format":f, "type": t, "key": "select", "position": k, "hidden": h, "value": v, "addoption": d };
            } else {
                adata = { "field": a, "title": e, "width": w, "type": t, "key": "select", "position": k, "hidden": h, "value": v, "addoption": d };
            }
            if (r === false) {
                column.push(adata);
            }
            fields[a] = { "type": t, "nullable": u, "defaultValue": v };
        }
    });
    jQuery(elem + ' textarea').each(function () {
        var i = jQuery(this).attr('data-show');
        if (i === true || !i) {
        var k = parseInt(jQuery(this).attr('data-position'));
        var a = jQuery(this).attr('name');
        var c = jQuery(this).attr('data-template');
        var e = jQuery(this).attr('data-title');
        var t = jQuery(this).attr('data-type');
        var w = jQuery(this).attr('data-width');
        var u = jQuery(this).attr('data-nullable') ? true : false;
        var h = jQuery(this).attr('data-hidden') ? true : false;
        var r = jQuery(this).attr('data-remove') ? true : false;
        var v = jQuery(this).attr('data-value');
        var f = jQuery(this).attr('data-format');
        if (c||c === "") {
            adata = { "field": a, "title": e, "width": w, "template": c,"format":f, "type": t, "key": "textarea", "position": k, "hidden": h, "value": v };
        } else {
            adata = { "field": a, "title": e, "width": w, "type": t, "key": "textarea", "position": k, "hidden": h, "value": v };
        }
        if (r === false) {
            column.push(adata);
        }
        fields[a] = { "type": t, "nullable": u };
        }
    });
    jQuery(elem + ' input').each(function () {
        var i = jQuery(this).attr('data-show');
        if (i === true || !i) {
        var k = parseInt(jQuery(this).attr('data-position'));
        var a = jQuery(this).attr('name');
        var c = jQuery(this).attr('data-template');
        var e = jQuery(this).attr('data-title');
        var t = jQuery(this).attr('data-type');
        var w = jQuery(this).attr('data-width');
        var n = jQuery(this).attr('data-null') ? true : false;
        var h = jQuery(this).attr('data-hidden') ? true : false;
        var u = jQuery(this).attr('data-nullable') ? true : false;
        var r = jQuery(this).attr('data-remove') ? true : false;
        var v = jQuery(this).attr('data-value');
        var f = jQuery(this).attr('data-format');
        if (c || c === "") {
            adata = { "field": a, "title": e, "width": w, "template": c, "format": f, "type": t, "key": jQuery(this).attr('type'), "position": k, "null": n, "hidden": h, "value": v };
        } else {
            adata = { "field": a, "title": e, "width": w, "type": t, "key": jQuery(this).attr('type'), "position": k, "null": n, "hidden": h, "value": v };
        }
        if (r === false) {
            column.push(adata);
        }
        fields[a] = { "type": t ,"nullable" : u };
        }
    });
    column.sort(sort_by('position', false, parseInt));
    data['columns'] = column;
    data['fields'] = fields;
    return data;
}


jQuery.fn.EPosMessage = function (type, message) {
    type = type === '' ? 'success' : type;
    jQuery(this).html('');
    var messageElem = '';
    if (type === "success") {
        messageElem = jQuery("<div class=\"alert alert-success\"><button class='close'></button>" + message + "</div>");
    } else {
        messageElem = jQuery("<div class=\"alert alert-danger\"><button class='close'></button>" + message + "</div>");
    }
    jQuery(this).append(messageElem);
    messageElem.fadeIn(500).delay(5000).fadeOut(500);
};

function RequestURLWaiting(url, returnType, postData, callback, displayLoading) {
    var windowWidget = jQuery('body');
    if (displayLoading) {
        kendo.ui.progress(windowWidget, true);
    }
    jQuery.ajax({
        url: url,
        type : 'POST',
        data: postData,
        dataType: returnType,
        success: function (result) {
            callback(result);
            if (displayLoading) {
                kendo.ui.progress(windowWidget, false);
            }
        },
        //error: function (xhr) {
        //    kendo.alert(xhr.responseText);
        //    location.reload();
        //}
    });
}

function RequestURLImage(url, returnType, postData, callback, displayLoading) {
  var windowWidget = jQuery('body');
  if (displayLoading) {
      kendo.ui.progress(windowWidget, true);
  }
  jQuery.ajax({
      url: url,
      type : 'POST',
      data: postData,
      processData: false,
      contentType: false,
      success: function (result) {
          callback(result);
          if (displayLoading) {
              kendo.ui.progress(windowWidget, false);
          }
      },
      //error: function (xhr) {
      //    kendo.alert(xhr.responseText);
      //    location.reload();
      //}
  });
}

function TryCatch(callback){
  try{
    callback();
  }catch(e){
    kendo.alert(transText.error+' -JS- '+e.message);
  }
}

function RequestFileURLWaiting(url, returnType, postData, callback, displayLoading) {
    var windowWidget = jQuery('body');
    if (displayLoading) {
        kendo.ui.progress(windowWidget, true);
    }
    jQuery.ajax({
        url: url,
        xhr: function () { // custom xhr (is the best)

            var xhr = new XMLHttpRequest();
            var total = 0;

            // Get the total size of files
            jQuery.each(document.getElementById('files').files, function (i, file) {
                total += file.size;
            });

            // Called when upload progress changes. xhr2
            xhr.upload.addEventListener("progress", function (evt) {
                // show progress like example
                var loaded = (evt.loaded / total).toFixed(2) * 100; // percent
            }, false);

            return xhr;
        },
        type: returnType,
        processData: false,
        contentType: false,
        data: postData,
        success: function (result) {
                callback(result);
                if (displayLoading) {
                    kendo.ui.progress(windowWidget, false);
                }
        },
        //error: function (xhr) {
        //    kendo.alert(xhr.responseText);
        //    location.reload();
        //}
    });
}
function formatDate(container) {
    if (container) {
        var from = container.substr(0, 10).split("-");
        var date_string = from[2] + "/" + from[1] + "/" + from[0];
        return date_string;
    }
}
function formatDateDefault(container) {
    if (container) {
        var from = container.substr(0, 10).split("/");
        var date_string = from[2] + "-" + from[1] + "-" + from[0];
        return date_string;
    }
}

function formatDateTimeDefault(container) {
    if (container) {
        var from = container.substr(0, 10).split("/");
        var date_string = from[2] + "-" + from[1] + "-" + from[0]+ ' 00:00:00.000';
        return date_string;
    }
}
function formatDateTime(container) {
    var from = container.substr(0, 10).split("-");
    var time = container.substr(11);
    var date_string = from[2] + "-" + from[1] + "-" + from[0] + " " + time;
    return date_string;
}


function getMonthDateRange(year, month) {
    //var moment = require('moment');

    // month in moment is 0 based, so 9 is actually october, subtract 1 to compensate
    // array is 'year', 'month', 'day', etc
    var startDate = moment([year, month - 1]);

    // Clone the value before .endOf()
    var endDate = moment(startDate).endOf('month');

    // make sure to call toDate() for plain JavaScript date type
    return { start: startDate, end: endDate };
}
function getQuarterDateRange(year, month) {
    //var moment = require('moment');

    // month in moment is 0 based, so 9 is actually october, subtract 1 to compensate
    // array is 'year', 'month', 'day', etc
    var startDate = moment([year, month - 1]);

    // Clone the value before .endOf()
    var endDate = moment(startDate).endOf('quarter');

    // make sure to call toDate() for plain JavaScript date type
    return { start: startDate, end: endDate };
}
// DEFAULT COLUMN KENDO UI
function FormatStatus(container) {
    var result = '';
    if (container === "0" || container === 0) {
        result = '<span class="uk-badge uk-badge-warning">'+transText.not_accepted+'</span>'
    } else if(container === "1" || container === 1){
        result = '<span class="uk-badge uk-badge-success">'+transText.accepted+'</span>'
    } else {
        result = '<span class="uk-badge uk-badge-info">'+transText.completed+'</span>';
    }
    return result;
}
function FormatCheckBox(container) {
    var result = '';
    if (container === "1" || container === 1) {
        result = '<input type="checkbox" disabled checked=""/>';
    } else {
        result = '<input type="checkbox" disabled/>';
    }
    return result;
}
function FormatCheckBoxBoolean(container) {
    var result = '';
    if (container === true) {
        result = '<input type="checkbox" disabled checked=""/>';
    } else {
        result = '<input type="checkbox" disabled/>';
    }
    return result;
}
function FormatDropList(container,column) {
  var result = "";
  if(container != null && container != ""){
    result = jQuery("select[name='" + column + "']").find('option[value=' + container+ ']').text();
  }
  return result;
}

function FormatRadio(container, column) {
    var id = jQuery("input[name='" + column + "'][value=" + container + "]").attr("id");
    var result = jQuery("label[for='" + id + "'").text();
    return result;
}

function FormatMultiSelectValue(container) {
    var result = container.split('-')[0];
    return result;
}

function FormatNumber(container) {
    var result = 0;
    if (container === null || container === "") {
        result = 0;
    } else {
        result = kendo.toString(parseInt(container), "n0");
    }
    return result;
}

function FormatDecimal(container) {
    var result = 0;
    if (container === null || container === "") {
        result = 0;
    } else {
        result = kendo.toString(parseInt(container), "n2");
    }
    return result;
}

function FormatDate(container) {
    var result = "";
    if (container === null) {
        result = "";
    } else {
        var a = new Date(container);
        result = kendo.toString(kendo.parseDate(a, "yyyy-MM-dd"), "dd/MM/yyyy");
    }
    return result;
}
function DateFormatter(container) {
    var result = "";
    if (container === null || container === "-") {
        result = "";
    } else {
        var a = new Date(container);
        result = kendo.toString(kendo.parseDate(a, "yyyy-MM-dd"), "dd/MM/yyyy");
    }
    return result;
}

function runningFormatter(value, row, index) {
    return index + 1;
}

function totalTextFormatter(data) {
    return 'Total';
}

function totalFormatter(data) {
    return data.length;
}

function sumFormatter(data) {
    var field = this.field;
    var total = data.reduce(function (sum, row) {
        return sum + (+row[field]);
    }, 0);
    return kendo.toString(parseInt(total), "n0");
}

function avgFormatter(data) {
    return kendo.toString(parseInt(sumFormatter.call(this, data).split('.').join('') / data.length), "n0");
}
function priceFomatter(value) {
    if (value !== null && value !=="-") {
        return kendo.toString(parseInt(value), "n0");
    } else {
        return "";
    }
}
function GetValueFomatter(container, column) {
    var result = jQuery("select[name='" + this.field + "']").find('option[value=' + container + ']').text();
    return result;
}
