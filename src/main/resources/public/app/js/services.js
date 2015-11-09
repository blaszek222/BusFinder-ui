var services = angular.module('services', []);

services.service('BusStop', ['Restangular',
    function (Restangular) {
        return {
            findAll: function () {
                return Restangular.all('busStops').getList();
            }
        };
    }
]);