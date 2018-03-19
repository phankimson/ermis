var ChatForm = function () {
    var myWindow = jQuery('#event_content');
    var $kWindow = '';
    var initKendoButtonAddEvent = function(){
        jQuery("#add-event").kendoButton({
             icon: "share"
         });
    };
    var initKendoEditor = function(){
          jQuery("#editor").kendoEditor({
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

    var initWindowEvent = function(){
         $kWindow = myWindow.kendoWindow({
            width: "650px",
            title: "",
            visible: false,
            actions: [
                "Pin",
                "Minimize",
                "Maximize",
                "Close"
            ],
            modal: true
        }).data("kendoWindow").center();
    };
    var initOpenWindowEvent = function(){
       jQuery('#add-event').on("click",function(e){
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
           $kWindow.title("Thêm sự kiện");
           myWindow.data("kendoWindow").open();
        }
        jQuerylink.data('lockedAt', +new Date());
       });
    };
     var initCancelEvent = function(){
       jQuery('.cancel-event').on("click",function(e){
        var jQuerylink = jQuery(e.target);
        e.preventDefault();
        if (!jQuerylink.data('lockedAt') || +new Date() - jQuerylink.data('lockedAt') > 300) {
           myWindow.data("kendoWindow").close();
        }
        jQuerylink.data('lockedAt', +new Date());
       });
    };
    var initComboboxTypeAction = function(){
        var data = [
            { text: "Kiểu 1", value: "1" },
            { text: "Kiểu 2", value: "2" },
            { text: "Kiểu 3", value: "3" },
            { text: "Kiểu 4", value: "4" },
            { text: "Kiểu 5", value: "5" }
    ];
    jQuery("#action-event").kendoComboBox({
            dataTextField: "text",
            dataValueField: "value",
            filter: "contains",
            dataSource: data
    });
    };
    return {

        init: function () {
            initWindowEvent();
            initOpenWindowEvent();
            initKendoButtonAddEvent();
            initKendoEditor();
            initCancelEvent();
            initComboboxTypeAction();
        }

    };

}();

jQuery(document).ready(function () {
    ChatForm.init();
});
