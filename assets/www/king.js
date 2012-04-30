
$("#myButton").live( "click", function() {
		$.mobile.loadingMessage = 'Please Wait...';
	    $.mobile.showPageLoadingMsg();
		
	    
	    createChangeset().then(function(i){
	    	alert(i);
	    	
	    	createNode(i).then(function(g){
	    		alert('Node created: '+g);
	    		
	    	}).fail(function(){
	    		alert('Node not created');
	    		
	    	});
			  
		  }).fail(function(){
			  
			  alert('Changeset not created');
			  
		  });
		
	    $.mobile.hidePageLoadingMsg();
	  
});

	

function createChangeset() {
	alert('inside create changeset');
			//var id;
		  var d = $.Deferred();
		  $.ajax({
		    url: 'http://api06.dev.openstreetmap.org/api/0.6/changeset/create',
		    type: 'POST',
		    
		    data: "<osm><changeset><tag k='created_by' v='Easymappr' /><tag k='comment' v='OSM edited with EasyMappr' /></changeset></osm>",
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



		function isChangesetActive(changset_id) {
		  var d = $.Deferred();

		  $.ajax({
		    url: ' http://api.openstreetmap.org/api/0.6/changeset/create/' + changeset_id,
		    type: 'GET',
		    success: function(resp){
		      d.resolve($(resp).find('changeset').attr('open') == 'true');
		    },
		    error: function(err){
		      d.reject(err);
		    }
		  });

		  return d;
		}



		function makeBeforeSend(method){
		  var use = "davidebukali";
		  var pss = "lukulinanganda";

		  var auth = make_base_auth(use, pss);
			
		  return function(xhr) {
		    xhr.setRequestHeader("X_HTTP_METHOD_OVERRIDE", method);
		    xhr.setRequestHeader("Authorization", auth);
		  };
		}



		function createNode(cid){
			alert('inside create Node');
		  var d = $.Deferred();
		 // var tags = '<osm><node changeset='+cid+' lat="0.2921067" lon="32.6173466"><tag k="building" v="house"/></node></osm>';
		
		  $.ajax({
		    url: 'http://api06.dev.openstreetmap.org/api/0.6/node/create',
		    type: 'POST',
		    data: '<osm><node changeset="'+cid+'" lat="0.2921067" lon="32.6173466"><tag k="building" v="house"/></node></osm>',
		    beforeSend: makeBeforeSend("PUT"), 
		    success: function(id) {
		      d.resolve(id);
		      //alert('Created Node: '+tags+ ' with id '+id)
		    },
		    error: function(err){
		     // console.log(JSON.stringify(err));
		      d.reject(err);
		     // alert('Not Created...'+err)
		    }
		  });
		  
		  return d;
		 
		 }



		function uploadOSMData(){
		   // var fault;
		    
			db.transaction(function (transaction) {
		    transaction.executeSql(
			'SELECT * FROM userdetails WHERE sub = ?;',
			[0],
			function (transaction, result) {
			  for (var i=0; i < result.rows.length; i++) {
				        
			    createNode(result.rows.item(i).latlong, createNodeTags(result.rows.item(i).id)).then(function(err){
			      alert('Created Node for: '+result.rows.item(i).latlong+'\n'+' With tags: '+createNodeTags(result.rows.item(i).id));
			    	
			    }).fail(function(err){
			      alert('Failed Node for: '+result.rows.item(i).latlong+'\n'+' With tags: '+createNodeTags(result.rows.item(i).id));
			     // fault = 'true';
			    	
			    });
			  
			  }
			  
			  
			}, errorHandler);
		  });
			/*
			if(fault == 'true'){
			  alert("Upload Failed");
			}else{
			  alert("Upload Complete");
			}*/
			
			
		}


		function createNodeTags(nodeId){
			
		  var ky = new Array();
		  var val = new Array();
		  
		  var allTags = "";
		  
		  db.transaction(function (transaction) {
		    transaction.executeSql(
		    'SELECT * FROM keyvalues WHERE id = ? and sub = ?;',
		    [nodeId,0],
		    function (transaction, result) {
		      for (var i=0; i < result.rows.length; i++) {
		        
		    	ky[i] = result.rows.item(i).key;
		        val[i] = result.rows.item(i).value;
		        
		      }
		    }, errorHandler);
		  });	
					
		  for(var p = 0; p<ky.length; p++){
		    allTags = allTags + '<tag k='+ky[p]+' v='+val[p]+'/>';
			  
		  }

		  return allTags;
			
		}



		var Base64 = {
				

		// private property
		_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

		// public method for encoding
		encode : function (input) {
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
			}else if (isNaN(chr3)) {
			    enc4 = 64;
			  }

			output = output +
			this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

			}

		  return output;
		},

		// public method for decoding
		decode : function (input) {
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
		_utf8_encode : function (string) {
		  string = string.replace(/\r\n/g,"\n");
		  var utftext = "";

		  for (var n = 0; n < string.length; n++) {

		    var c = string.charCodeAt(n);

		    if (c < 128) {
		      utftext += String.fromCharCode(c);
		    }
		    else if((c > 127) && (c < 2048)) {
		      utftext += String.fromCharCode((c >> 6) | 192);
			  utftext += String.fromCharCode((c & 63) | 128);
		    }
		    else {
			  utftext += String.fromCharCode((c >> 12) | 224);
			  utftext += String.fromCharCode(((c >> 6) & 63) | 128);
			  utftext += String.fromCharCode((c & 63) | 128);
		    }

		  }

		  return utftext;
		},

		// private method for UTF-8 decoding
		_utf8_decode : function (utftext) {
		  var string = "";
		  var i = 0;
		  var c = c1 = c2 = 0;

		  while ( i < utftext.length ) {

		    c = utftext.charCodeAt(i);

			if (c < 128) {
			  string += String.fromCharCode(c);
			  i++;
			}
			else if((c > 191) && (c < 224)) {
			  c2 = utftext.charCodeAt(i+1);
			  string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
			  i += 2;
			}
			else {
			  c2 = utftext.charCodeAt(i+1);
			  c3 = utftext.charCodeAt(i+2);
			  string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
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


function saveSettings() {
	
	localStorage.usernm = $('#username').val();
    localStorage.pswd = $('#password').val();
  
    createChangeset().then(function(id){
      chsetId = id;
      $.mobile.changePage("#page_home", "slide", true, false);
  		  
    }).fail(function(err){
  	  
  	if(err.statusText == "timeout") {
  	  alert("Network too slow");
  	}else {
  	  alert("Error Logging in. Wrong password");
  	}
  		  	  
    });

  return false;
}
