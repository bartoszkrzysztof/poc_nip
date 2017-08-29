function InputController ($scope, $http, $window, $filter) {
	$scope.companyId = { text : '7835083242', number : '' };
	$scope.url = 'http://ihaveanidea.aveneo.pl/NIPAPI/api/Company';
	
	
	function inputValue() {
		var validatedId = new ValidateId($scope.companyId.text);
		$scope.companyId.number = validatedId.num;
		$scope.companyId.type = validatedId.type;
	};
	
	$scope.$watch('companyId.text', inputValue);
	
	$scope.storageData = angular.fromJson(localStorage.getItem('searchHistory'));
	if ($scope.storageData === null) {
		$scope.storageData = [];
	}
	
//	console.log(Object.keys($scope.storageData));
	

	
	$scope.showInfo = function(){
		
		for (var i in $scope.storageData) {
			if ($scope.storageData[i]['SearchResult']['CompanyId'] == $scope.companyId.number) {
				var inHistory = true;
				break;
			}
		}
		if (inHistory !== true) {
			$http({
				url: $scope.url,
				method: 'GET',
				params: {CompanyId: $scope.companyId.number}
				}).then(function(response) {
					$scope.companyInfo = response.data;

					if ($scope.companyInfo.Success === true) {
						var localStorage = $scope.storageData;

						var obj = {
							SearchResult: {
								CompanyId: $scope.companyId.number,
								TimeStamp: Date.now(),
								CompanyInformation: $scope.companyInfo.CompanyInformation
							}
						};
						localStorage.push(obj);

						$window.localStorage.setItem('searchHistory', $filter('json')(localStorage, 1));
					}
			});
		}

	};
} 

function ValidateId (string) {
	var number = string.replace(/[^0-9]/g, ''),
		strLenght = number.length,
		type = '';
	
	if (strLenght < 9) { 
		var type = 'numer za krótki'; 
	}
	else if (strLenght == 10) { 
		var validation = NipRegonCheck(number, '657234567'); 
		if (validation == true) {
			var type = 'nip';
		}
		else {
			var type = 'krs';
		}
	}
	else if (strLenght == 9 || strLenght == 14) { 
		var validation = NipRegonCheck(number, '89234567'); 
		if (validation == true) {
			var type = 'regon';
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