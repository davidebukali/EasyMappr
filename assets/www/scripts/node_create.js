$('#page_node_create_submit').live('click',function(){

  var title = $('#page_node_name').val();
  if (!title) { alert('Please enter a title.'); return false; }

  var body = $('#page_node_body').val();
  if (!body) { alert('Please enter a body.'); return false; }

  // BEGIN: drupal services node create login (warning: don't use https if you don't have ssl setup)
  $.ajax({
      url: "http://10.0.2.2/drupal7/?q=my_services/node.json",
      type: 'post',
      data: 'node[type]=page&node[title]=' + encodeURIComponent(title) + '&node[language]=und&node[body][und][0][value]=' + encodeURIComponent(body),
      dataType: 'json',
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        alert('page_node_create_submit - failed to login');
        console.log(JSON.stringify(XMLHttpRequest));
        console.log(JSON.stringify(textStatus));
        console.log(JSON.stringify(errorThrown));
      },
      success: function (data) {
       $.mobile.changePage("index.html", "slideup");
       alert("Node created: "+data);
      }
  });
  // END: drupal services node create
  
  
  return false;

});