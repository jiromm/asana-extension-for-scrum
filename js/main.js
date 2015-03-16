var getLocation = function(href) {
	var l = document.createElement("a");
	l.href = href;
	return l;
};

$(function() {
//	chrome.tabs.getSelected(null, function(tab) {
//		var tablink = tab.url,
//			url = getLocation(tablink);
//
//		if (url.hostname == 'app.asana.com') {
			$.get("https://app.asana.com/api/1.0/projects/18203401877896/tasks", function(data) {
				for (var i in data.data) {
					$('.tasks').append('<li>' + data.data[i].name + '</li>');
				}
			}, "json");
//		}
//	});
});
