var getLocation = function(href) {
		var l = document.createElement("a");
		l.href = href;

		return l;
	},
	users = {
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
		}
	};

$(function() {
	var $total_hours = $('.total-hours'),
		$total_stories = $('.total-stories'),
		$assigned = $('.assigned'),
		$users = $('.users'),
		$wrapper = $('.wrapper'),
		$appliedFactor = $('.applied-factor'),
		$centralized = $('.centralized'),
		$achievable = $('.achievable'),
		$loader = $('.loader'),
		$wrong = $('.wrong');

	$appliedFactor.on('apply', function(e, isApplied) {
		if (isApplied) {
			$(this).find('a').hide();
			$users.find('.badge').hide();

			$(this).find('.centralized').fadeIn('fast');
			$users.find('input').fadeIn('fast');
			$users.find('input').hide().removeClass('hide').fadeIn('fast');
			$achievable.text(7 * 28).show();
		} else {
			$centralized.hide();
			$achievable.hide();
			$users.find('input').addClass('hide');
		}
	});

	$appliedFactor.trigger('apply', [false]);

	if (chrome.hasOwnProperty('tabs')) {
		chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
			var tablink = arrayOfTabs[0].url,
				url = getLocation(tablink);

			if (url.hostname == 'app.asana.com') {
				var pathname = url.pathname,
					parts = pathname.split('/'),
					needle = null,
					totalHours = 0,
					totalStories = 0,
					totalAssignedStories = 0,
					hour,
					task,
					taskName,
					taskAssignee,
					taskCompleted;

				if (parts.length > 2) {
					$loader.removeClass('hide');

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

									totalHours += hour;
									totalStories++;

									if (taskAssignee !== null) {
										if (users.hasOwnProperty(taskAssignee.id)) {
											users[taskAssignee.id]['hours']['total'] += hour;

											if (taskCompleted) {
												users[taskAssignee.id]['hours']['completed'] += hour;
											}

											totalAssignedStories++;
										}
									}
								}
							}
						}

						$total_hours.text(totalHours);
						$total_stories.text(totalStories);
						$assigned.html(totalAssignedStories + '&nbsp;&nbsp;&nbsp;');

						for (var j in users) {
							if (users.hasOwnProperty(j)) {
								$users.append(
									'<a href="#" class="list-group-item">' +
										'<img src="' + users[j]['image'] + '" width="21" height="21"> &nbsp; ' +
										'<span class="badge">' + users[j]['hours']['completed'] + ' / ' + users[j]['hours']['total'] + '</span>' +
										'<input type="number" class="hide pull-right" step="1" min="0" max="40" value="28">' +
										users[j]['name'] +
										'</a>'
								);
							}
						}

						$loader.fadeOut('fast', function() {
							$wrapper.hide().removeClass('hide').fadeIn('slow');
						});
					}, "json");
				} else {
					$wrong.removeClass('hide');
				}
			} else {
				$wrong.removeClass('hide');
			}
		});
	} else {
		$wrong.removeClass('hide');
	}

	$appliedFactor.find('a').click(function(e) {
		e.preventDefault();

		$appliedFactor.trigger('apply', [true]);
	});
});
