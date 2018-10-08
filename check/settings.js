var fs = require("fs");

fs.exists(path.join(app.getPath('userData'), 'positionSettings.db'),function(exists) {
    if (exists) { 
    // do nothing
    } else {
        createSettingFile();
        console.log("do nothing ke else me");
    }
});

$(document).ready( function() {
    $.modal.defaults = {
        fadeDuration: 300,     // Number of milliseconds the fade transition takes (null means no transition)
        fadeDelay: 0,
        showClose: true,          // Point during the overlay's fade-in that the modal begins to fade in (.5 = 50%, 1.5 = 150%, etc.)
      };

    $(document).on("click", ".settingElement" , function(e) {
        let element =  $(this).attr("data-id");
        getSetting( element, function( position ) {
            $("#settingTop").val( position.top );
            $("#settingLeft").val( position.left );
            $("#whichElement").val( element );
        });
        $("#settingHeading").html(element);
    }); 

    $(".settingInput").keydown(function(e) {
        if(isNumber(e) == false) {
            return false;
        }
    });

    $(document).on("click", "#saveSetting" , function(e) {
        let top     =  $("#settingTop").val();
        let left    =  $("#settingLeft").val();
        let element =  $("#whichElement").val();
        saveSetting(element, top, left);
        $("#closer").click();
    });
    
});

function isNumber(e) {
    if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
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
            return false;
        } else {
            return true;
        }
}

function saveSetting( element, top, left ) {
    let object = { 
        $set:{
            current:{
                top: top,
                left: left
            }
        }
    }
    positionSettings.update({ element: element } ,object , {}, function (e) {
    });
}

function getSetting( element, callback ) {
    let setting;
    positionSettings.find({element: element}, function (err,docs) {
        console.log(docs);
        
        callback(docs[0].current);
    });
}

function createSettingFile() {
    let file = [
        {"element":"word","current":{"top":"770","left":"405"}},
        {"element":"date","current":{"top":"209","left":"314"}},
        {"element":"amount","current":{"top":"190","left":"435"}},
        {"element":"name","current":{"top":"830","left":"370"}}
    ];
    file.forEach(function(item){
        console.log( item );
        positionSettings.insert(item, function (err, newDoc) {
            console.log(err);
            console.log(newDoc);
        });    
    });
}