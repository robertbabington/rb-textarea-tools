var app = angular.module('rbTextareaSettings');

app.controller('myCtrl', function($scope) {
    $scope.myVariable = '';

    $scope.myList = [
        {text: 'Aaron_Sorkin'},
        {text: 'Albert_Reynolds'},
        {text: 'Brian_Blessid'},
        {text: 'Brian_Boru'},
        {text: 'Brian_Griffin'},
        {text: 'Captain_Hook'},
        {text: 'Carl_Pilkington'}
    ]
});