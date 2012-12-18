var db;
var chsetId = 0;
var crds;
var mainForm = '';
var save;
var gps = false;

$(document).ready(
    function() {

      $.blockUI({
        message : '<h5><img src="images/spinner.gif" /><br/>Please wait...</h5>',
        css : {
          top : ($(window).height()) / 3 + 'px',
          left : ($(window).width() - 200) / 2 + 'px',
          width : '200px'
        }
      });

      save = new saveChanges();

      loginstate().then(function(x) {

        mainPage(x);

      }).fail(function(y) {

        mainPage(y);
      });

      $("#login_submit").click(function() {

        var us = $("#user").val();
        var ps = $("#passw").val();
        if ($("#user").val().length > 0 && $("#passw").val().length > 0)
        {
          var networkState = navigator.network.connection.type;
          var states = {};
          states[Connection.UNKNOWN] = 'Unknown connection';
          states[Connection.ETHERNET] = 'Ethernet connection';
          states[Connection.WIFI] = 'WiFi connection';
          states[Connection.CELL_2G] = 'Cell 2G connection';
          states[Connection.CELL_3G] = 'Cell 3G connection';
          states[Connection.CELL_4G] = 'Cell 4G connection';
          states[Connection.NONE] = 'No network connection';
          if ((states[networkState] == 'No network connection') || (states[networkState] == 'Unknown connection'))
          {
            //alert('Your phone web connection is not working. Please check and Try Again.');
            showAlert('Your phone web connection is not working. Please check and Try Again.', 'Internet Issue', 'Done');
            return false;
          } else
          {

            $.blockUI({
              message : '<h4><img src="images/ajax-loader.gif" /><br/>Signing In...</h4>',
              css : {
                top : ($(window).height()) / 3 + 'px',
                left : ($(window).width() - 200) / 2 + 'px',
                width : '200px',
                backgroundColor : '#C9C9C9',
                '-webkit-border-radius' : '10px',
                '-moz-border-radius' : '10px',
                color : '#FFFFFF',
                border : 'none'
              }
            });

            login(us, ps).then(function(p) {

              alert(p);
              $.unblockUI();
            }).fail(function(a) {

              alert(a);
              $.unblockUI();
            });
          }
        } else
        {
          $.unblockUI();
          alert("Please enter a username and password.");
        }

      });

      $("#logout").click(function() {

        var networkState = navigator.network.connection.type;
        var states = {};
        states[Connection.UNKNOWN] = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI] = 'WiFi connection';
        states[Connection.CELL_2G] = 'Cell 2G connection';
        states[Connection.CELL_3G] = 'Cell 3G connection';
        states[Connection.CELL_4G] = 'Cell 4G connection';
        states[Connection.NONE] = 'No network connection';
        if ((states[networkState] == 'No network connection') || (states[networkState] == 'Unknown connection'))
        {
          showAlert('Your phone web connection is not working. Please check and Try Again.', 'Internet Issue', 'Done');
          return false;
        } else
        {
          logout().then(function() {

            $("#accordion").children().trigger("collapse");
          }).fail(function(x) {

            alert(x);
          });
        }

      });

      $("#page_login_submit").click(function() {

        var a = navigator.network.connection.type;
        var b = {};
        b[Connection.UNKNOWN] = "Unknown connection";
        b[Connection.ETHERNET] = "Ethernet connection";
        b[Connection.WIFI] = "WiFi connection";
        b[Connection.CELL_2G] = "Cell 2G connection";
        b[Connection.CELL_3G] = "Cell 3G connection";
        b[Connection.CELL_4G] = "Cell 4G connection";
        b[Connection.NONE] = "No network connection";
        if ((b[a] == "No network connection") || (b[a] == "Unknown connection"))
        {
          showAlert('Your phone web connection is not working. Please check and Try Again.', 'Internet Issue', 'Done');
          return false;
        } else
        {
          saveSettings();
        }
      });

      $("#page_logout").click(function() {

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

      $("#page_home").live("pagebeforeshow", function(event) {
        
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, readEmp, failReadEmp);
        mainPage(localStorage.url);

      });

      $("#options").live("pagebeforeshow", function(event) {

        $("#accordion").children().trigger("collapse");
        checkOSM();
        loginStatus().then(function() {

          $("#user").val(localStorage.u);
          $("#passw").val(localStorage.p);

          $("#elogout").show();
          $("#elogin").hide();

        }).fail(function() {

          $("#user").val("");
          $("#passw").val("");
          $("#elogout").hide();
          $("#elogin").show();

        });

      });

      $("#myButton").click(function() {

        if(gps == true){
          $.blockUI({
            message : '<h4><img src="images/ajax-loader.gif" /><br/>Loading Form...</h4>',
            css : {
              top : ($(window).height()) / 3 + 'px',
              left : ($(window).width() - 200) / 2 + 'px',
              width : '200px',
              backgroundColor : '#C9C9C9',
              '-webkit-border-radius' : '10px',
              '-moz-border-radius' : '10px',
              color : '#FFFFFF',
              border : 'none'
            }
          });
          
          if (mainForm == '')
          {

            makeForm(localStorage.url);
            
          } else
          {

            $(".myform").empty();
            makeForm(localStorage.url);
            
          }
          
        }else{
          alert("Please Turn on GPS To Start Mapping");
          
        }

      });

      // Wait for PhoneGap to load
      document.addEventListener("deviceready", onDeviceReady, false);

      var watchID = null;

      // PhoneGap is ready
      function onDeviceReady() {

        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, readEmp, failReadEmp);

        var shortName = 'mapityo';
        var version = '1.0';
        var displayName = 'mapityo';
        var maxSize = 50000;

        db = openDatabase(shortName, version, displayName, maxSize);

        db.transaction(function(transaction) {

          transaction.executeSql('CREATE TABLE IF NOT EXISTS userDetails ' + '(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' + 'usr TEXT NOT NULL, latlong TEXT NOT NULL,'
              + ' title TEXT NOT NULL, editMode TEXT NOT NULL,' + ' time TEXT NOT NULL, submitted TEXT NOT NULL);');
        });

        db.transaction(function(transaction) {

          transaction.executeSql('CREATE TABLE IF NOT EXISTS keyvalues ' + ' (id INTEGER NOT NULL, ' + 'key TEXT NOT NULL, value TEXT NOT NULL, sub TEXT NOT NULL);');
        });

        var options = {
            enableHighAccuracy : true,
            frequency : 3000
        };

        watchID = navigator.geolocation.watchPosition(onSuccess, onerror, options);
        $.unblockUI();
      }

      // onSuccess Geolocation
      function onSuccess(position) {
        gps = true;
        localStorage.lat = position.coords.latitude;
        localStorage.lon = position.coords.longitude;

        var element = $('#lat').html('Latitude: ' + '<br/><b>' + localStorage.lat + '</b>');
        var ele = $('#lon').html('Longitude: ' + '<br/><b>' + localStorage.lon + '</b>');

        crds = localStorage.lat + ',' + localStorage.lon;
      }

      // onError Callback receives a PositionError object
      function onerror(error) {
        var gpsoff = "The last location provider was disabled";
        if (error.message == gpsoff)
        {
          alert("Please Check That GPS Switched is On");
          gps = false;
        }
        
      }

    });

