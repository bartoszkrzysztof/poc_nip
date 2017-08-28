function InputController ($scope, $http) {
	$scope.companyId = { text : '7835083242', number : '' };
	
	function inputValue() {
		var validatedId = ValidateId($scope.companyId.text);
		$scope.companyId.number = validatedId.num;
		$scope.companyId.type = validatedId.type;
	};
	
	$scope.$watch('companyId.text', inputValue);
	
	$scope.url = 'http://ihaveanidea.aveneo.pl/NIPAPI/api/Company';
	$scope.showInfo = function(){
	 	$http({
			url: $scope.url,
			method: 'GET',
			params: {CompanyId: $scope.companyId.number}
			}).then(function(response) {
				$scope.companyInfo = response.data;
	 	});
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
		if (validation === true) {
			var type = 'nip';
		}
		else {
			var type = 'krs';
		}
	}
	else if (strLenght == 9 || strLenght == 14) { 
		var validation = NipRegonCheck(number, '89234567'); 
		if (validation === true) {
			var type = 'regon';
		}
		else {
			var type = 'niepoprawny numer';
		}
	}
	else { 
		var type = 'błędna ilość znaków'; 
	}
	
	var obj = {
		num: number,
		type: type,
	}
	return obj;
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
		return valid;	
	}
	else {
		var valid = false;
	}
}