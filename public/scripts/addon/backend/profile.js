var Profile = function () {
    var initChangeCard = function () {
        jQuery('#change_user_edit').on('click', function () {
            jQuery('#user_edit_form').show(1000);
            jQuery('#user_edit_form').find('.uk-sticky-placeholder').css('height', jQuery(window).height() * 0.15);
            jQuery("html, body").animate({ scrollTop: 0 }, "slow");
            jQuery('#user_profile').hide(1000);
        })
    }
    var initBack = function () {
        jQuery('#user_edit_back').on('click', function () {
            jQuery('#user_edit_form').hide(1000);
            jQuery("html, body").animate({ scrollTop: 0 }, "slow");
            jQuery('#user_profile').show(1000);
        })
    }
    var initChangeAvatar = function () {
        var client = Client.connect('data')
        jQuery("#user_edit_avatar_control").change(function(){
          var fd = new FormData(); // XXX: Neex AJAX2
          var a = jQuery(this)[0].files[0];
           fd.append('avatar', a);
           RequestURLImage('avatar-profile', 'json', fd, function (result) {
               if (result.status == true) {
                  jQuery(".fileinput").fileinput('reset');
                  jQuery(".user_action_image").find(".md-user-image").attr("src",UrlString(result.data.avatar));
                  jQuery(".thumbnail img").attr("src",UrlString(result.data.avatar));
                   client.emit('client-send-change-avatar', result.data )
                   jQuery('#notification').EPosMessage('success', result.message);
               } else {
                   jQuery('#notification').EPosMessage('error', result.message);
               }
           }, true);
      });
      client.on('server-send-change-avatar', function (data) {
          jQuery(".chat_users").find("li[data-user="+data.id+"] img").attr("src",UrlString(result.data.avatar));
      })
    }
    var initSave = function () {
        jQuery('#user_edit_save').on('click', function (e) {
            e.preventDefault();
            var tabs = jQuery('#user_edit_tabs_content').find('.uk-active').attr('id');
            if (tabs == 'user_edit_info_content') {
                if (jQuery('.profile-update').valid()) {
                    var data = GetAllValueForm('.profile-update');
                    var postdata = { data: JSON.stringify(data) };
                    RequestURLWaiting('profile', 'json', postdata, function (result) {
                        if (result.status == true) {
                            jQuery('#notification').EPosMessage('success', result.message);
                        } else {
                            jQuery('#notification').EPosMessage('error', result.message);
                        }
                    }, true);
                }
            } else {
                if (jQuery('.change-password').valid()) {
                    var data = GetAllValueForm('.change-password');
                    var postdata = { data: JSON.stringify(data) };
                    RequestURLWaiting('changepassword', 'json', postdata, function (result) {
                        if (result.status == true) {
                            jQuery('#notification').EPosMessage('success', result.message);
                            setTimeout(function () { window.location.href = 'index' }, 1500);
                        } else {
                            jQuery('#notification').EPosMessage('error', result.message);
                        }
                    }, true);
                }
            }

        })
    }
    var initValidate = function () {
        jQuery('.profile-update').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            rules: {
                fullname: {
                    required: true
                },
                firstname: {
                    required: true
                },
                lastname: {
                    required: true
                },
                identity_card: {
                    required: true,
                    number: true
                },
                jobs: {
                    required: true
                },
                about: {
                    required: true
                },
                city: {
                    required: true
                },
                address: {
                    required: true
                },
                birthday: {
                    required: true
                },
                phone: {
                    required: true,
                    number: true
                }
            },

            invalidHandler: function (event, validator) { //display error alert on form submit
                $('.alert-danger', $('.profile-update')).show();
            },

            highlight: function (element) { // hightlight error inputs
                $(element)
                    .closest('.uk-grid').addClass('has-error'); // set error class to the control group
            },

            success: function (label) {
                label.closest('.uk-grid').removeClass('has-error');
                label.remove();
            },

            errorPlacement: function (error, element) {
                if (element.closest('.control-label').size() === 1) {
                    error.insertAfter(element.closest('.control-label'));
                } else {
                    error.insertAfter(element);
                }
            },

            submitHandler: function (form) {
                form.submit(); // form validation success, call ajax form submit
            }
        });

        $('.profile-update').keypress(function (e) {
            if (e.which === 13) {
                if ($('.profile-update').validate().form()) {
                    $('.profile-update').submit(); //form validation success, call ajax form submit
                }
                return false;
            }
        });

        jQuery('.change-password').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            rules: {
                password: {
                    required: true,
                    minlength: 6
                },
                npassword: {
                    required: true,
                    minlength: 6
                },
                rpassword: {
                    equalTo: "#new_password"
                }

            },

            invalidHandler: function (event, validator) { //display error alert on form submit
                $('.alert-danger', $('.change-password')).show();
            },

            highlight: function (element) { // hightlight error inputs
                $(element)
                    .closest('.uk-grid').addClass('has-error'); // set error class to the control group
            },

            success: function (label) {
                label.closest('.uk-grid').removeClass('has-error');
                label.remove();
            },

            errorPlacement: function (error, element) {
                if (element.closest('.control-label').size() === 1) {
                    error.insertAfter(element.closest('.control-label'));
                } else {
                    error.insertAfter(element);
                }
            },

            submitHandler: function (form) {
                form.submit(); // form validation success, call ajax form submit
            }
        });

        $('.change-password').keypress(function (e) {
            if (e.which === 13) {
                if ($('.change-password').validate().form()) {
                    $('.change-password').submit(); //form validation success, call ajax form submit
                }
                return false;
            }
        });
    }



    return {

        init: function () {
            initChangeCard();
            initBack();
            initValidate();
            initSave();
            initChangeAvatar();
        }

    };

}();

jQuery(document).ready(function () {
    Profile.init();
});