$("#edit").click(function() {

  var num = $("#edit_content").children().length;

  $.blockUI({
    message : '<h4><img src="images/ajax-loader.gif" /><br/>Loading Edit Values...</h4>',
    css : {
      top : ($(window).height()) / 3 + 'px',
      left : ($(window).width() - 200) / 2 + 'px',
      width : '200px',
      backgroundColor : '#C9C9C9',
      '-webkit-border-radius' : '10px',
      '-moz-border-radius' : '10px',
      color : '#FFFFFF',
      border : 'none'
    }
  });

  checkDB().then(function() {

    if (num > 0)
    {
      $("#edit_content").empty();
      save.makeEditForm();
      $.unblockUI();
    } else
    {
      save.makeEditForm();
      $.unblockUI();
    }

  }).fail(function() {

    alert("You Have No Data to Edit");
    $.unblockUI();
  });

});

$("#saveEdit").click(function() {

  save.saveEditForm();
});

function saveChanges() {

  this.editstat = 'true';

  this.checkEdit = function() {

    var d = $.Deferred();

    db.transaction(function(transaction) {

      transaction.executeSql('SELECT * FROM userDetails WHERE editMode = ? AND submitted=?;', [ 0, 0 ], function(transaction, result) {

        if (result.rows.length >= 1)
        {
          d.resolve(result.rows.length);

        } else
        {
          d.reject(result.rows.length);

        }

      }, function(transaction, error) {

        alert('Error: ' + error.message);
      });
    });
    return d;
  }

  //reset edit record on the fly
  this.resetEdit = function() {

    db.transaction(function(tx) {

      tx.executeSql("UPDATE userDetails SET editMode = ?", [ 0 ], null, onError);
    });

  }

  this.listData = function(k) {

    var d = $.Deferred();
    var dv = $("<div></div>");
    var labo;
    var textbx;
    var name = '';
    var shop = '';

    var labo1;
    var textbx1;
    labo1 = $('<label for=' + k + ',' + k + '>Id</label>');

    textbx1 = document.createElement('input');
    textbx1.type = 'text';
    textbx1.name = k + ',' + k;
    textbx1.id = k + ',' + k;
    textbx1.value = k;
    textbx1.readOnly = true;

    dv.append(labo1);
    dv.append(textbx1);

    db.transaction(function(transaction) {

      transaction.executeSql('SELECT * FROM keyvalues WHERE id=?;', [ k ], function(transaction, result) {

        for ( var i = 0; i < result.rows.length; i++)
        {

          labo = $('<label for=' + result.rows.item(i).id + "," + result.rows.item(i).key + '>' + result.rows.item(i).key + '</label>');

          textbx = document.createElement('input');
          textbx.type = 'text';
          textbx.name = result.rows.item(i).id + "," + result.rows.item(i).key;
          textbx.id = result.rows.item(i).id + "," + result.rows.item(i).key;
          textbx.value = result.rows.item(i).value;

          dv.append(labo);
          dv.append(textbx);

          if (result.rows.item(i).key == "name")
          {
            name = result.rows.item(i).value;
          }
        }

        d.resolve(dv, name);
      }

      , function(transaction, error) {

        alert("its " + error.message);
      });
    });
    return d;
  }

  //Update edit record on the fly
  this.updateEdit = function(id) {
    var d = $.Deferred();
    db.transaction(function(tx) {

      tx.executeSql("UPDATE userDetails SET editMode = ? WHERE id = ?", [ 1, id ], function(transaction, result) {
        d.resolve();

      }, onError);
    });
    return d;
  }

  this.makeEditable = function() {

    var d = $.Deferred();
    var collapsible;
    var self = this;

    db.transaction(function(transaction) {

      transaction.executeSql('SELECT * FROM userDetails WHERE editMode=? AND submitted=? LIMIT 1;', [ 0, 0 ], function(transaction, result) {

        self.updateEdit(result.rows.item(0).id).then(function() {
          self.listData(result.rows.item(0).id).then(function(z, m) {

            collapsible = $('<div data-role="collapsible" data-collapsed="true"><h3>' + result.rows.item(0).title + ' - ' + m + '</h3></div>');
            collapsible.append(z);

            d.resolve(result.rows.item(0).id, collapsible);
          });
        });

      }

      , function(transaction, error) {

        alert("its " + error.message);
        d.reject();
      });
    });
    return d;
  }

  this.makeEditForm = function() {

    var listform = $("#edit_content");
    var self = this;

    this.checkEdit().then(function(x) {

      self.makeEditable().then(function(f, g) {

        self.editstat = 'false';
        listform.append(g).trigger('create');

        self.makeEditForm();
      });

    }).fail(function() {

      if (self.editstat == 'false')
      {
        self.resetEdit();
        $.mobile.changePage("#edit_page", "slide", true, false);
      } else
      {
        alert("You Do not Have Data to Edit ");
      }
    });

  }

  this.updateResults = function(f) {

    var items;
    var self = this;

    $.each(f, function(key, value) {

      items = key.split(',');

      updateKeyVals(value, items[1], items[0]).then(function(a, v, b) {

        $.mobile.changePage("#page_home", "slide", true, false);
        
      });

    });

  }

  this.saveEditForm = function() {

    var validate = true;
    var features = {};
    var texts = jQuery("#edit_content input:text:not([readonly='readonly'])");
    
    var edit = 0;
    var self = this;

    texts.each(function() {

      if ($(this).val().length > 0)
      {
        features[$(this).attr('name')] = $(this).val();
      } else
      {
        validate = false;
      }
    });

    if (validate)
    {
      self.updateResults(features);

    } else
    {
      alert("Please Enter all Values");
    }
  }

}

