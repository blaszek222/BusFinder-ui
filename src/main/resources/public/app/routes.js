var routerBusFinderApp = angular.module('busFinderApp');

routerBusFinderApp.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/dashboard');
    $stateProvider
            .state('dashboard', {
                url: '/dashboard',
                urrl: 'app/index.html'
            })
//            .state('manageOffice', {
//                url: '/manageOffice',
//                views: {
//                    'navigation': {
//                        templateUrl: 'app/partials/navigation.tpl.html'
//                    },
//                    'content': {
//                        templateUrl: 'app/partials/office/manageOffice.tpl.html'
//                    }
//                }
//            })
//            .state('manageProjects', {
//                url: '/manageProjects',
//                views: {
//                    'navigation': {
//                        templateUrl: 'app/partials/navigation.tpl.html'
//                    },
//                    'content': {
//                        templateUrl: 'app/partials/project/manageProjects.tpl.html'
//                    }
//                }
//            })
//            .state('peopleList', {
//                url: '/peopleList',
//                views: {
//                    'navigation': {
//                        templateUrl: 'app/partials/navigation.tpl.html'
//                    },
//                    'content': {
//                        templateUrl: 'app/partials/people/list.tpl.html'
//                    }
//                }
//            })
//            .state('assignToRoom', {
//                url: '/assignToRoom',
//                views: {
//                    'navigation': {
//                        templateUrl: 'app/partials/navigation.tpl.html'
//                    },
//                    'content': {
//                        templateUrl: 'app/partials/people/assignToRoom.tpl.html'
//                    }
//                }
//            })
//            .state('assignToProjects', {
//                url: '/assignToProjects',
//                views: {
//                    'navigation': {
//                        templateUrl: 'app/partials/navigation.tpl.html'
//                    },
//                    'content': {
//                        templateUrl: 'app/partials/people/assignToProjects.tpl.html'
//                    }
//                }
//            })
//            .state('officeMap', {
//                url: '/officeMap',
//                views: {
//                    'navigation': {
//                        templateUrl: 'app/partials/navigation.tpl.html'
//                    },
//                    'content': {
//                        templateUrl: 'app/partials/office/officeMap.tpl.html'
//                    }
//                }
//            })
});
