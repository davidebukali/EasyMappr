var db;
var chsetId = 0;
var crds;
var mainForm = '';
localStorage.URLl = "value";
var userIds = new Array();
var lats = new Array();
var z = '';
var access = false;

$(document).ready(
    function(){
    	
      $.blockUI({
        message : '<h5><img src="images/spinner.gif" /><br/>Please wait...</h5>',
        css : {
          top : ($(window).height()) / 3 + 'px',
          left : ($(window).width() - 200) / 2 + 'px',
          width : '200px'
        }
      });
      
      //Wait for PhoneGap to load
      document.addEventListener("deviceready", onDeviceReady, false);
      var watchID = null;
      //PhoneGap is ready
      function onDeviceReady(){
        access = true;
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, readEmp, failReadEmp);
        
        var shortName = 'mapit';
        var version = '1.0';
        var displayName = 'mapit';
        var maxSize = 50000;
        db = openDatabase(shortName, version, displayName, maxSize);
        db.transaction(function(transaction){
          transaction.executeSql('CREATE TABLE IF NOT EXISTS userDetails ' + ' (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, '
              + ' usr TEXT NOT NULL, latlong TEXT NOT NULL, ' + ' time TEXT NOT NULL, submitted TEXT NOT NULL);');
        });
        db.transaction(function(transaction){
          transaction.executeSql('CREATE TABLE IF NOT EXISTS keyvalues ' + ' (id INTEGER NOT NULL, '
              + ' key TEXT NOT NULL, value TEXT NOT NULL, sub TEXT NOT NULL);');
        });
        var options = {
          enableHighAccuracy : true,
          frequency : 3000
        };
        watchID = navigator.geolocation.watchPosition(onSuccess, onerror, options);
        
        loginStatus().then(function(){
      	  $("#elogout").show();
      	  $("#elogin").hide();
      	  localStorage.url = "http://easymappr01.internal01.mountbattenhosting.net/preset";
        }).fail(function(){
      	  
      	  if(localStorage.u != undefined && localStorage.p != undefined || localStorage.u != "0" && localStorage.p != "0"){
      		  login(localStorage.u, localStorage.p).then(function(a){
      			  alert(a);
      		  });
      	  }else
      	  {
      		  localStorage.url = "kiosk.xml";
          	  $("#elogout").hide();
          	  $("#elogin").show();
          	  alert("Please Login to EasyMappr to view your default preset."); 
      	  }
      	  
        });
        
      }
      
      $("#page_login_submit").click(function(){
          var a = navigator.network.connection.type;
          var b = {};
          b[Connection.UNKNOWN] = "Unknown connection";
          b[Connection.ETHERNET] = "Ethernet connection";
          b[Connection.WIFI] = "WiFi connection";
          b[Connection.CELL_2G] = "Cell 2G connection";
          b[Connection.CELL_3G] = "Cell 3G connection";
          b[Connection.CELL_4G] = "Cell 4G connection";
          b[Connection.NONE] = "No network connection";
          if ((b[a] == "No network connection") || (b[a] == "Unknown connection")) {
            alert("Your phone web connection is not working. Please check and Try Again.")
          } else {
            saveSettings();

          }
        });
      
      $("#login_submit").click(function(){
    	  var us = $("#user").val();
    	  var ps = $("#passw").val();
    	  if($("#user").val().length > 0 && $("#passw").val().length > 0) {
    		  
    		  $.blockUI({
                  message : '<h4><img src="images/ajax-loader.gif" /><br/>Signing In...</h4>',
                  css : {
                    top : ($(window).height()) / 3 + 'px',
                    left : ($(window).width() - 200) / 2 + 'px', width : '200px',
                    backgroundColor : '#33CCFF', '-webkit-border-radius' : '10px',
                    '-moz-border-radius' : '10px', color : '#FFFFFF', border : 'none'
                  }
                });
    		  
          login(us, ps).then(function(p){
        	  alert(p);
        	  $.unblockUI();
          }).fail(function(a){
        	  alert(a);
        	  $.unblockUI();
          });
    	  }else{
    		  $.unblockUI();
    		  alert("Please enter a username and password.");
    	  }
    	  
        });
      
      $("#logout").click(function(){
    	  
          logout().then(function(){
        	  
          }).fail(function(x){
        	  alert(x);
          });
    	  
        });
      
      
      //onSuccess Geolocation
      function onSuccess(position){
        var element = document.getElementById('lat');
        var ele = document.getElementById('lon');
        localStorage.lat = position.coords.latitude;
        localStorage.lon = position.coords.longitude;
        element.innerHTML = 'Latitude: ' + '<br/><b>' + localStorage.lat + '</b>';
        ele.innerHTML = 'Longitude: ' + '<br/><b>' + localStorage.lon + '</b>';
        crds = localStorage.lat + ',' + localStorage.lon;
        if(access == true){
        	$.unblockUI();
        	access = false;
        }
      }
      
      // onError Callback receives a PositionError object
      function onerror(error){
        alert('GPS Error: ' + error.message);
      }
      $("#page_logout").click(function(){
        $.blockUI({
          message : '<h5><img src="images/spinner.gif" /><br/>Logging out...</h5>',
          css : {
            top : ($(window).height()) / 3 + 'px',
            left : ($(window).width() - 200) / 2 + 'px',
            width : '200px'
          }
        });
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFSww, failww);
      });

      mainPage(localStorage.url);
      
});


