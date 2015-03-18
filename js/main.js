var getLocation = function(href) {
	var l = document.createElement("a");
	l.href = href;

	return l;
};
var users = {
	10124585031848: {
		"name": "Eduard Aleksanyan",
		"image": "https://s3.amazonaws.com/profile_photos/10124585031848.wyUMUWeGEyfd7bXATcGa_21x21.png",
		"hours": {
			"total": 0,
			"completed": 0
		}
	},
	11686527531417: {
		"name": "Tigran Ghabuzyan",
		"image": "https://s3.amazonaws.com/profile_photos/11686527531417.QOvoSX7R6lTJSG9VDBQI_21x21.png",
		"hours": {
			"total": 0,
			"completed": 0
		}
	},
	10124585031839: {
		"name": "Tigran Petrosyan",
		"image": "https://s3.amazonaws.com/profile_photos/10124585031839.Zvk5gKoGkI4BZNXFeAG7_21x21.png",
		"hours": {
			"total": 0,
			"completed": 0
		}
	},
	5754650264628: {
		"name": "Tigran Tadevosyan",
		"image": "https://s3.amazonaws.com/profile_photos/5754650264628.J6jyaDiKxliFxx4kIpiU_21x21.png",
		"hours": {
			"total": 0,
			"completed": 0
		}
	},
	25719136431202: {
		"name": "Hrayr Papikyan",
		"image": "https://s3.amazonaws.com/profile_photos/25719136431202.G39up5gCwyUO8Lg5UhBL_21x21.png",
		"hours": {
			"total": 0,
			"completed": 0
		}
	},
	12950252745597: {
		"name": "Arbi Baghoomian",
		"image": "https://s3.amazonaws.com/profile_photos/12950252745597.xddYtxsUKBXFP4oYLpSF_21x21.png",
		"hours": {
			"total": 0,
			"completed": 0
		}
	},
	10124585031830: {
		"name": "Aram Baghdasaryan",
		"image": "https://s3.amazonaws.com/profile_photos/10124585031830.JrvDk4UBi3WC0VX8vMT7_21x21.png",
		"hours": {
			"total": 0,
			"completed": 0
		}
	}/*,
	26433177772854: {
		"name": "Astghik Hakobyan",
		"image": "https://s3.amazonaws.com/profile_photos/26433177772854.4ep7rXLA9N8tLpuqeZZB_21x21.png",
		"hours": {
			"total": 0,
			"completed": 0
		}
	},
	8430834800772: {
		"name": "Amoor Avakian",
		"image": "https://s3.amazonaws.com/profile_photos/8430834800772.1GM1v68dVWh5Sgem5vWm_21x21.png",
		"hours": {
			"total": 0,
			"completed": 0
		}
	}*/
};

$(function() {
	var $total_hours = $('.total-hours'),
		$total_stories = $('.total-stories'),
		$not_assigned = $('.not-assigned'),
		$users = $('.users');

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
					total_not_assigned_stories = 0,
					hour,
					task,
					taskName,
					taskAssignee,
					taskCompleted;

				if (parts.length > 2) {
					$.get('https://app.asana.com/api/1.0/projects/' + parts[2] + '/tasks?opt_fields=name,assignee,completed', function(data) {
						for (var i in data.data) {
							if (data.data.hasOwnProperty(i)) {
								task = data.data[i];
								taskName = task.name;
								taskAssignee = task.assignee;
								taskCompleted = task.completed;

								if (taskName.slice(-1) == ':') {
									continue;
								}

								needle = /\[([\d\.]+)\]/.exec(data.data[i].name);

								if (needle !== null) {
									hour = parseFloat(needle[1]);

									total_hours += hour;
									total_stories++;

									if (taskAssignee !== null) {
										if (users.hasOwnProperty(taskAssignee.id)) {
											users[taskAssignee.id]['hours']['total'] += hour;

											if (taskCompleted) {
												users[taskAssignee.id]['hours']['completed'] += hour;
											}
										}
									}
								} else {
									total_not_assigned_stories++;
								}
							}
						}

						$total_hours.text(total_hours);
						$total_stories.text(total_stories);
						$not_assigned.text(total_not_assigned_stories);

						for (var j in users) {
							if (users.hasOwnProperty(j)) {
								$users.append(
									'<a href="#" class="list-group-item">' +
										'<img src="' + users[j]['image'] + '" width="21" height="21"> &nbsp; ' +
										'<span class="badge">' + users[j]['hours']['completed'] + ' / ' + users[j]['hours']['total'] + '</span>' +
										users[j]['name'] +
									'</a>'
								);
							}
						}
					}, "json");
				}
			}
		});
	}
});
