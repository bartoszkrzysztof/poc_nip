function InputController ($scope) {
	$scope.companyId = { text : '', number : null };
	var inputValue = function() {
		var validatedId = ValidateId($scope.companyId.text);
		
		$scope.companyId.number = validatedId.num;
		$scope.companyId.type = validatedId.type;
	};
	$scope.$watch('companyId.text', inputValue);
} 

function ValidateId (string) {
	var number = string.replace(/[^0-9]/g, ''),
		strLenght = number.length,
		type = '';
	
	if (strLenght == 10) {
		var type = NipCheck(number);
	}
//	else if (strLenght == 9 || strLenght == 14) {
//		var type = 'regon';
//	}
	
	var obj = {
		num: number,
		type: type,
	}
	console.log(obj);
	return obj;
}

function NipCheck(string) {
	var parts = string.split(''),
		checks = '657234567'.split(''),
		sum = 0, checksum = 0;
	for (i = 0; i <= 8; i++) { 
		sum += parseInt(checks[i]) * parseInt(parts[i]);
	}
	var checksum = sum % 11;			
	if (checksum == parseInt(parts[9])) {
		return 'nip';	
	}
	else {
		return 'krs';
	}
}
//function RegonCheck(string) {
//	var parts = string.split(''),
//		checks = '657234567'.split(''),
//		sum = 0, checksum = 0;
//	for (i = 0; i <= 8; i++) { 
//		sum += parseInt(checks[i]) * parseInt(parts[i]);
//	}
//	var checksum = sum % 11;			
//	if (checksum == parseInt(parts[9])) {
//		return 'nip';	
//	}
//	else {
//		return 'krs';
//	}
//}