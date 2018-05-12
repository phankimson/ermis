var Ermis = function () {
    var $kGrid = jQuery("#grid");
    var dataId = '';
    var $print = '';
    var initKendoGrid = function () {
        dataSource = new kendo.data.DataSource({
            data: Ermis.data,
            batch: false,
            pageSize: 8,
            schema: {
                model: {
                    id: "id",
                    fields: Ermis.field
                }
            },
              aggregate: Ermis.aggregate,
        });
        var grid = $kGrid.kendoGrid({
            dataSource: dataSource,
            save: function (data) {
                var grid = this;
                setTimeout(function () {
                    grid.refresh();
                });
            },
            height: jQuery(window).height() * 0.5,
            editable: false,
            selectable: "row",
            filterable: true,
            change : onChange,
            pageable: true,
            columns: Ermis.columns
        });

        grid.data("kendoGrid").thead.kendoTooltip({
          filter: "th",
          content: function (e) {
              var target = e.target; // element for which the tooltip is shown
              return $(target).text();
          }
      });

    }

    var onChange = function () {
        var grid = this;
        var dataItem = grid.dataItem(grid.select());
        dataId = dataItem.id;
    };


      var initNew = function (e) {
          var jQuerylink = jQuery(e.target);
          e.preventDefault();
          if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
              if (Ermis.per.a) {
                  localStorage.removeItem("dataId");
                  window.location = Ermis.action.new;
              } else {
                  kendo.alert(transText.you_not_permission_add);
              }
          }
          jQuerylink.data('lockedAt', +new Date());
      };


      var initView = function (e) {
          var jQuerylink = jQuery(e.target);
          e.preventDefault();
          if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
              if (Ermis.per.a) {
                  localStorage.dataId = dataId;
                  window.location = Ermis.action.view;
              } else {
                  kendo.alert(transText.you_not_permission_add);
              }
          }
          jQuerylink.data('lockedAt', +new Date());
      };

      var initDelete = function (e) {
          var jQuerylink = jQuery(e.target);
          e.preventDefault();
          if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
              if (Ermis.per.d) {
                if ($kGrid.find('tr.k-state-selected').length > 0)  {
                      $.when(KendoUiConfirm(transText.are_you_sure, transText.message)).then(function (confirmed) {
                          if (confirmed) {
                              var postdata = { data: JSON.stringify(dataId)};
                              RequestURLWaiting(Ermis.link+'-delete', 'json', postdata, function (result) {
                                  if (result.status === true) {
                                      var grid = $kGrid.data("kendoGrid");
                                      grid.removeRow($kGrid.find('.k-state-selected'));
                                      jQuery('#notification').EPosMessage('success', result.message);
                                  } else {
                                      jQuery('#notification').EPosMessage('error', result.message);
                                  }
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

      var initPrint = function (e) {
          var jQuerylink = jQuery(e.target);
          e.preventDefault();
          if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            if ($kGrid.find('tr.k-state-selected').length > 0)  {
              if ($print) {
                  $print.data("kendoDialog").open();
              } else {
                  initKendoUiDialog(1);
              }
            } else {
                kendo.alert(transText.please_select_line);
            }
          }
          jQuerylink.data('lockedAt', +new Date());
      };

      var initKendoUiDialog = function (type) {
        if (type === 1) {
            $print = $("#print").kendoDialog({
                width: "400px",
                title: "Print",
                closable: true,
                modal: true,
                actions: [
                    { text: "In Giảm", action: onPrintDown },
                    { text: "In Tăng", action: onPrintUp },
                    { text: "Close", primary: true }
                ]
            });
        }
        function onPrintDown(e) {
          var obj = {};
          var grid = $kGrid.data("kendoGrid");
          var dataItem  = grid.dataItem(grid.select());
          if(dataItem){
            obj.id = dataItem.id;
            obj.type = 11;
            obj.voucher = 9;
            var postdata = { data: JSON.stringify(obj)};
            RequestURLWaiting(Ermis.link+'-print', 'json', postdata, function (result) {
                if (result.status === true) {
                  if (result.detail_content) {
                    var decoded = $("<div/>").html(result.print_content).text();
                      decoded = decoded.replace('<tr class="detail_content"></tr>', result.detail_content);
                      PrintForm(jQuery('#print_template'), decoded);
                      jQuery('#print_template').html("");
                  }
                }
            }, true);
          }
        }
        function onPrintUp(e) {
          var obj = {};
          var grid = $kGrid.data("kendoGrid");
          var dataItem  = grid.dataItem(grid.select());
          if(dataItem){
            obj.id = dataItem.id;
            obj.type = 10;
            obj.voucher = 8;
            var postdata = { data: JSON.stringify(obj)};
            RequestURLWaiting(Ermis.link+'-print', 'json', postdata, function (result) {
                if (result.status === true) {
                  if (result.detail_content) {
                    var decoded = $("<div/>").html(result.print_content).text();
                      decoded = decoded.replace('<tr class="detail_content"></tr>', result.detail_content);
                      PrintForm(jQuery('#print_template'), decoded);
                      jQuery('#print_template').html("");
                  }
                }
            }, true);
          }
        }
      };

      var initStatus = function(){
        jQuery(".view").on("click",initView);
        jQuery(".new").on("click",initNew);
        jQuery('.delete').on('click', initDelete);
        jQuery(".print").on("click", initPrint);
      }

    return {
        //main function to initiate the module
        init: function () {
            initKendoGrid();
            initStatus();
            initKendoUiDialog();
        }
    };
}();

jQuery(document).ready(function () {
    Ermis.init();
});
