let $ = require('jquery');
$(document).ready(function(){
    $('.single1').on('keypress', function(e){
        if(isNumber(e)) {
            $('.single2').focus();
            $('.single2').select();
        } else {
            return false;
        }
    });

    $('.single1').on('keyup', function(e){
        if(e.keyCode == 8 && this.value == '' ) {
            $("#name").focus();
        }
    });

    $('.single2').on('keypress', function(e){
        if(isNumber(e)) {
            $('.single3').focus();
            $('.single3').select();
        } else {
            return false;
        }  
    });

    $('.single2').on('keyup', function(e){
        if(e.keyCode == 8 && this.value == '' ) {
            $(".single1").focus();
            $(".single1").val('');                        
        }
    });

    $('.single3').on('keypress', function(e){
        if(isNumber(e)) {
            $('.single4').focus();
            $('.single4').select();            
        } else {
            return false;
        }  
    });

    $('.single3').on('keyup', function(e){
        if(e.keyCode == 8 && this.value == '' ) {
            $(".single2").focus();
            $(".single2").val('');
        }
    });

    $('.single4').on('keypress', function(e){
        if(isNumber(e)) {
            $('#amount').focus();
            // let tmpStr = $('#year').val();
            // $('#year').val('');
            // $('#year').val(tmpStr);
        } else {
            return false;
        }  
    });

    $('.single4').on('keyup', function(e){
        if(e.keyCode == 8 && this.value == '' ) {
            $(".single3").focus();
            $(".single3").val('');            
        }
    });

    // $('#year').on('keypress', function(e){
    //     if(isNumber(e)) {
    //         if(e.keyCode == 13 ) {
    //             $("#amount").focus();
    //         }
    //     } else {
    //         return false;
    //     }   
    // });

    // $('#year').on('keyup', function(e){
    //     if(e.keyCode == 8 && this.value == '' ) {
    //         $(".single4").focus();
    //         $(".single4").val('');         
    //     }
    // });

    $('.single1, .single2, .single3, .single4').on('focus', function(e){
        $(this).attr('placeholder','');
    });

});

function isNumber(e) {
    if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 40, 110, 190]) !== -1 ||
             // Allow: Ctrl/cmd+A
            (e.keyCode == 65 && (e.ctrlKey === true || e.metaKey === true)) ||
             // Allow: Ctrl/cmd+C
            (e.keyCode == 67 && (e.ctrlKey === true || e.metaKey === true)) ||
             // Allow: Ctrl/cmd+X
            (e.keyCode == 88 && (e.ctrlKey === true || e.metaKey === true)) ||
             // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
                 // let it happen, don't do anything
            return true;
        }
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
            return false;
        } else {
            return true;
        }
}

function selectAll(element) {
    let tmpStr = element.val();
    element.val('');
    element.val(tmpStr);
}

