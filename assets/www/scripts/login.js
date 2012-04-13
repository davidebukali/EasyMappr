$('#page_login_submit').live('click',function(){
  var name = $('#page_login_name').val();
  if (!name) { alert('Please enter your user name.'); return false; }
  var pass = $('#page_login_pass').val();
  if (!pass) { alert('Please enter your password.'); return false; }
  
  // BEGIN: drupal services user login (warning: don't use https if you don't have ssl setup)
  $.ajax({
      url: "http://10.0.2.2/drupal7/api/?q=my_services/user/login.json",
      type: 'post',
      data: 'username=' + encodeURIComponent(name) + '&password=' + encodeURIComponent(pass),
      dataType: 'json',
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        alert('page_login_submit - failed to login');
        console.log(JSON.stringify(XMLHttpRequest));
        console.log(JSON.stringify(textStatus));
        console.log(JSON.stringify(errorThrown));
      },
      success: function (data) {
       $.mobile.changePage("index.html", "slideup");
      }
  });
  // END: drupal services user login
  return false;
});