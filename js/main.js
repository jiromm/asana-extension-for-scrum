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
	var userIdList = {},
		$totals = $('.totals'),
		$totalHours = $('.total-hours'),
		$totalStories = $('.total-stories'),
		$assigned = $('.assigned'),
		$users = $('.users'),
		$wrapper = $('.wrapper'),
		$appliedFactor = $('.applied-factor'),
		$achievable = $('.achievable'),
		$loader = $('.loader'),
		$wrong = $('.wrong');

	// Define totals
	if (localStorage.getItem('appliedFactor') == undefined) {
		var defaultHours = 28;

		for (var userId in users) {
			userIdList[userId] = defaultHours;
		}

		localStorage.setItem('appliedFactor', JSON.stringify(userIdList));
		localStorage.setItem('defaultHour', defaultHours);
		$appliedFactor.find('input').val(defaultHours);
	} else {
		$appliedFactor.find('input').val(
			localStorage.getItem('defaultHour')
		);
	}

	userIdList = JSON.parse(
		localStorage.getItem('appliedFactor')
	);

	// Calculate total hours
	$totals.on('calculate', function() {
		var total = 0;

		$users.find('input').each(function() {
			var userId = parseInt($(this).closest('.list-group-item').attr('data-user-id')),
				userHour = parseInt($(this).val());

			userIdList[userId] = userHour;
			total += userHour;
		});

		localStorage.setItem('appliedFactor', JSON.stringify(userIdList));
		localStorage.setItem('defaultHour', parseInt($appliedFactor.find('input').val()));
		$achievable.text(total);
	});

	// Enable/disable applied factor
	$appliedFactor.on('apply', function(e, isApplied) {
		if (isApplied) {
			$users.find('input').hide().removeClass('hide').fadeIn('fast');
			$users.find('.badge').hide();

			$(this).find('a').text('Close');
			$(this).find('input').fadeIn('fast', function() {
				$(this).focus()
			});
		} else {
			$users.find('.badge').show();
			$users.find('input').addClass('hide');

			$(this).find('input').hide();
			$(this).find('a').text('Applied Factor');
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

						$totalHours.text(totalHours);
						$totalStories.text(totalStories);
						$assigned.html(totalAssignedStories + '&nbsp;&nbsp;&nbsp;');

						for (var j in users) {
							if (users.hasOwnProperty(j)) {
								$users.append(
									'<a href="#" class="list-group-item" data-user-id="' + j + '">' +
										'<img src="' + users[j]['image'] + '" width="21" height="21"> &nbsp; ' +
										'<span class="badge">' + users[j]['hours']['completed'] + ' / ' + users[j]['hours']['total'] + '</span>' +
										'<input type="number" class="hide pull-right" step="1" min="0" max="40" value="' + userIdList[j] + '">' +
										users[j]['name'] +
									'</a>'
								);
							}
						}

						$loader.fadeOut('fast', function() {
							$wrapper.hide().removeClass('hide').fadeIn('slow');
						});

						$totals.trigger('calculate');
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

		var isActive = parseInt($(this).attr('data-is-active'));

		$(this).attr('data-is-active', isActive ? 0 : 1);

		$appliedFactor.trigger('apply', [isActive ? false : true]);
	});

	$appliedFactor.find('input').on('change, input', function() {
		var self = $(this);

		$users.find('.list-group-item').each(function() {
			var input = $(this).find('input');

			if ($(this).hasClass('active')) {
				// continue
			} else {
				input.val(
					self.val()
				);
			}
		});

		$totals.trigger('calculate');
	});

	$users.on('change, input', 'input', function() {
		$totals.trigger('calculate');
	});

	$users.on('click', '.list-group-item', function(e) {
		e.preventDefault();

		if (e.target.tagName != 'INPUT') {
			$(this).toggleClass('active');
		}
	});
});
