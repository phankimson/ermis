var Ermis = function () {
    var $import = '';  var a = []; var b;
    var data = [];
    var initStatus = function () {
        jQuery(".save").on("click", initSave);
        jQuery(".cancel").on("click", initCancel);
        jQuery(".import").on("click", initImport);
    }
    var initGetColunm = function () {
        data = GetAllDataForm('#tabs_anim');
        return data;
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

    var initKendoUiDialog = function (type) {
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

        function onImportFile(e) {
            var type = jQuery("#page_content_inner .uk-tab").find(".uk-active").attr("data-type");
            var a = jQuery('#import-form').get(0);
            var FileUpload = new FormData(a); // XXX: Neex AJAX2
            // You could show a loading image for example...
            RequestFileURLWaiting(Ermis.link+'-import' + type, 'post', FileUpload, function (results) {
                if (results.status === true) {
                    if (type === "5") {
                        var grid = $kGrid.data("kendoTreeList");
                        ds = new kendo.data.TreeListDataSource({
                            data: results.data,
                            schema: {
                                model: {
                                    id: "id",
                                    parentId: "parent_id",
                                    fields: Ermis.field,
                                    expanded: true
                                },

                            }
                        });
                        grid.setDataSource(ds);
                    } else if (type === "4") {
                        var grid1 = $kGrid1.data("kendoGrid");
                        ds = new kendo.data.DataSource({ data: results.data, pageSize: 8, schema: { model: { fields: Ermis.field1 } } });
                        grid1.setDataSource(ds);
                    } else if (type === "3") {
                        var grid2 = $kGrid2.data("kendoGrid");
                        ds = new kendo.data.DataSource({ data: results.data, pageSize: 8, schema: { model: { fields: Ermis.field2 } } });
                        grid2.setDataSource(ds);
                    } else if (type === "2") {
                        var grid3 = $kGrid3.data("kendoGrid");
                        ds = new kendo.data.DataSource({ data: results.data, pageSize: 8, schema: { model: { fields: Ermis.field3 } } });
                        grid3.setDataSource(ds);
                    } else if (type === "1") {
                        var grid4 = $kGrid4.data("kendoGrid");
                        ds = new kendo.data.DataSource({ data: results.data, pageSize: 8, schema: { model: { fields: Ermis.field4 } } });
                        grid4.setDataSource(ds);
                    }
                }
                jQuery(".k-upload-files.k-reset").find("li").remove();
                kendo.alert(results.message);
            }, true);
        }
        function onDownloadFile(e) {
            var type = jQuery("#page_content_inner .uk-tab").find(".uk-active").attr("data-type");
            var url = 'DownloadExcel' + type;
            window.open(url);
        }
    };
    var initKendoUiDropList = function () {
        jQuery(".droplist").kendoDropDownList({
            filter: "contains",
            change: onChange
        });
        function onChange(e) {
            var dataItem = this.dataItem(e.item);
            var postdata = { data: JSON.stringify(dataItem.value)};
            RequestURLWaiting(Ermis.link+'-load', 'json', postdata, function (result) {
                if (result.status === true) {
                    var grid4 = $kGrid4.data("kendoGrid");
                    ds = new kendo.data.DataSource({ data: result.data, pageSize: 8, schema: { model: { fields: Ermis.field4 } } });
                    grid4.setDataSource(ds);
                }else{
                        jQuery('#notification').EPosMessage('error',result.message);
                }
            }, true);
        }

    };

    var initKendoUiUpload = function () {
        jQuery("#files").kendoUpload({ "multiple": false });
    };

    var initSave = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            $.when(KendoUiConfirm(transText.are_you_sure, transText.message)).then(function (confirmed) {
                if (confirmed) {
                    var obj = {}; var crit = true;
                    jQuery.each(data.columns, function (k, col) {
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
                            obj[col.field] = jQuery('textarea[name="' + col.field + '"]').val().trim();
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
                        } else if (col.key === 'radio') {
                            obj[col.field] = jQuery('input[name="' + col.field + '"]:checked').val();
                        }
                    });
                    if (crit === true) {
                        var postdata = { data: JSON.stringify(obj)};
                        RequestURLWaiting(Ermis.link+'-save', 'json', postdata, function (result) {
                            if (result.status === true) {
                                jQuery('#notification').EPosMessage('success', result.message);
                            } else {
                                jQuery('#notification').EPosMessage('error', result.message);
                            }
                        }, true);

                    } else {
                        jQuery('#notification').EPosMessage('error', transText.please_fill_field);
                    }
                }
            });
        }
        jQuerylink.data('lockedAt', +new Date());
    };

    var initCancel = function () {
        var obj = {};
        var postdata = { data: JSON.stringify(obj)};
        RequestURLWaiting(Ermis.link+'-cancel', 'json', postdata, function (result) {
            if (result.status === true) {
                    jQuery.each(result.data, function (k, v) {
                      jQuery('input[name='+v.code+'-1]').val(v.value)
                      jQuery('input[name='+v.code+'-2]').val(v.value1)
                      jQuery('input[name='+v.code+'-3]').val(v.value2)
                      jQuery('input[name='+v.code+'-4]').val(v.value3)
                      jQuery('input[name='+v.code+'-5]').val(v.value4)
                      jQuery('input[name='+v.code+'-6]').val(v.value5)
                    })
            }else{
                  jQuery('#notification').EPosMessage('error',result.message);
            }
        }, true);
    }



    return {
        //main function to initiate the module
        init: function () {
            initGetColunm();
            initKendoUiDropList();
            //initGrid();
            initStatus();
        }
    };
}();

jQuery(document).ready(function () {
    Ermis.init();
});
