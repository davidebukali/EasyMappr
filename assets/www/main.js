
var db;
var chsetId;
var crds;
var mainForm = '';
var formz = $('#form1');
var userIds = new Array();
var lats = new Array();


$("#myButton").live("click", function(event, ui) {
	if(mainForm==''){
	  makeForm();
	}
	$.mobile.changePage("#mainform", "slide", true, false);
});

$("#page_save_submit").live("click", function(event, ui) {
	processForm();
});

$("#page_login_submit").live("click", function(event, ui) {
	saveSettings();
});

$("#upload").live("click", function(event, ui) {

	var networkState = navigator.network.connection.type; 
	var states = {}; 
	states[Connection.UNKNOWN] = 'Unknown connection'; 
	states[Connection.ETHERNET] = 'Ethernet connection'; 
	states[Connection.WIFI] = 'WiFi connection'; 
	states[Connection.CELL_2G] = 'Cell 2G connection'; 
	states[Connection.CELL_3G] = 'Cell 3G connection'; 
	states[Connection.CELL_4G] = 'Cell 4G connection'; 
	states[Connection.NONE] = 'No network connection'; 

	if((states[networkState] == 'No network connection') || (states[networkState] == 'Unknown connection')){ 
		alert('Your phone web connection is not working. Please check and Try Again.'); 
	}else{ 
	
    createChangeset().then(function(k){
		    chsetId = k;
			alert('chsetId: ' + k);
	
			upload(k);
			
    }).fail(function(err){
	    alert('upload fail changeset not created');
	  });
	
	}
	
	
});

//Update record on the fly
function updateRecord(id) {
   database.transaction(function(tx) {
     tx.executeSql("UPDATE userDetails SET submitted = ? WHERE id = ?", [1, id], null, onError);
   });
}

function onError(tx, error) {
	 alert("Error: "+error.message);
	}

function upload(){
	
		db.transaction(function(transaction) {
			transaction.executeSql('SELECT * FROM userDetails where submitted = ? limit 1;', [0], function(transaction, result) {
				//for ( var i = 0; i < result.rows.length; i++){
				if(result.rows.length == 1){
				  createNodeTags(result.rows.item(0).id).then(function(ts){
					  alert('Node Tags: '+ts);
					  createNode(result.rows.item(0).latlong, ts, chsetId).then(function(ig){
						 
						  alert("Node created: "+ig);
						  updateRecord(result.rows.item(0).id);
						  
						  upload();
						  
					  }).fail(function(err){
						  alert("Node Not created: "+err);
					  });
				  });	
				}else{
					alert("Upload Complete");
					return;
					
				}
				  
				//}
 				}, function(transaction, error){
				   alert('Error: '+error.message);
					
				});
		});
		
	
}

$(document).ready(function(event) {
	
  var shortName = 'mapit';
  var version = '1.0';
  var displayName = 'mapit';
  var maxSize = 50000;

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
    ' key TEXT NOT NULL, value TEXT NOT NULL, sub TEXT NOT NULL);');
  });
		

 
  $.ajax ({
    type: "GET",
    url: "ParkingLanes.xml",
    dataType: "xml",
    beforeSend: function (XMLHttpRequest) {
    	$.mobile.loadingMessage = 'Loading Coordinates...';
        $.mobile.showPageLoadingMsg();
    },
    success: function(xml) {
      $("#openingmessage").html($(xml).find("presets").attr("shortdescription"));
      $("#desc").html($(xml).find("presets").attr("description"));  		
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
    var element = document.getElementById('lat');
    var ele = document.getElementById('lon');
    
    localStorage.lat = position.coords.latitude;
    localStorage.lon = position.coords.longitude;
    
    element.innerHTML = 'Lat: '  + localStorage.lat;
    ele.innerHTML = 'Long: ' + localStorage.lon;
    
    crds = localStorage.lat+','+localStorage.lon;
    
    //localStorage.crds = element.innerHTML+','+ele.innerHTML;
    $.mobile.hidePageLoadingMsg();
   // $.unblockUI();
  } 		

  // onError Callback receives a PositionError object
  function onError(error) {
    alert('Error: ' + error.message);
  }	
  
 // }
  
  
});
	


