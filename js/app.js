var config = {
	tooShort : 'Numer za krótki',
	notValid : 'Numer niepoprawny',
	tooLong : 'Numer niepoprawny',
	validNip : 'Poprawny numer NIP',
	validRegon : 'Poprawny numer REGON', 
	validKrs : 'Poprawny numer KRS',
	historyPeriod : 3
}

angular.module('NipApp', ['chieffancypants.loadingBar', 'ngAnimate'])
.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
}])

function NipController ($scope, $http, $window, $filter, $location, $anchorScroll, cfpLoadingBar) {
	ClearStorage();
	
	$scope.companyId = { text : '', number : '' };
	$scope.url = 'http://ihaveanidea.aveneo.pl/NIPAPI/api/Company';
	
	$scope.storageData = angular.fromJson(localStorage.getItem('searchHistory'));
	if ($scope.storageData === null) {
		$scope.storageData = [];
	}

	function inputValue() {
		var validatedId = new ValidateId($scope.companyId.text);
		$scope.companyId.number = validatedId.prefix + validatedId.num;
		$scope.companyId.type = validatedId.type;
		$scope.companyId.valid = validatedId.valid;
	};
	
	$scope.$watch('companyId.text', inputValue);
	
	$scope.showInfo = function(){
		if ($scope.companyId.valid === true) {
			cfpLoadingBar.start();
			$scope.inHistory = false;
			CheckInHistory($scope.storageData, $scope.companyId.number);

			if ($scope.inHistory !== true) {
				$scope.searchedId = $scope.companyId.number;
				$http({
					url: $scope.url,
					method: 'GET',
					params: {CompanyId: $scope.companyId.number}
					}).then(function(response) {
						$scope.companyInfo = response.data;

						if ($scope.companyInfo.CompanyInformation !== null) {
							var obj = {
								SearchResult: {
									CompanyId: $scope.companyId.number,
									TimeStamp: Date.now(),
									CompanyInformation: $scope.companyInfo.CompanyInformation
								}
							};
							$scope.storageData.push(obj);
							$window.localStorage.setItem('searchHistory', $filter('json')($scope.storageData, 1));
						}
				});
			}
			cfpLoadingBar.complete();
		}
	};
	$scope.showPreviousInfo = function(id, targetHash) {
		cfpLoadingBar.start();
		CheckInHistory($scope.storageData, id);
		$location.path(targetHash);
    	$anchorScroll();
		cfpLoadingBar.complete();
	}
	function CheckInHistory (storage, id) {
		for (var i in storage) {
			if (storage[i]['SearchResult']['CompanyId'] == id) {
				$scope.companyInfo = storage[i]['SearchResult'];
				$scope.inHistory = true;
				break;
			}
		}
	}
} 

function ValidateId (string) {
	var number = string.replace(/[^0-9]/g, ''),
		strLenght = number.length,
		type = '',
		prefix = '',
		valid = false;
	
	if (strLenght < 9) { 
		var type = config.tooShort; 
	}
	else if (strLenght == 10) { 
		var validation = NipRegonCheck(number, '657234567'); 
		if (validation == true) {
			var type = config.validNip;
			var valid = true;
		}
		else {
			var type = config.validKrs;
			var valid = true;
			var prefix = 'KRS'
		}
	}
	else if (strLenght == 9 || strLenght == 14) { 
		var validation = NipRegonCheck(number, '89234567'); 
		if (validation == true) {
			var type = config.validRegon;
			var valid = true;
		}
		else {
			var type = config.notValid;
		}
	}
	else { 
		var type = config.tooLong; 
	}
	
	this.num = number;
	this.type = type;
	this.valid = valid;
	this.prefix = prefix;
}

function NipRegonCheck(string, check) {
	var parts = string.split(''),
		checks = check.split(''),
		sum = 0, checksum = 0;
	for (i = 0; i < checks.length; i++) { 
		sum += parseInt(checks[i]) * parseInt(parts[i]);
	}
	var checksum = sum % 11;
	if (checksum == parseInt(parts[checks.length])) {
		var valid = true;
	}
	else {
		var valid = false;
	}
	return valid;	
}

function ClearStorage() {
	var date = new Date();
	date.setDate(date.getDate() - config.historyPeriod);
	var compareDate = new Date(date);
	var unixtime = new Date(compareDate).getTime();
	var obj = JSON.parse(localStorage.getItem('searchHistory'));
	if (obj != null) {
		for (var i in obj) {
			var historytime = obj[i].SearchResult.TimeStamp;
			if (historytime < unixtime) {
				delete obj[i];
			}
		}
		obj = obj.filter(function(n){ return n });
		localStorage.setItem('searchHistory', JSON.stringify(obj));
	}
}