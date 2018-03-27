var Ermis = function () {
    var $kGrid = jQuery('#grid');
    var myWindow = jQuery("#form-action");
    var $kWindow = '';
    var key = 'Alt+';
    var data = [];
    var room = [];
    var dataId = '';
    var $export = ''; var $import = '';
    var initWsConnectRoom = function(){
      var client = Client.connect('data')
      room = Client.joinRoom(client,Ermis.room)
    }
    var initWsListenServer = function(){
      room.on('server-send-save',function(room,data){
          initSaveComplete(data)
      })
      room.on('server-send-delete',function(room,data){
        var grid = $kGrid.data("kendoGrid");
        var dataItem  = grid.dataSource.get(data);
        var row = grid.tbody.find("tr[data-uid='" + dataItem.uid + "']");
        grid.removeRow(row);
      })
      room.on('server-send-import',function(room,data){
        var grid = $kGrid.data("kendoGrid");
        jQuery.each(data, function (k, d) {
            //grid.dataSource.add(d);
            grid.dataSource.insert(0, d);
        });
      })
    }

    var initGetColunm = function () {
        data = GetAllDataForm('#form-action');
        return data;
    };

    var initStatus = function (flag) {
        shortcut.remove(key + "A");
        shortcut.remove(key + "X");
        shortcut.remove(key + "E");
        shortcut.remove(key + "S");
        shortcut.remove(key + "C");
        shortcut.remove(key + "D");
        shortcut.remove(key + "I");
        shortcut.remove(key + "Q");
        shortcut.remove(key + "L");
        jQuery('.add,.copy,.cancel,.edit,.save,.delete,.import,.export,.load').off('click');
        if (flag === 1) {//DEFAULT
            jQuery('#add-top-menu').show();
            jQuery('.save,.cancel').addClass('disabled');
            jQuery('.save,.cancel').off('click');
            jQuery('input,textarea').not('.header_main_search_input').not('#content_message').not('#files').not('.k-filter-menu input').addClass('disabled');
            jQuery(".droplist").not("#action-event").addClass('disabled');
            jQuery('input:checkbox').parent().addClass('disabled');
            jQuery('.k-select').addClass('disabled');
            jQuery('.add,.copy,.edit,.delete,.import,.export,.load').removeClass('disabled');
            jQuery('.add').on('click', initAdd);
            jQuery('.copy').on('click', initCopy);
            jQuery('.edit').on('click', initEdit);
            jQuery('.delete').on('click', initDelete);
            jQuery('.import').on('click', initImport);
            jQuery('.export').on('click', initExport);
            shortcut.add(key + "A", function (e) { initAdd(e); });
            shortcut.add(key + "X", function (e) { initCopy(e); });
            shortcut.add(key + "E", function (e) { initEdit(e); });
            shortcut.add(key + "D", function (e) { initDelete(e); });
            shortcut.add(key + "I", function (e) { initImport(e); });
            shortcut.add(key + "Q", function (e) { initExport(e); });
            shortcut.add(key + "L", function (e) { altair_main_header.search_show();});
        } else if (flag === 2) {//ADD
            myWindow.data("kendoWindow").open();
            $kGrid.addClass('disabled');
            $kGrid.find('tr.k-state-selected').removeClass('k-state-selected');
            jQuery('.save,.cancel,.load').removeClass('disabled');
            jQuery('.k-select').removeClass('disabled');
            jQuery(".droplist").removeClass('disabled');
            jQuery('.number-price,.number').removeClass('disabled');
            jQuery('.cancel').on('click', initCancel);
            jQuery('.save').on('click', initSave);
            jQuery('.load').on('click', initLoadBarcode);
            jQuery('.k-datepicker').removeClass('disabled');
            shortcut.add(key + "S", function (e) { initSave(e); });
            shortcut.add(key + "C", function (e) { initCancel(e); });
            jQuery('.add,.copy,.edit,.delete,.import,.export').addClass('disabled');
            jQuery('.add,.copy,.edit,.delete,.import,.export').off('click');
            jQuery('input,textarea').removeClass('disabled');
            jQuery('.k-button').removeClass('disabled');
            jQuery('input:checkbox').parent().removeClass('disabled');
            jQuery('input').not('[type=radio]').val("");
            jQuery('textarea').val("");
            jQuery.each(data.columns, function (k, col) {
                if (col.key === 'select' && jQuery('select[name = ' + col.field + ']').hasClass("droplist")) {
                    jQuery('.droplist[name="' + col.field + '"]').data('kendoDropDownList').value(col.value);
                } else if (col.key === 'select' && jQuery('select[name = ' + col.field + ']').hasClass("multiselect")) {
                    jQuery('.multiselect[name="' + col.field + '"]').data('kendoMultiSelect').value(col.value);
                } else if (col.key === 'checkbox') {
                    (col.value === "1" || col.value === 1 || col.value === true) ? jQuery('input[name="' + col.field + '"]').parent().addClass('checked') : jQuery('input[name="' + col.field + '"]').parent().removeClass('checked');
                } else if (col.type === 'date') {
                    if (col.value === 'now') {
                        jQuery('input[name="' + col.field + '"]').data("kendoDatePicker").value(kendo.toString(kendo.parseDate(new Date()), 'dd/MM/yyyy'));
                    } else {
                        jQuery('input[name="' + col.field + '"]').data("kendoDatePicker").value("");
                    }
                } else if (col.key === 'textarea' && jQuery('textarea[name = ' + col.field + ']').hasClass("editor")) {
                        jQuery('textarea[name="' + col.field + '"]').data('kendoEditor').value("");
                }
            });
        } else if (flag === 3) {//Edit , COpy
            myWindow.data("kendoWindow").open();
            $kGrid.addClass('disabled');
            jQuery('.save,.cancel,.load').removeClass('disabled');
            jQuery('.k-select').removeClass('disabled');
            jQuery('.number-price,.number').removeClass('disabled');
            jQuery(".droplist").removeClass('disabled');
            jQuery('.cancel').on('click', initCancel);
            jQuery('.save').on('click', initSave);
            jQuery('.load').on('click', initLoadBarcode);
            jQuery('.k-datepicker').removeClass('disabled');
            shortcut.add(key + "S", function (e) { initSave(e); });
            shortcut.add(key + "C", function (e) { initCancel(e); });
            jQuery('.add,.copy,.edit,.delete,.import,.export').addClass('disabled');
            jQuery('.add,.copy,.edit,.delete,.import,.export').off('click');
            jQuery('input,textarea').removeClass('disabled');
            jQuery('.k-button').removeClass('disabled');
            jQuery('input:checkbox').parent().removeClass('disabled');
            jQuery('#droplist-validation_listbox .k-item').removeClass('disabled k-state-disabled');
            jQuery.each(data.columns, function (k, v) {
                if (v.addoption === "true") {
                    var index = parseInt(jQuery('select[name="' + v.field + '"]').find('option[value=' + dataId + ']').index());
                    jQuery('#droplist-validation_listbox .k-item').eq(index).addClass('disabled k-state-disabled');
                }
            });
        } else if (flag === 4) {//Cancel, Save
            $kGrid.removeClass('disabled');
            $kGrid.find('tr.k-state-selected').removeClass('k-state-selected');
            jQuery('input').not('[type=radio]').val("");
            jQuery('textarea').val("");
            jQuery.each(data.columns, function (k, col) {
                if (col.key === 'select' && jQuery('select[name = ' + col.field + ']').hasClass("droplist")) {
                    jQuery('.droplist[name="' + col.field + '"]').data('kendoDropDownList').value("0");
                } else if (col.key === 'select' && jQuery('select[name = ' + col.field + ']').hasClass("multiselect")) {
                    jQuery('.multiselect[name="' + col.field + '"]').data('kendoMultiSelect').value("0");
                } else if (col.key === 'checkbox') {
                    jQuery('input[name="' + col.field + '"]').parent().addClass('checked');
                } else if (col.type === 'date') {
                    jQuery('input[name="' + col.field + '"]').data("kendoDatePicker").value(null);
                } else if (col.type === 'radio') {
                    jQuery('input[name="' + col.field + '"]').attr("checked", "checked");
                } else if (col.addoption === 'true') {
                    jQuery('#droplist-validation_listbox .k-item').removeClass('disabled k-state-disabled');
                }
            });
            jQuery('.k-select').addClass('disabled');
            jQuery('.number-price,.number').addClass('disabled');
            jQuery('.save,.cancel').addClass('disabled');
            jQuery('.save,.cancel').off('click');
            jQuery('input,textarea').not('.header_main_search_input').not('#files').not('.k-filter-menu input').addClass('disabled');
            jQuery(".droplist").addClass('disabled');
            jQuery('input:checkbox').parent().addClass('disabled');
            jQuery('.add,.copy,.edit,.delete,.import,.export').removeClass('disabled');
            jQuery('.add').on('click', initAdd);
            jQuery('.copy').on('click', initCopy);
            jQuery('.edit').on('click', initEdit);
            jQuery('.delete').on('click', initDelete);
            jQuery('.import').on('click', initImport);
            jQuery('.export').on('click', initExport);
            shortcut.add(key + "A", function (e) { initAdd(e); });
            shortcut.add(key + "X", function (e) { initCopy(e); });
            shortcut.add(key + "E", function (e) { initEdit(e); });
            shortcut.add(key + "D", function (e) { initDelete(e); });
            shortcut.add(key + "I", function (e) { initImport(e); });
            shortcut.add(key + "Q", function (e) { initExport(e); });
            shortcut.add(key + "L", function (e) { altair_main_header.search_show();});
        }
    };

    var initKendoUiDatePicker = function () {
        jQuery(".date").kendoDatePicker({
            format: "dd/MM/yyyy"
        });
    };

    var initKendoUiEditor = function () {
        jQuery(".editor").kendoEditor({
            tools: [
                "bold",
                "italic",
                "underline",
                "strikethrough",
                "justifyLeft",
                "justifyCenter",
                "justifyRight",
                "justifyFull",
                "insertUnorderedList",
                "insertOrderedList",
                "indent",
                "outdent",
                "createLink",
                "unlink",
                "insertImage",
                "insertFile",
                "subscript",
                "superscript",
                "tableWizard",
                "createTable",
                "addRowAbove",
                "addRowBelow",
                "addColumnLeft",
                "addColumnRight",
                "deleteRow",
                "deleteColumn",
                "viewHtml",
                "formatting",
                "cleanFormatting",
                "fontName",
                "fontSize",
                "foreColor",
                "backColor",
                "print"
            ]
        });
    };


    var initKendoUiTabStrip = function () {
        var ts = jQuery("#tabstrip");
        ts.kendoTabStrip({
            select: onSelected
        });
        ts.show();

        function onSelected(e) {
            var search = jQuery(e.item).attr("data-search");
            var postdata = { data: JSON.stringify(search) };
            RequestURLWaiting(Ermis.link+'-get', 'json', postdata, function (result) {
                if (result.status === true) {
                    var grid = $kGrid.data("kendoGrid");
                    var ds = new kendo.data.DataSource({ data: result.data , pageSize : result.data.length});
                    grid.setDataSource(ds);
                }else{
                  kendo.alert(result.message);
                }
            }, true);
        }
    };

    var initKendoUiContextMenu = function () {
        jQuery("#context-menu").kendoContextMenu({
            target: ".md-card-content"
        });
    };

    var initKendoUiUpload = function () {
        jQuery("#files").kendoUpload({ "multiple": false });
    };

    var initKendoUiDialog = function (type) {
        if (type === 1) {
            var grid = $kGrid.data("kendoGrid");
            $export = $("#export").kendoDialog({
                width: "400px",
                title: "Export",
                closable: true,
                modal: true,
                actions: [
                    { text: "Export Excel", action: onExcel },
                    { text: "Export PDF", action: onPDF },
                    { text: "Close", primary: true }
                ]
            });
        } else {
            $import = $("#import").kendoDialog({
                width: "400px",
                title: "Import",
                closable: true,
                content: '<form id="import-form" enctype="multipart/form-data" role="form" method="post"><input name="files" id="files" type="file" /></form>',
                modal: true,
                actions: [
                    { text: 'Import File', action: onImportFile },
                    { text: 'Download File', action: onDownloadFile },
                    { text: 'Close', primary: true }
                ]
            });
            initKendoUiUpload();
        }
        function onImportFile(e) {
            var a = jQuery('#import-form').get(0);
            var FileUpload = new FormData(a); // XXX: Neex AJAX2
            // You could show a loading image for example...
                try {
            RequestFileURLWaiting(Ermis.link+'-import', 'post', FileUpload, function (results) {
                if (results.status === true) {
                  room.emit('client-send-import', results.data )
                    var grid = $kGrid.data("kendoGrid");
                    jQuery.each(results.data, function (k, d) {
                        //grid.dataSource.add(d);
                        grid.dataSource.insert(0, d);
                    });
                }
                jQuery(".k-upload-files.k-reset").find("li").remove();
                kendo.alert(results.message);
            }, true);
          } catch(e) {
                kendo.alert(transText.failed_import);
          }
        }
        function onDownloadFile(e) {
            var url = Ermis.link+'-DownloadExcel';
            window.open(url);
        }
        function onExcel(e) {
            grid.saveAsExcel();
        }
        function onPDF(e) {
            grid.saveAsPDF();
        }

    };

    var initLoadBarcode = function(){
     jQuery.post( Ermis.link+'-load', function( result ) {
        jQuery("input[name='code']").val(initBarcodeMasker(result.data))
        });
    }


    var initKendoUiSearchbox = function () {
        $(".header_main_search_input").on("keypress blur change", function () {
            var filter = { logic: "or", filters: [] };
            $searchValue = $(this).val();
            if ($searchValue) {
                $.each(data.columns, function (key, column) {
                    if (column.hidden === false && column.key != 'checkbox') {
                        if (column.type === 'number') {
                            filter.filters.push({ field: column.field, operator: "eq", value: $searchValue });
                        } else if (column.type === 'boolean') {
                            filter.filters.push({ field: column.field, operator: "eq", value: $searchValue });
                        } else if (column.type === 'date') {
                            filter.filters.push({ field: column.field, operator: "eq", value: $searchValue });
                        } else {
                            filter.filters.push({ field: column.field, operator: "contains", value: $searchValue });
                        }

                    }
                });
            }
            $kGrid.data("kendoGrid").dataSource.query({ filter: filter });
        });
    };

    var initSaveComplete = function(rd){
      var grid = $kGrid.data("kendoGrid");
      if (rd.d === null) {
          grid.dataSource.insert(0, rd.data);
          jQuery.each(data.columns, function (k, v) {
              if (v.addoption === "true") {
                  jQuery('select[name="' + v.field + '"]').data("kendoDropDownList").dataSource.add({ "text": rd.data.code + ' - ' + rd.data.name, "value": rd.data.id });
              }
          });
      } else {
        var selectedItem = [];
        if(rd.a == 1){
            var dataItem  = grid.dataSource.get(rd.data.id);
            var row = grid.tbody.find("tr[data-uid='" + dataItem.uid + "']");
            selectedItem = grid.dataItem(row);
        }else{
            selectedItem = grid.dataItem(grid.select());
        }
          jQuery.each(data.columns, function (k, col) {
              if (col.field && selectedItem[col.field] !== rd.data[col.field]) {
                  selectedItem.set(col.field, rd.data[col.field]);
              }
          });
          jQuery.each(data.columns, function (k, v) {
              if (v.addoption === "true" && rd.obj.code !== rd.data.code || v.addoption === "true" && rd.obj.name !== rd.data.name) {
                  var index = parseInt(jQuery('select[name="' + v.field + '"]').find('option[value=' + rd.data.id + ']').index());
                  jQuery('select[name="' + v.field + '"]').data("kendoDropDownList").dataItem(index).set("text", rd.data.code + ' - ' + rd.data.name);
              }
          });
      }
    }

    var initSave = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            $.when(KendoUiConfirm(transText.are_you_sure, transText.message)).then(function (confirmed) {
                if (confirmed) {
                    var obj = {}; var crit = false;
                    obj.id = dataId;
                    obj.type = jQuery('#tabstrip').find('.k-state-active').attr("data-search");
                    jQuery.each(data.columns, function (k, col) {
                        if (col.null === true && !jQuery('input[name="' + col.field + '"]').val()) {
                            crit = false;
                            return false;
                        } else {
                            crit = true;
                        }

                        if (col.key === 'text' || col.key === 'password' || col.key === 'number') {
                            if (jQuery('input[name="' + col.field + '"]').hasClass('number-price') || jQuery('input[name="' + col.field + '"]').hasClass('number')) {
                                obj[col.field] = jQuery('input[name="' + col.field + '"]').data("kendoNumericTextBox").value();
                            } else {
                                obj[col.field] = jQuery('input[name="' + col.field + '"]').val().trim();
                                if (col.type === 'date') {
                                    obj[col.field] = formatDateDefault(obj[col.field]);
                                }
                            }

                        } else if (col.key === 'select' && jQuery('select[name = ' + col.field + ']').hasClass("droplist")) {
                            obj[col.field] = jQuery('.droplist[name="' + col.field + '"]').data('kendoDropDownList').value();
                        } else if (col.key === 'select' && jQuery('select[name = ' + col.field + ']').hasClass("multiselect")) {
                            var arr = jQuery('.multiselect[name="' + col.field + '"]').data('kendoMultiSelect').value();
                            obj[col.field] = arr.join();
                        } else if (col.key === 'textarea') {
                            obj[col.field] = jQuery('textarea[name="' + col.field + '"]').val();
                        } else if (col.key === 'checkbox') {
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
                        }else if (col.key === 'radio') {
                            obj[col.field] = jQuery('input[name="' + col.field + '"]:checked').val();
                        }
                    });
                    if (crit === true) {
                        var postdata = { data: JSON.stringify(obj) };
                        RequestURLWaiting(Ermis.link+'-save', 'json', postdata, function (result) {
                            if (result.status === true) {
                              room.emit('client-send-save', {data : result.data, d :dataId , a:1 , obj : obj})
                              initSaveComplete({data : result.data, d :dataId ,a:2 , obj : obj})
                            }
                            myWindow.data("kendoWindow").close();
                            kendo.alert(result.message);
                            initStatus(4);
                        }, true);

                    } else {
                        kendo.alert(transText.please_fill_field);
                    }
                }
            });
        }
        jQuerylink.data('lockedAt', +new Date());
    };

    var initAdd = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            if (Ermis.per.a) {
                dataId = null;
                $kWindow.title(transText.add);
                initStatus(2);
            } else {
                kendo.alert(transText.you_not_permission_add);
            }
        }
        jQuerylink.data('lockedAt', +new Date());
    };

    var initCopy = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            if (Ermis.per.a) {
                if ($kGrid.find('.k-state-selected').length > 0) {
                    dataId = null;
                    $kWindow.title(transText.copy);
                    initStatus(3);
                } else {
                    kendo.alert(transText.please_select_line_copy);
                }
            } else {
                kendo.alert(transText.you_not_permission_add);
            }
        }
        jQuerylink.data('lockedAt', +new Date());
    };

    var initEdit = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            if (Ermis.per.e) {
                if ($kGrid.find('tr.k-state-selected').length > 0) {
                    $kWindow.title(transText.edit);
                    initStatus(3);
                } else {
                    kendo.alert(transText.please_select_line_edit);
                }
            } else {
                kendo.alert(transText.you_not_permission_edit);
            }
        }
        jQuerylink.data('lockedAt', +new Date());
    };

    var initCancel = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            $.when(KendoUiConfirm(transText.are_you_sure, transText.message)).then(function (confirmed) {
                if (confirmed) {
                    myWindow.data("kendoWindow").close();
                    initStatus(4);
                }
            });
        }
        jQuerylink.data('lockedAt', +new Date());
    };

    var initDelete = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            if (Ermis.per.d) {
                if ($kGrid.find('.k-state-selected').length > 0) {
                    $.when(KendoUiConfirm(transText.are_you_sure, transText.message)).then(function (confirmed) {
                        if (confirmed) {
                            var postdata = { data: JSON.stringify(dataId) };
                            RequestURLWaiting(Ermis.link+'-delete', 'json', postdata, function (result) {
                                if (result.status === true) {
                                    room.emit('client-send-delete', dataId )
                                    var grid = $kGrid.data("kendoGrid");
                                    grid.removeRow($kGrid.find('.k-state-selected'));
                                }
                                myWindow.data("kendoWindow").close();
                                kendo.alert(result.message);
                                initStatus(4);
                            }, true);
                        }
                    });
                } else {
                    kendo.alert(transText.please_select_line_delete);
                }
            } else {
                kendo.alert(transText.you_not_permission_delete);
            }
        }
        jQuerylink.data('lockedAt', +new Date());
    };

    var initImport = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            if ($import) {
                $import.data("kendoDialog").open();
            } else {
                initKendoUiDialog(2);
            }
        }
        jQuerylink.data('lockedAt', +new Date());
    };

    var initExport = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            if ($export) {
                $export.data("kendoDialog").open();
            } else {
                initKendoUiDialog(1);
            }
        }
        jQuerylink.data('lockedAt', +new Date());
    };

    var onChange = function () {
        var grid = this;
        var dataItem = grid.dataItem(grid.select());
        dataId = dataItem.id;
        jQuery.each(data.columns, function (k, col) {
            if (col.key === 'text' || col.key === 'password' || col.key === 'number') {
                if (col.type === 'date') {
                    jQuery('input[name="' + col.field + '"]').val(kendo.toString(kendo.parseDate(dataItem[col.field], 'yyyy-mm-dd'), 'dd/MM/yyyy'));
                } else if (jQuery('input[name = ' + col.field + ']').hasClass("color")) {
                    var color = kendo.parseColor(color);
                    jQuery('input[name="' + col.field + '"]').data("kendoColorPicker").value(dataItem[col.field]);
                }else if (jQuery('input[name = ' + col.field + ']').hasClass("number-price") || jQuery('input[name = ' + col.field + ']').hasClass("number")) {
                    jQuery('input[name="' + col.field + '"]').data("kendoNumericTextBox").value(dataItem[col.field]);
                } else {
                    jQuery('input[name="' + col.field + '"]').val(dataItem[col.field]);
                }
            } else if (col.key === 'select') {
                if (dataItem[col.field] === null) {
                    jQuery('select[name="' + col.field + '"]').data('kendoDropDownList').value("0");
                } else {
                 if(jQuery('select[name="' + col.field + '"]').hasClass("multiselect")){
                    jQuery('select[name="' + col.field + '"]').data('kendoMultiSelect').value(dataItem[col.field].split(","));
                  }else{
                    jQuery('select[name="' + col.field + '"]').data('kendoDropDownList').value(dataItem[col.field]);
                }
              }

            } else if (col.key === 'checkbox') {
                  if (dataItem[col.field] === "1" || dataItem[col.field] === true || dataItem[col.field] === 1) {
                    jQuery('input[name="' + col.field + '"]').parent().addClass('checked');
                } else {
                    jQuery('input[name="' + col.field + '"]').parent().removeClass('checked');
                }
            } else if (col.key === 'textarea') {
                if (jQuery('textarea[name = ' + col.field + ']').hasClass("editor")) {
                    var decoded = $("<div/>").html(dataItem[col.field]).text();
                    jQuery('textarea[name="' + col.field + '"]').data("kendoEditor").value(decoded);
                } else {
                    jQuery('textarea[name="' + col.field + '"]').val(dataItem[col.field]);
                }
            } else if (col.key === 'radio') {
                jQuery('input[name="' + col.field + '"][value=' + dataItem[col.field] + ']').attr("checked","checked");
            }
        });
    };

    var initKendoUiDropList = function () {
        jQuery(".droplist").kendoDropDownList({
            filter: "contains"
        });
    };

    var initKendoUiMultiSelect = function () {
        jQuery(".multiselect").kendoMultiSelect({
            autoClose: false,
            tagTemplate: ('<span>#: FormatMultiSelectValue(data.text) #</span>'),
            filter: "contains"
            //select: onSelectMultil
        });
    };

    var initKendoUiNumber = function () {
        $(".number").kendoNumericTextBox({
            format: "n0",
            step: 1
        });
    };
    var initKendoUiNumberPrice = function () {
        $(".number-price").kendoNumericTextBox({
            format: "n0",
            step: 1000
        });
    };

    var initKendoColor = function(){
     jQuery(".color").kendoColorPicker({
        buttons: false,
        value: "#FFFFFF"
      })
    }

    var initKendoUiWindow = function () {
        function onClose() {
            initStatus(4);
        }
        $kWindow = myWindow.kendoWindow({
            width: jQuery(window).width() * 0.75,
            title: "",
            visible: false,
            actions: [
                "Pin",
                "Minimize",
                "Maximize",
                "Close"
            ],
            modal: true,
            close: onClose
        }).data("kendoWindow").center();
    };

    var initKendoUiGridView = function () {
      var grid =  $kGrid.kendoGrid({
            dataSource: {
                data: Ermis.data,
                pageSize: 20
            },
            scrollable: {
             virtual: true
            },
            change: onChange,
            selectable: "row",
            height: jQuery(window).height() * 0.75,
            groupable: true,
            sortable: true,
            pageable: {
                refresh: true,
                pageSizes: true,
                buttonCount: 5
            },
            filterable: true,
            schema: {
                model: {
                    fields: data.fields
                }
            },
            columns: data.columns,
            dataBound: function () {
                var currentPage = this.dataSource.page();
                var Pagesize  = this.dataSource.pageSize();
                var rows = this.items();
                $(rows).each(function () {
                    var index = (currentPage - 1) * Pagesize + ($(this).index()  + 1);
                    var rowLabel = $(this).find(".row-number");
                    $(rowLabel).html(index);
                });
            },
        });
        grid.data("kendoGrid").thead.kendoTooltip({
          filter: "th",
          content: function (e) {
              var target = e.target; // element for which the tooltip is shown
              return $(target).text();
          }
      });
    };

    return {

        init: function () {
            initStatus(Ermis.flag);
            initKendoUiDatePicker();
            initKendoUiTabStrip();
            initGetColunm();
            initKendoUiDropList();
            initKendoUiContextMenu();
            initKendoUiGridView();
            initKendoUiSearchbox();
            initKendoUiWindow();
            initKendoUiNumber();
            initKendoUiNumberPrice();
            initKendoColor();
            initKendoUiMultiSelect();
            initKendoUiEditor();
            initWsConnectRoom();
            initWsListenServer();
        }

    };

}();

jQuery(document).ready(function () {
    Ermis.init();
});