function makeForm() {

	$.ajax ({
	    type: "GET",
	    url: "ParkingLanes.xml",
	    dataType: "xml",
	    success: function(xml) {
	mainForm = 'true';
	var fieldset;
	var fix = $(xml).find('item');
	var t = 0;
	var item;

	fix
			.each(function() {
				fieldset = $('<fieldset></fieldset><br/>');
				item = $(this).attr('name');
				var leg = $('<legend><b>' + ucwords(item)
						+ '</b></legend><br/>');
				fieldset.append(leg);

				var labelCount = 0;

				$(this)
						.children()
						.each(
								function() {

									if ((this).nodeName == "combo") {
										var txt = $(this).attr(
												'text');
										var kiy = $(this).attr(
												'key');
										var now5 = new Array();
										now5 = kiy.split(/:|_/);
										var x = 0;
										var real5 = "";

										while (x < now5.length) {
											real5 = real5
													+ now5[x];
											x++;
										}

										var radFieldset = $('<fieldset data-role="controlgroup" data-mini="true"></fieldset><br/>');

										var radLeg = $('<legend>'
												+ ucwords(txt)
												+ '</legend><br/>');
										radFieldset
												.append(radLeg);

										var arr = $(this).attr(
												'values');
										var valu = arr;
										var substrg = valu
												.split(',');
										var x = 0;

										while (x < substrg.length) {
											var labl = $('<label for='
													+ real5
													+ '>'
													+ substrg[x]
													+ '</label><br/><br/>');
											var radio = $('<input type="radio" class="combo" name='
													+ real5
													+ ' id='
													+ real5
													+ ' value='
													+ substrg[x]
													+ ' />');
											var pile = labl
													.prepend(radio);

											radFieldset
													.append(pile);
											x = x + 1;
										}

										fieldset
												.append(radFieldset);
									}

									if ((this).nodeName == "label") {
										var clas;
										if (labelCount == 0) {
											clas = "h1";
										} else if (labelCount == 0) {
											clas = "h2";
										} else if (labelCount == 1) {
											clas = "h3";
										}

										var a = $(this).attr(
												'text');
										var lab = $('<label class='
												+ clas
												+ '>'
												+ ucwords(a)
												+ '</label><br/>');
										fieldset.append(lab);

										labelCount++;
									}

									if ((this).nodeName == "text") {
										var textbName = $(this)
												.attr('text');
										var kay = $(this).attr(
												'key');
										var now1 = new Array();
										now1 = kay.split(/:|_/);
										var x = 0;
										var real = "";

										while (x < now1.length) {
											real = real
													+ now1[x];
											x++;
										}

										// var labo = $('<label
										// class='+textbName+'><-'+textbName+'</label>');
										var textbx = $(
												'<input/>')
												.attr(
														{
															placeholder : textbName,
															type : 'text',
															name : textbName,
															id : real
														});
										// var mix =
										// labo.prepend(textbx);
										var newline = $('<br/>');
										fieldset.append(textbx);
										fieldset
												.append(newline);

									}

									if ((this).nodeName == "key") {
										var key = $(this).attr(
												'key');
										var keyval = $(this)
												.attr('value');
										var now3 = new Array();
										now3 = key.split(/:|_/);
										var x = 0;
										var real3 = "";

										while (x < now3.length) {
											real3 = real3
													+ now3[x];
											x++;
										}

										var textb = $(
												'<input/>')
												.attr(
														{
															type : 'text',
															id : real3,
															name : real3,
															value : keyval,
															hidden : 'hidden'
														});
										var lab = $('<label>'
												+ ucwords(key)
												+ '</label><br/>');
										var combined = textb
												.appendTo(lab);
										fieldset
												.append(combined);
									}

									if ((this).nodeName == "optional") {
										$(this)
												.children()
												.each(
														function() {

															if ((this).nodeName == "label") {

																var clas;
																if (labelCount == 0) {
																	clas = "h1";
																} else if (labelCount == 0) {
																	clas = "h2";
																} else if (labelCount == 1) {
																	clas = "h3";
																}

																var a = $(
																		this)
																		.attr(
																				'text');
																var lab = $('<label class='
																		+ clas
																		+ '>'
																		+ ucwords(a)
																		+ '</label><br/><br/>');
																fieldset
																		.append(lab);
															}

															if ((this).nodeName == "combo") {
																var txt = $(
																		this)
																		.attr(
																				'text');
																var kiy = $(
																		this)
																		.attr(
																				'key');
																var now5 = new Array();
																now5 = kiy
																		.split(/:|_/);
																var x = 0;
																var real5 = "";

																while (x < now5.length) {
																	real5 = real5
																			+ now5[x];
																	x++;
																}

																var radFieldset = $('<fieldset data-role="controlgroup" data-mini="true"></fieldset><br/>');

																var radLeg = $('<legend>'
																		+ ucwords(txt)
																		+ '</legend><br/>');
																radFieldset
																		.append(radLeg);

																var arr = $(
																		this)
																		.attr(
																				'values');
																var valu = arr;
																var substrg = valu
																		.split(',');
																var x = 0;

																while (x < substrg.length) {
																	var labl = $('<label for='
																			+ real5
																			+ '>'
																			+ substrg[x]
																			+ '</label><br/><br/>');
																	var radio = $('<input type="radio" class="combo" name='
																			+ real5
																			+ ' id='
																			+ real5
																			+ ' value='
																			+ substrg[x]
																			+ ' />');
																	var pile = labl
																			.prepend(radio);

																	radFieldset
																			.append(pile);
																	x = x + 1;
																}

																fieldset
																		.append(radFieldset);
															}

															if ((this).nodeName == "text") {
																var textbName = $(
																		this)
																		.attr(
																				'text');
																var kay = $(
																		this)
																		.attr(
																				'key');
																var now1 = new Array();
																now1 = kay
																		.split(/:|_/);
																var x = 0;
																var real = "";

																while (x < now1.length) {
																	real = real
																			+ now1[x];
																	x++;
																}

																// var
																// labo
																// =
																// $('<label
																// class='+textbName+'><-'+textbName+'</label>');
																var textbx = $(
																		'<input/>')
																		.attr(
																				{
																					placeholder : textbName,
																					type : 'text',
																					name : textbName,
																					id : real
																				});
																// var
																// mix
																// =
																// labo.prepend(textbx);
																var newline = $('<br/>');
																fieldset
																		.append(textbx);
																fieldset
																		.append(newline);

															}

															if ((this).nodeName == "key") {
																var key = $(
																		this)
																		.attr(
																				'key');
																var keyval = $(
																		this)
																		.attr(
																				'value');
																var now6 = new Array();
																now6 = key
																		.split(/:|_/);
																var x = 0;
																var real6 = "";

																while (x < now6.length) {
																	real6 = real6
																			+ now6[x];
																	x++;
																}

																var textb = $(
																		'<input/>')
																		.attr(
																				{
																					type : 'text',
																					id : real6,
																					name : real6,
																					value : keyval,
																					hidden : 'hidden'
																				});
																var lab = $('<label>'
																		+ ucwords(key)
																		+ '</label><br/>');
																var combined = textb
																		.appendTo(lab);
																fieldset
																		.append(combined);
															}

														});
									}

								});

				fieldset.prependTo('.myform');
			});
	    }
	});

	

}



