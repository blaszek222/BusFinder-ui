"use strict";
var controllers = angular.module('controllers', []);

controllers.controller('BusStopController', ["$scope", 'BusStop',
    function ($scope, BusStop) {
        BusStop.findAll().then(function(response){
            $scope.busStops = response;
        });
        
    }
]);
