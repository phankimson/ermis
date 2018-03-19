var Chat = function () {
    var i = 2;var k = 1; var user_receipt = ""; var crit_load = false;
    const client = Client.connect('chat')

    var initStatusChat = function(user,status) {
        var data = jQuery(".chat_users").find("li[data-user="+user+"]")
      if(status == 0){ // OFFLINE
        data.find(".element-status").removeClass().addClass("element-status")
        data.find("span.uk-text-small.uk-text-muted.uk-text-truncate").html(transText['offline'])
      }else if(status == 1 ){ // ONLINE
        data.find(".element-status").removeClass().addClass("element-status").addClass("element-status-success")
        data.find("span.uk-text-small.uk-text-muted.uk-text-truncate").html(transText['online'])
      }else if(status == 2 ){ // BUSY
        data.find(".element-status").removeClass().addClass("element-status").addClass("element-status-danger")
        data.find("span.uk-text-small.uk-text-muted.uk-text-truncate").html(transText['busy'])
      }else if(status == 3 ){ // GOING OUT
        data.find(".element-status").removeClass().addClass("element-status").addClass("element-status-warning")
        data.find("span.uk-text-small.uk-text-muted.uk-text-truncate").html(transText['going_out'])
      }
    }

    var initCheckOnline = function(){
      client.on('server-check-online', function (data) {
        if(data.reconnect === false){
          UIkitshowNotify ("<a href='javascript:;' class='notify-action'>x</a>"+ data.current_user.username + " " + transText['online'] , null , 0 , null,"top-right")
        }
          jQuery.each(data.user_all, function (k, v) {
            initStatusChat(v.user,1)
          })
      })
    }

    var initCheckOffline = function(){
      client.on('server-check-offline', function (data) {
          UIkitshowNotify ("<a href='javascript:;' class='notify-action'>x</a>"+ data.username + " " + transText['offline'] , null , 0 , null,"top-right")
          initStatusChat(data.id,0)
      })
    }
    var initLoadChatUserScroll = function(){
      $(".scrollbar-inner").on("scroll",function(e){
        if(jQuery(".chat_box_active").length > 0){
          var a = $(this).scrollTop()
          var c = $(this).height()
          var b = $(this)[0].scrollHeight
          if( a + c == b && crit_load == false){
           k++
           arr = {}
           arr['user_receipt'] = user_receipt
           arr['page'] = k
           var postdata = { data: JSON.stringify(arr) };
           RequestURLWaiting('load-chat-user', 'json', postdata, function (result) {
               if (result.status === true) {
                   jQuery.each(result.data, function (k, v) {
                     if(v.user_send == user_receipt && v.user_receipt == user_receipt){
                         bindDataUser(v,'append',1)
                         bindDataUser(v,'append',2)
                     }else if(v.user_send == user_receipt){
                         bindDataUser(v,'append',1)
                     }else if(v.user_receipt == user_receipt){
                         bindDataUser(v,'append',2)
                     }
                     k++
                   })
               }else{
                    crit_load = true
                    kendo.alert(result.message);                    
               }
           }, true);
          }
        }

    });
    }

    var initLoadChatUser = function(){
      jQuery(".chat_users li").on("click",function(){
        k = 1
        crit_load = false
        arr = {}
        jQuery(".chat_message_wrapper").not(".chat_message_load").remove()
        user_receipt = jQuery(this).attr("data-user")
        arr['user_receipt'] = user_receipt
        arr['page'] = k
        var postdata = { data: JSON.stringify(arr) };
        RequestURLWaiting('load-chat-user', 'json', postdata, function (result) {
            if (result.status === true) {
                jQuery.each(result.data, function (k, v) {
                  if(v.user_send == user_receipt && v.user_receipt == user_receipt){
                      bindDataUser(v,'append',1)
                      bindDataUser(v,'append',2)
                  }else if(v.user_send == user_receipt){
                      bindDataUser(v,'append',1)
                  }else if(v.user_receipt == user_receipt){
                      bindDataUser(v,'append',2)
                  }
                  k++
                })
            } else {
                kendo.alert(result.message);
            }
        }, true);
      })
    }

    var initSendChatUser = function(){
        jQuery("#submit_message").on("click",function(){
           var arr = {}
           arr['user_receipt'] = user_receipt;
           arr['message'] = jQuery("#content_message").val();
           arr['user_send'] = jQuery("#session_user").val();
           var postdata = { data: JSON.stringify(arr) };
           RequestURLWaiting('chat', 'json', postdata, function (result) {
               if (result.status === true) {
                   bindDataUser(arr,'append',1)
                   client.emit('client-send-data-user', {'user_receipt' : arr['user_receipt'] , 'message': arr['message'] , 'user_send' :arr['user_send'] } )
               } else {
                   kendo.alert(result.message);
               }
           }, true);
        })
        client.on('server-send-data-user', function (data) {
           bindDataUser(data,'append',2)
           var user = jQuery(".chat_users li[data-user='"+user_receipt+"']").find(".md-list-heading").html()
            UIkitshowNotify ("<a href='javascript:;' class='notify-action'>x</a>"+ user + " " + transText['chatting'] , null , 0 , null,"top-right")
        })
    }

    var initSendChat = function(){
        jQuery(".send-event").on("click",function(){
           var arr = {}
           arr['type'] = jQuery("#action-event").data("kendoComboBox").value();
           arr['message'] = jQuery("#editor").data("kendoEditor").value();
           arr['session_user'] = jQuery("#session_user").html();
           var postdata = { data: JSON.stringify(arr) };
           RequestURLWaiting('timeline', 'json', postdata, function (result) {
               if (result.status === true) {
                   client.emit('client-send-data', {'type' : arr['type'] , 'message': arr['message'] , 'session_user' :arr['session_user'] } )
               } else {
                   kendo.alert(result.message);
               }
           }, true);
        })
        client.on('server-send-data', function (data) {
            bindData(data,"prepend")
        })
    }
      var bindDataUser = function(data,position,type){
        var item = jQuery(".chat_message_wrapper").last().clone(true);
        item.removeAttr("style")
        item.removeClass("chat_message_load")
        var src_user_receipt = jQuery(".chat_users li[data-user='"+data.user_receipt+"']").find(".md-user-image").attr("src")
        var src_user_send = jQuery(".chat_users li[data-user='"+data.user_send+"']").find(".md-user-image").attr("src")
        if(type == 1){
          item.removeClass("chat_message_right")
          item.find(".md-user-image").attr("src",src_user_receipt)
        }else{
          item.addClass("chat_message_right")
          item.find(".md-user-image").attr("src",src_user_send)
        }
        if(data.created_at){
          item.find(".chat_message p").html(data.message+"<span class='chat_message_time'>"+moment(data.created_at).calendar()+"</span>")
        }else{
          item.find(".chat_message p").html(data.message+"<span class='chat_message_time'>"+moment().calendar()+"</span>")
        }
        if(position == 'prepend'){
            jQuery(".chat_box.chat_box_colors_a").prepend(item);
        }else{
            jQuery(".chat_box.chat_box_colors_a").append(item);
        }
      }
      var bindData = function(data,position){
        var item = jQuery(".timeline_item").last().clone(true);
        item.removeAttr("style");
        if(data.type == "2" || data.title == "2"){
        item.find(".timeline_icon").removeClass("timeline_icon_success");
        item.find(".timeline_icon").addClass("timeline_icon_danger");
        item.find(".material-icons").html("&#xE5CD;");
      }else if(data.type == "3" || data.title == "3"){
        item.find(".timeline_icon").removeClass("timeline_icon_success");
        item.find(".material-icons").html("&#xE410;");
      }else if(data.type == "4" || data.title == "4"){
        item.find(".timeline_icon").removeClass("timeline_icon_success");
        item.find(".timeline_icon").addClass("timeline_icon_primary");
        item.find(".material-icons").html("&#xE0B9;");
      }else if(data.type == "5" || data.title == "5"){
        item.find(".timeline_icon").removeClass("timeline_icon_success");
        item.find(".timeline_icon").addClass("timeline_icon_warning");
        item.find(".material-icons").html("&#xE7FE;");
        }
        if(data.created_at != null){
        item.find(".timeline_date").html(moment(data.created_at, "YYYY-MM-DD").format('DD/MM/YYYY'))
        }else{
        var d = new Date();
        item.find(".timeline_date").html(d.getDate()+"/<span>"+ (d.getMonth() + 1) +"</span>/"+"<span>"+d.getFullYear()+"</span>");
        }
        item.find(".timeline_content").html(data.session_user);
        item.find(".timeline_content_addon blockquote").html(data.message);
        if(position == 'prepend'){
            jQuery(".timeline").prepend(item);
        }else{
            jQuery(".timeline").append(item);
        }

        jQuery('#event_content').data("kendoWindow").close();
        jQuery('body').addClass('sidebar_secondary_active');
      }
      var initLoadTimeline = function(){
        jQuery("#view_more").on("click",function(){
          var postdata = { data: JSON.stringify(i) };
          RequestURLWaiting('view-more-timeline', 'json', postdata, function (result) {
              if (result.status === true) {
                jQuery.each(result.data, function (k, v) {
                  bindData(v,"append")
                })
                  i++
              } else {
                  kendo.alert(result.message);
              }
          }, true);
        })
      }

    return {

        init: function () {
            initCheckOnline();
            initCheckOffline();
            initSendChat();
            initLoadTimeline();
            initLoadChatUser();
            initLoadChatUserScroll();
            initSendChatUser();
        }

    };

}();

jQuery(document).ready(function () {
    Chat.init();
});