function updateKeyVals(v, a, b) {

  var d = $.Deferred();
  db.transaction(function(tx) {

    tx.executeSql('UPDATE keyvalues SET value=? WHERE key=? AND id=?;', [ v, a, b ], function() {

      d.resolve(a, v, b);

    }, onError);
  });

  return d;

}

function alertDismissed() {

}

function showAlert(msg, title, button) {

  navigator.notification.alert(msg, // message
      alertDismissed, // callback
      title, // title
      button // buttonName
  );
}

$("#page_save_submit").click(function() {

  processForm();
});

$("#upload").click(function() {

  var networkState = navigator.network.connection.type;
  var states = {};
  states[Connection.UNKNOWN] = 'Unknown connection';
  states[Connection.ETHERNET] = 'Ethernet connection';
  states[Connection.WIFI] = 'WiFi connection';
  states[Connection.CELL_2G] = 'Cell 2G connection';
  states[Connection.CELL_3G] = 'Cell 3G connection';
  states[Connection.CELL_4G] = 'Cell 4G connection';
  states[Connection.NONE] = 'No network connection';
  if ((states[networkState] == 'No network connection') || (states[networkState] == 'Unknown connection'))
  {

    showAlert('Your phone web connection is not working. Please check and Try Again.', 'Internet Issue', 'Done');
    return false;
  } else
  {

    if (chsetId != 0)
    {
      isChangesetActive(chsetId).then(function() {

        sendData();
      }).fail(function() {

        showAlert("You were logged out, Please Sign In from options", 'Logout', 'Done');

        $.mobile.changePage("#options", "slide", true, false);
        $.unblockUI();
        return false;
      });
    } else
    {

      showAlert("Please Sign In from options", "SignIn", "Done");
      return false;
    }
  }
});

function checkOSM() {

  if (chsetId > 0)
  {
    $("#plogin").hide();
    $("#plogout").show();

    $('#username').val(localStorage.usernm);
    $('#pass').val(localStorage.pswd);
  } else
  {
    $("#plogout").hide();
    $("#plogin").show();

    $('#username').val("");
    $('#pass').val("");

  }

}

function login(name, pass) {

  var d = $.Deferred();
  $.ajax({
    url : "http://beta.easymappr.com/?q=emp_services/user/login.json",
    type : 'post',
    data : 'username=' + encodeURIComponent(name) + '&password=' + encodeURIComponent(pass),
    dataType : 'json',
    error : function(XMLHttpRequest, textStatus, errorThrown) {

      d.reject("Failed to login: " + errorThrown);
    },
    success : function(data) {

      localStorage.url = "http://beta.easymappr.com/preset"
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, saveEmpUser, empfail);
      $.mobile.changePage("#page_home", "slide", true, false);
      d.resolve("EasyMappr Login Success");

    }
  });
  return d;

}

function logout() {

  var d = $.Deferred();
  $.ajax({
    url : " http://beta.easymappr.com/?q=emp_services/user/logout.json",
    type : 'post',
    dataType : 'json',
    error : function(XMLHttpRequest, textStatus, errorThrown) {

      d.reject(errorThrown);
      // alert('Failed to logout ' + errorThrown);
    },
    success : function(data) {

      d.resolve(data);
      localStorage.u = undefined;
      localStorage.p = undefined;
      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, resetEmp, failreset);
      $.mobile.changePage("#page_home", "slide", true, false);

    }
  });
  return d;

}

function loginstate() {

  var d = $.Deferred();
  var url;

  $.ajax({
    url : "http://beta.easymappr.com/?q=emp_services/system/connect.json",
    type : 'post',
    dataType : 'json',
    error : function(XMLHttpRequest, textStatus, errorThrown) {

      url = "dukas.xml";
      localStorage.url = url;

      d.reject(url);
    },
    success : function(data) {

      url = "http://beta.easymappr.com/preset";
      localStorage.url = url;
      d.resolve(url);

    }
  });
  return d;

}

function loginStatus() {

  var d = $.Deferred();
  $.ajax({
    url : "http://beta.easymappr.com/?q=emp_services/system/connect.json",
    type : 'post',
    dataType : 'json',
    error : function(XMLHttpRequest, textStatus, errorThrown) {

      d.reject();

    },
    success : function(data) {

      var drupal_user = data.user;
      if (drupal_user.uid == 0)
      {
        // user is not logged in
        d.reject();
      } else
      { // user is logged in
        d.resolve();

      }
    }
  });
  return d;

}

