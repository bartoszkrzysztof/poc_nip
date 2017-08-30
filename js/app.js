function InputController ($scope, $http, $window, $filter) {
	$scope.companyId = { text : '', number : '' };
	$scope.url = 'http://ihaveanidea.aveneo.pl/NIPAPI/api/Company';
	
	
	function inputValue() {
		var validatedId = new ValidateId($scope.companyId.text);
		$scope.companyId.number = validatedId.prefix + validatedId.num;
		$scope.companyId.type = validatedId.type;
		$scope.companyId.valid = validatedId.valid;
	};
	
	$scope.$watch('companyId.text', inputValue);
	
	$scope.storageData = angular.fromJson(localStorage.getItem('searchHistory'));
	if ($scope.storageData === null) {
		$scope.storageData = [];
	}
	
	$scope.showInfo = function(){
		if ($scope.companyId.valid === true) {
			$scope.inHistory = false;
			CheckInHistory($scope.storageData, $scope.companyId.number);

			if ($scope.inHistory !== true) {
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
		}

	};
	$scope.showPreviousInfo = function(id) {
		CheckInHistory($scope.storageData, id);
	}
	
	function CheckInHistory (storage, id) {
//		$scope.companyId.text = id;
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
		var type = 'numer za krótki'; 
	}
	else if (strLenght == 10) { 
		var validation = NipRegonCheck(number, '657234567'); 
		if (validation == true) {
			var type = 'nip';
			var valid = true;
		}
		else {
			var type = 'krs';
			var valid = true;
			var prefix = 'KRS'
		}
	}
	else if (strLenght == 9 || strLenght == 14) { 
		var validation = NipRegonCheck(number, '89234567'); 
		if (validation == true) {
			var type = 'regon';
			var valid = true;
		}
		else {
			var type = 'niepoprawny numer';
		}
	}
	else { 
		var type = 'błędna ilość znaków'; 
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