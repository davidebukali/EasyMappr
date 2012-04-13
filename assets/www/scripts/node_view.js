$('#page_node_view').live('pageshow',function(){
  try {
    $.ajax({
      url: "http://10.0.2.2/drupal7/?q=my_services/node/" + encodeURIComponent(nid) + ".json",
      type: 'get',
      dataType: 'json',
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        alert('page_node_view - failed to retrieve page node');
        console.log(JSON.stringify(XMLHttpRequest));
        console.log(JSON.stringify(textStatus));
        console.log(JSON.stringify(errorThrown));
      },
      success: function (data) {
        console.log(JSON.stringify(data));
        $('#page_node_view h1').html(data.title); // set the header title
        $('#page_node_view .content').html(data.body.und[0].safe_value); // display the body in the content div
      }
    });
  }
  catch (error) { alert("page_node_view - " + error); }
});

$('#button_node_delete').live("click",function(){
	  if (confirm("Are you sure you want to delete this node?")) {
	    try {
	      $.ajax({
	        url: "http://10.0.2.2/drupal7/?q=my_services/node/" + encodeURIComponent(nid) + ".json",
	        type: 'delete',
	        dataType: 'json',
	        error: function (XMLHttpRequest, textStatus, errorThrown) {
	          alert('page_node_view - failed to delete page node');
	          console.log(JSON.stringify(XMLHttpRequest));
	          console.log(JSON.stringify(textStatus));
	          console.log(JSON.stringify(errorThrown));
	        },
	        success: function (data) {
	          console.log(JSON.stringify(data));
	          $.mobile.changePage("index.html", "slideup");
	        }
	      });
	    }
	    catch (error) { alert("button_node_delete - " + error); }
	  }
	  else {
	    return false;
	  }
	});
