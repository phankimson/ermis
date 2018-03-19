var Ermis = function () {
    var data = [];
    var container = document.getElementById('grid');
    var hot = '';
    var key = 'Alt+';

    var initStatus = function (flag) {
        shortcut.remove(key + "A");
        shortcut.remove(key + "L");
        shortcut.remove(key + "S");
        shortcut.remove(key + "C");
        shortcut.remove(key + "D");
        shortcut.remove(key + "P");
        jQuery('.add,.load,.cancel,.save,.delete,.print,.export').off('click');
        if (flag === 1) {//DEFAULT
            jQuery('#add-top-menu-caculation').show();
            jQuery('.save,.cancel,.print,.delete,.export').addClass('disabled');
            jQuery('.save,.cancel,.print-item,.delete').off('click');
            jQuery('.add,.load').removeClass('disabled');
            jQuery('.add').on('click', initAdd);
            jQuery('.load').on('click', initLoad);
            shortcut.add(key + "A", function (e) { initAdd(e); });
            shortcut.add(key + "L", function (e) { initLoad(e); });
        } else if (flag === 2) {//ADD
            jQuery('.add,.load,.print,.delete').addClass('disabled');
            jQuery('.add,.load,.print-item,.delete').off('click');
            jQuery('.save,.cancel').removeClass('disabled');
            jQuery('.save').on('click', initSave);
            jQuery('.cancel').on('click', initCancel);
            shortcut.add(key + "S", function (e) { initSave(e); });
            shortcut.add(key + "C", function (e) { initCancel(e); });
        } else if (flag === 3) {//LOAD
            jQuery('.add,.load,.save').addClass('disabled');
            jQuery('.add,.load,.save').off('click');
            jQuery('.delete,.print,.cancel,.export').removeClass('disabled');
            jQuery('.delete').on('click', initDelete);
            jQuery('.print-item').on('click', initPrint);
            jQuery('.cancel').on('click', initCancel);
            //jQuery('.export').on('click', initExport);
            shortcut.add(key + "D", function (e) { initDelete(e); });
            shortcut.add(key + "P", function (e) { initPrint(e); });
            shortcut.add(key + "C", function (e) { initCancel(e); });
        } else if (flag === 4) {//CANCEL
            jQuery('.save,.cancel,.print,.delete,.export').addClass('disabled');
            jQuery('.save,.cancel,.print-item,.delete,.export').off('click');
            jQuery('.add,.load').removeClass('disabled');
            jQuery('.add').on('click', initAdd);
            jQuery('.load').on('click', initLoad);
            shortcut.add(key + "A", function (e) { initAdd(e); });
            shortcut.add(key + "L", function (e) { initLoad(e); });
        } else if (flag === 5) {//SAVE
            jQuery('.add,.load,.save,.cancel').addClass('disabled');
            jQuery('.add,.load,.save,.cancel').off('click');
            jQuery('.delete,.print').removeClass('disabled');
            jQuery('.delete').on('click', initDelete);
            jQuery('.print-item').on('click', initPrint);
            //jQuery('.export').on('click', initExport);
            shortcut.add(key + "D", function (e) { initDelete(e); });
            shortcut.add(key + "P", function (e) { initPrint(e); });
        }
    };


    var initMonthDate = function () {
        $(".month-picker").kendoDatePicker({
            // defines the start view
            start: "year",

            // defines when the calendar should return date
            depth: "year",

            // display month and year in the input
            format: "MM/yyyy",

            // specifies that DateInput is used for masking the input element
            dateInput: true
        });
    };


    var initKendoUiContextMenu = function () {
        jQuery("#context-menu").kendoContextMenu({
            target: ".md-card-content"
        });
    };
    var initPrint = function (e) {
        var obj = {};
        obj.date = jQuery("input[name='date']").val();
        obj.voucher = jQuery(this).attr('data-id');
        var postdata = { data: JSON.stringify(obj) };
        RequestURLWaiting(Ermis.link+'-Print', 'json', postdata, function (result) {
            if (result.status === true) {
                var decoded = $("<div/>").html(result.print).text();
                if (result.detail_content) {
                    decoded = decoded.replace('<tr class="detail_content"></tr>', result.detail_content);
                }
                PrintForm(jQuery('#print'), decoded);
                jQuery('#print').html("");
            }else{
              kendo.alert(result.message);
            }

        }, true);
    };
    //var initExport = function () {
    //    window.open('data:application/vnd.ms-excel,' + encodeURIComponent($('div[id$=grid]').html()));
    //    e.preventDefault();
    //}

    var initAdd = function (e) {
            var date = jQuery("input[name='date']").val();
            var postdata = { data: JSON.stringify(date)  };
            RequestURLWaiting(Ermis.link+'-Add', 'json', postdata, function (result) {
                if (result.status === true) {
                    initTable(result.data);
                    initStatus(2);
                } else {
                    kendo.alert(result.message);
                }

            }, true);
    };
    var initLoad = function (e) {
        var date = jQuery("input[name='date']").val();
        var postdata = { data: JSON.stringify(date) };
        RequestURLWaiting(Ermis.link+'-Load', 'json', postdata, function (result) {
            if (result.status === true) {
                initTable(result.data);
                initStatus(3);
            } else {
                kendo.alert(result.message);
            }
        }, true);
    };
    var initDelete = function (e) {
        var date = jQuery("input[name='date']").val();
        var postdata = { data: JSON.stringify(date) };
        RequestURLWaiting(Ermis.link+'-Delete', 'json', postdata, function (result) {
            if (result.status === true) {
                initTable(null);
                initStatus(4);
            }
            kendo.alert(result.message);
        }, true);
    };
    var initSave = function (e) {
        var obj = {};
        obj.date = jQuery("input[name='date']").val();
        obj.detail = hot.getSourceData();
        var postdata = { data: JSON.stringify(obj) };
        RequestURLWaiting(Ermis.link+'-Save', 'json', postdata, function (result) {
            if (result.status === true) {
                initStatus(5);
            }
            kendo.alert(result.message);
        }, true);
    };
    var initCancel = function (e) {
        initTable(null);
        initStatus(4);
    };


    var initTable = function (data) {
        if (data == null) {
            data = [];
        }
        var ArrayHeaders = [];
        $.each(Ermis.columns, function (index, item) {
            ArrayHeaders.push(item.name);
        });
        var ArrayColumn = [];
        $.each(Ermis.columns, function (index, item) {
            var columnsList = {};
            if (item.type === 'number') {
                columnsList = {
                    data: item.id,
                    renderer: numberRenderer,
                    readOnly: true
                    //                   width : ( 1 * $(window).width() )/item.length
                };
            } else if (item.type === 'decimal') {
                columnsList = {
                    data: item.id,
                    renderer: decimalRenderer,
                    readOnly: true
                    //                   width : ( 1 * $(window).width() )/item.length
                };
            } else if (item.type === 'date') {
                columnsList = {
                    data: item.id,
                    renderer: dateRenderer,
                    readOnly: true
                    //                   width : ( 1 * $(window).width() )/item.length
                };
            } else if (item.type === 'total') {
                columnsList = {
                    data: item.id,
                    renderer: addTotal,
                    readOnly: true
                    //                   width : ( 1 * $(window).width() )/item.length
                };
            } else {
                columnsList = {
                    data: item.id,
                    readOnly: true
                    //                   width : ( 1 * $(window).width() )/item.length
                };
            }
            ArrayColumn.push(columnsList);
        });
        if (hot) {
            hot.destroy();
        }
        hot = new Handsontable(container, {
            data: data,
            colHeaders: ArrayHeaders,
            rowHeaders: true,
            //minSpareRows: 1,
            fixedColumnsLeft: 2,
            fixedColumnsTop: 2,
            manualColumnFreeze: true,
            //stretchH: 'all',
            height: 0.8 * $(window).height(),
            //                  contextMenu: true,
            columns: ArrayColumn
            //                   afterRender: function () {
            //                 var addgroup = '';
            //                     addgroup += '<tr id="header-grouping">';
            //                  $.each(group, function(index, item) {
            //                     addgroup +='<th colspan="'+item.col+'">'+item.name+'</th>';
            //                 });
            //                    addgroup += '</tr>';
            //                      window.setTimeout(function() {
            //                 $('#table-excel').find('thead').find('tr').before(addgroup);
            //                   }, 0);
            //                    },
            //                beforeRender: function() {
            //                 while ($('#header-grouping').size() > 0)
            //                $('#header-grouping').remove();
            //                },
            //              afterColumnResize: function () {
            //            $container.handsontable('render');
            //             },
            //               afterGetColHeader: function() {
            //            while ($('.ht_clone_top.handsontable #header-grouping th').size() > 0)
            //                $('.ht_clone_top.handsontable #header-grouping th').remove();
            //        },
            //                modifyColWidth: function () {
            ////           $('#header-grouping').remove();
            //             }
        });
        if (data) {
            hot.alter('insert_row', data.length + 1);
        }
        var exportPlugin = hot.getPlugin('exportFile');
        var buttons = {
            file: document.getElementById('export-file')
        };

        buttons.file.addEventListener('click', function () {
            exportPlugin.downloadFile('csv', { filename: 'MyFile',columnHeaders: true,});
        });

        function dateRenderer(instance, td, row, col, prop, value, cellProperties) {
            if (value == null || value == "") {
                return td;
            } else {
                var escaped = Handsontable.helper.stringify(value);
                escaped = formatDate(escaped);
                td.innerHTML = escaped;
                return td;
            }
        }

        function decimalRenderer(instance, td, row, col, prop, value) {
            if (row === instance.countRows() - 1) {
                td.style.textAlign = 'right';
                td.style.fontWeight = 'bold';
                value = getTotal(prop);
            }
            Handsontable.NumericRenderer.apply(this, arguments);
            var escaped = Handsontable.helper.stringify(value);
            escaped = FormatDecimal(escaped, 2);
            td.innerHTML = escaped;

            return td;
        }
        function numberRenderer(instance, td, row, col, prop, value) {
            if (row === instance.countRows() - 1) {
                td.style.textAlign = 'right';
                td.style.fontWeight = 'bold';
                value = getTotal(prop);
            }
            Handsontable.NumericRenderer.apply(this, arguments);
            var escaped = Handsontable.helper.stringify(value);
            escaped = FormatNumber(escaped);
            td.innerHTML = escaped;

            return td;
        }

        function addTotal(instance, td, row, col, prop, value) {
            if (row === instance.countRows() - 1) {
                td.style.fontWeight = 'bold';
                td.style.textAlign = 'right';
                td.innerText = 'Total: ';
                return;
            } else {
                Handsontable.NumericRenderer.apply(this, arguments);
            }
        }

        function getTotal(prop) {
            var total = 0;
            if (data !== null) {
                data.reduce(function (sum, row) {
                    if (row[prop] !== null) {
                        total += parseFloat(row[prop]);
                    }
                }, 0);
                return total;
            }

        }
    };

    var initKendoUiDropList = function () {
        jQuery(".droplist").kendoDropDownList({
            filter: "contains"
        });
    };
    var initKendoButton = function () {
        jQuery("#search_grid").kendoButton();
    };

    return {

        init: function () {
            initStatus(1);
            initMonthDate();
            initKendoUiContextMenu();
            initKendoUiDropList();
        }

    };

}();

jQuery(document).ready(function () {
    Ermis.init();
});
