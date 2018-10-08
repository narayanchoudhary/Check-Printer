const remote = require('electron').remote;
const app = remote.app;
var path = require('path');
var machineIdSync = require('node-machine-id').machineIdSync;
var machineId =  machineIdSync({original:true});
var EncryptedId = hash(machineId);

let $ = require('jquery');
let Datastore = require('nedb')
let db = new Datastore({ filename: path.join(app.getPath('userData'), 'nedb.db'), autoload: true })
let positionSettings = new Datastore({ filename: path.join(app.getPath('userData'), 'positionSettings.db'), autoload: true, corruptAlertThreshold: 1 });
let keyFile = new Datastore({ filename: path.join(app.getPath('userData'), 'keyFile.db'), autoload: true, corruptAlertThreshold: 1 });
let suggestions = [];
let currentYear = new Date().getFullYear();

$(document).ready(function(){
    $('.dont-print-me').css("display","none");
    $('#productId').html(machineId);
    $('#showPasswordPromt').click();

    keyFileHe(function(he){
        if(he) {
            enterPasswordAutomatically();
        }
    });
    // onload focus on name field
    $("#name").focus();
    setDateToToday();

    // on pressing enter Key on name field focus on date field
    $('#name').bind("keydown", function(e) {        
        if (e.which == 13) {
            $('.single1').focus();
            $('.single1').select();
            setTimeout(function(){
                $('#nameautocomplete-list').remove();
            }, 1);
            
        } else if(e.which == 40) {
        } 
        else if(e.which == 9) {
            setTimeout(function(){
                $('#nameautocomplete-list').remove();
            }, 1);
        }
    });

    // load suggestion for name field
    load_suggestions();

    $("#amount").keydown(function (e) {
        // Allow: backspace, delete, tab, escape, enter and .
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
                if (e.which == 13) {
                    printDiv();
                } else if (e.keyCode == 27 || e.keyCode == 38) {
                    $(".single4").focus();
                }
                return;
        }
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    });

    $("#amount").keyup(function (e) {
        if(e.which == 8 && this.value == '') {
            $('.single1').focus();
            $('.single1').select();
        }
        $('#word-me').val(inWords($(this).val()));
        $('#word-me-div').html(inWords($(this).val()));
    });

    $("#passwordSubmit").click(function(){
        let userEnteredKey = $("#passwordKey").val();
        console.log("userEnteredKey", userEnteredKey);
        console.log("EncryptedId", EncryptedId);
        
        if(userEnteredKey == EncryptedId) {
            $('.dont-print-me').css("display","block");
            $('#closePassword').click();
            createKeyFile();
        } else {
            alert('Galat key daali he bhai');
        }
    });

}); // end


var a = ['','one ','two ','three ','four ', 'five ','six ','seven ','eight ','nine ','ten ','eleven ','twelve ','thirteen ','fourteen ','fifteen ','sixteen ','seventeen ','eighteen ','nineteen '];
var b = ['', '', 'twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety'];

function inWords (num) {
    if ((num = num.toString()).length > 9) return 'overflow';
    n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return; var str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'only ' : '';
    return str;
}

function onChangeHandler (target) {
	$('#word-me').val(inWords(target.value));
}

function printDiv() {
    // Save name in db
    let name = $('#name').val().trim();
    if(name !== '') {
        db.find({name: name}, function (err,docs) {
            if(docs.length == 0) {
                db.insert({name : name.toUpperCase()});
                // load suggestion for name field
                load_suggestions();
            }
        });
    }

    $('.dont-print-me').css("display","none");
    $('.print-me').css("display","block");

    $('#date-l').html( dateVal() );
    $('#name-l').html( $('#name').val() );
    $('#amount-l').html( numberWithCommas( $('#amount').val() ) );
    $('#word-me-l').html( $('#word-me').val() );

    setCss();

    window.print();
    
    $('.dont-print-me').css("display","block");
    $('.print-me').css("display","none");
}

const numberWithCommas = (x) => {
  
	x=x.toString();
	var lastThree = x.substring(x.length-3);
	var otherNumbers = x.substring(0,x.length-3);
	if(otherNumbers != '')
	    lastThree = ',' + lastThree;
	var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;

	return res;
}