function login(name, pass) {
	  
	  var d = $.Deferred();
	  $.ajax({
	    url : "http://easymappr01.internal01.mountbattenhosting.net/?q=emp_services/user/login.json", type : 'post',
	    data : 'username=' + encodeURIComponent(name) + '&password=' + encodeURIComponent(pass),
	    dataType : 'json', error : function(XMLHttpRequest, textStatus, errorThrown) {
	      
	      d.reject("Failed to login: " + errorThrown);
	    }, success : function(data) {
	      
	      d.resolve("EasyMappr Login Success");
	      
	      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, saveEmpUser, empFail);
	      $.mobile.changePage("#page_home", "slide", true, false);
	    }
	  });
	  return d;
	  
}

	function logout() {
	  var d = $.Deferred();
	  $.ajax({
	    url : "http://easymappr01.internal01.mountbattenhosting.net/?q=emp_services/user/logout.json", type : 'post', dataType : 'json',
	    error : function(XMLHttpRequest, textStatus, errorThrown) {
	      d.reject(errorThrown);
	     // alert('Failed to logout ' + errorThrown);
	    }, success : function(data) {
	      
	      d.resolve(data);
	      localStorage.u = "0";
	      localStorage.p = "0";
	      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, resetEmp, failreset);
	      $.mobile.changePage("#page_home", "slide", true, false);
	      alert("Logged out.");
	    }
	  });
	  return d;
	  
	}
	
	function loginStatus() {
		  
		  var d = $.Deferred();
		  $.ajax({
		    url : "http://easymappr01.internal01.mountbattenhosting.net/?q=emp_services/system/connect.json", type : 'post',
		    dataType : 'json', error : function(XMLHttpRequest, textStatus, errorThrown) {
		      
		      
		      alert('Cannot Connect to EasyMappr Site. '+errorThrown);
		      
		    }, success : function(data) {
		      
		      var drupal_user = data.user;
		      if(drupal_user.uid == 0) {
		        // user is not logged in
		    	
		        d.reject();
		      }
		      else { // user is logged in
		        d.resolve();
		        
		      }
		    }
		  });
		  return d;
		  
}

$("#options").live("pagebeforeshow", function(event){
	
	loginStatus().then(function(){
		$("#user").val(localStorage.u);
		$("#passw").val(localStorage.p);
	}).fail(function(){
		
	});
	
  if (chsetId > 0) {
    $("#login").hide();
    $("#logout").show();
    //$('#usr').hide();
    //$('#pss').hide();
    $('#username').val(localStorage.usernm);
    $('#pass').val(localStorage.pswd);
  } else {
    $("#logout").hide();
    $("#login").show();
    $('#usn').show();
    $('#pss').show();
  }
});

$("#myButton").click(function(){
  $.blockUI({
    message : '<h5><img src="images/spinner.gif" /><br/>Loading Form...</h5>',
    css : {
      top : ($(window).height()) / 3 + 'px',
      left : ($(window).width() - 200) / 2 + 'px',
      width : '200px'
    }
  });
  
  setTimeout(function(){ 
	  if (mainForm == '') {
		    makeForm(localStorage.url);
		  } else {
		    $(".myform").empty();
		    makeForm(localStorage.url);
		  }
  
  }, 1000);
  
});


$("#setUrl").click(function(){
	
	if($("#presetUrl").val().length > 0){
		$.mobile.showToast("Saving ...", 1000, function() {
			//var path = "presets/";
			localStorage.url = $("#presetUrl").val();
			mainPage(localStorage.url);
		    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, settings, failsaveSettings);
		  });
	}else{
		alert("Please enter a preset");
	}
	
	
});

