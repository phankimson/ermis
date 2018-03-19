var Ermis = function () {
    var $kGrid = jQuery("#grid");
    var $kGrid1 = jQuery("#grid1");
    var $kGrid2 = jQuery("#grid2");
    var $kGrid3 = jQuery("#grid3");
    var $kGrid4 = jQuery("#grid4");
    var $import = '';  var a = []; var b;
    var initStatus = function () {
        jQuery(".save").on("click", initSave);
        jQuery(".cancel").on("click", initCancel);
        jQuery(".import").on("click", initImport);
    }
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
                  kendo.alert(result.message);
                }
            }, true);
        }

    };

    var initKendoUiUpload = function () {
        jQuery("#files").kendoUpload({ "multiple": false });
    };
    var initGrid = function () {
        var dataSource = new kendo.data.TreeListDataSource({
            pageSize  : 20,
            data: Ermis.data,
            schema: {
                model: {
                    id: "id",
                    parentId: "parent_id",
                    fields: Ermis.field,
                    expanded: true
                },

            }
        });
      var grid = $kGrid.kendoTreeList({
            dataSource: dataSource,
            height: jQuery(window).height() * 0.75,
            groupable: true,
            sortable: true,
            pageable: false,
            filterable: true,
            editable: true,
            edit: onEdit,
            save : onSave,
            columns: Ermis.columns
        });
        grid.data('kendoTreeList').thead.kendoTooltip({
          filter: "th",
          content: function (e) {
              var target = e.target; // element for which the tooltip is shown
              return $(target).text();
          }
      });
        function onSave(e) {
            var treelist = this;
            var model = e.model;
            var updatedElement = {
                id: model.id,
                parent_id: model.parent_id,
                debt_account: model.debt_account,
                credit_account: model.credit_account,
            };
            treelist.dataSource.pushUpdate(updatedElement);
            var data = treelist.dataSource.data();
            var data_sort = jQuery.grep(data, function (n) {
                return (n.hasChildren === true);
            });
            data_sort.sort(sort_by('name', true, function (a) { return a.toUpperCase() }));
            jQuery.each(data_sort, function (k, v) {
                 var arr = jQuery.grep(data, function (n) {
                        return (n.parentId === v.id);
                 });
                 var keys = 0;
                 jQuery.each(data, function (x, y) {
                     if (y.id === v.id) {
                         keys = x;
                         return false;
                     };
                 });
                 var count_debt_account = 0; var count_credit_account = 0;
                 jQuery.each(arr, function (s,c) {
                     count_debt_account += c.debt_account;
                     count_credit_account += c.credit_account;
                 });
                 data[keys].debt_account = count_debt_account;
                 data[keys].credit_account = count_credit_account;
            })
            jQuery.each(data, function (k, v) {
                var updatedElement = {
                    id: v.id,
                    parent_id: v.parent_id,
                    debt_account: v.debt_account,
                    credit_account: v.credit_account,
                };
                treelist.dataSource.pushUpdate(updatedElement);
            });
        }
        function onEdit(e) {
            var model = e.model;
            if (model.hasChildren === true) {
                var treeList = this;
                treeList.saveRow();
                kendo.alert(transText.belongs_group_can_not_edit);
            }
        }
    }
    var initKendoGrid = function () {
        dataSource = new kendo.data.DataSource({
            data: Ermis.data1,
            batch: true,
            pageSize: 8,
            schema: {
                model: {
                    id: "id",
                    fields: Ermis.field1
                }
            }
        });
        var grid = $kGrid1.kendoGrid({
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
            filterable: true,
            pageable: true,
            columns: Ermis.columns1
        });
        grid.data('kendoGrid').thead.kendoTooltip({
          filter: "th",
          content: function (e) {
              var target = e.target; // element for which the tooltip is shown
              return $(target).text();
          }
      });

    };

    var initKendoGrid1 = function () {
        dataSource = new kendo.data.DataSource({
            data: Ermis.data2,
            batch: true,
            pageSize: 8,
            schema: {
                model: {
                    id: "id",
                    fields: Ermis.field2
                }
            }
        });
      var grid =  $kGrid2.kendoGrid({
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
            filterable: true,
            pageable: true,
            columns: Ermis.columns2
        });
        grid.data('kendoGrid').thead.kendoTooltip({
          filter: "th",
          content: function (e) {
              var target = e.target; // element for which the tooltip is shown
              return $(target).text();
          }
      });
    };


    var initKendoGrid2 = function () {
        dataSource = new kendo.data.DataSource({
            data: Ermis.data3,
            batch: true,
            pageSize: 8,
            schema: {
                model: {
                    id: "id",
                    fields: Ermis.field3
                }
            }
        });
        var grid = $kGrid3.kendoGrid({
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
            filterable: true,
            pageable: true,
            columns: Ermis.columns3
        });

        grid.data('kendoGrid').thead.kendoTooltip({
          filter: "th",
          content: function (e) {
              var target = e.target; // element for which the tooltip is shown
              return $(target).text();
          }
      });

    };

    var initKendoGrid3 = function () {
        dataSource = new kendo.data.DataSource({
            data: Ermis.data4,
            batch: true,
            pageSize: 8,
            schema: {
                model: {
                    id: "id",
                    fields: Ermis.field4
                }
            }
        });
      var grid = $kGrid4.kendoGrid({
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
            filterable: true,
            pageable: true,
            columns: Ermis.columns4
        });
        grid.data('kendoGrid').thead.kendoTooltip({
          filter: "th",
          content: function (e) {
              var target = e.target; // element for which the tooltip is shown
              return $(target).text();
          }
      });
    };

    var initSave = function () {
        var obj = {};
        obj.type = jQuery("#tabs-strip").find(".uk-active[aria-expanded='true']").attr("data-type");
        if (obj.type === "5") {//ACCOUNT
        obj.account = $kGrid.data("kendoTreeList").dataSource.data();
      } else if (obj.type === "4") {//BANKACCOUNT
        obj.bank = $kGrid1.data("kendoGrid").dataSource.data();
      } else if (obj.type === "3") {//CUSTOMER
        obj.customer = $kGrid2.data("kendoGrid").dataSource.data();
      } else if (obj.type === "2") {//SUPLIER
            obj.suplier = $kGrid3.data("kendoGrid").dataSource.data();
        } else if (obj.type === "1") {//GOODS
            obj.goods = $kGrid4.data("kendoGrid").dataSource.data();
            obj.stock = jQuery('select[name="stock"]').data('kendoDropDownList').value();
        }
        var postdata = { data: JSON.stringify(obj)};
        RequestURLWaiting(Ermis.link+'-save', 'json', postdata, function (result) {
            if (result.status === true) {
                kendo.alert(result.message);
            }
        }, true);
    }
    var initCancel = function () {
        var obj = {};
        obj.type = jQuery(".uk-tab").find(".uk-active[aria-expanded='true']").attr("data-type");
        obj.stock = jQuery('select[name="stock"]').data('kendoDropDownList').value();
        var postdata = { data: JSON.stringify(obj)};
        RequestURLWaiting(Ermis.link+'-cancel', 'json', postdata, function (result) {
            if (result.status === true) {
                if (obj.type === "5") {
                    var grid = $kGrid.data("kendoTreeList");
                    ds = new kendo.data.TreeListDataSource({
                        data: result.data,
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
                } else if (obj.type === "4") {
                    var grid1 = $kGrid1.data("kendoGrid");
                    ds = new kendo.data.DataSource({ data: result.data, pageSize: 8, schema: { model: { fields: Ermis.field1 } } });
                    grid1.setDataSource(ds);
                } else if (obj.type === "3") {
                    var grid2 = $kGrid2.data("kendoGrid");
                    ds = new kendo.data.DataSource({ data: result.data, pageSize: 8, schema: { model: { fields: Ermis.field2 } } });
                    grid2.setDataSource(ds);
                } else if (obj.type === "2") {
                    var grid3 = $kGrid3.data("kendoGrid");
                    ds = new kendo.data.DataSource({ data: result.data, pageSize: 8, schema: { model: { fields: Ermis.field3 } } });
                    grid3.setDataSource(ds);
                } else if (obj.type === "1") {
                    var grid4 = $kGrid4.data("kendoGrid");
                    ds = new kendo.data.DataSource({ data: result.data , pageSize: 8,schema: { model: { fields: Ermis.field4 } } });
                    grid4.setDataSource(ds);
                }
            }
        }, true);
    }
    getItemName = function (ID, data, field) {
        var value = '';
        b = field;
        a[b] = data;
        if (ID > 0 || ID != "") {
            var result = $.grep(eval(a[b]), function (n, i) {
                return n.id === ID;
            });
            if (result.length > 0) {
                value = result[0].code;
            }
        } else {
            value = '----SELECT-----';
        }
        return value;
    };


    return {
        //main function to initiate the module
        init: function () {
            initKendoUiDropList();
            //initGrid();
            initStatus();
            //initKendoGrid();
            initKendoGrid1();
            initKendoGrid2();
            initKendoGrid3();
        }
    };
}();

jQuery(document).ready(function () {
    Ermis.init();
});
