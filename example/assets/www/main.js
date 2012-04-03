var jQT = $.jQTouch ({
  icon: 'kilo.png',
});

var db;

var formz = $('#form1');

$(document).ready(function() {
			
  var shortName = 'emap';
  var version = '1.0';
  var displayName = 'Emap';
  var maxSize = 65536;

  db = openDatabase(shortName, version, displayName, maxSize);

  db.transaction (function (transaction) {
    transaction.executeSql (
    'CREATE TABLE IF NOT EXISTS userDetails ' +
    ' (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' +
    ' usr TEXT NOT NULL, latlong TEXT NOT NULL, ' + 
    ' time TEXT NOT NULL, submitted TEXT NOT NULL);');
  });


  db.transaction (function (transaction) {
    transaction.executeSql (
    'CREATE TABLE IF NOT EXISTS keyvalues ' +
    ' (id INTEGER NOT NULL, ' +
    ' key TEXT NOT NULL, value TEXT NOT NULL);');
  });
			
	
  $.blockUI ({
  	 message:'<h2>Finding Location...</h2>',
    css: { 
    padding:        50, 
    margin:  0, 
    width:   '100%', 
    top:     '0%', 
    left:    '0%', 
    textAlign:      'center', 
    color:   '#000', 
    border:  '3px solid #aaa', 
    backgroundColor:'#fff', 
		
    }
		   
  });


  if (typeof(PhoneGap) != 'undefined') {
    $('body > *').css({minHeight: window.innerHeight + 'px !important'});
  }


  $.ajax ({
    type: "GET",
    url: "ParkingLanes.xml",
    dataType: "xml",
    success: function(xml) {
      $("#openingmessage").html($(xml).find("presets").attr("shortdescription"));
      $("#desc").html($(xml).find("presets").attr("description"));  		
      var fieldset;
      var fix = $(xml).find('item');
      var t = 0;
      var item;
  
      fix.each(function () {
        fieldset = $('<fieldset></fieldset><br/>');
        item = $(this).attr('name');									
        var leg = $('<legend><b>'+ucwords(item)+'</b></legend><br/>');
        fieldset.append(leg);
  
        $(this).children().each(function () {
          if ((this).nodeName=="label") {	
          var a = $(this).attr('text');
          var lab = $('<label>'+ucwords(a)+'</label><br/>');
          fieldset.append(lab);
					
          }
					
          if ((this).nodeName=="text") {	
            var textbName = $(this).attr('text');
            var kay = $(this).attr('key');	
            var now1 = new Array(); 
            now1 = kay.split(/:|_/);
            var x = 0;
            var real = "";
      
            while (x<now1.length) {
              real = real + now1[x];
              x++;
            }			
									
            var labo = $('<label class='+textbName+'><-'+textbName+'</label>');	
            var textbx = $('<input/>').attr({type: 'text', name:textbName, id:real});			
            var mix = labo.prepend(textbx);
            var newline = $('<br/>');
		      fieldset.append(mix);
            fieldset.append(newline);			
						
          }
					
          if ((this).nodeName=="combo") {
            var txt = $(this).attr('text');
            var ky = $(this).attr('key');
		      var now2 = new Array(); 
            now2 = ky.split(/:|_/);
            var x = 0;
            var real2 = "";
      
            while (x<now2.length) {
            real2 = real2 + now2[x];
            x++;
            }			
						
		      var labco = $('<label>'+ucwords(txt)+'</label><br/><br/>');
            fieldset.append(labco);	
            var arr = $(this).attr('values');
            var valu = arr;
            var substrg = valu.split(','); 	
            var x = 0;
			
            while (x<substrg.length) {
            var labl	= $('<label>'+substrg[x]+'</label><br/><br/>');
		      var radio = $('<input type="radio" name='+real2+' id='+real2+' value='+substrg[x]+' />');
		      var pile = labl.prepend(radio);
		      fieldset.append(pile);
		      x=x+1;
            }							
          }
							
          if ((this).nodeName=="key") {
            var key = $(this).attr('key');
            var keyval = $(this).attr('value');
		      var now3 = new Array(); 
            now3 = key.split(/:|_/);
            var x = 0;
            var real3 = "";
	
            while(x<now3.length) {
              real3 = real3 + now3[x];
              x++;
            }			
						
            var textb = $('<input/>').attr({ type: 'text', id: real3, name:real3, value:keyval, hidden:'hidden'});			
            var lab = $('<label>'+ucwords(key)+'</label><br/>');	
            var combined = textb.appendTo(lab);
            fieldset.append(combined);
          }
					
					
          if ((this).nodeName=="optional") {
            $(this).children().each(function () {
						
              if ((this).nodeName=="label") {							
                var a = $(this).attr('text');
                var lab = $('<label>'+ucwords(a)+'</label><br/><br/>');
                fieldset.append(lab);
              }
					
              if ((this).nodeName=="text") {
                var textbName = $(this).attr('text');
                var k = $(this).attr('key');		
                var now4 = new Array(); 
                now4 = k.split(/:|_/);
                var x = 0;
                var real4 = "";

                while (x<now4.length) {
                  real4 = real4 + now4[x];
                  x++;
                }
			
                var labo = $('<label class='+textbName+'><-'+textbName+'</label>');
                var textbx = $('<input/>').attr({id:real4, type: 'text', name:textbName});			
                var mix = labo.prepend(textbx);
                var newline = $('<br/>');
                fieldset.append(mix);
                fieldset.append(newline);					
					
              }
					
              if ((this).nodeName=="combo") {
                var txt = $(this).attr('text');
                var kiy = $(this).attr('key');
                var now5 = new Array(); 
                now5 = kiy.split(/:|_/);
                var x = 0;
                var real5 = "";
       
                while (x<now5.length) {
                  real5 = real5 + now5[x];
                  x++;
                }			
			
                var labco = $('<label>'+ucwords(txt)+'</label><br/><br/>');
                fieldset.append(labco);	
                var arr = $(this).attr('values');
                var valu = arr;
                var substrg = valu.split(','); 	
                var x = 0;
			
                while (x<substrg.length) {
                  var labl = $('<label>'+substrg[x]+'</label><br/><br/>');
                  var radio = $('<input type="radio" name='+real5+' id='+real5 +' value='+substrg[x] +' />');
                  var pile = labl.prepend(radio);
		            fieldset.append(pile);
                  x=x+1;
                }					
					
              }
					
              if((this).nodeName=="key") {
                var key = $(this).attr('key');
                var keyval = $(this).attr('value');					
                var now6 = new Array(); 
                now6 = key.split(/:|_/);
                var x = 0;
                var real6 = "";			
  
                while (x<now6.length) {
                  real6 = real6 + now6[x];
                  x++;
                }			
			
                var textb = $('<input/>').attr({ type: 'text', id:real6 , name:real6, value:keyval, hidden:'hidden'});			
                var lab = $('<label>'+ucwords(key)+'</label><br/>'); 
                var combined = textb.appendTo(lab);
                fieldset.append(combined);
              }
						
            });				
          }											
					
        });			
		
        fieldset.prependTo('.myform');
        }); 	
    }
  });	

  //Wait for PhoneGap to load
  document.addEventListener("deviceready", onDeviceReady, false);
  var watchID = null;

  //PhoneGap is ready
  function onDeviceReady() {
    var options = { enableHighAccuracy: true };
    watchID = navigator.geolocation.watchPosition(onSuccess, onError, options);
  }	

   // onSuccess Geolocation
  function onSuccess(position) {	
    var element = document.getElementById('geolocation');
    element.innerHTML = 'Lat:'  + position.coords.latitude  + '<br/>' +
    'Long:' + position.coords.longitude;
    localStorage.coords = 'Lat:'  + position.coords.latitude + ','	+ 'Long:' + position.coords.longitude;

    $.unblockUI();
  } 		

  // onError Callback receives a PositionError object
  function onError(error) {
    alert('code: '    + error.code    + '\n' +
    'message: ' + error.message + '\n');
  }	

});
			
			
			
