var Permission = function () {
    var keys = [];
    var key_permission = function(){
        keys[0] = "v";
        keys[1] = "a";
        keys[2] = "e";
        keys[3] = "d";
        return keys;
    }

    var group_click = function (e) {
        var group = jQuery(this).attr('data-group');
        if (jQuery(this).hasClass('group-hide')) {
            jQuery(this).find('i').html("remove");
            jQuery(this).removeClass('group-hide');
            jQuery('.item[data-group="' + group + '"]').show();
        } else {
            jQuery(this).addClass('group-hide');
            jQuery(this).find('i').html("add");
            jQuery('.item[data-group="' + group + '"]').hide();
        }
    };
    var checkbox_group = function (e) {
        var group = jQuery(this).attr('name');
        if (jQuery(this).parent().hasClass('checked')) {
            jQuery('input[data-group="' + group + '"]').parent().addClass('checked');
        } else {
            jQuery('input[data-group="' + group + '"]').parent().removeClass('checked');
        }
    };
    var load_checkbox_group = function (e) {
        jQuery('.checkbox-group').each(function (e) {
            var name = jQuery(this).attr('name');
            var i = true;
            jQuery('input[data-group="' + name + '"]').each(function (e) {
                if (!jQuery(this).parent().hasClass('checked')) {
                    i = false;
                    return false;
                }
            });
            if (i === true) {
                jQuery(this).parent().addClass('checked');
            } else {
                jQuery(this).parent().removeClass('checked');
            }
        });
    }
    var checkbox_all = function (e) {
        var group = jQuery(this).attr('name');
        if (jQuery(this).parent().hasClass('checked')) {
            jQuery('input[data-group^="' + group + '"]').parent().addClass('checked');
            jQuery('input[name^="' + group + '"]').parent().addClass('checked');
        } else {
            jQuery('input[data-group^="' + group + '"]').parent().removeClass('checked');
            jQuery('input[name^="' + group + '"]').parent().removeClass('checked');
        }
    };
    var load_checkbox_all = function (e) {
        jQuery('.all').each(function (e) {
            var name = jQuery(this).attr('name');
            var i = true;
            jQuery('input[name^="' + name + '"]').not('#accordion_mode_main_menu').not('.filter').not('.all').each(function (e) {
                if (!jQuery(this).parent().hasClass('checked')) {
                    i = false;
                    return false;
                }
            });
            if (i === true) {
                jQuery(this).parent().addClass('checked');
            } else {
                jQuery(this).parent().removeClass('checked');
            }
        });
    };
    var change_user = function (e) {
        var id = jQuery(this).val();
        var postdata = { data: id };
        RequestURLWaiting('permission-get', 'json', postdata, function (data) {
            if (data.status === true) {
                //                    jQuery('#notification').EPosMessage('success',data.message);
                jQuery("input[type='checkbox']").parent().removeClass('checked');
                check_checkbox(data.data);
                load_checkbox_group();
                load_checkbox_all();
            } else {
               jQuery("input[type='checkbox']").parent().removeClass('checked');
                //                    jQuery('#notification').EPosMessage('error', data.message);
            }
        }, true);
    };
    var check_checkbox = function (data) {
        jQuery('tr').removeAttr('id');
        if (data.length>0) {
            jQuery.each(data, function (key, value) {
                jQuery.each(keys, function (k, v) {
                    if (value[v] === true) {
                        jQuery('input[name="' + v +'-'+value.menu + '"]').parent().addClass('checked');
                    } else {
                        jQuery('input[name="' + v +'-'+ value.menu + '"]').parent().removeClass('checked');
                    }
                })
                jQuery('tr[data-id="' + value.menu + '"]').attr('id', value.id);
            });
        } else {
            jQuery('input:checkbox').parent().removeClass('checked');
        }
    };
    //var load_id = function (data) {
    //    if (data) {
    //        jQuery.each(data, function (key, value) {
    //            jQuery('tr[data-id="' + value + '"]').attr('id', key);
    //        });
    //    }
    //};
    var btnSave = function (e) {
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
            if (Permission.per.e) {
            $.when(KendoUiConfirm(transText.are_you_sure, transText.message)).then(function (confirmed) {

                if (confirmed) {
                    var user = jQuery('#user').val();
                    if (user !=="") {
                        var aryData = [];
                        jQuery('.uk-table tr.item').each(function (i, obj) {
                            var id = jQuery(this).attr('id');
                            if (!id) {
                                id = null;
                            }
                            var menu = jQuery(this).attr('data-id');
                            var items = jQuery(this).find('.checkbox-item');
                            var permission = 0;
                            jQuery.each(items, function (y,o) {
                                var name = jQuery(this).attr('name').split('-', 1)[0];
                                if (jQuery(this).parent().hasClass('checked')) {
                                        permission += Math.pow(2, y);
                                }
                            });
                                aryData.push({ "permission": permission, "menu": menu, "user": user, "id": id });
                        });
                        var postdata = { data: JSON.stringify(aryData) };
                        RequestURLWaiting('permission-save', 'json', postdata, function (data) {
                            if (data.status === true) {
                                jQuery('#notification').EPosMessage('success', data.message);
                            } else {
                                jQuery('#notification').EPosMessage('error', data.message);
                            }
                        }, true);
                    } else {
                        jQuery('#notification').EPosMessage('error', transText.please_choose_user);
                    }
                }
            });
            } else {
                kendo.alert(transText.you_not_permission_edit);
            }
        }
        jQuerylink.data('lockedAt', +new Date());
    }

    var btnCancel = function(e){
      var jQuerylink = jQuery(e.target);
      e.preventDefault();
      if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
                var id = jQuery("#user").val();
                var postdata = { data: id };
                RequestURLWaiting('permission-get', 'json', postdata, function (data) {
                    if (data.status === true) {
                        //                    jQuery('#notification').EPosMessage('success',data.message);
                        check_checkbox(data.data);
                        load_checkbox_group();
                        load_checkbox_all();
                    } else {
                       jQuery("input[type='checkbox']").parent().removeClass('checked');
                        //                    jQuery('#notification').EPosMessage('error', data.message);
                    }
                }, true);
      }
      jQuerylink.data('lockedAt', +new Date());
    }

    var initStatus = function (e) {
        key_permission();
        jQuery("select, input:checkbox, input:radio, input:file").uniform();
        jQuery('.group_click').on('click', group_click);
        jQuery('.checkbox-group').on('click', checkbox_group);
        jQuery('.all').on('click', checkbox_all);
        jQuery('.save').on('click', btnSave);
        jQuery('.cancel').on('click', btnCancel);
        jQuery('#user').on('change', change_user);
    };
    return {
        //main function to initiate the module
        init: function () {
            initStatus();
        }
    };
}();

jQuery(document).ready(function () {
    Permission.init();
});