$("#page_save_submit").click(function(){
  processForm();
});
$("#upload").click(function(){
  var networkState = navigator.network.connection.type;
  var states = {};
  states[Connection.UNKNOWN] = 'Unknown connection';
  states[Connection.ETHERNET] = 'Ethernet connection';
  states[Connection.WIFI] = 'WiFi connection';
  states[Connection.CELL_2G] = 'Cell 2G connection';
  states[Connection.CELL_3G] = 'Cell 3G connection';
  states[Connection.CELL_4G] = 'Cell 4G connection';
  states[Connection.NONE] = 'No network connection';
  if ((states[networkState] == 'No network connection') || (states[networkState] == 'Unknown connection')) {
    alert('Your phone web connection is not working. Please check and Try Again.');
  } else {
    if (chsetId != 0) {
      isChangesetActive(chsetId).then(function(){
        sendData();
      }).fail(function(){
        alert("You were logged out, Please Sign In from options");
      });
    } else {
      alert("Please Sign In from options");
    }
  }
});
function isChangesetActive(changeset_id){
  var d = $.Deferred();
  $.ajax({
    url : localStorage.URLl + '/api/0.6/changeset/' + changeset_id,
    type : 'GET',
    success : function(resp){
      d.resolve($(resp).find('changeset').attr('open') == 'true');
    },
    error : function(err){
      d.reject(err);
    }
  });
  return d;
}
// Update record on the fly
function updateRecord(id){
  db.transaction(function(tx){
    tx.executeSql("UPDATE userDetails SET submitted = ? WHERE id = ?", [ 1, id
    ], null, onError);
  });
}
function sendData(){
  var dbRowsLeft;
  checkDB().then(function(ig){
    dbRowsLeft = ig;
    upload().then(function(m){
      updateRecord(m);
      if (dbRowsLeft > 1) {
        sendData();
      } else {
        alert("Upload Complete");
      }
    });
  }).fail(function(err){
    alert("No Data for Upload in Database");
    //$.unblockUI();
  });
}
function onError(tx, error){
  alert("Database Update Error: " + error.message + " Please Try Again");
}
function checkDB(){
  var d = $.Deferred();
  db.transaction(function(transaction){
    transaction.executeSql('SELECT * FROM userDetails where submitted = ?;', [ 0
    ], function(transaction, result){
      if (result.rows.length >= 1) {
        d.resolve(result.rows.length);
      } else {
        d.reject(result.rows.length);
      }
    }, function(transaction, error){
    // alert('Error: ' + error.message);
    });
  });
  return d;
}
function upload(){
  var d = $.Deferred();
  db.transaction(function(transaction){
    transaction.executeSql('SELECT * FROM userDetails where submitted = ? limit 1;', [ 0
    ], function(transaction, result){
      createNodeTags(result.rows.item(0).id).then(function(ts){
        createNode(localStorage.URLl, result.rows.item(0).latlong, ts, chsetId).then(function(ig){
          d.resolve(result.rows.item(0).id);
        }).fail(function(err){
          d.reject(err);
        });
      });
    }, function(transaction, error){
      //alert('Database Error: ' + error.message);
      //$.unblockUI();
    });
  });
  return d;
}

