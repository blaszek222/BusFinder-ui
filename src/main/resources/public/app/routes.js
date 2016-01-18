var routerBusFinderApp = angular.module('busFinderApp');

routerBusFinderApp.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/findConnection');
    $stateProvider
            .state('site', {
                abstract: true,
                templateUrl: 'app/partials/site/layout.tpl.html'
            })             
            .state('site.findBusLine', {
                url: '/findBusLine',
                views: {
                    'workspace': {
                        templateUrl: 'app/partials/site/finder/findBusLine.tpl.html'
                    },
                    'map': {
                        templateUrl: 'app/partials/site/map/map.tpl.html'
                    }
                }
            })
            .state('site.findBusStop', {
                url: '/findBusStop',
                views: {
                    'workspace': {
                        templateUrl: 'app/partials/site/finder/findBusStop.tpl.html'
                    },
                    'map': {
                        templateUrl: 'app/partials/site/map/map.tpl.html'
                    }
                }
            })   
            .state('site.findConnection', {
                url: '/findConnection',
                views: {
                    'workspace': {
                        templateUrl: 'app/partials/site/finder/findConnection.tpl.html'
                    },
                    'map': {
                        templateUrl: 'app/partials/site/map/map.tpl.html'
                    }
                }
            })               
            .state('site.manageBusStops', {
                url: '/manageBusStops',
                views: {
                    'workspace': {
                        templateUrl: 'app/partials/site/manager/manageBusStops.tpl.html'
                    },
                    'map': {
                        templateUrl: 'app/partials/site/map/map.tpl.html'
                    }
                }
            })      
            .state('site.manageBusStopConnections', {
                url: '/manageBusStopConnections',
                views: {
                    'workspace': {
                        templateUrl: 'app/partials/site/manager/manageBusStopConnections.tpl.html'
                    },
                    'map': {
                        templateUrl: 'app/partials/site/map/map.tpl.html'
                    }
                }
            })   
            .state('site.manageBusLines', {
                url: '/manageBusLines',
                views: {
                    'workspace': {
                        templateUrl: 'app/partials/site/manager/manageBusLines.tpl.html'
                    },
                    'map': {
                        templateUrl: 'app/partials/site/map/map.tpl.html'
                    }
                }
            })   
            .state('site.manageBusLineConnections', {
                url: '/manageBusLineConnections',
                views: {
                    'workspace': {
                        templateUrl: 'app/partials/site/manager/manageBusLineConnections.tpl.html'
                    },
                    'map': {
                        templateUrl: 'app/partials/site/map/map.tpl.html'
                    }
                }
            })   
            .state('site.manageTimetables', {
                url: '/manageTimetables',
                views: {
                    'workspace': {
                        templateUrl: 'app/partials/site/manager/manageTimetables.tpl.html'
                    },
                    'map': {
                        templateUrl: 'app/partials/site/map/map.tpl.html'
                    }
                }
            })             
});
