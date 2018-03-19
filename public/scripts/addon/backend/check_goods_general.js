var Ermis = function () {
    var $kGrid = jQuery("#grid");
    var dataId = '';
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
                  if ($kGrid.find('.k-state-selected').length > 0) {
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

      var initStatus = function(){
        jQuery(".view").on("click",initView);
        jQuery(".new").on("click",initNew);
        jQuery('.delete').on('click', initDelete);
      }

    return {
        //main function to initiate the module
        init: function () {
            initKendoGrid();
            initStatus();
        }
    };
}();

jQuery(document).ready(function () {
    Ermis.init();
});