function mainPage(t){
  $.ajax({
    type : "GET",
    url : t,
    dataType : "xml",
    
    success : function(xml){
      var oldShortDesc = $(xml).find("presets").attr("shortdescription");
      var newShortDesc = replaceAll(oldShortDesc, "_", " ");
      var olddesc = $(xml).find("presets").attr("description");
      var desc = replaceAll(olddesc, "_", " ");
      $("#openingmessage").html(newShortDesc);
      $("#desc").html(desc);
    }
  });
}
function makeForm(b){
	
  $.ajax({
    type : "GET",
    url : b,
    dataType : "xml",
    complete : function(jqXHR, textStatus){
      if (textStatus == "success") {
        $.mobile.changePage("#mainform", "slide", true, false);
        $.unblockUI();
      }
    },
    success : function(xml){
    	
      mainForm = 'true';
      var fieldset;
      
      $(xml).find('group').each(
              function(){
            	  fieldset = $('<fieldset></fieldset>');
                  var olditem = $(this).attr('name');
                  var item = replaceAll(olditem, "_", " ");
                  var leg = $('<legend id="h1">' + ucwords(item) + '</legend>');
                  fieldset.append(leg);
      $(this).children().each(
          function(){
        	  
        	  if((this).nodeName == "item"){
        		  var labelCount = 0;
                  
                  $(this).children().each(
                      function(){

                        if ((this).nodeName == "combo") {
                        	
                        	var oldtxt = $(this).attr('text');
                            var txt;
                            var kiy = $(this).attr('key');
                            
                            if(oldtxt == undefined || oldtxt == "" || oldtxt == null){
                            	txt = kiy;
                            }else{
                            	txt = replaceAll(oldtxt, "_", " ");
                            }
                            
                            var uniqueId = new Array();
                            uniqueId = kiy.split(/:|_/);
                            var x = 0;
                            var idString = "";
                            while (x < uniqueId.length) {
                              idString = idString + uniqueId[x];
                              x++;
                            }
                        	var radioValues = $(this).attr('values');
                        	var radioFieldset = $('<fieldset data-role="controlgroup"></fieldset>');
                            var radioLegend = $('<legend id="h2">' + txt + '</legend>');
                            radioFieldset.append(radioLegend);
                            var subs;
                            var newRadio;
                            var newRadioLabel;
                            
                        	if(radioValues == undefined || radioValues == "" || radioValues == null){
                        		$(this).children().each(function(){
                        			subs = $(this).attr('value');
                        			newRadio = $('<input type="radio" name=' + kiy + ' id=' + idString + subs + ' value='
                            				+ subs + ' />');
                        			newRadioLabel = $('<label for=' + idString + subs+ '>' + subs + '</label>');
                            		radioFieldset.append(newRadio);
                            		radioFieldset.append(newRadioLabel);
                        			
                        		});
                        		
                        	}else
                        	{

                                var substrg = radioValues.split(',');
                                var x = 0;
                                while (x < substrg.length) {
                                	if(substrg[x] != "" && substrg[x] != null){
                                		newRadio = $('<input type="radio" name=' + kiy + ' id=' + idString + substrg[x] + ' value='
                                				+ substrg[x] + ' />');
                                		newRadioLabel = $('<label for=' + idString + substrg[x] + '>' + substrg[x] + '</label>');
                                		radioFieldset.append(newRadio);
                                		radioFieldset.append(newRadioLabel);
                                			
                                	}
                                	x = x + 1;
                                }
                                
                        	}
                        	fieldset.append(radioFieldset);
                          
                        }else if ((this).nodeName == "label") {
                          var clas;

                          var a = $(this).attr('text');
                          var lab = $('<label class="h2">' + a + '</label><br/>');
                          fieldset.append(lab);
                          
                        }else if ((this).nodeName == "text") {
                          var oldtextbName = $(this).attr('text');
                          var textbName;
                          var kay = $(this).attr('key');
                          if(oldtextbName == undefined || oldtextbName == "" || oldtextbName == null){
                        	  textbName = kay;
                        	  
                          }else{
                        	  textbName = replaceAll(oldtextbName, "_", " ");
                          }
                          
                          var now1 = new Array();
                          now1 = kay.split(/:|_/);
                          var x = 0;
                          var real = "";
                          while (x < now1.length) {
                            real = real + now1[x];
                            x++;
                          }
                          var labo = $('<label for=' + real + ' class="h2">' + textbName + '</label>');
                          var textbx = document.createElement('input');
                          textbx.type = 'text';
                          textbx.name = real;
                          textbx.id = real;
                          
                          fieldset.append(labo);
                          fieldset.append(textbx);
                        }else if ((this).nodeName == "key") {
                          var key = $(this).attr('key');
                          var keyval = $(this).attr('value');
                          var now3 = new Array();
                          now3 = key.split(/:|_/);
                          var x = 0;
                          var real3 = "";
                          while (x < now3.length) {
                            real3 = real3 + now3[x];
                            x++;
                          }
                          var textb = $('<input/>').attr({
                            type : 'text',
                            id : real3,
                            name : real3,
                            value : keyval,
                            type : 'hidden'
                          });
                         // var lab = $('<label>' + ucwords(key) + '</label><br/>');
                          //fieldset.append(lab);
                          fieldset.append(textb);
                        }else if ((this).nodeName == "space") {
                          var newline = $('<br/>');
                          fieldset.append(newline);
                        }else if ((this).nodeName == "multiselect") {
                        	
                        	var oldtxt = $(this).attr('text');
                            var txt;
                            var kiy = $(this).attr('key');
                            
                            if(oldtxt == undefined || oldtxt == "" || oldtxt == null){
                            	txt = kiy;
                            }else{
                            	txt = replaceAll(oldtxt, "_", " ");
                            }
                            
                            var uniqueId = new Array();
                            uniqueId = kiy.split(/:|_/);
                            var x = 0;
                            var idString = "";
                            while (x < uniqueId.length) {
                              idString = idString + uniqueId[x];
                              x++;
                            }
                        	var radioValues = $(this).attr('values');
                        	var radioFieldset = $('<fieldset data-role="controlgroup"></fieldset>');
                            var radioLegend = $('<legend id="h2">' + txt + '</legend>');
                            radioFieldset.append(radioLegend);
                            var subs;
                            var newRadio;
                            var newRadioLabel;
                            
                        	if(radioValues == undefined || radioValues == "" || radioValues == null){
				  var y = 0;
                        		$(this).children().each(function(){
						
                        			subs = $(this).attr('value');
                        			newRadio = $('<input type="checkbox" name=' + kiy + ' id=' + y + subs + ' value='
                            				+ subs + ' />');
                        			newRadioLabel = $('<label for=' + y + subs+ '>' + subs + '</label>');
                            		radioFieldset.append(newRadio);
                            		radioFieldset.append(newRadioLabel);
					
					y = y+1;
                        			
                        		});
                        		
                        	}else
                        	{

                                var substrg = radioValues.split(',');
                                var x = 0;
                                while (x < substrg.length) {
                                	if(substrg[x] != "" && substrg[x] != null){
                                		newRadio = $('<input type="checkbox" name=' + kiy + ' id=' + x + substrg[x] + ' value='+ substrg[x] + ' />');
                                		newRadioLabel = $('<label for=' + x + substrg[x] + '>' + substrg[x] + '</label>');
                                		radioFieldset.append(newRadio);
                                		radioFieldset.append(newRadioLabel);
                                			
                                	}
                                	x = x + 1;
                                }
                                
                        	}
                        	fieldset.append(radioFieldset);
                          
                        }
                        
                        				
                        if ((this).nodeName == "optional") {
                          $(this).children().each(
                              function(){
                              		
                                if ((this).nodeName == "label") {
                                  var clas;

                                  var a = $(this).attr('text');
                                  var lab = $('<label class="h2">' + a + '</label><br/><br/>');
                                  fieldset.append(lab);
                                }
                                
                                							
                                if ((this).nodeName == "combo") {
                                	var oldtxt = $(this).attr('text');
                                    var txt;
                                    var kiy = $(this).attr('key');
                                    
                                    if(oldtxt == undefined || oldtxt == "" || oldtxt == null){
                                    	txt = kiy;
                                    }else{
                                    	txt = replaceAll(oldtxt, "_", " ");
                                    }
                                    
                                    var uniqueId = new Array();
                                    uniqueId = kiy.split(/:|_/);
                                    var x = 0;
                                    var idString = "";
                                    while (x < uniqueId.length) {
                                      idString = idString + uniqueId[x];
                                      x++;
                                    }
                                	var radioValues = $(this).attr('values');
                                	var radioFieldset = $('<fieldset data-role="controlgroup"></fieldset>');
                                    var radioLegend = $('<legend id="h2">' + txt + '</legend>');
                                    radioFieldset.append(radioLegend);
                                	
                                	if(radioValues == undefined || radioValues == "" || radioValues == null){
                                		$(this).children().each(function(){
                                			var subs = $(this).attr('value');
                                			var newRadio = $('<input type="radio" name=' + kiy + ' id=' + idString + subs + ' value='
                                    				+ subs + ' />');
                                    		var newRadioLabel = $('<label for=' + idString + subs+ '>' + subs + '</label>');
                                    		radioFieldset.append(newRadio);
                                    		radioFieldset.append(newRadioLabel);
                                			
                                		});
                                		
                                	}else
                                	{

                                        var substrg = radioValues.split(',');
                                        var x = 0;
                                        while (x < substrg.length) {
                                        	if(substrg[x] != "" && substrg[x] != null){
                                        		var newRadio = $('<input type="radio" name=' + kiy + ' id=' + idString + substrg[x] + ' value='
                                        				+ substrg[x] + ' />');
                                        		var newRadioLabel = $('<label for=' + idString + substrg[x] + '>' + substrg[x] + '</label>');
                                        		radioFieldset.append(newRadio);
                                        		radioFieldset.append(newRadioLabel);
                                        			
                                        	}
                                        	x = x + 1;
                                        }
                                        
                                	}
                                	fieldset.append(radioFieldset);
                                } 
                                
                                	
                                
                                if ((this).nodeName == "text") {
                                	var oldtextbName = $(this).attr('text');
                                    var textbName;
                                    var kay = $(this).attr('key');
                                    if(oldtextbName == undefined || oldtextbName == "" || oldtextbName == null){
                                  	  textbName = kay;
                                  	  
                                    }else{
                                  	  textbName = replaceAll(oldtextbName, "_", " ");
                                    }
                                  var now1 = new Array();
                                  now1 = kay.split(/:|_/);
                                  var x = 0;
                                  var real = "";
                                  while (x < now1.length) {
                                    real = real + now1[x];
                                    x++;
                                  }
                                  var labo = $('<label for=' + real + ' class="h2">' + textbName + '</label>');
                                  
                                  var textbx = document.createElement('input');
                                  textbx.type = 'text';
                                  textbx.name = real;
                                  textbx.id = real;
                                  
                                  
                                  
                                  fieldset.append(labo);
                                  fieldset.append(textbx);
                                }else if((this).nodeName == "key") {
                                  var key = $(this).attr('key');
                                  var keyval = $(this).attr('value');
                                  var now6 = new Array();
                                  now6 = key.split(/:|_/);
                                  var x = 0;
                                  var real6 = "";
                                  while (x < now6.length) {
                                    real6 = real6 + now6[x];
                                    x++;
                                  }
                                  var textb = $('<input/>').attr({
                                    type : 'text',
                                    id : real6,
                                    name : real6,
                                    value : keyval,
                                    type : 'hidden'
                                  });
                                  //var lab = $('<label>' + ucwords(key) + '</label><br/>');
                                  fieldset.append(textb);
                                  
                                }
       								
                              });  
                        }		
                        
                      });
                  
        	  }
            
            
          });
              });
      fieldset.prependTo('.myform').trigger("create");
    }
  });
  				
}
function submission(t, latlon, f, u){
  this.time = t;
  this.latlon = latlon;
  this.features = f;
  this.user = u;
  this.submt = 0;
  this.getEntryId = function(){
    var d = $.Deferred();
    var idi;
    db.transaction(function(transaction){
      transaction.executeSql('SELECT * FROM userDetails;', null, function(transaction, result){
        for ( var i = 0; i < result.rows.length; i++) {
          var row = result.rows.item(i);
          idi = row.id;
        }
        d.resolve(idi);
      }, errorHandler);
    });
    return d;
  }
  this.saveUser = function(){
    var d = $.Deferred();
    localStorage.count = 0;
    db.transaction(function(transaction){
      transaction.executeSql('INSERT INTO userDetails (usr, latlong, time, submitted) VALUES (?, ?, ?, ?);', [ u, latlon, t, 0
      ], function(){
        d.resolve();
      }, errorHandler);
    });
    return d;
  }
  this.saveResults = function(i){
    $.each(f, function(key, value){
      db.transaction(function(transaction){
        transaction.executeSql('INSERT INTO keyvalues (id, key, value, sub) VALUES (?, ?, ?, ?);', [ i, key, value, 0
        ], function(){}, errorHandler);
      });
    });
  }
}
function errorHandler(transaction, error){
  alert('Database Error was ' + error.message + ' please try again');
  return true;
}
function uploadErrorHandler(transaction, error){
  alert('Error: ' + error.message);
  return true;
}
function replaceAll(Source, stringToFind, stringToReplace){
	var temp = Source+"";
    var index = temp.indexOf(stringToFind);
        while(index != -1){
            temp = temp.replace(stringToFind,stringToReplace);
            index = temp.indexOf(stringToFind);
        }
        return temp;
  //return txt.replace(new RegExp(rep, 'g'), with_this);
}
function saveSettings(){
  
  localStorage.URLl = "http://api.openstreetmap.org/";
  
  if ($('#username').val().length > 0 && $('#pass').val().length > 0 && localStorage.URLl != "value") {
    localStorage.usernm = $('#username').val();
    localStorage.pswd = $('#pass').val();
    createChangeset(localStorage.URLl).then(function(hu){
      
      chsetId = hu;
      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFSw, failw);
      $.mobile.changePage("#page_home", "slide", true, false);
    });
  } else {
    alert("Please Enter Login Values");
    //$.unblockUI();
  }
}
function ucwords(input){
  var words = input.split(/(\s|-)+/);
  output = [];
  for ( var i = 0, len = words.length; i < len; i += 1) {
    output.push(words[i][0].toUpperCase() + words[i].toLowerCase().substr(1));
  }
  return output.join('');
}
function resetForm($form){
  $form.find('input:text, input:password, input:file, select').val('');
  $form.find('input:radio').removeAttr('checked').removeAttr('selected');
}
function processForm(){
  var flag = false;
  var radioCheck = false;
  var validate = false;
  var features = {};
  var radios = jQuery(".myform input[type='radio']");
  var texts = jQuery(".myform input[type='text']");
  radios.filter(":checked").each(function(){
    radioCheck = true;
    features[$(this).attr('name')] = $(this).val();
  });
  texts.each(function(){
    if ($(this).val().length > 0) {
      // alert("Its on: "+$(this).val());
      flag = true;
      features[$(this).attr('name')] = $(this).val();
    }
  })
  if (flag == true || radioCheck == true) {
    validate = true;
  } else {
    validate = false;
  }
  if (validate) {
    var currentTime = new Date();
    var hours = currentTime.getHours();
    var minutes = currentTime.getMinutes();
    if (minutes < 10)
      minutes = "0" + minutes
    var tim = hours + ':' + minutes;
    if (localStorage.usernm != undefined && localStorage.pswd != undefined) {
      var s = new submission(tim, crds, features, localStorage.usernm);
      s.saveUser().then(function(){
        s.getEntryId().then(function(x){
          localStorage.id = x;
          s.saveResults(x);
        });
      });
      // $.mobile.changePage("#page_home", "slide", true, false);
      $('.myform')[0].reset();
      resetForm($('.myform'));
      $(".myform input[type='radio']").each(function(){
        $(this).checkboxradio("refresh");
      });
      alert("Values saved");
      $('html').animate({
        scrollTop : 0
      }, 'slow');//IE, FF
      $('body').animate({
        scrollTop : 0
      }, 'slow');
      return false;
    } else {
      alert("Please Save Username and Password in Options.");
      $.mobile.changePage("#page_home", "slide", true, false);
    }
  } else {
    alert("Please Save Atleast One Value");
  }
}
function createChangeset(s){
  var d = $.Deferred();
  $.ajax({
    url : s + 'api/0.6/changeset/create',
    type : 'POST',
    timeout : 30000,
    data : "<osm><changeset><tag k='created_by' v='Easymappr' /><tag k='comment' v='Edited with EasyMappr' /></changeset></osm>",
    beforeSend : function(xhr){
      //makeBeforeSend("PUT");
      $.blockUI({
        message : '<h5><img src="images/spinner.gif" /><br/>Please Wait...</h5>',
        css : {
          top : ($(window).height()) / 3 + 'px',
          left : ($(window).width() - 200) / 2 + 'px',
          width : '200px'
        }
      });
      var use = localStorage.usernm;
      var pss = localStorage.pswd;
      var auth = make_base_auth(use, pss);
      xhr.setRequestHeader("X_HTTP_METHOD_OVERRIDE", "PUT");
      xhr.setRequestHeader("Authorization", auth);
    },
    success : function(resp){
      d.resolve(resp);
    },
    complete : function(jqXHR, textStatus){
      if (textStatus == "success") {
        alert("Login Success");
        $.unblockUI();
      } else if (textStatus == "timeout") {
        alert("Wrong Password: " + localStorage.pswd + " or Username: " + localStorage.usernm + " using Server: "
            + localStorage.URLl);
        //alert("Server Busy Try Again");
        $.unblockUI();
      }
    }
  });
  return d;
}
function makeBeforeSend(method){
  var use = localStorage.usernm;
  var pss = localStorage.pswd;
  var auth = make_base_auth(use, pss);
  return function(xhr){
    xhr.setRequestHeader("X_HTTP_METHOD_OVERRIDE", method);
    xhr.setRequestHeader("Authorization", auth);
  };
}

