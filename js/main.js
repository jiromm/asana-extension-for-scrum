$(function() {
	var userIdList = {},
		$totals = $('.totals'),

		$tags = $('.tags'),
		$sections = $('.sections'),

		$users = $('.users'),
		$wrapper = $('.wrapper'),
		$appliedFactor = $('.applied-factor'),
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

	// Get user's id list
	userIdList = JSON.parse(
		localStorage.getItem('appliedFactor')
	);

	// Calculate total hours
	$totals.on('calculateTotalHours', function() {
		var total = 0;

		$users.find('input').each(function() {
			var userId = parseInt($(this).closest('.list-group-item').attr('data-user-id')),
				userHour = parseInt($(this).val());

			userIdList[userId] = userHour;
			total += userHour;
		});

		localStorage.setItem('appliedFactor', JSON.stringify(userIdList));
		localStorage.setItem('defaultHour', parseInt($appliedFactor.find('input').val()));
		$totals.find('.possible').text(isNaN(total) ? 0 : total);
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

	// Apply default settings for applied factor
	$appliedFactor.trigger('apply', [false]);

	// Process task identification
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
					taskCompleted,
					processCalculation = function(data) {
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
											'<span class="taken text-success">' + users[o]['hours']['completed'] + '</span>' +
											'<span class="done">' + users[o]['hours']['total'] + '</span>' +
										'</span>' +
										'<input type="number" class="hide pull-right" step="1" min="0" max="40" value="' + userIdList[o] + '">' +
										users[o]['name'] +
									'</a>'
								);
							}
						}

						$loader.fadeOut('fast', function() {
							$wrapper.hide().removeClass('hide').fadeIn('slow');
						});

						$totals.trigger('calculateTotalHours');
					};

				if (parts.length > 2) {
					$loader.removeClass('hide');

					$.get('https://app.asana.com/api/1.0/projects/' + parts[2] + '/tasks?opt_fields=name,assignee,completed,tags', processCalculation, 'json');
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

		if (isActive) {
			$users.find('.list-group-item').removeClass('active');
		}

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
});
