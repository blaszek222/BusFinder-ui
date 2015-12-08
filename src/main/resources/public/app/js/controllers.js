"use strict";
var controllers = angular.module('controllers', []);

controllers.controller('MapController', ["$scope", 'Map', 'BusStop', 'BusLine', 'BusStopConnection', 'BusLineConnection', 'NgMap', '$timeout',
    function ($scope, Map, BusStop, BusLine, BusStopConnection, BusLineConnection, NgMap, $timeout) {
        //var map = Map.initiateMap();
        //map.addListener('click', addLatLng);
        $scope.markers = [];
        $scope.polylines = [];
        $scope.busLineConnections = [];
        $scope.infoWindows = [];

        var vm = this;
        vm.active = {};
        vm.selectedBusLine = null;
        vm.busStops = [];
        vm.busLines = [];
        vm.busStopConnections = [];
        vm.busStopConnectionExist = null;
        vm.busLineConnectionExist = null;
        vm.busStopCreationAvaliability = false;
        vm.addingBusStopToBusLineAvliability = null;
        vm.searchingRouteAvailability = null;
        
        vm.polylineOptions = {
            strokeColor: 'red'
        };

        vm.addingBusStopToBusLine = {
            busStop: null,
            busLine: null
        };

        vm.newBusStop = {
            id: 'defaultId',
            name: null,
            position: false
        };

        vm.newBusLine = {
            number: null,
            busStopFrom: null,
            busStopTo: null
        };

        vm.newBusStopConnection = {
            distance: null,
            busStopFrom: null,
            busStopTo: null
        };

        vm.newBusLineConnection = {
            busLine: null,
            busStopConnection: null,
            busLineOrder: null
        };
        
        vm.searchedConnection = {
            busStopFrom: null,
            busStopTo: null,
            searchingType: null
        };

        vm.newBusStopIsActive = false;

        NgMap.getMap().then(function (map) {
            vm.map = map;
        });

        vm.showDetail = function (event, busStop) {
            vm.active = busStop;
            vm.map.showInfoWindow('infoWindowId', busStop.id);
        };

        vm.showNewBusStopDetail = function (event) {
            vm.map.showInfoWindow('newBusStopInfoWindow', vm.newBusStop.id);
        };
        
        vm.changePosition = function(event){
            vm.newBusStop.position = [event.latLng.lat(), event.latLng.lng()];
        };

        vm.toggleBusStopCreationAvaliability = function () {
            if (vm.busStopCreationAvaliability === false) {
                vm.busStopCreationAvaliability = true;
            } else {
                vm.busStopCreationAvaliability = false;
            }
        };

        vm.addMarker = function (event) {
            if (vm.busStopCreationAvaliability === true) {
                vm.newBusStop.position = [event.latLng.lat(), event.latLng.lng()];
            }
        };
        
        vm.setDefaultConnectionsColor =  function(){
            angular.forEach(vm.busStopConnections, function (bSC) {
                vm.map.shapes[bSC.id].setMap(null);
                vm.map.shapes[bSC.id].strokeColor = vm.polylineOptions.strokeColor;
                vm.map.shapes[bSC.id].setMap(vm.map);
            });              
        };
        
        vm.createNeighbourArray = function(){
                vm.neighboursArray = {};
                angular.forEach(vm.busStopsList, function(busStop){
                   vm.inner = {};
                   angular.forEach(vm.busStopsList, function(busStop2){
                       var keepGoing = true;
                       vm.inner[busStop2.id] = 0; 
                       angular.forEach(vm.busStopConnections, function(busStopConnection){ 
                           if(keepGoing === true){
                                if(busStopConnection.busStopFrom.id == busStop.id && busStopConnection.busStopTo.id == busStop2.id){
                                    vm.inner[busStop2.id] = 1;
                                    keepGoing = false;
                                }                             
                            }
                       });
                   });
                });
        };
        
        vm.findConnection = function(){
            if(vm.searchedConnection.searchingType === "distance"){
                vm.findShortestDistanceConnection();
            }else{
                vm.findSmallestBusStopsAmountConnection();
            }
        };
        
        vm.highlightRoute = function(){
            var currentNode = {};
            currentNode = vm.searchedConnection.busStopTo.id;
            vm.setDefaultConnectionsColor();
            while(vm.nodesPreviousNodeP[currentNode] != -1){
                angular.forEach(vm.busStopConnections, function(busStopConnection){
                   if(busStopConnection.busStopFrom.id == vm.nodesPreviousNodeP[currentNode] && busStopConnection.busStopTo.id == currentNode){
                        vm.map.shapes[busStopConnection.id].setMap(null);
                        vm.map.shapes[busStopConnection.id].strokeColor = 'blue';
                        vm.map.shapes[busStopConnection.id].setMap(vm.map);
                        currentNode = vm.nodesPreviousNodeP[currentNode];
                   } 
                });                    
            }               
        };        
        
        vm.findShortestDistanceConnection = function(){
            vm.nodesSetQ = {};
            vm.nodesSetS = {};
            vm.nodesPreviousNodeP = {};
            vm.travelCostD = {};
            var minCost = 10;
            var minCostNode = {};
            
            function getFirst(data) {
              for (var prop in data)
                return prop;
            }            
            
            angular.forEach(vm.busStopsList, function(busStop){
               vm.nodesSetQ[busStop.id] = busStop.id; 
               vm.nodesPreviousNodeP[busStop.id] = -1;
               vm.travelCostD[busStop.id] = 1000000;
            }); 
            vm.travelCostD[vm.searchedConnection.busStopFrom.id] = 0;

            while(Object.keys(vm.nodesSetQ).length > 0){
                minCostNode = getFirst(vm.nodesSetQ);
                minCost = vm.travelCostD[minCostNode];
                
                for(var key in vm.nodesSetQ){
                    if(vm.travelCostD[key] < minCost){
                        minCost = vm.travelCostD[key];
                        minCostNode = key;
                    }                    
                }
                
                vm.nodesSetS[minCostNode] = minCost;
                delete vm.nodesSetQ[minCostNode];
                
                angular.forEach(vm.busStopConnections, function(busStopConnection){
                   if(busStopConnection.busStopFrom.id == minCostNode){
                       if(vm.travelCostD[busStopConnection.busStopTo.id] >= (vm.travelCostD[minCostNode] + busStopConnection.distance)){
                           vm.travelCostD[busStopConnection.busStopTo.id] = (vm.travelCostD[minCostNode] + busStopConnection.distance);
                           vm.nodesPreviousNodeP[busStopConnection.busStopTo.id] = minCostNode;
                       }
                   } 
                });              
            }
            
            vm.highlightRoute();
        };
        
        vm.findSmallestBusStopsAmountConnection = function(){
            vm.nodesSetQ = {};
            vm.nodesSetS = {};
            vm.nodesPreviousNodeP = {};
            vm.travelCostD = {};
            var minCost = 10;
            var minCostNode = {};
            
            function getFirst(data) {
              for (var prop in data)
                return prop;
            }            
            
            angular.forEach(vm.busStopsList, function(busStop){
               vm.nodesSetQ[busStop.id] = busStop.id; 
               vm.nodesPreviousNodeP[busStop.id] = -1;
               vm.travelCostD[busStop.id] = 1000000;
            }); 
            vm.travelCostD[vm.searchedConnection.busStopFrom.id] = 0;

            while(Object.keys(vm.nodesSetQ).length > 0){
                minCostNode = getFirst(vm.nodesSetQ);
                minCost = vm.travelCostD[minCostNode];
                
                for(var key in vm.nodesSetQ){
                    if(vm.travelCostD[key] < minCost){
                        minCost = vm.travelCostD[key];
                        minCostNode = key;
                    }                    
                }
                
                vm.nodesSetS[minCostNode] = minCost;
                delete vm.nodesSetQ[minCostNode];
                
                angular.forEach(vm.busStopConnections, function(busStopConnection){
                   if(busStopConnection.busStopFrom.id == minCostNode){
                       if(vm.travelCostD[busStopConnection.busStopTo.id] >= (vm.travelCostD[minCostNode] + 1)){
                           vm.travelCostD[busStopConnection.busStopTo.id] = (vm.travelCostD[minCostNode] + 1);
                           vm.nodesPreviousNodeP[busStopConnection.busStopTo.id] = minCostNode;
                       }
                   } 
                });              
            }
            
            vm.highlightRoute();
        };        
        
        

        vm.createNewBusStopConnection = function () {
            vm.busStopConnectionExist = false;
            var savedBusStopConnection = {};
            angular.forEach(vm.busStopConnections, function (bSC) {
                if (bSC.busStopFrom.id == vm.newBusStopConnection.busStopFrom.id && bSC.busStopTo.id == vm.newBusStopConnection.busStopTo.id && vm.busStopConnectionExist === false) {
                    vm.busStopConnectionExist = true;
                }
            });
            if (vm.busStopConnectionExist === false) {
                vm.newBusStopConnection.distance = Math.floor(google.maps.geometry.spherical.computeDistanceBetween(
                        (new google.maps.LatLng(vm.newBusStopConnection.busStopFrom.position[0], vm.newBusStopConnection.busStopFrom.position[1])),
                        (new google.maps.LatLng(vm.newBusStopConnection.busStopTo.position[0], vm.newBusStopConnection.busStopTo.position[1]))));
                BusStopConnection.save(vm.newBusStopConnection, vm.busStopConnections).then(function (resp) {
                    savedBusStopConnection = resp;
                    BusStopConnection.getBusStopConnectionBusStopFromPromise(resp.id).then(function (responseFrom) {
                        savedBusStopConnection.busStopFrom = responseFrom;
                        BusStopConnection.getBusStopConnectionBusStopToPromise(resp.id).then(function (responseTo) {
                            savedBusStopConnection.busStopTo = responseTo;
                            savedBusStopConnection.strokeColor = 'green';
                            savedBusStopConnection.strokeWeight = 2;
                            vm.busStopConnections.push(savedBusStopConnection);
                            vm.createNeighbourArray();
                        });
                    });
                });
            }
            $timeout(function () {
                vm.busStopConnectionExist = null;
            }, 5000);
        };

        vm.createBusLine = function () {
            var newBusLine = vm.newBusLine;
            vm.newBusLineAvailability = true;
            angular.forEach(vm.busLines, function (busLine) {
                if (busLine.number == newBusLine.number) {
                    vm.newBusLineAvailability = false;
                }
            });
            if (vm.newBusLineAvailability === true) {
                BusLine.save(vm.busLines, newBusLine).then(function (createdBusLine) {
                    BusLine.getBusLineBusStopFromPromise(createdBusLine.id).then(function (responseFrom) {
                        createdBusLine.busStopFrom = responseFrom;
                        BusLine.getBusLineBusStopToPromise(createdBusLine.id).then(function (responseTo) {
                            createdBusLine.busStopTo = responseTo;
                            createdBusLine.busStops = [];
                            //BusStopConnection.showBusStopConnection(busStopConnection, map, $scope.polylines, $scope.colorVar);
                            vm.busLines.push(createdBusLine);
                            vm.newBusLine = {
                                number: null,
                                busStopFrom: null,
                                busStopTo: null
                            };
                            $timeout(function () {
                                vm.newBusLineAvailability = null;
                            }, 5000);
                        });
                    });
                });
            }
        };

        vm.addBusStopToBusLine = function () {

            var addingBusStopToBusLine = vm.addingBusStopToBusLine;
            vm.addingBusStopToBusLineAvliability = true;
            angular.forEach(vm.busLines, function (busLine) {
                angular.forEach(busLine.busStops, function (busStop) {
                    if (busStop.id == addingBusStopToBusLine.busStop.id && busLine.id == addingBusStopToBusLine.busLine.id) {
                        vm.addingBusStopToBusLineAvliability = false;
                    }
                });
            });
            if (vm.addingBusStopToBusLineAvliability === true) {
                BusLine.addBusStopToBusLine(addingBusStopToBusLine.busStop.id, addingBusStopToBusLine.busLine.id).then(function (addedBusStop) {
                    if (addedBusStop === 'success') {
                        angular.forEach(vm.busLines, function (busLine) {
                            if (busLine.id == addingBusStopToBusLine.busLine.id) {
                                busLine.busStops.push(addingBusStopToBusLine.busStop);
                            }
                        });
                        angular.forEach(vm.busStops, function (busStop) {
                            if (busStop.id == addingBusStopToBusLine.busStop.id) {
                                busStop.busLines.push(addingBusStopToBusLine.busLine);
                            }
                        });
                    }
                });
            }
            $timeout(function () {
                vm.addingBusStopToBusLineAvliability = null;
            }, 5000);

        };
        


        vm.findAllBusStops = function () {
            BusStop.findAll().then(function (response) {
                var busStop = {};
                var Iterator = 0;
                vm.busStopsList = response;
                angular.forEach(response, function (resp) {
                    Iterator++;
                    $timeout(function () {
                        BusStop.getBusStopBusLinesPromise(resp.id).then(function (busStopBusLines) {
                            busStop = {};
                            busStop = {
                                id: resp.id.toString(),
                                name: resp.name,
                                position: [resp.latitude, resp.longitude],
                                busLines: busStopBusLines
                            };
                            vm.busStops.push(busStop);
                        });
                    }, (Iterator * 150));
                });
            });
        };
        
        vm.findAllBusStops();
      
        vm.saveNewBusStop = function () {
            var busStopToSave = {
                name: vm.newBusStop.name,
                latitude: vm.newBusStop.position[0],
                longitude: vm.newBusStop.position[1]
            };
            BusStop.save(busStopToSave, vm.busStopsList).then(function (resp) {
                vm.busStopsList.push(resp);
                var busStop = {
                    id: resp.id.toString(),
                    name: resp.name,
                    position: [resp.latitude, resp.longitude],
                    busLines: []
                };
                vm.busStops.push(busStop);
                vm.newBusStop = {
                    id: 'defaultId',
                    name: null,
                    position: false
                };
                vm.toggleBusStopCreationAvaliability();
            });
        };



        vm.findAllBusStopConnections = function () {
            BusStopConnection.findAll().then(function (response) {
                vm.busStopConnections = response;
                angular.forEach(vm.busStopConnections, function (busStopConnection) {
                    BusStopConnection.getBusStopConnectionBusStopFromPromise(busStopConnection.id).then(function (responseFrom) {
                        busStopConnection.busStopFrom = responseFrom;
                        BusStopConnection.getBusStopConnectionBusStopToPromise(busStopConnection.id).then(function (responseTo) {
                            busStopConnection.busStopTo = responseTo;
                        });
                    });
                    busStopConnection.strokeColor = 'red';
                    busStopConnection.strokeWeight = 2;

                });

            });
        };
        vm.findAllBusStopConnections();


        vm.findAllBusLines = function () {
            BusLine.findAll().then(function (response) {
                vm.busLines = response;
                angular.forEach(vm.busLines, function (busLine) {
                    BusLine.getBusLineBusStopFromPromise(busLine.id).then(function (responseFrom) {
                        busLine.busStopFrom = responseFrom;
                        BusLine.getBusLineBusStopToPromise(busLine.id).then(function (responseTo) {
                            busLine.busStopTo = responseTo;
                            //BusStopConnection.showBusStopConnection(busStopConnection, map, $scope.polylines, $scope.colorVar);
                        });
                    });
                    BusLine.getBusLineBusStopsPromise(busLine.id).then(function (busLineBusStops) {
                        busLine.busStops = busLineBusStops;
                    });

                });
            });
        };
        vm.findAllBusLines();

        angular.element(document).ready(function () {
            vm.searchingRouteAvailability = true;
            $scope.$watch('vm.selectedBusLine', function () {
                vm.setDefaultConnectionsColor();

                angular.forEach(vm.busLineConnections, function (busLineConnection) {
                    if (busLineConnection.busLine.id === vm.selectedBusLine) {
                        vm.map.shapes[busLineConnection.busStopConnection.id].setMap(null);
                        vm.map.shapes[busLineConnection.busStopConnection.id].strokeColor = 'blue';
                        vm.map.shapes[busLineConnection.busStopConnection.id].setMap(vm.map);
                    }
                });
            });
        });

        vm.findAllBusLineConnections = function () {
            BusLineConnection.findAll().then(function (response) {
                vm.busLineConnections = response;
                angular.forEach(vm.busLineConnections, function (busLineConnection) {
                    BusLineConnection.getBusLineConnectionBusLinePromise(busLineConnection.id).then(function (responseBusLine) {
                        busLineConnection.busLine = responseBusLine;
                        BusLineConnection.getBusLineConnectionBusStopConnectionPromise(busLineConnection.id).then(function (responseBusStopConnection) {
                            busLineConnection.busStopConnection = responseBusStopConnection;
                            busLineConnection.busStopConnection.busStopFrom = BusStopConnection.getBusStopConnectionBusStopFrom(busLineConnection.busStopConnection.id);
                            busLineConnection.busStopConnection.busStopTo = BusStopConnection.getBusStopConnectionBusStopTo(busLineConnection.busStopConnection.id);
                            //BusStopConnection.showBusStopConnection(busStopConnection, map, $scope.polylines, $scope.colorVar);
                        });
                    });
                });
            });
        };
        vm.findAllBusLineConnections();

        vm.createBusLineConnection = function () {
            vm.busLineConnectionExist = false;
            //var savedBusLineConnection = {};
            angular.forEach(vm.busLineConnections, function (bLC) {
                if ((bLC.busLine.id == vm.newBusLineConnection.busLine.id &&
                        bLC.busStopConnection.id == vm.newBusLineConnection.busStopConnection.id &&
                        vm.busLineConnectionExist === false) || (bLC.busLine.id == vm.newBusLineConnection.busLine.id && bLC.busLineOrder == vm.newBusLineConnection.busLineOrder)) {
                    vm.busLineConnectionExist = true;
                    var tempFilterDef = vm.selectedBusLine;
                    vm.selectedBusLine = null;
                    $timeout(function () {
                        vm.busLineConnectionExist = null;vm.selectedBusLine = tempFilterDef;
                    }, 5000);
                }
            });
            if (vm.busLineConnectionExist === false) {
                BusLineConnection.save(vm.busLineConnections, vm.newBusLineConnection).then(function (savedBusLineConnection) {
                    BusLineConnection.getBusLineConnectionBusLinePromise(savedBusLineConnection.id).then(function (responseBusLine) {
                        savedBusLineConnection.busLine = responseBusLine;
                        BusLineConnection.getBusLineConnectionBusStopConnectionPromise(savedBusLineConnection.id).then(function (responseBusStopConnection) {
                            savedBusLineConnection.busStopConnection = responseBusStopConnection;
                            BusStopConnection.getBusStopConnectionBusStopFromPromise(savedBusLineConnection.busStopConnection.id).then(function (busStopFrom) {
                                savedBusLineConnection.busStopConnection.busStopFrom = busStopFrom;
                                BusStopConnection.getBusStopConnectionBusStopToPromise(savedBusLineConnection.busStopConnection.id).then(function (busStopTo) {
                                    savedBusLineConnection.busStopConnection.busStopTo = busStopTo;
                                    vm.busLineConnections.push(savedBusLineConnection);
                                    var tempFilterDef = vm.selectedBusLine;
                                    vm.selectedBusLine = null;
                                    $timeout(function () {
                                        vm.busLineConnectionExist = null;vm.selectedBusLine = tempFilterDef;
                                    }, 5000);
                                    
                                    
                                });
                            });
                        });
                    });
                });
            }
        };
    }
]);