function createNode(a, cords, tag, cid){
  var d = $.Deferred();
  var coordinates = cords.split(',');
  $.ajax({
    url : a + 'api/0.6/node/create',
    type : 'POST',
    data : '<osm><node changeset="' + cid + '" lat="' + coordinates[0] + '" lon="' + coordinates[1] + '">' + tag
        + '</node></osm>',
    beforeSend : function(xhr){
      //makeBeforeSend("PUT");
      $.blockUI({
        message : '<h5><img src="images/spinner.gif" /><br/>Uploading...</h5>',
        css : {
          top : ($(window).height()) / 3 + 'px',
          left : ($(window).width() - 200) / 2 + 'px',
          width : '200px'
        }
      });
      var use = localStorage.usernm;
      var pss = localStorage.pswd;
      var auth = make_base_auth(use, pss);
      xhr.setRequestHeader("X_HTTP_METHOD_OVERRIDE", "PUT");
      xhr.setRequestHeader("Authorization", auth);
    },
    success : function(id){
      d.resolve(id);
      $.unblockUI();
    },
    error : function(err){
      d.reject(err);
      $.unblockUI();
    },
    timeout : 120000,
    complete : function(jqXHR, textStatus){
      if (textStatus == "error") {
        alert("Upload Error, please login and try again");
      } else if (textStatus == "timeout") {
        alert("Server Busy Please Try Again");
      }
    }
  });
  return d;
}
function createNodeTags(nodeId){
  var d = $.Deferred();
  var allTags = '';
  db.transaction(function(transaction){
    transaction.executeSql('SELECT * FROM keyvalues WHERE id = ? and sub = ?;', [ nodeId, 0
    ], function(transaction, result){
      for ( var i = 0; i < result.rows.length; i++) {
        allTags = allTags + '<tag k="' + result.rows.item(i).key + '" v="' + result.rows.item(i).value + '"/>';
      }
      d.resolve(allTags);
    }, function(transaction, error){
      d.reject();
    });
  });
  return d;
}

