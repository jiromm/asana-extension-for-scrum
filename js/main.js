/**
 * Native chrome object
 * @typedef {object} chrome
 */
$(function() {
	var testingQueue = buildTestingQueue(),

		$totals = $('.totals'),
		$tags = $('.tags'),
		$sections = $('.sections'),
		$users = $('.users'),
		$wrapper = $('.wrapper'),
		$appliedFactor = $('.applied-factor'),
		$teamPower = $('.team-power strong'),
		$loader = $('.loader'),
		$status = $('.status'),
		$wrong = $('.wrong'),

		// Task related
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
		taskCompleted,
		getAppliedFactorData = function() {
			var data = {};

			$users.find('a').each(function() {
				data[$(this).attr('data-user-id')] = $(this).find('input').val();
			});

			return data;
		},
		processCalculation = function(data) {
			$status.text('Calculating totals.');

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

						// Calculate tag's count and hours
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

						// Calculate total completed hours
						if (taskCompleted) {
							hours.completed += hour;
						}

						// Calculate total completed hours for each developer
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

			// Draw statistics
			$totals.find('.total').text(hours.total);
			$totals.find('.completed').text(hours.completed);

			$totals.find('.estimated').text(stories.estimated);
			$totals.find('.taken').text(stories.total);
			$totals.find('.assigned').text(stories.assigned);

			$tags.find('.tag-bug').text(tags.bug.count);
			$tags.find('.tag-critical').text(tags.critical.count);
			$tags.find('.tag-debt').text(tags.debt.count);

			$tags.find('.tag-bug-hours').text(tags.bug.hours);
			$tags.find('.tag-critical-hours').text(tags.critical.hours);
			$tags.find('.tag-debt-hours').text(tags.debt.hours);

			$sections.find('.block-strategic .point').text(section.hours.strategic);
			$sections.find('.block-tactical .point').text(section.hours.tactical);
			$sections.find('.block-maintenance .point').text(section.hours.maintenance);

			// Draw something cool
			for (var o in users) {
				if (users.hasOwnProperty(o)) {
					$users.append(
						'<a href="#" class="list-group-item" data-user-id="' + o + '">' +
							'<img src="' + users[o]['image'] + '" width="21" height="21"> &nbsp; ' +
							'<span class="badge">' +
								'<span class="done delim text-success">' + users[o].hours.completed + '</span>' +
								'<span class="taken delim">' + users[o].hours.total + '</span>' +
								'<span class="possible text-warning">' + users[o].hours.possible + '</span>' +
							'</span>' +
							'<input type="number" class="hide pull-right" step="1" min="0" max="40" value="' + users[o].hours.possible + '">' +
							users[o]['name'] +
							' <i class="glyphicon glyphicon-random text-danger" data-content="<u>' + users[testingQueue[o][0]]['name'] + ', ' + users[testingQueue[o][1]]['name'] + '</u>"></i>' +
						'</a>'
					);
				}
			}

			$loader.fadeOut('fast', function() {
				$wrapper.hide().removeClass('hide').fadeIn('slow');
			});

			setTimeout(function() {
				$('.list-group-item .glyphicon').popover({
					placement: 'top',
					trigger: 'hover',
					html: true
				});

				$totals.trigger('calculateTotalHours');
				$status.addClass('hide');
			}, 500);
		};

	// Calculate team power
	$totals.on('calculateTeamPower', function() {
		var teamPower = 0;

		for (var userId in users) {
			if (users.hasOwnProperty(userId)) {
				if (!users[userId].hours.possible) {
					continue
				}

				teamPower += users[userId].hours.possible / 28;
			}
		}

		$teamPower.text(
			teamPower.toFixed(2) + ' FTE'
		);
	});

	// Calculate total hours
	$totals.on('calculateTotalHours', function() {
		var total = 0;

		$users.find('input').each(function() {
			var userId = parseInt($(this).closest('.list-group-item').attr('data-user-id')),
				userHour = parseInt($(this).val());

			users[userId].hours.possible = userHour;
			total += userHour;
		});

		$totals.find('.possible').text(isNaN(total) ? 0 : total);
		$totals.trigger('calculateTeamPower');
	});

	// Enable/disable applied factor
	$appliedFactor.on('apply', function(e, isApplied, passiveMode) {
		if (isApplied) {
			$users.find('input').hide().removeClass('hide').fadeIn('fast');
			$users.find('.badge').hide();

			$(this).find('a').text('Save');
			$(this).find('input').fadeIn('fast', function() {
				$(this).focus()
			});
		} else {
			$users.find('.badge').show();
			$users.find('input').addClass('hide');

			$(this).find('input').hide();
			$(this).find('a').text('Applied Factor');

			if (passiveMode === true) {
				$.post(getSprintDBUrl(sessionStorage.getItem('sprintId')), {data: getAppliedFactorData()})
					.done(function(data) {
						if (data.status == 'success') {
							console.log('SUCCESS! Successfully saved.');
						} else {
							console.log('ERROR! Something went wrong.');
						}
					})
					.fail(function() {
						console.log('ERROR! Connection Error.');
					})
					.always(function() {
						$appliedFactor.find('a').prop('disabled', false);
					});
			}
		}
	});

	$appliedFactor.find('a').click(function(e) {
		e.preventDefault();

		var isActive = parseInt($(this).attr('data-is-active'));

		$(this).attr('data-is-active', isActive ? 0 : 1);

		if (isActive) {
			$users.find('.list-group-item').removeClass('active');
		}

		$(this).prop('disabled', true);
		$appliedFactor.trigger('apply', [isActive ? false : true, true]);
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

		$totals.trigger('calculateTotalHours');
	});

	$users.on('change, input', 'input', function() {
		$totals.trigger('calculateTotalHours');
	});

	$users.on('click', '.list-group-item', function(e) {
		e.preventDefault();

		var isAppliedFactorActive = parseInt(
			$appliedFactor.find('a').attr('data-is-active')
		);

		if (e.target.tagName != 'INPUT' && isAppliedFactorActive) {
			$(this).toggleClass('active');
		}
	});

	$(document).on('detectAdmin', function() {
		if (admins.indexOf(
			JSON.parse(localStorage.getItem('user')).id
		) != -1) {
			$appliedFactor.removeClass('hide');
		}
	});

	$(document).on('processCalculation', function(e, sprintId, isApplied, data) {
		var userId,
			maxHour = 0;

		if (isApplied) {
			for (userId in data) {
				if (data.hasOwnProperty(userId)) {
					users[userId].hours.possible = data[userId];
					maxHour = parseInt(data[userId]) > maxHour ? parseInt(data[userId]) : maxHour;
				}
			}

			// @todo detect value in a smart way
			$appliedFactor.find('input').val(maxHour);
		} else {
			for (userId in users) {
				if (users.hasOwnProperty(userId)) {
					users[userId].hours.possible = 0;
				}
			}

			$appliedFactor.find('input').val(0);
		}

		$.get(getSprintUrl(sprintId), processCalculation, 'json');
	});

	$(document).on('prepareAppliedFactor', function(e, sprintId) {
		$status.text('Applied factor defaults.');
		$.get(getSprintDBUrl(sprintId), function(data) {
			$status.text('Process calculation...');
			$(document).trigger('processCalculation', [sprintId, data.isApplied, data.data]);
		}, 'json');
	});

	$(document).on('processHandling', function() {
		$status.text('Initialization.');

		// Detect administrator
		$(document).trigger('detectAdmin');

		// Apply default settings for applied factor
		$appliedFactor.trigger('apply', [false]);

		// Process task identification
		if (chrome.hasOwnProperty('tabs')) {
			chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
				var tablink = arrayOfTabs[0].url,
					url = getLocation(tablink);

				if (url.hostname == 'app.asana.com') {
					var pathname = url.pathname,
						parts = pathname.split('/');

					if (parts.length > 2) {
						sessionStorage.setItem('sprintId', parts[2]);
						$(document).trigger('prepareAppliedFactor', [parts[2]]);
					} else {
						$wrong.removeClass('hide');
						$loader.addClass('hide');
						$status.addClass('hide');
					}
				} else {
					$wrong.removeClass('hide');
					$loader.addClass('hide');
					$status.addClass('hide');
				}
			});
		} else {
			$wrong.removeClass('hide');
			$loader.addClass('hide');
			$status.addClass('hide');
		}
	});

	// Detect admins
	$(document).on('getUserInfo', function() {
		if (typeof getUserInfoUrl !== 'undefined') {
			$.get(getUserInfoUrl(), function(data) {
				if (data.error == undefined) {
					localStorage.setItem('user', JSON.stringify(data.data));

					$(document).trigger('processHandling');
				} else {
					// @todo handle unauthorized access
				}
			}, 'json');
		}
	});

	// Entry point
	if (localStorage.getItem('user') == undefined) {
		$(document).trigger('getUserInfo');
	} else {
		$(document).trigger('processHandling');
	}
});
