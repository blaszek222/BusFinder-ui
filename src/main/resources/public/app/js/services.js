var services = angular.module('services', []);

services.service('Map',
    function () {
        return {           
            initiateMap: function() {
                return new google.maps.Map(document.getElementById('map'), {
                  zoom: 15,
                  center: {lat: 50.87358, lng: 20.63567},
                  mapTypeId: google.maps.MapTypeId.ROADMAP
                }); 
            }
        };
    }
);

services.service('BusStop', ['Restangular', '$q',
    function (Restangular, $q) {
        return {
            findAll: function () {
                return Restangular.all('busStops').getList();
            },
            findOne: function (id) {
                return Restangular.one('busStops', id).get();
            },            
            save: function (busStop, busStops) {
                return busStops.post(busStop);
            },
            showBusStops: function(busStops, map, markers, infoWindows){
                
                    var contentString = '<div id="content"></div>';
                    
                    angular.forEach(busStops, function(busStop){
                    
                    markers[busStop.id] = new google.maps.Marker({
                      position: {lat: busStop.latitude, lng: busStop.longitude},
                      map: map,
                      title: busStop.id+' '+busStop.name,
                      icon: 'images/bus.png',
                      animation: google.maps.Animation.DROP
                    });
                    
                    infoWindows[[busStop.id]] = new google.maps.InfoWindow({
                        content: busStop.name
                    });        
                    
                    markers[busStop.id].addListener('click', function() {
                        infoWindows[[busStop.id]].open(map, markers[busStop.id]);
                    });                    
//                    
//                    markers[busStop.id].bindPopup(busStop.name);
//
//                    markers[busStop.id].on('mouseover', function() {
//                        markers[busStop.id].openPopup();
//                    });
//                    markers[busStop.id].on('mouseout', function() {
//                        markers[busStop.id].closePopup();
//                    });
                }); 
                
            },
            _getBusStopBusLines: function (idBusStop) {
                return Restangular.one('busStops', idBusStop).all('busLines').getList();
            },
            getBusStopBusLines: function (idBusStop) {
                return this._getBusStopBusLines(idBusStop).$object;
            },
            getBusStopBusLinesPromise: function (idBusStop) {
                var deferred = $q.defer();
                this._getBusStopBusLines(idBusStop).then(function (response) {
                    deferred.resolve(response);
                });
                return deferred.promise;
            }             
        };
    }
]);

services.service('BusStopConnection', ['Restangular', '$q', 'BusStop',
    function (Restangular, $q, BusStop) {
        return {
            findAll: function () {
                return Restangular.all('busStopConnections').getList();
            },
            save: function (busStopConnection, busStopConnections) {
                var deferred = $q.defer();
                Restangular.one('busStops', busStopConnection.busStopFrom.id).get().then(function(response){
                    busStopConnection.busStopFrom = response.getRestangularUrl();
                    Restangular.one('busStops', busStopConnection.busStopTo.id).get().then(function(response){
                        busStopConnection.busStopTo = response.getRestangularUrl();
                        busStopConnections.post(busStopConnection).then(function(response){
                            deferred.resolve(response);
                        });                                                
                    });                    
                }); 
                return deferred.promise;  
            },            
            _getBusStopConnectionBusStopFrom: function (idBusStopConnection) {
                return Restangular.one('busStopConnections', idBusStopConnection).customGET('busStopFrom');
            },
            getBusStopConnectionBusStopFrom: function (idBusStopConnection) {
                return this._getBusStopConnectionBusStopFrom(idBusStopConnection).$object;
            },
            getBusStopConnectionBusStopFromPromise: function (idBusStopConnection) {
                var deferred = $q.defer();
                this._getBusStopConnectionBusStopFrom(idBusStopConnection).then(function (response) {
                    deferred.resolve(response);
                });
                return deferred.promise;
            },            
            _getBusStopConnectionBusStopTo: function (idBusStopConnection) {
                return Restangular.one('busStopConnections', idBusStopConnection).customGET('busStopTo');
            },   
            getBusStopConnectionBusStopTo: function (idBusStopConnection) {
                return this._getBusStopConnectionBusStopTo(idBusStopConnection).$object;
            }, 
            getBusStopConnectionBusStopToPromise: function (idBusStopConnection) {
                var deferred = $q.defer();
                this._getBusStopConnectionBusStopTo(idBusStopConnection).then(function (response) {
                    deferred.resolve(response);
                });
                return deferred.promise;
            }            
        };
    }
]);


