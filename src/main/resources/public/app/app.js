var busFinderApp = angular.module('busFinderApp', [
    'restangular',
    'ui.router',
    'services',
    'controllers'
//    'filters',
//    'dndLists'
]);
busFinderApp.config(function (RestangularProvider) {
    RestangularProvider.setBaseUrl("http://localhost:8081");

    RestangularProvider.setDefaultHeaders(
        {"Accept": 'application/json'},
        {"Content-Type": "application/json+hal"}
    );
    
    RestangularProvider.setResponseInterceptor(function (data, operation, what) {
        if (operation === 'get') {
            resp = data;
            resp._links = data._links;
            return resp;
        }
        if (operation === 'getList') {
            if (_.has(data, '_embedded')) {
                resp = data._embedded[what];
            } else {
                resp = [];
            }
            resp._links = data._links;
            return resp;
        }
        return data;
    });

    RestangularProvider.setRestangularFields({
        selfLink: 'self.link'
    });
});