function submission(t,latlon,f,u) {
  this.time = t;
  this.latlon = latlon;
  this.features = f;
  this.user = u;			
  this.submt = 0;	
  
  
  
 this.getEntryId = function () {
	var d = $.Deferred();
    var idi;			
    db.transaction(function (transaction) {
      transaction.executeSql(
      'SELECT * FROM userDetails;',
      null,
      function (transaction, result) {
        for (var i=0; i < result.rows.length; i++) {
          var row = result.rows.item(i);
          idi = row.id;
        }
        d.resolve(idi);
      }, errorHandler);
    });	
			
    return d;
}

			
			
this.saveUser = function () {
	var d = $.Deferred();
	localStorage.count = 0;
  db.transaction(function (transaction) {
    transaction.executeSql(
    'INSERT INTO userDetails (usr, latlong, time, submitted) VALUES (?, ?, ?, ?);',
    [u, latlon, t, 0],
    function () {
      alert("User Details saved in DB. User: "+u+" and pass: "+ localStorage.pswd+" and Coords: "+latlon+" dbcoods: "+localStorage.lat+" "+localStorage.lon);
      d.resolve();
    }, errorHandler);
  });	
  return d;
}
		
			
this.saveResults = function(i) {
  $.each(f, function (key, value) {
    db.transaction(function (transaction) {
      transaction.executeSql(
      'INSERT INTO keyvalues (id, key, value, sub) VALUES (?, ?, ?, ?);',
      [i, key, value,0],
      function() {		
        alert("Value saved in DB is: "+key+': '+value +' id is:'+i);
      }, errorHandler);
    });	    
  });
			
}			
}
		
		
function errorHandler (transaction, error) {
  alert('Error was '+error.message);
  return true;
}

function uploadErrorHandler(transaction, error){
  alert('Error: '+error.message);
  return true;
	
}