services.service('BusLine', ['Restangular', '$q', 'LinksExtractor',
    function (Restangular, $q, LinksExtractor) {
        return {
            findAll: function () {
                return Restangular.all('busLines').getList();
            },
            save: function (busLines, busLine) {
                var deferred = $q.defer();
                Restangular.one('busStops', busLine.busStopFrom.id).get().then(function(response){
                    busLine.busStopFrom = response.getRestangularUrl();
                    Restangular.one('busStops', busLine.busStopTo.id).get().then(function(response){
                        busLine.busStopTo = response.getRestangularUrl();
                        busLines.post(busLine).then(function(response){
                            deferred.resolve(response);
                        });                                                
                    });                    
                }); 
                return deferred.promise; 
            },            
            _getBusLineBusStopFrom: function (idBusLine) {
                return Restangular.one('busLines', idBusLine).customGET('busStopFrom');
            },
            getBusLineBusStopFrom: function (idBusLine) {
                return this._getBusLineBusStopFrom(idBusLine).$object;
            },
            getBusLineBusStopFromPromise: function (idBusLine) {
                var deferred = $q.defer();
                this._getBusLineBusStopFrom(idBusLine).then(function (response) {
                    deferred.resolve(response);
                });
                return deferred.promise;
            },            
            _getBusLineBusStopTo: function (idBusLine) {
                return Restangular.one('busLines', idBusLine).customGET('busStopTo');
            },   
            getBusLineBusStopTo: function (idBusLine) {
                return this._getBusLineBusStopTo(idBusLine).$object;
            }, 
            getBusLineBusStopToPromise: function (idBusLine) {
                var deferred = $q.defer();
                this._getBusLineBusStopTo(idBusLine).then(function (response) {
                    deferred.resolve(response);
                });
                return deferred.promise;
            },  
            _getBusLineBusStops: function (idBusLine) {
                return Restangular.one('busLines', idBusLine).all('busStops').getList();
            },
            getBusLineBusStops: function (idBusLine) {
                return this._getBusLineBusStops(idBusLine).$object;
            },
            getBusLineBusStopsPromise: function (idBusLine) {
                var deferred = $q.defer();
                this._getBusLineBusStops(idBusLine).then(function (response) {
                    deferred.resolve(response);
                });
                return deferred.promise;
            },          
            addBusStopToBusLine: function (busStopId, busLineId) {
                var deferred = $q.defer();
                Restangular.one('busStops', busStopId).get().then(function (busStop) {
                    Restangular.one('busLines', busLineId).all('busStops').getList().then(function (busLineBusStops) {
                        busLineBusStops.customPUT(LinksExtractor.extractLinksFromHATEOASArrayAndAddEntity(busLineBusStops, busStop)
                                , null, null, {'Content-Type': 'text/uri-list'}).then(function (addedBusStop) {
                            deferred.resolve('success');
                        });
                    });
                });
                return deferred.promise;
            },
        };
    }
]);

services.service('BusLineConnection', ['Restangular', '$q',
    function (Restangular, $q) {
        return {
            findAll: function () {
                return Restangular.all('busLineConnections').getList();
            },
            save: function (busLineConnections, busLineConnection) {
                var deferred = $q.defer();
                Restangular.one('busLines', busLineConnection.busLine.id).get().then(function(response){
                    busLineConnection.busLine = response.getRestangularUrl();
                    Restangular.one('busStopConnections', busLineConnection.busStopConnection.id).get().then(function(response){
                        busLineConnection.busStopConnection = response.getRestangularUrl();
                        busLineConnections.post(busLineConnection).then(function(response){
                            deferred.resolve(response);
                        });                                                
                    });                    
                }); 
                return deferred.promise; 
            },             
            _getBusLineConnectionBusLine: function (idBusLineConnection) {
                return Restangular.one('busLineConnections', idBusLineConnection).customGET('busLine');
            },
            getBusLineConnectionBusLine: function (idBusLineConnection) {
                return this._getBusLineConnectionBusLine(idBusLineConnection).$object;
            },
            getBusLineConnectionBusLinePromise: function (idBusLineConnection) {
                var deferred = $q.defer();
                this._getBusLineConnectionBusLine(idBusLineConnection).then(function (response) {
                    deferred.resolve(response);
                });
                return deferred.promise;
            },            
            _getBusLineConnectionBusStopConnection: function (idBusLineConnection) {
                return Restangular.one('busLineConnections', idBusLineConnection).customGET('busStopConnection');
            },   
            getBusLineConnectionBusStopConnection: function (idBusLineConnection) {
                return this._getBusLineConnectionBusStopConnection(idBusLineConnection).$object;
            }, 
            getBusLineConnectionBusStopConnectionPromise: function (idBusLineConnection) {
                var deferred = $q.defer();
                this._getBusLineConnectionBusStopConnection(idBusLineConnection).then(function (response) {
                    deferred.resolve(response);
                });
                return deferred.promise;
            }            
        };
    }
]);