function autocomplete(inp, arr) {
    var currentFocus;
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        this.parentNode.appendChild(a);
        for (i = 0; i < arr.length; i++) {
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            b = document.createElement("DIV");
            b.setAttribute("id", arr[i]);
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                b.addEventListener("click", function(e) {
                inp.value = this.getElementsByTagName("input")[0].value;
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          currentFocus++;
          addActive(x);
        } else if (e.keyCode == 38) {
          currentFocus--;
          addActive(x);
        } else if (e.keyCode == 13) {
          e.preventDefault();
          if (currentFocus > -1) {
            if (x) x[currentFocus].click();
          }
        }
    });
    function addActive(x) {
      if (!x) return false;
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {        
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
  }

function load_suggestions() {
    db.find({}, function (err,docs) {
        suggestions = docs.map(a => a.name);
        autocomplete(document.getElementById("name"), suggestions);        
   });
}

function closeAllLists(elmnt) {        
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
      x[i].parentNode.removeChild(x[i]);
    }
  }
}   

function isSuggestionListOpen () {
    if($('#nameautocomplete-list').length == 0) {
        return false;
    } else {
        return true;
    }
}

function setDateToToday() {
    var d = new Date();
    let day = ("0" + d.getDate()).slice(-2);
    let month =  ("0" + d.getMonth()).slice(-2);
    let d1 = day.charAt(0);
    let d2 = day.charAt(1);
    let m1 = month.charAt(0);
    let m2 = month.charAt(1);
    $("#d1").val(d1);
    $("#d2").val(d2);
    $("#m1").val(m1);
    $("#m2").val(m2);
}

function setCss(element,elementName) {
    var printStyle = '<style type="text/css" media="print">';
    positionSettings.find({element: "name"}, function (err,docs) {
        let top = docs[0].current.top;
        let left = docs[0].current.left;
        printStyle += '#name-l {top: '+top+'px;left: '+left+'px;}';
    });

    positionSettings.find({element: "date"}, function (err,docs) {
        let top = docs[0].current.top;
        let left = docs[0].current.left;
        printStyle += '#date-l {top: '+top+'px;left: '+left+'px;}';
    });

    positionSettings.find({element: "amount"}, function (err,docs) {
        let top = docs[0].current.top;
        let left = docs[0].current.left;
        printStyle += '#amount-l {top: '+top+'px;left: '+left+'px;}';
    });

    positionSettings.find({element: "word"}, function (err,docs) {
        let top = docs[0].current.top;
        let left = docs[0].current.left;
        printStyle += '#word-me-l {top: '+top+'px;left: '+left+'px;}';

        printStyle += '</style>';
        console.log(printStyle);
         
        $('head').append(printStyle);
    });
}

function dateVal() {
    let d1 = $("#d1").val();
    let d2 = $("#d2").val();
    let m1 = $("#m1").val();
    let m2 = $("#m2").val();
    let year = $("#year").val();

    dateValue = d1 + d2 + m1 + m2 + year;
    return dateValue;
}

function createKeyFile() {
    let key = $('#passwordKey').val();
    let doc = {"key":key};
    keyFile.insert(doc, function (err, newDoc) {
        console.log(err);
        console.log(newDoc);
    });
}

function keyFileHe(callback) {
    fs.exists(path.join(app.getPath('userData'), 'keyFile.db'),function(exists){
        if (exists) {
            console.log("exists ke under");
            callback(true);
        } else {
            callback(false);
            console.log("exists ke else me");            
        }
    });
}

function enterPasswordAutomatically() {
    console.log('enter password automatically ke under');
    
    keyFile.find({}, function (err,docs) {
        console.log(docs[0].key);
        console.log(err);
        
        
        $('#passwordKey').val(docs[0].key);
        setTimeout(function(){
            $('#passwordSubmit').click();
        },100);
    });
}

function hash(value) {
    var hash = 0, i, chr;
    if (value.length === 0) return hash;
    for (i = 0; i < value.length; i++) {
      chr   = value.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  };