;(function( $, window, undefined ) {
	  $.extend($.mobile, {
	      showToast: function(message,delay,callback) {
	          var oldMsg = $.mobile.loadingMessage;
	          $.mobile.loadingMessage = message;
	          $.mobile.showPageLoadingMsg("a",message,true);
	          if(delay && delay >0)
	          {
	              setTimeout(function(){
	                  $.mobile.hidePageLoadingMsg();
	                  $.mobile.loadingMessage = oldMsg;
	                  if(callback) callback();
	              },delay);
	          }
	          
	      }
	  });
	})( jQuery, this );

var Base64 = {
  // private property
  _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
  // public method for encoding
  encode : function(input){
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
      output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3)
          + this._keyStr.charAt(enc4);
    }
    return output;
  },
  // public method for decoding
  decode : function(input){
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
  _utf8_encode : function(string){
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
  _utf8_decode : function(utftext){
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
        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }
    }
    return string;
  }
}
function make_base_auth(user, pass){
  var tok = user + ':' + pass;
  var hash = Base64.encode(tok);
  return "Basic " + hash;
}
function gotFSw(fileSystem){
  fileSystem.root.getFile("pass.txt", {
    create : true,
    exclusive : false
  }, gotFileEntryw, failw);
}
function gotFileEntryw(fileEntry){
  fileEntry.createWriter(gotFileWriter, fail);
}
function gotFileWriter(writer){
  writer.onwriteend = function(evt){
    //console.log("contents of file now 'some sample text'");
    //alert("User and Pass Saved");
    $.unblockUI();
  };
  var auth = $("#username").val() + "," + $("#pass").val() + "," + chsetId + "," + localStorage.URLl;
  writer.write(auth);
}
function failw(error){
  //console.log(error.code);
  alert("Username and Password Not Saved, Please Login");
  $.unblockUI();
}
function gotFS(fileSystem){
  fileSystem.root.getFile("pass.txt", null, gotFileEntry, fail);
}
function gotFileEntry(fileEntry){
  fileEntry.file(gotFile, fail);
}
function gotFile(file){
  //readDataUrl(file);
  readAsText(file);
}
function readAsText(file){
  var reader = new FileReader();
  reader.onloadend = function(evt){
    //console.log("Read as text");
    //console.log(evt.target.result);
    var accss = evt.target.result.split(",");
    localStorage.usernm = accss[0];
    localStorage.pswd = accss[1];
    chsetId = accss[2];
    localStorage.URLl = accss[3];
    if (accss[0] != '0') {
      //alert("Welcome: " + localStorage.usernm);
    } else {
      alert("Login in from Options to Upload Data");
    }
    //$.unblockUI();
  };
  reader.readAsText(file);
}
function fail(evt){
  //console.log(evt.target.error.code);
  //alert("Username and Password Not read, Please Login");
  //$.unblockUI();
}
function gotFSww(fileSystem){
  fileSystem.root.getFile("pass.txt", {
    create : true,
    exclusive : false
  }, gotFileEntryww, failww);
}
function gotFileEntryww(fileEntry){
  fileEntry.createWriter(gotFileWriterw, failww);
}
function gotFileWriterw(writer){
  writer.onwriteend = function(evt){
    //console.log("contents of file now 'some sample text'");
    alert("Successfully Logged Out");
    localStorage.usernm = undefined;
    localStorage.pswd = undefined;
    chsetId = 0;
    localStorage.URLl = undefined;
    $.mobile.changePage("#page_home", "slide", true, false);
    $.unblockUI();
  };
  var auth = 0 + "," + 0 + "," + 0 + "," + 0;
  writer.write(auth);
}
function failww(error){
  //console.log(error.code);
  alert("Error Logging Out, Try again");
  $.unblockUI();
}

