Date.prototype.getWeek = function() {
	var onejan = new Date(this.getFullYear(), 0, 1);
	return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
};

Array.prototype.in_array = function(needle) {
	for (var i = 0, l = this.length; i < l; i++) {
		if (this[i] == needle) {
			return true;
		}
	}

	return false;
};

var getLocation = function(href) {
		var l = document.createElement("a");
		l.href = href;

		return l;
	},
	getUserInfoUrl = function() {
		return 'https://app.asana.com/api/1.0/users/me';
	},
	getSprintUrl = function(sprintId) {
		return 'https://app.asana.com/api/1.0/projects/' + sprintId + '/tasks?opt_fields=name,assignee,completed,tags,followers';
	},
	getSprintDBUrl = function(sprintId) {
		return 'http://jiromm.com/projects/chrome/asana/db/?id=' + sprintId;
	},
	users = {
		10124585031848: {
			"name": "Eduard Aleksanyan",
			"image": "https://s3.amazonaws.com/profile_photos/10124585031848.wyUMUWeGEyfd7bXATcGa_21x21.png",
			"hours": {
				"total": 0,
				"completed": 0,
				"possible": 0
			}
		},
		11686527531417: {
			"name": "Tigran Ghabuzyan",
			"image": "https://s3.amazonaws.com/profile_photos/11686527531417.QOvoSX7R6lTJSG9VDBQI_21x21.png",
			"hours": {
				"total": 0,
				"completed": 0,
				"possible": 0
			}
		},
		10124585031839: {
			"name": "Tigran Petrosyan",
			"image": "https://s3.amazonaws.com/profile_photos/10124585031839.Zvk5gKoGkI4BZNXFeAG7_21x21.png",
			"hours": {
				"total": 0,
				"completed": 0,
				"possible": 0
			}
		},
		5754650264628: {
			"name": "Tigran Tadevosyan",
			"image": "https://s3.amazonaws.com/profile_photos/5754650264628.J6jyaDiKxliFxx4kIpiU_21x21.png",
			"hours": {
				"total": 0,
				"completed": 0,
				"possible": 0
			}
		},
		25719136431202: {
			"name": "Hrayr Papikyan",
			"image": "https://s3.amazonaws.com/profile_photos/25719136431202.G39up5gCwyUO8Lg5UhBL_21x21.png",
			"hours": {
				"total": 0,
				"completed": 0,
				"possible": 0
			}
		},
		12950252745597: {
			"name": "Arbi Baghoomian",
			"image": "https://s3.amazonaws.com/profile_photos/12950252745597.xddYtxsUKBXFP4oYLpSF_21x21.png",
			"hours": {
				"total": 0,
				"completed": 0,
				"possible": 0
			}
		},
		10124585031830: {
			"name": "Aram Baghdasaryan",
			"image": "https://s3.amazonaws.com/profile_photos/10124585031830.JrvDk4UBi3WC0VX8vMT7_21x21.png",
			"hours": {
				"total": 0,
				"completed": 0,
				"possible": 0
			}
		},
		45707791044342: {
			"name": "Harut Grigoryan",
			"image": "https://s3.amazonaws.com/profile_photos/45707791044342.6ghgdwzni7VLBsuOvMXL_21x21.png",
			"hours": {
				"total": 0,
				"completed": 0,
				"possible": 0
			}
		}
	},
	testers = [
		{id: 10124585031830, step: 1}, // Aram Baghdasaryan
		{id: 12950252745597, step: 1}, // Arbi Baghoomyan
		{id: 10124585031848, step: 1}, // Eduard Aleksanyan
		{id: 25719136431202, step: 1}, // Hrayr Papikyan
		{id: 10124585031839, step: 1}, // Tigran Petrosyan
		{id: 5754650264628,  step: 1}, // Tigran Tadevosyan
		{id: 11686527531417, step: 1}, // Tigran Ghabuzyan
		{id: 45707791044342, step: 1}  // Harut Grigoryan
	],
	admins = [8430834800772, 26433177772854, 10124585031839/*, 10124585031830*/],
	tagsIdList = {
		1367012534094:  'bug',
		1379750807237:  'critical',
		29189199083474: 'debt'
	}
	buildTestingQueue = function() {
		var iteration = {},
			i1,
			step,
			len = testers.length,
			fixedWeek = (new Date()).getWeek() + 1,
			getNext = function(firstUserIndex, testerIndex, len) {
				var secondUserIndex = firstUserIndex + 1;

				if (secondUserIndex == testerIndex) {
					secondUserIndex ++;
				}

				if (secondUserIndex == len) {
					if (testerIndex == 0) {
						secondUserIndex = 1;
					} else {
						secondUserIndex = 0;
					}
				}

				return secondUserIndex;
			};

		testers.forEach(function(item, index) {
			testers[index].step = fixedWeek;
		});

		for (var j in testers) {
			if (testers.hasOwnProperty(j)) {
				step = parseInt(testers[j].step);
				i1 = step + parseInt(j);

				i1 = i1 - parseInt(i1 / len) * len;

				if (i1 == j) {
					if (j == len - 1) {
						i1 = 0;
					} else {
						i1++;
					}
				}

				iteration[testers[j].id] = [testers[i1].id, testers[getNext(i1, j, len)].id];
			}
		}

		return iteration;
	};