function isChangesetActive(changeset_id) {

  var d = $.Deferred();
  $.ajax({
    url : localStorage.URLl + '/api/0.6/changeset/' + changeset_id,
    type : 'GET',
    beforeSend : function(xhr) {

      $.blockUI({
        message : '<h5><img src="images/spinner.gif" /><br/>Please wait...</h5>',
        css : {
          top : ($(window).height()) / 3 + 'px',
          left : ($(window).width() - 200) / 2 + 'px',
          width : '200px'
        }
      });

    },
    success : function(resp) {

      if ($(resp).find('changeset').attr('open') == 'true')
      {
        d.resolve();
      } else
      {
        d.reject();
      }

    },
    error : function(err) {

      // alert("changeset not active: ");
      d.reject(err);
    }
  });
  return d;
}

function sendData() {

  var dbRowsLeft;
  checkDB().then(function(ig) {

    dbRowsLeft = ig;
    upload().then(function(m) {

      updateRecord(m);
      if (dbRowsLeft > 1)
      {
        sendData();
      } else
      {
        showAlert("Upload Complete", "Status", "Done");
        $.unblockUI();
      }
    }).fail(function(d) {

      //alert("Error is "+d);
      sendData();

    });
  }).fail(function(err) {

    showAlert("No Data for Upload in Database", "Database Info", "Done");
    $.unblockUI();
  });
}

function upload() {

  var d = $.Deferred();
  db.transaction(function(transaction) {

    transaction.executeSql('SELECT * FROM userDetails where submitted = ? limit 1;', [ 0 ], function(transaction, result) {

      createNodeTags(result.rows.item(0).id).then(function(ts) {

        //alert(ts);
        createNode(localStorage.URLl, result.rows.item(0).latlong, ts, chsetId).then(function(ig) {

          //alert("node created "+ig);
          d.resolve(result.rows.item(0).id);
        }).fail(function(err) {

          d.reject(err);
        });
      });
    }, function(transaction, error) {

      //alert('Database Error: ' + error.message);
      // $.unblockUI();
    });
  });
  return d;
}

//Update record on the fly
function updateRecord(id) {

  db.transaction(function(tx) {

    tx.executeSql("UPDATE userDetails SET submitted = ? WHERE id = ?", [ 1, id ], null, onError);
  });
}

function createNodeTags(nodeId) {

  var d = $.Deferred();
  var allTags = '';
  db.transaction(function(transaction) {

    transaction.executeSql('SELECT * FROM keyvalues WHERE id = ? and sub = ?;', [ nodeId, 0 ], function(transaction, result) {

      for ( var i = 0; i < result.rows.length; i++)
      {
        allTags = allTags + '<tag k="' + result.rows.item(i).key + '" v="' + result.rows.item(i).value + '"/>';
      }
      d.resolve(allTags);
    }, function(transaction, error) {

      d.reject();
    });
  });
  return d;
}

function createNode(a, cords, tag, cid) {

  var d = $.Deferred();
  var use = localStorage.usernm;
  var pss = localStorage.pswd;
  //alert("Values are "+ a+" "+ cords +" "+ tag +" "+ cid);
  var coordinates = cords.split(',');
  $.ajax({
    url : a + 'api/0.6/node/create',
    type : 'POST',
    data : '<osm><node changeset="' + cid + '" lat="' + coordinates[0] + '" lon="' + coordinates[1] + '">' + tag + '</node></osm>',
    beforeSend : function(xhr) {

      //makeBeforeSend("PUT");

      var auth = make_base_auth(use, pss);
      xhr.setRequestHeader("X_HTTP_METHOD_OVERRIDE", "PUT");
      xhr.setRequestHeader("Authorization", auth);
    },
    success : function(id) {

      d.resolve(id);
      //$.unblockUI();
    },
    error : function(jqXHR, textStatus, errorThrown) {

      if (jqXHR.status == 409)
      {
        createSet(use, pss).then(function(hu) {

          chsetId = hu;
          d.reject(chsetId);
        });
      }
      //alert("In create Node "+textStatus);
    }
  });
  return d;
}

function onError(tx, error) {

  alert("Database Update Error: " + error.message + " Please Try Again");
}
function checkDB() {

  var d = $.Deferred();
  db.transaction(function(transaction) {

    transaction.executeSql('SELECT * FROM userDetails where submitted = ?;', [ 0 ], function(transaction, result) {

      if (result.rows.length >= 1)
      {
        d.resolve(result.rows.length);
      } else
      {
        d.reject(result.rows.length);
      }
    }, function(transaction, error) {

      // alert('Error: ' + error.message);
    });
  });
  return d;
}

function mainPage(t) {

  $.ajax({
    type : "GET",
    url : t,
    dataType : "xml",
    success : function(xml) {

      var oldShortDesc = $(xml).find("presets").attr("shortdescription");
      var newShortDesc = replaceAll(oldShortDesc, "_", " ");
      var olddesc = $(xml).find("presets").attr("description");
      var desc = replaceAll(olddesc, "_", " ");
      $("#openingmessage").html(newShortDesc);
      localStorage.title = newShortDesc;
      $("#desc").html(desc);
    }
  });
}

