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
	},
	tagsIdList = {
		1367012534094: 'bug',
		1379750807237: 'critical',
		29189199083474: 'debt'
	};

$(function() {
	var userIdList = {},
		$totals = $('.totals'),
		$totalHours = $('.total-hours'),
		$totalStories = $('.total-stories'),

		$tagBug = $('.tag-bug'),
		$tagCritical = $('.tag-critical'),
		$tagDebt = $('.tag-debt'),

		$tagHourBug = $('.tag-bug-hours'),
		$tagHourCritical = $('.tag-critical-hours'),
		$tagHourDebt = $('.tag-debt-hours'),

		$sections = $('.sections'),

		$assigned = $('.assigned'),
		$users = $('.users'),
		$wrapper = $('.wrapper'),
		$appliedFactor = $('.applied-factor'),
		$achievable = $('.achievable'),
		$estimated = $('.estimated'),
		$completed = $('.completed'),
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
		$achievable.text(isNaN(total) ? 0 : total);
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
					tags = {
						bug: {
							count: 0,
							hours: 0
						},
						critical: {
							count: 0,
							hours: 0
						},
						debt: {
							count: 0,
							hours: 0
						}
					},
					hours = {
						estimated: 0,
						completed: 0,
						total: 0
					},
					stories = {
						estimated: 0,
						assigned: 0,
						total: 0
					},
					section = {
						tempIndex: 'maintenance',
						hours: {
							strategic: 0,
							tactical: 0,
							maintenance: 0
						}
					},
					hour,
					task,
					taskName,
					taskAssignee,
					taskCompleted;

				if (parts.length > 2) {
					$loader.removeClass('hide');

					$.get('https://app.asana.com/api/1.0/projects/' + parts[2] + '/tasks?opt_fields=name,assignee,completed,tags', function(data) {
						for (var i in data.data) {
							if (data.data.hasOwnProperty(i)) {
								task = data.data[i];
								taskName = task.name;
								taskAssignee = task.assignee;
								taskCompleted = task.completed;

								// Detect section
								if (taskName.slice(-1) == ':') {
									var taskSectionName = taskName.slice(0, -1).toLowerCase();

									section.tempIndex = section.hours[taskSectionName] == undefined
										? 'maintenance'
										: taskSectionName;

									continue;
								}

								// Detect estimated story
								needle = /\[([\d\.]+)\]/.exec(data.data[i].name);
								stories.total++;

								// Detect assigned or not
								if (taskAssignee) {
									stories.assigned++;
								}

								// Calculate hours
								if (needle !== null) {
									hour = parseFloat(needle[1]);
									hours.total += hour;
									stories.estimated++;

									// Count section hours
									section.hours[section.tempIndex] += hour;

									// Detect tags count
									if (task.tags.length && hour > 0) {
										for (var j in task.tags) {
											if (task.tags.hasOwnProperty(j)) {
												if (tagsIdList[task.tags[j].id] != undefined) {
													tags[tagsIdList[task.tags[j].id]].count++;
													tags[tagsIdList[task.tags[j].id]].hours += hour;
												}
											}
										}
									}

									// Detect total completed hours
									if (taskCompleted) {
										hours.completed += hour;
									}

									if (taskAssignee !== null) {
										if (users.hasOwnProperty(taskAssignee.id)) {
											users[taskAssignee.id]['hours']['total'] += hour;

											if (taskCompleted) {
												users[taskAssignee.id]['hours']['completed'] += hour;
											}
										}
									}
								}
							}
						}

						$totalHours.text(hours.total);
						$completed.html(hours.completed);
						$totalStories.text(stories.total);
						$assigned.html(stories.assigned);
						$estimated.html(stories.estimated);

						$tagBug.text(tags.bug.count);
						$tagCritical.text(tags.critical.count);
						$tagDebt.text(tags.debt.count);

						$tagHourBug.text(tags.bug.hours);
						$tagHourCritical.text(tags.critical.hours);
						$tagHourDebt.text(tags.debt.hours);

						$sections.find('.block-strategic .point').text(section.hours.strategic);
						$sections.find('.block-tactical .point').text(section.hours.tactical);
						$sections.find('.block-maintenance .point').text(section.hours.maintenance);

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
