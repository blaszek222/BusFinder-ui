(function () {
    "use strict";

    var usersModule = angular.module('busFinderApp');

    usersModule.factory('LinksExtractor', ['Restangular', function (Restangular) {
            function extractLinksFromHATEOASArray(HATEOASArray) {
                var arrayLength = HATEOASArray.length;
                var resultString = '';
                for (var i = 0; i < arrayLength; i++) {
                    resultString = resultString + HATEOASArray[i].getRestangularUrl() + '\n';
                }
                return resultString;
            }
            function extractLinksFromHATEOASArrayAndAddEntity(HATEOASArray, Entity) {
                var collectionLinks = extractLinksFromHATEOASArray(HATEOASArray);
                collectionLinks += Entity.getRestangularUrl();
                return collectionLinks;
            }
            return {
                extractLinksFromHATEOASArray: extractLinksFromHATEOASArray,
                extractLinksFromHATEOASArrayAndAddEntity: extractLinksFromHATEOASArrayAndAddEntity
            };
        }]);

})();