function readSettings(fileSystem) {
	  
	  fileSystem.root.getFile("settings.txt", null, readSettingsFileEntry, failSettings);
	}
	function readSettingsFileEntry(fileEntry) {
	  
	  fileEntry.file(readSettingsFile, failSettings);
	}
	function readSettingsFile(file) {
	  
	  readSetAsText(file);
	}
	function readSetAsText(file) {
	  
	  var reader = new FileReader();
	  reader.onload = function(evt) {
	    
	    var text = evt.target.result;
	    
	    localStorage.url = text;
	    
	  };
	  reader.readAsText(file);
	}
	function failSettings(evt) {
	  
	}

	function settings(fileSystem) {
	  
	  fileSystem.root.getFile("settings.txt", {
	    create : true, exclusive : false
	  }, saveSettingsFileEntry, failsaveSettings);
	}
	function saveSettingsFileEntry(fileEntry) {
	  
	  fileEntry.createWriter(saveSettingsFileWriter, failsaveSettings);
	}
	function saveSettingsFileWriter(writer) {
	  
	  writer.onwriteend = function(evt) {
	    
	    localStorage.url = $("#presetUrl").val();
	    
	  };
	  var auth = $("#presetUrl").val();
	  
	  writer.write(auth);
	}
	function failsaveSettings(error) {
	  $.unblockUI();
	}

	
	function saveEmpUser(fileSystem){
		  fileSystem.root.getFile("emppass.txt", {
		    create : true,
		    exclusive : false
		  }, gotEmp, empfail);
		}
		function gotEmp(fileEntry){
		  fileEntry.createWriter(gotEmpWriter, empfail);
		}
		function gotEmpWriter(writer){
		  writer.onwriteend = function(evt){
			  localStorage.u = $("#user").val();
			  localStorage.p = $("#passw").val();
		  };
		  alert("saved username and pass "+$("#user").val() + "," + $("#passw").val());
		  var auth = $("#user").val() + "," + $("#passw").val();
		  writer.write(auth);
		}
		function empfail(error){
		  
		}
		
		function readEmp(fileSystem){
		  fileSystem.root.getFile("emppass.txt", null, readEmpEntry, failReadEmp);
		}
		function readEmpEntry(fileEntry){
		  fileEntry.file(gotEmpRead, failReadEmp);
		}
		function gotEmpRead(file){
		  //readDataUrl(file);
		  readAsText(file);
		}
		function readAsText(file){
		  var reader = new FileReader();
		  reader.onloadend = function(evt){
		
		    var accss = evt.target.result.split(",");
		    localStorage.u = accss[0];
		    localStorage.p = accss[1];
		    
		    alert("read username and pass "+accss[0]+" "+accss[1]);
		    
		  };
		  reader.readAsText(file);
		}
		function failReadEmp(evt){
		  
		}
		
		function resetEmp(fileSystem){
			  fileSystem.root.getFile("emppass.txt", {
			    create : true,
			    exclusive : false
			  }, gotResetEntryww, failreset);
			}
			function gotResetEntryww(fileEntry){
			  fileEntry.createWriter(gotResetWriterw, failreset);
			}
			function gotResetWriterw(writer){
			  writer.onwriteend = function(evt){
			 
			    localStorage.u = undefined;
			    localStorage.p = undefined;
			    
			    $.mobile.changePage("#page_home", "slide", true, false);
			    
			  };
			  var auth = 0 + "," + 0;
			  writer.write(auth);
			}
			function failreset(error){
			
			}