function submission(t,latlon,f,u) {
  this.time = t;
  this.latlon = latlon;
  this.features = f;
  this.user = u;			
  this.submt = 0;	
  this.getEntryId = function () {
    var idi;
			
    db.transaction(function (transaction) {
      transaction.executeSql(
      'SELECT id FROM userDetails WHERE latlong = ?;',
      [this.latlon],
      function (transaction, result) {
        for (var i=0; i < result.rows.length; i++) {
          var row = result.rows.item(i);
          idi = row.id;
        }
      }, errorHandler);
    });	
			
  return idi;
}

			
			
this.saveUser = function () {
  db.transaction(function (transaction) {
    transaction.executeSql(
    'INSERT INTO userDetails (usr, latlong, time, submitted) VALUES (?, ?, ?, ?);',
    [this.user, this.latlon, this.time, this.submt],
    function () {
      alert("User Details saved in DB");
    }, errorHandler);
  });	
}
		
			
this.saveResults = function(i) {
  $.each(this.features, function (key, value) {
    db.transaction(function (transaction) {
      transaction.executeSql(
      'INSERT INTO keyvalues (id, key, value) VALUES (?, ?, ?);',
      [i, key, value],
      function() {		
        alert("Value saved in DB is: "+key+': '+value);
      }, errorHandler);
    });	    
  });
			
}			
}
		
		
function errorHandler (transaction, error) {
  alert('Oops. Error was '+error.message+' (Code '+error.code+')');
  return true;
}


function saveSettings() {
  localStorage.usernm = $('#username').val();
  jQT.goBack();
  return false;
}
			
		
function ucwords(input) {
  var words = input.split(/(\s|-)+/);
  output = [];

  for (var i = 0, len = words.length; i < len; i += 1) {
    output.push(words[i][0].toUpperCase() +
    words[i].toLowerCase().substr(1));
  }

  return output.join('');
}	

			
function processForm() {
  var flag = false;
  var radioCheck = false;
  var validate = false;
  var features = {};
																
  $('fieldset').children('label').each(function() {
    var child = $(this);
    if (child.is('label')) {
      $(this).children().each(function() {	
        if ($(this).is(':text')) {
          var textVal = $(this).val();
          if (textVal != "" && textVal != undefined && textVal != null) { 		
            flag = true;
            features[$(this).attr('id')] = $(this).val();			
          }		
        }
			
			
        if ($(this).is("[type=radio]:checked")) {
          features[$(this).attr('id')] = $(this).val();		
          radioCheck = true;
        }
			
      });				
    }				
  });
			

  if (flag == true || radioCheck == true) {
    validate = true;
  }
  else {
    validate = false;
  }

  if (validate) {
    var currentTime = new Date();
    var hours = currentTime.getHours();
    var minutes = currentTime.getMinutes();

    if (minutes < 10)
      minutes = "0" + minutes
    var tim = hours+':'+minutes;
			
    if (localStorage.usernm != "" && localStorage.usernm != undefined) {
      var s = new submission(tim,localStorage.coords,features,localStorage.usernm);
      s.saveUser();
      s.saveResults(s.getEntryId());
      jQT.goBack();
      $('.myform')[0].reset();
			
      return false;
    }
    else {
      alert("Please Save Username in Settings.");
    }			
			
  }
  else {
    alert("Please Save Atleast One Value");
  }

}