function errorHandler(transaction, error) {

  alert('Database Error was ' + error.message + ' please try again');
  return true;
}
function uploadErrorHandler(transaction, error) {

  alert('Error: ' + error.message);
  return true;
}
function replaceAll(txt, replace, with_this) {

  return txt.replace(new RegExp(replace, 'g'), with_this);
}
function saveSettings() {

  localStorage.URLl = "http://api.openstreetmap.org/";

  if ($('#username').val().length > 0 && $('#pass').val().length > 0 && localStorage.URLl != undefined)
  {

    createChangeset(localStorage.URLl).then(function(hu) {

      chsetId = hu;
      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFSw, failw);
      $.mobile.changePage("#page_home", "slide", true, false);
    });
  } else
  {
    showAlert("Please Enter Login Values", "Login", "Done");
    // $.unblockUI();
  }
}
function ucwords(input) {

  var words = input.split(/(\s|-)+/);
  output = [];
  for ( var i = 0, len = words.length; i < len; i += 1)
  {
    output.push(words[i][0].toUpperCase() + words[i].toLowerCase().substr(1));
  }
  return output.join('');
}
function resetForm($form) {

  $form.find('input:text, input:password, input:file, select').val('');
  $form.find('input:radio').removeAttr('checked').removeAttr('selected');
}
function processForm() {

  var flag = false;
  var radioCheck = false;
  var validate = false;
  var features = {};
  var radios = jQuery(".myform input[type='radio']");
  var texts = jQuery(".myform input[type='text']");
  var title = $("#openingmessage").val();
  var edit = 0;

  radios.filter(":checked").each(function() {

    radioCheck = true;
    features[$(this).attr('name')] = $(this).val();
  });
  texts.each(function() {

    if ($(this).val().length > 0)
    {
      // alert("Its on: "+$(this).val());
      flag = true;
      features[$(this).attr('name')] = $(this).val();
    }
  })
  if (flag == true || radioCheck == true)
  {
    validate = true;
  } else
  {
    validate = false;
  }
  if (validate)
  {
    var currentTime = new Date();
    var hours = currentTime.getHours();
    var minutes = currentTime.getMinutes();
    if (minutes < 10)
      minutes = "0" + minutes
      var tim = hours + ':' + minutes;
    if (localStorage.usernm != undefined && localStorage.pswd != undefined)
    {
      var s = new submission(tim, crds, features, localStorage.usernm, localStorage.title);
      s.saveUser().then(function() {

        s.getEntryId().then(function(x) {

          localStorage.id = x;
          s.saveResults(x);
        });
      });

      $('.myform')[0].reset();
      resetForm($('.myform'));
      $(".myform input[type='radio']").each(function() {

        $(this).checkboxradio("refresh");
      });

      $('html').animate({
        scrollTop : 0
      }, 'slow');// IE, FF
      $('body').animate({
        scrollTop : 0
      }, 'slow');
      return false;
    } else
    {
      alert("Please Save Username and Password in Options.");
      $.mobile.changePage("#options", "slide", true, false);
    }
  } else
  {
    alert("Please Save Atleast One Value");
  }
}