function saveSettings() {

	localStorage.usernm = $('#username').val();
	localStorage.pswd = $('#pass').val();
	$.mobile.changePage("#page_home", "slide", true, false);
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
	
	
    if (localStorage.usernm != undefined && localStorage.pswd != undefined){
      var s = new submission(tim,crds,features,localStorage.usernm);
      
      s.saveUser().then(function(){
    	  
    	  s.getEntryId().then(function(x){
    		  
    		 // alert('x is:'+x);
    		  
    		  localStorage.id = x;
    		  s.saveResults(x);
    		  
    	  });
    	  
      });
      
      
     // $.mobile.changePage("#page_home", "slide", true, false);
      $('.myform')[0].reset();
			
      return false;
    }
    
    else {
      alert("Please Save Username and Password in Options.");
      $.mobile.changePage("#page_home", "slide", true, false);
    }		
			
  }
  else {
    alert("Please Save Atleast One Value");
  }

}


function createChangeset() {
	alert('inside create changeset');
			//var id;
		  var d = $.Deferred();
		  $.ajax({
		    url: 'http://api06.dev.openstreetmap.org/api/0.6/changeset/create',
		    type: 'POST',
		    
		    data: "<osm><changeset><tag k='created_by' v='Easymappr' /><tag k='comment' v='Edited with EasyMappr' /></changeset></osm>",
		    beforeSend: makeBeforeSend("PUT"),
		    success: function(resp) {
		      d.resolve(resp);
		      //id = resp;
		     // alert(resp);
		    },
		    error: function(err){
		      d.reject(err);
		     // alert("Error: "+err);
		    },
		    timeout: 30 * 1000
		    });

		  return d;
		}

function makeBeforeSend(method) {
	var use = localStorage.usernm;
	var pss = localStorage.pswd;

	var auth = make_base_auth(use, pss);

	return function(xhr) {
		xhr.setRequestHeader("X_HTTP_METHOD_OVERRIDE", method);
		xhr.setRequestHeader("Authorization", auth);
	};
} 

function createNode(cords, tag, cid) {
	alert('inside create node');
	var d = $.Deferred();

	var coordinates = cords.split(',');

	$.ajax({
		url : 'http://api06.dev.openstreetmap.org/api/0.6/node/create',
		type : 'POST',
		data : '<osm><node changeset="'+cid+'" lat="'+coordinates[0]+'" lon="'+coordinates[1]+'">'+tag+'</node></osm>',
		beforeSend : makeBeforeSend("PUT"),
		success : function(id) {
			d.resolve(id);
		},
		error : function(err) {
			// console.log(JSON.stringify(err));
			d.reject(err);
		}
	});

	return d;
}



function createNodeTags(nodeId) {
	
	var d = $.Deferred();
	var allTags = '';

	db.transaction(function(transaction) {
		transaction.executeSql('SELECT * FROM keyvalues WHERE id = ? and sub = ?;', [nodeId,0], function(transaction, result) {
		  for ( var i = 0; i < result.rows.length; i++){
			
			allTags = allTags + '<tag k="' + result.rows.item(i).key + '" v="' + result.rows.item(i).value + '"/>';

			//alert('Key: '+result.rows.item(i).key+' and value: '+result.rows.item(i).value);
						
			}
		  d.resolve(allTags);
		  
			}, function(transaction, error){
			   alert('Error: '+error.message);
				
			});
	});
	//alert('Outside Tags with value =  '+allTags);
	return d;

}

var Base64 = {

	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

	// public method for encoding
	encode : function(input) {
		output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;

		input = Base64._utf8_encode(input);

		while (i < input.length) {

			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);

			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;

			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}

			output = output + this._keyStr.charAt(enc1)
					+ this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3)
					+ this._keyStr.charAt(enc4);

		}

		return output;
	},

	// public method for decoding
	decode : function(input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;

		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		while (i < input.length) {

			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			output = output + String.fromCharCode(chr1);

			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}

		}

		output = Base64._utf8_decode(output);

		return output;

	},

	// private method for UTF-8 encoding
	_utf8_encode : function(string) {
		string = string.replace(/\r\n/g, "\n");
		var utftext = "";

		for ( var n = 0; n < string.length; n++) {

			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			} else if ((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			} else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}

		return utftext;
	},

	// private method for UTF-8 decoding
	_utf8_decode : function(utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;

		while (i < utftext.length) {

			c = utftext.charCodeAt(i);

			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			} else if ((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i + 1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			} else {
				c2 = utftext.charCodeAt(i + 1);
				c3 = utftext.charCodeAt(i + 2);
				string += String.fromCharCode(((c & 15) << 12)
						| ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}

		}

		return string;
	}

}

function make_base_auth(user, pass) {

	var tok = user + ':' + pass;
	var hash = Base64.encode(tok);
	return "Basic " + hash;

}

