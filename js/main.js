var getLocation = function(href) {
	var l = document.createElement("a");
	l.href = href;

	return l;
};

$(function() {
	var $total_hours = $('.total-hours'),
		$total_stories = $('.total-stories'),
		$not_assigned = $('.not-assigned');

	if (chrome.hasOwnProperty('tabs')) {
		chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
			var tablink = arrayOfTabs[0].url,
				url = getLocation(tablink);

			$total_hours.text(0);
			$total_stories.text(0);
			$not_assigned.text(0);

			if (url.hostname == 'app.asana.com') {
				var pathname = url.pathname,
					parts = pathname.split('/'),
					needle = null,
					total_hours = 0,
					total_stories = 0,
					total_not_assigned_stories = 0;

				if (parts.length > 2) {
					$.get('https://app.asana.com/api/1.0/projects/' + parts[2] + '/tasks?opt_fields=name,assignee', function(data) {
						for (var i in data.data) {
							if (data.data.hasOwnProperty(i)) {
								needle = /\[([\d\.]+)\]/.exec(data.data[i].name);

								if (needle !== null) {
									needle = parseFloat(needle[1]);

									total_hours += needle;
									total_stories++;

									console.log('total_hours', total_hours);
									console.log('total_stories', total_stories);
								} else {
									total_not_assigned_stories++;
									console.log('total_not_assigned_stories', total_not_assigned_stories);
								}
							}
						}

						$total_hours.text(total_hours);
						$total_stories.text(total_stories);
						$not_assigned.text(total_not_assigned_stories);
					}, "json");
				}
			}
		});
	}
});