function submission(t, latlon, f, u, title) {

  this.time = t;
  this.latlon = latlon;
  this.features = f;
  this.user = u;
  this.submt = 0;
  this.title = title;
  this.edit = 0;

  this.getEntryId = function() {

    var d = $.Deferred();
    var idi;
    db.transaction(function(transaction) {

      transaction.executeSql('SELECT * FROM userDetails;', null, function(transaction, result) {

        for ( var i = 0; i < result.rows.length; i++)
        {
          var row = result.rows.item(i);
          idi = row.id;
        }
        d.resolve(idi);
      }, errorHandler);
    });
    return d;
  }
  this.saveUser = function() {

    var d = $.Deferred();
    localStorage.count = 0;
    db.transaction(function(transaction) {

      transaction.executeSql('INSERT INTO userDetails (usr, latlong, title, editMode, time, submitted) VALUES (?, ?, ?, ?, ?, ?);', [ u, latlon, title, 0, t, 0 ], function() {

        d.resolve();
      }, errorHandler);
    });
    return d;
  }
  this.saveResults = function(i) {

    $.each(f, function(key, value) {

      db.transaction(function(transaction) {

        transaction.executeSql('INSERT INTO keyvalues (id, key, value, sub) VALUES (?, ?, ?, ?);', [ i, key, value, 0 ], function() {

        }, errorHandler);
      });
    });
  }

}
function createChangeset(s) {

  var d = $.Deferred();
  $.ajax({
    url : s + 'api/0.6/changeset/create',
    type : 'POST',
    timeout : 30000,
    data : "<osm><changeset><tag k='created_by' v='Easymappr' /><tag k='comment' v='Edited with EasyMappr' /></changeset></osm>",
    beforeSend : function(xhr) {

      localStorage.usernm = $('#username').val();
      localStorage.pswd = $('#pass').val();
      //makeBeforeSend("PUT");
      $.blockUI({
        message : '<h4><img src="images/ajax-loader.gif" /><br/>OSM Signing In...</h4>',
        css : {
          top : ($(window).height()) / 3 + 'px',
          left : ($(window).width() - 200) / 2 + 'px',
          width : '200px',
          backgroundColor : '#C9C9C9',
          '-webkit-border-radius' : '10px',
          '-moz-border-radius' : '10px',
          color : '#FFFFFF',
          border : 'none'
        }
      });
      var use = localStorage.usernm;
      var pss = localStorage.pswd;
      var auth = make_base_auth(use, pss);
      xhr.setRequestHeader("X_HTTP_METHOD_OVERRIDE", "PUT");
      xhr.setRequestHeader("Authorization", auth);
    },
    success : function(resp) {

      d.resolve(resp);
    },
    complete : function(jqXHR, textStatus) {

      if (textStatus == "success")
      {
        //alert("Login Success");
        $.unblockUI();
      } else if (textStatus == "timeout")
      {
        alert("Wrong Password: " + localStorage.pswd + " or Username: " + localStorage.usernm);
        // alert("Server Busy Try Again");
        $.unblockUI();
      }
    }
  });
  return d;
}
function makeForm(b) {

  $.ajax({
    type : "GET",
    url : b,
    dataType : "xml",
    complete : function(jqXHR, textStatus) {

      if (textStatus == "success")
      {
        $.mobile.changePage("#mainform", "slide", true, false);
        $.unblockUI();
      }
    },
    success : function(xml) {

      var fieldset;
      $(xml).find('item').each(function() {
        mainForm = 'set';
        fieldset = $('<fieldset id="head"></fieldset>');
        var olditem = $(this).attr('name');
        var item = replaceAll(olditem, "_", " ");
        var leg = $('<legend class="h2">' + ucwords(item) + '</legend>');
        fieldset.append(leg);
        var labelCount = 0;
        $(this).children().each(function() {

          if ((this).nodeName == "combo")
          {
            var oldtxt = $(this).attr('text');
            var txt;
            var kiy = $(this).attr('key');

            if (oldtxt == undefined || oldtxt == "" || oldtxt == null)
            {
              txt = kiy;
            } else
            {
              txt = replaceAll(oldtxt, "_", " ");
            }

            var uniqueId = new Array();
            uniqueId = kiy.split(/:|_/);
            var x = 0;
            var idString = "";
            while (x < uniqueId.length)
            {
              idString = idString + uniqueId[x];
              x++;
            }
            var radioValues = $(this).attr('values');
            var radioFieldset = $('<fieldset data-role="controlgroup"></fieldset>');
            var radioLegend = $('<legend id="h2">' + txt + '</legend>');
            radioFieldset.append(radioLegend);

            if (radioValues == undefined || radioValues == "" || radioValues == null)
            {
              $(this).children().each(function() {

                var subs = $(this).attr('value');
                var newRadio = $('<input type="radio" name=' + kiy + ' id=' + idString + subs + ' value=' + subs + ' />');
                var newRadioLabel = $('<label for=' + idString + subs + '>' + subs + '</label>');
                radioFieldset.append(newRadio);
                radioFieldset.append(newRadioLabel);

              });

            } else
            {

              var substrg = radioValues.split(',');
              var x = 0;
              while (x < substrg.length)
              {
                if (substrg[x] != "" && substrg[x] != null)
                {
                  var newRadio = $('<input type="radio" name=' + kiy + ' id=' + idString + substrg[x] + ' value=' + substrg[x] + ' />');
                  var newRadioLabel = $('<label for=' + idString + substrg[x] + '>' + substrg[x] + '</label>');
                  radioFieldset.append(newRadio);
                  radioFieldset.append(newRadioLabel);

                }
                x = x + 1;
              }

            }
            fieldset.append(radioFieldset);
          } else if ((this).nodeName == "label")
          {
            var a = $(this).attr('text');
            var lab = $('<label>' + ucwords(a) + '</label><br/>');
            fieldset.append(lab);
            labelCount++;
          } else if ((this).nodeName == "text")
          {
            var oldtextbName = $(this).attr('text');
            var textbName = replaceAll(oldtextbName, "_", " ");
            var kay = $(this).attr('key');
            var now1 = new Array();
            now1 = kay.split(/:|_/);
            var x = 0;
            var real = "";
            while (x < now1.length)
            {
              real = real + now1[x];
              x++;
            }
            var labo = $('<label for=' + real + ' class=' + textbName + '>' + textbName + '</label>');
            var textbx = document.createElement('input');
            textbx.type = 'text';
            textbx.name = real;
            textbx.id = real;

            fieldset.append(labo);
            fieldset.append(textbx);
          } else if ((this).nodeName == "space")
          {
            var newline = $('<br/>');
            fieldset.append(newline);
          } else if ((this).nodeName == "multiselect")
          {

            var oldtxt = $(this).attr('text');
            var txt;
            var kiy = $(this).attr('key');

            if (oldtxt == undefined || oldtxt == "" || oldtxt == null)
            {
              txt = kiy;
            } else
            {
              txt = replaceAll(oldtxt, "_", " ");
            }

            var uniqueId = new Array();
            uniqueId = kiy.split(/:|_/);
            var x = 0;
            var idString = "";
            while (x < uniqueId.length)
            {
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

            if (radioValues == undefined || radioValues == "" || radioValues == null)
            {
              var y = 0;
              $(this).children().each(function() {

                subs = $(this).attr('value');
                newRadio = $('<input type="checkbox" name=' + kiy + ' id=' + y + subs + ' value=' + subs + ' />');
                newRadioLabel = $('<label for=' + y + subs + '>' + subs + '</label>');
                radioFieldset.append(newRadio);
                radioFieldset.append(newRadioLabel);

                y = y + 1;

              });

            } else
            {

              var substrg = radioValues.split(';');
              var x = 0;
              while (x < substrg.length)
              {
                if (substrg[x] != "" && substrg[x] != null)
                {
                  newRadio = $('<input type="checkbox" name=' + kiy + ' id=' + x + substrg[x] + ' value=' + substrg[x] + ' />');
                  newRadioLabel = $('<label for=' + x + substrg[x] + '>' + substrg[x] + '</label>');
                  radioFieldset.append(newRadio);
                  radioFieldset.append(newRadioLabel);

                }
                x = x + 1;
              }

            }
            fieldset.append(radioFieldset);

          } else if ((this).nodeName == "check")
          {

            var oldtxt = $(this).attr('text');
            var txt;
            var kiy = $(this).attr('key');

            if (oldtxt == undefined || oldtxt == "" || oldtxt == null)
            {
              txt = kiy;
            } else
            {
              txt = replaceAll(oldtxt, "_", " ");
            }

            var radioFieldset = $('<fieldset data-role="controlgroup"></fieldset>');
            var radioLegend = $('<legend id="h2"></legend>');
            radioFieldset.append(radioLegend);
            var subs;
            var newRadio;
            var newRadioLabel;

            newRadio = $('<input type="checkbox" name=' + kiy + ' id=' + kiy + txt + ' value=' + txt + ' />');
            newRadioLabel = $('<label for=' + kiy + txt + '>' + txt + '</label>');
            radioFieldset.append(newRadio);
            radioFieldset.append(newRadioLabel);

            fieldset.append(radioFieldset);

          }

          if ((this).nodeName == "optional")
          {
            $(this).children().each(function() {

              if ((this).nodeName == "label")
              {

                var a = $(this).attr('text');
                var lab = $('<label>' + ucwords(a) + '</label><br/><br/>');
                fieldset.append(lab);
              } else if ((this).nodeName == "combo")
              {
                var oldtxt = $(this).attr('text');
                var txt;
                var kiy = $(this).attr('key');

                if (oldtxt == undefined || oldtxt == "" || oldtxt == null)
                {
                  txt = kiy;
                } else
                {
                  txt = replaceAll(oldtxt, "_", " ");
                }

                var uniqueId = new Array();
                uniqueId = kiy.split(/:|_/);
                var x = 0;
                var idString = "";
                while (x < uniqueId.length)
                {
                  idString = idString + uniqueId[x];
                  x++;
                }
                var radioValues = $(this).attr('values');
                var radioFieldset = $('<fieldset data-role="controlgroup"></fieldset>');
                var radioLegend = $('<legend id="h2">' + txt + '</legend>');
                radioFieldset.append(radioLegend);

                if (radioValues == undefined || radioValues == "" || radioValues == null)
                {
                  $(this).children().each(function() {

                    var subs = $(this).attr('value');
                    var newRadio = $('<input type="radio" name=' + kiy + ' id=' + idString + subs + ' value=' + subs + ' />');
                    var newRadioLabel = $('<label for=' + idString + subs + '>' + subs + '</label>');
                    radioFieldset.append(newRadio);
                    radioFieldset.append(newRadioLabel);

                  });

                } else
                {

                  var substrg = radioValues.split(',');
                  var x = 0;
                  while (x < substrg.length)
                  {
                    if (substrg[x] != "" && substrg[x] != null)
                    {
                      var newRadio = $('<input type="radio" name=' + kiy + ' id=' + idString + substrg[x] + ' value=' + substrg[x] + ' />');
                      var newRadioLabel = $('<label for=' + idString + substrg[x] + '>' + substrg[x] + '</label>');
                      radioFieldset.append(newRadio);
                      radioFieldset.append(newRadioLabel);

                    }
                    x = x + 1;
                  }

                }
                fieldset.append(radioFieldset);
              } else if ((this).nodeName == "text")
              {
                var oldtextbName = $(this).attr('text');
                var textbName = replaceAll(oldtextbName, "_", " ");
                var kay = $(this).attr('key');
                var now1 = new Array();
                now1 = kay.split(/:|_/);
                var x = 0;
                var real = "";
                while (x < now1.length)
                {
                  real = real + now1[x];
                  x++;
                }
                var labo = $('<label for=' + real + ' class=' + textbName + '>' + textbName + '</label>');

                var textbx = document.createElement('input');
                textbx.type = 'text';
                textbx.name = real;
                textbx.id = real;

                fieldset.append(labo);
                fieldset.append(textbx);
              } else if ((this).nodeName == "multiselect")
              {

                var oldtxt = $(this).attr('text');
                var txt;
                var kiy = $(this).attr('key');

                if (oldtxt == undefined || oldtxt == "" || oldtxt == null)
                {
                  txt = kiy;
                } else
                {
                  txt = replaceAll(oldtxt, "_", " ");
                }

                var uniqueId = new Array();
                uniqueId = kiy.split(/:|_/);
                var x = 0;
                var idString = "";
                while (x < uniqueId.length)
                {
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

                if (radioValues == undefined || radioValues == "" || radioValues == null)
                {
                  var y = 0;
                  $(this).children().each(function() {

                    subs = $(this).attr('value');
                    newRadio = $('<input type="checkbox" name=' + kiy + ' id=' + y + subs + ' value=' + subs + ' />');
                    newRadioLabel = $('<label for=' + y + subs + '>' + subs + '</label>');
                    radioFieldset.append(newRadio);
                    radioFieldset.append(newRadioLabel);

                    y = y + 1;

                  });

                } else
                {

                  var substrg = radioValues.split(';');
                  var x = 0;
                  while (x < substrg.length)
                  {
                    if (substrg[x] != "" && substrg[x] != null)
                    {
                      newRadio = $('<input type="checkbox" name=' + kiy + ' id=' + x + substrg[x] + ' value=' + substrg[x] + ' />');
                      newRadioLabel = $('<label for=' + x + substrg[x] + '>' + substrg[x] + '</label>');
                      radioFieldset.append(newRadio);
                      radioFieldset.append(newRadioLabel);

                    }
                    x = x + 1;
                  }

                }
                fieldset.append(radioFieldset);

              } else if ((this).nodeName == "check")
              {

                var oldtxt = $(this).attr('text');
                var txt;
                var kiy = $(this).attr('key');

                if (oldtxt == undefined || oldtxt == "" || oldtxt == null)
                {
                  txt = kiy;
                } else
                {
                  txt = replaceAll(oldtxt, "_", " ");
                }

                var radioFieldset = $('<fieldset data-role="controlgroup"></fieldset>');
                var radioLegend = $('<legend id="h2"></legend>');
                radioFieldset.append(radioLegend);
                var subs;
                var newRadio;
                var newRadioLabel;

                newRadio = $('<input type="checkbox" name=' + kiy + ' id=' + kiy + txt + ' value=' + txt + ' />');
                newRadioLabel = $('<label for=' + kiy + txt + '>' + txt + '</label>');
                radioFieldset.append(newRadio);
                radioFieldset.append(newRadioLabel);

                fieldset.append(radioFieldset);

              }

            });

          }
        });
        fieldset.prependTo('.myform').trigger("create");
      });
    }
  });
}
function createSet(u, p) {

  var d = $.Deferred();
  $.ajax({
    url : 'http://api.openstreetmap.org/api/0.6/changeset/create',
    type : 'POST',
    timeout : 30000,
    data : "<osm><changeset><tag k='created_by' v='Easymappr' /><tag k='comment' v='Edited with EasyMappr' /></changeset></osm>",
    beforeSend : function(xhr) {

      var auth = make_base_auth(u, p);
      xhr.setRequestHeader("X_HTTP_METHOD_OVERRIDE", "PUT");
      xhr.setRequestHeader("Authorization", auth);
    },
    success : function(resp) {

      d.resolve(resp);
    },
    complete : function(jqXHR, textStatus) {

      if (textStatus == "timeout")
      {
        d.reject("Wrong Password: " + p + " or Username: " + u);
        // alert("Server Busy Try Again");
        $.unblockUI();
      }
    }
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

var Base64 = {
    // private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    // public method for encoding
    encode : function(input) {

      output = "";
      var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
      var i = 0;
      input = Base64._utf8_encode(input);
      while (i < input.length)
      {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);
        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;
        if (isNaN(chr2))
        {
          enc3 = enc4 = 64;
        } else if (isNaN(chr3))
        {
          enc4 = 64;
        }
        output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
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
      while (i < input.length)
      {
        enc1 = this._keyStr.indexOf(input.charAt(i++));
        enc2 = this._keyStr.indexOf(input.charAt(i++));
        enc3 = this._keyStr.indexOf(input.charAt(i++));
        enc4 = this._keyStr.indexOf(input.charAt(i++));
        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;
        output = output + String.fromCharCode(chr1);
        if (enc3 != 64)
        {
          output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64)
        {
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
      for ( var n = 0; n < string.length; n++)
      {
        var c = string.charCodeAt(n);
        if (c < 128)
        {
          utftext += String.fromCharCode(c);
        } else if ((c > 127) && (c < 2048))
        {
          utftext += String.fromCharCode((c >> 6) | 192);
          utftext += String.fromCharCode((c & 63) | 128);
        } else
        {
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
      while (i < utftext.length)
      {
        c = utftext.charCodeAt(i);
        if (c < 128)
        {
          string += String.fromCharCode(c);
          i++;
        } else if ((c > 191) && (c < 224))
        {
          c2 = utftext.charCodeAt(i + 1);
          string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
          i += 2;
        } else
        {
          c2 = utftext.charCodeAt(i + 1);
          c3 = utftext.charCodeAt(i + 2);
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
function gotFSw(fileSystem) {

  fileSystem.root.getFile("pass.txt", {
    create : true,
    exclusive : false
  }, gotFileEntryw, failw);
}
function gotFileEntryw(fileEntry) {

  fileEntry.createWriter(gotFileWriter, fail);
}
function gotFileWriter(writer) {

  writer.onwriteend = function(evt) {

  };
  var auth = $("#username").val() + "," + $("#pass").val() + "," + chsetId + "," + localStorage.URLl;
  writer.write(auth);
}
function failw(error) {

}
function gotFS(fileSystem) {

  fileSystem.root.getFile("pass.txt", null, gotFileEntry, fail);
}
function gotFileEntry(fileEntry) {

  fileEntry.file(gotFile, fail);
}
function gotFile(file) {

  readAsText(file);
}
function readAsText(file) {

  var reader = new FileReader();
  reader.onloadend = function(evt) {

    var accss = evt.target.result.split(",");
    localStorage.usernm = accss[0];
    localStorage.pswd = accss[1];
    chsetId = accss[2];
    localStorage.URLl = accss[3];

  };
  reader.readAsText(file);
}
function fail(evt) {

}
function gotFSww(fileSystem) {

  fileSystem.root.getFile("pass.txt", {
    create : true,
    exclusive : false
  }, gotFileEntryww, failww);
}
function gotFileEntryww(fileEntry) {

  fileEntry.createWriter(gotFileWriterw, failww);
}
function gotFileWriterw(writer) {

  writer.onwriteend = function(evt) {

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
function failww(error) {

}

function saveEmpUser(fileSystem) {

  fileSystem.root.getFile("emppass.txt", {
    create : true,
    exclusive : false
  }, gotEmp, empfail);
}
function gotEmp(fileEntry) {

  fileEntry.createWriter(gotEmpWriter, empfail);
}
function gotEmpWriter(writer) {

  writer.onwriteend = function(evt) {

    localStorage.u = $("#user").val();
    localStorage.p = $("#passw").val();
  };

  var auth = $("#user").val() + "," + $("#passw").val();
  //alert("saved username and pass " + auth);
  writer.write(auth);
}
function empfail(error) {

}

function readEmp(fileSystem) {

  fileSystem.root.getFile("emppass.txt", null, readEmpEntry, failReadEmp);
}
function readEmpEntry(fileEntry) {

  fileEntry.file(gotEmpRead, failReadEmp);
}
function gotEmpRead(file) {

  //readDataUrl(file);
  readText(file);
}
function readText(file) {

  var reader = new FileReader();
  reader.onloadend = function(evt) {

    var accss = evt.target.result.split(",");

    if (accss == null)
    {
      localStorage.u = undefined;
      localStorage.p = undefined;
    } else
    {
      localStorage.u = accss[0];
      localStorage.p = accss[1];
    }

  };
  reader.readAsText(file);
}
function failReadEmp(evt) {

}

function resetEmp(fileSystem) {

  fileSystem.root.getFile("emppass.txt", {
    create : true,
    exclusive : false
  }, gotResetEntry, failreset);
}
function gotResetEntry(fileEntry) {

  fileEntry.createWriter(gotResetWriter, failreset);
}
function gotResetWriter(writer) {

  writer.onwriteend = function(evt) {

    localStorage.u = undefined;
    localStorage.p = undefined;

  };
  var auth = undefined;
  writer.write(auth);
}
function failreset(error) {

}
