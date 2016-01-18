"use strict";
var controllers = angular.module('controllers', []);

controllers.controller('MapController', ["$scope", 'Map', 'BusStop', 'BusLine', 'BusStopConnection', 'BusLineConnection', 'Notifications', 'Timetable', 'NgMap', '$timeout',
    function ($scope, Map, BusStop, BusLine, BusStopConnection, BusLineConnection, Notifications, Timetable, NgMap, $timeout) {
        var vm = this;
    
        vm.active = {};
        vm.selectedBusLine = null;
        vm.busStops = [];
        vm.busLines = [];
        vm.busStopConnections = [];
        vm.timetables = [];
        vm.busStopConnectionCreationAvaliability = null;
        vm.busLineConnectionExist = null;
        vm.busStopCreationAvaliability = false;
        vm.addingBusStopToBusLineAvliability = null;
        vm.searchingRouteAvailability = null;
        vm.foundRouteConnections = [];
        vm.searchedBusStop = null;
        vm.selectedBusLineBusStop = null;
        vm.searchedBusLineBusStops = [];
        vm.searchedBusStopTimetables = [];
        vm.searchingMode = {};
        
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
            if(vm.searchingMode == 'busLine'){
                vm.selectedBusLineBusStop = busStop;
            }else{
                if(vm.searchingMode == 'busStop'){
                    vm.searchedBusStop = busStop;
                }
            }
            
            if(busStop.position == undefined){
                busStop.position = [busStop.latitude, busStop.longitude];
                busStop.id = busStop.id.toString();
            }
            
            vm.active = busStop;
            vm.findActiveBusStopBusLines();
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
                Notifications.showNotification("<strong>Informacja : </strong>Aby utworzyć przystanek kliknij w dowolnym miejscu na mapie a nastepnie wybierz jego nazwę i kliknij przycisk Save aby go zapisać", "info", 10000);
            } else {
                vm.busStopCreationAvaliability = false;
                vm.newBusStop.position = null;
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
        
        vm.crateBusLinesAvaliabilityOnSearchedRouteArray = function(){
                vm.busLinesAvaliabilityOnSearchedRouteArray = {};
                vm.busLinesAvaliabilityOnSearchedRouteArraySum = {};
                var i =0;
                angular.forEach(vm.foundRouteConnections, function(foundRouteConnection){
                    vm.busLinesAvaliabilityOnSearchedRouteArraySum[i] = 0;
                    i++;
                });
                angular.forEach(vm.busLines, function(busLine){
                   vm.inner = {};
                   i = 0;
                   angular.forEach(vm.foundRouteConnections, function(foundRouteConnection){
                      
                       var keepGoing = true;
                       vm.inner[i] = 0;

                       angular.forEach(vm.busLineConnections, function(busLineConnection){ 
                           if(keepGoing === true){
                                if(busLineConnection.busStopConnection.id == foundRouteConnection.id && busLineConnection.busLine.id == busLine.id){
                                    vm.inner[i] = 1;
                                    vm.busLinesAvaliabilityOnSearchedRouteArraySum[i]++;
                                    keepGoing = false;
                                }                             
                            }
                            
                       });
                       i++;
                   });
                   vm.busLinesAvaliabilityOnSearchedRouteArray[busLine.id] = vm.inner;
                   console.log(busLine.number, ':', vm.inner)
                });
                console.log('suma:', vm.busLinesAvaliabilityOnSearchedRouteArraySum)
                vm.connectionExist = true;
                if(vm.foundRouteConnections.length > 0){
                    angular.forEach(vm.busLinesAvaliabilityOnSearchedRouteArraySum, function(sumItem){
                        if(sumItem == 0){
                            vm.connectionExist = false;
                        }
                    });                    
                }else{
                    vm.connectionExist = false;
                }

                console.log(vm.connectionExist, Object.keys(vm.busLinesAvaliabilityOnSearchedRouteArraySum).length)
                vm.determineBusLinesForFoundRoute();
        };        
        
        vm.findConnection = function(){
            if(vm.searchedConnection.searchingType === "distance"){
                vm.findShortestDistanceConnection();
            }else{
                if(vm.searchedConnection.searchingType === "minimumBusStops"){
                    vm.findSmallestBusStopsAmountConnection();
                }else{
                    vm.findDirectConnection();
                }
            }
        };
        
        vm.highlightRoute = function(){
            vm.foundRouteConnections = [];
            vm.createFoundRouteConnectionsArray();
            vm.setDefaultConnectionsColor();
            angular.forEach(vm.foundRouteConnections, function(foundRouteConnection){
                vm.map.shapes[foundRouteConnection.id].setMap(null);
                vm.map.shapes[foundRouteConnection.id].strokeColor = 'blue';
                vm.map.shapes[foundRouteConnection.id].setMap(vm.map);                
            });
        };
            
        vm.createFoundRouteConnectionsArray = function(){
            var currentNode = {};
            currentNode = vm.searchedConnection.busStopTo.id;

            while(vm.nodesPreviousNodeP[currentNode] != -1){
                angular.forEach(vm.busStopConnections, function(busStopConnection){
                   if(busStopConnection.busStopFrom.id == vm.nodesPreviousNodeP[currentNode] && busStopConnection.busStopTo.id == currentNode){
                        vm.foundRouteConnections.unshift(busStopConnection);
                        currentNode = vm.nodesPreviousNodeP[currentNode];
                   } 
                });                    
            }               
            console.log(vm.foundRouteConnections)
            vm.crateBusLinesAvaliabilityOnSearchedRouteArray();
        };  
        
        vm.determineBusLinesForFoundRoute = function(){
            vm.travelDirections = [];
            var travelDirection;
            var complete = true;
            function resetTravelDirection(){
                travelDirection = {
                    from: null,
                    to: null,
                    busLine: null
                }
            };
            function getFirst(data) {
                for (var prop in data)
                    return prop;
            } 
            resetTravelDirection();
            var index = 0;
            var availableBusLines = [];
            function busLineAvaliabilityOnFirstConnection(index){
                for(var key in vm.busLinesAvaliabilityOnSearchedRouteArray){
                    if(vm.busLinesAvaliabilityOnSearchedRouteArray[key][index] == 1){
                        availableBusLines[key] = key;
                    }
                }  
            }
            
            while((index) < vm.foundRouteConnections.length){
                //console.log('while')
                if(travelDirection.from === null){travelDirection.from = index;}
                if(Object.keys(availableBusLines).length == 0){
                    busLineAvaliabilityOnFirstConnection(index)
                    travelDirection.distance = vm.foundRouteConnections[index].distance;
                }
                if(Object.keys(availableBusLines).length == 0){index = vm.foundRouteConnections.length}
                //console.log(Object.keys(availableBusLines).length, availableBusLines, vm.foundRouteConnections.length)
                if((index+1) == vm.foundRouteConnections.length){index++}
                while((Object.keys(availableBusLines).length >= 1) && ((index+1) < vm.foundRouteConnections.length)){
                    //console.log('while inside')
                    index++;  
                    if(Object.keys(availableBusLines).length > 0){travelDirection.distance += vm.foundRouteConnections[index].distance;}
                    angular.forEach(availableBusLines, function(availableBusLine){
                        if(vm.busLinesAvaliabilityOnSearchedRouteArray[availableBusLine][index] == 0){
                            if(Object.keys(availableBusLines).length == 1){
                                travelDirection.to = index-1;
                                travelDirection.busLine = getFirst(availableBusLines)
                                travelDirection.distance -= vm.foundRouteConnections[index].distance;
                                vm.travelDirections.push(travelDirection);
                                resetTravelDirection();
                                availableBusLines = [];
                                console.log('travel directions', vm.travelDirections)
                            }
                            delete availableBusLines[availableBusLine];
                            
                        }
                    })
                    //console.log(availableBusLines)          
                }
                if((index) == vm.foundRouteConnections.length){
                    
                                travelDirection.to = index-1;
                                travelDirection.busLine = getFirst(availableBusLines)
                                vm.travelDirections.push(travelDirection);
                                resetTravelDirection();
                                availableBusLines = [];
                                console.log('travel directions', vm.travelDirections)                    
                }               
            }
            vm.determineBusLinesArriveTimesForFoundConnection(vm.travelDirections);
        }; 
        
        vm.determineBusLinesArriveTimesForFoundConnection = function(travelDirections){
            vm.date = new Date();
            vm.currentTime_minutes = vm.date.getMinutes();
            vm.currentTime_hour = vm.date.getHours(); 
            
            console.log(vm.timetables)
            angular.forEach(travelDirections, function(travelDirection, index){
                travelDirection.hour = null;
                travelDirection.minute =   null;
                if(vm.foundRouteConnections.length > 0){
                    travelDirection.fromTemp = vm.foundRouteConnections[travelDirection.from].busStopFrom;
                    travelDirection.toTemp = vm.foundRouteConnections[travelDirection.to].busStopTo;               
                    travelDirection.from = vm.foundRouteConnections[travelDirection.from].busStopFrom.id;
                    travelDirection.to = vm.foundRouteConnections[travelDirection.to].busStopTo.id;                    
                }

                var found = false;

                angular.forEach(vm.timetables, function(timetable){
                    if(timetable.busLine.id == travelDirection.busLine && timetable.busStop.id == travelDirection.from){
                        if(travelDirection.hour == null){
                            if((timetable.time_hour == vm.currentTime_hour && timetable.time_minute >= vm.currentTime_minutes) || 
                                (timetable.time_hour > vm.currentTime_hour)){
                                    travelDirection.hour = timetable.time_hour;
                                    travelDirection.minute = timetable.time_minute;
                            }
                        }else{
                            if(timetable.time_hour >= vm.currentTime_hour && timetable.time_hour <= travelDirection.hour){
                                if(timetable.time_hour == vm.currentTime_hour){
                                    if(timetable.time_hour == travelDirection.hour){
                                        if(timetable.time_minute > vm.currentTime_minutes && timetable.time_minute < travelDirection.minute){
                                            travelDirection.hour = timetable.time_hour;
                                            travelDirection.minute = timetable.time_minute;
                                        }
                                    }else{
                                        if(timetable.time_minute > vm.currentTime_minutes){
                                            travelDirection.hour = timetable.time_hour;
                                            travelDirection.minute = timetable.time_minute;
                                        }                                         
                                    }
                                }else{
                                    if(timetable.time_hour == travelDirection.hour){
                                        if(timetable.time_minute < travelDirection.minute){
                                            travelDirection.hour = timetable.time_hour;
                                            travelDirection.minute = timetable.time_minute;
                                        } 
                                    }else{
                                        travelDirection.hour = timetable.time_hour;
                                        travelDirection.minute = timetable.time_minute;                                        
                                    }
                                }
                            }
                        }
                    }
                })

                if (travelDirection.hour != null && vm.foundRouteConnections.length > 0) {
                    vm.currentTime_minutes = travelDirection.minute;
                    vm.currentTime_hour = travelDirection.hour;
                }
                
                if(vm.foundRouteConnections.length > 0){
                    vm.timeDif = Math.ceil(travelDirection.distance / 300);
                }else{
                    vm.timeDif = 0;
                }
                
                console.log(vm.timeDif)
                vm.currentTime_minutes += vm.timeDif;
                if(vm.currentTime_minutes >59){
                    vm.currentTime_minutes -= 60;
                    vm.currentTime_hour++;
                }

                angular.forEach(vm.busLines, function(busLine){
                    if(busLine.id == travelDirection.busLine && found == false){
                        travelDirection.busLine = busLine.number;
                        found = true;
                    }
                });  
                travelDirection.from =  travelDirection.fromTemp;
                travelDirection.to = travelDirection.toTemp;
               
            });  
            
        };
        
        vm.findDirectConnection = function(){
            vm.foundRouteConnections = [];
            vm.travelDirections = [];
            var fromMatch = {};
            var toMatch = {};
            var foundLinesForDirectConnection = [];
            //var foundLine = false;
            angular.forEach(vm.busLines, function(busLine){
        //        if(foundLine == false){
                    toMatch = {};
                    fromMatch = {};
                    angular.forEach(vm.busLineConnections, function(busLineConnection){

                            if(busLine.id == busLineConnection.busLine.id && busLineConnection.busStopConnection.busStopFrom.id == vm.searchedConnection.busStopFrom.id){
                                fromMatch = busLine.id;
                            } 
                            if(busLine.id == busLineConnection.busLine.id && busLineConnection.busStopConnection.busStopTo.id == vm.searchedConnection.busStopTo.id){
                                toMatch = busLine.id;
                            }  

                    });
           //     }                
                if(toMatch  != {} && fromMatch != {} && toMatch == fromMatch){
                    foundLinesForDirectConnection.push(busLine.id)
                    vm.connectionExist = true;
                    //foundLine = true;
                }
            });
            console.log(foundLinesForDirectConnection)

            var travelDirection;
            function resetTravelDirection(){
                travelDirection = {
                    from: null,
                    to: null,
                    busLine: null
                }
            };
            angular.forEach(foundLinesForDirectConnection, function(foundLine){
                resetTravelDirection();
                travelDirection = {
                    from: vm.searchedConnection.busStopFrom.id,
                    to: vm.searchedConnection.busStopTo.id,
                    busLine: foundLine
                }
                vm.travelDirections.push(travelDirection); 
            });
            
            vm.selectedBusLine = vm.travelDirections[0].busLine;
            vm.determineBusLinesArriveTimesForFoundConnection(vm.travelDirections)
            
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
            vm.busStopConnectionCreationAvaliability = true;
            var savedBusStopConnection = {};
            angular.forEach(vm.busStopConnections, function (bSC) {
                if (bSC.busStopFrom.id == vm.newBusStopConnection.busStopFrom.id && bSC.busStopTo.id == vm.newBusStopConnection.busStopTo.id && vm.busStopConnectionCreationAvaliability === true) {
                    vm.busStopConnectionCreationAvaliability = false;
                    Notifications.showNotification("<strong>Błąd! </strong>Połączenie pomiędzy podanymi przystankami już istnieje ! Wybierz inne przystanki", "danger", 5000);
                }
                if(vm.newBusStopConnection.busStopFrom.id == vm.newBusStopConnection.busStopTo.id && vm.busStopConnectionCreationAvaliability === true){
                    vm.busStopConnectionCreationAvaliability = false;
                    Notifications.showNotification("<strong>Błąd! </strong>Wybrano taki sam przystanek początkowy i końcowy ! Wybierz inne przystanki", "danger", 5000);
                }
            });
            if (vm.busStopConnectionCreationAvaliability === true) {
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
                            Notifications.showNotification("<strong>Sukces! </strong>Udało się utworzyć połączenie pomiędzy podanymi przystankami", "success", 5000);
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
                    Notifications.showNotification("<strong>Błąd! </strong>Linia o takiej nazwie juz istnieje! Wybierz inna nazwę", "danger", 5000);
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
                            Notifications.showNotification("<strong>Sukces! </strong>Udało się utworzyc linie autobusową", "success", 5000);
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
                        Notifications.showNotification("<strong>Błąd! </strong>Wybrana linia posiada już ten przystanek !", "danger", 5000);
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
                        Notifications.showNotification("<strong>Sukces! </strong>Udało się dodać przystanek do linii", "success", 5000);
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
                Notifications.showNotification("<strong>Sukces! </strong>Udało się utworzyć przystanek", "success", 5000);
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
            $scope.$watch('vm.searchedBusStop', function () {
                if(vm.searchedBusStop != null){
                     vm.showDetail(null, vm.searchedBusStop);
                     vm.findAvailableTimetablesForSearchedBusStop();
                }
               
            });
        });     
        
        angular.element(document).ready(function () {
            $scope.$watch('vm.selectedBusLine', function () {
                var busStop = {};
                if(vm.selectedBusLine != null){
                    vm.setDefaultConnectionsColor();
                    
                    angular.forEach(vm.busLineConnections, function (busLineConnection) {
                        if (busLineConnection.busLine.id == vm.selectedBusLine) {
                            vm.map.shapes[busLineConnection.busStopConnection.id].setMap(null);
                            vm.map.shapes[busLineConnection.busStopConnection.id].strokeColor = 'blue';
                            vm.map.shapes[busLineConnection.busStopConnection.id].setMap(vm.map);
                        }
                    });                    
                    vm.searchedBusLineBusStops = [];
                    angular.forEach(vm.busLineConnections, function(busLineConnection, index){
                        //console.log(busLineConnection)
                       if(vm.selectedBusLine == busLineConnection.busLine.id){
                            busStop = {};
                            busStop = {
                                id: busLineConnection.busStopConnection.busStopTo.id.toString(),
                                name: busLineConnection.busStopConnection.busStopTo.name,
                                position: [busLineConnection.busStopConnection.busStopTo.latitude, busLineConnection.busStopConnection.busStopTo.longitude],
                                
                            };
                            vm.searchedBusLineBusStops[busLineConnection.busLineOrder] = busStop;
                            if(busLineConnection.busLineOrder == 1){
                                busStop = {};
                                busStop = {
                                    id: busLineConnection.busStopConnection.busStopFrom.id.toString(),
                                    name: busLineConnection.busStopConnection.busStopFrom.name,
                                    position: [busLineConnection.busStopConnection.busStopFrom.latitude, busLineConnection.busStopConnection.busStopTo.longitude],

                                };                                
                                vm.searchedBusLineBusStops[0] = busStop;
                            }                           
                       }
                    });
                    //console.log(vm.busStops[0])
                    
                    //console.log(vm.searchedBusLineBusStops)
                }
            });
        });    
        
        angular.element(document).ready(function () {
            $scope.$watch('vm.selectedBusLineBusStop', function () {
                if(vm.selectedBusLineBusStop != null){
                    console.log(vm.selectedBusLineBusStop)
                    vm.showDetail(null, vm.selectedBusLineBusStop);
                    vm.findAvailableTimetablesForSelectedBusLineBusStop();
                }
                
               
            });
        });         
        
        vm.findAvailableTimetablesForSearchedBusStop = function(){
            //vm.searchingMode = 'busStop';
            console.log('stop')
            vm.searchedBusStopTimetables = [];
            vm.date = new Date();
            vm.currentTime_minutes = vm.date.getMinutes();
            vm.currentTime_hour = vm.date.getHours();
            var sumCurrent = vm.currentTime_hour*60+vm.currentTime_minutes;
            var sumTimetableTime = 0;
            angular.forEach(vm.timetables, function(timetable){
                sumTimetableTime = timetable.time_hour*60+timetable.time_minute;
                if(timetable.busStop.id == vm.searchedBusStop.id && sumCurrent <= sumTimetableTime){
                    vm.searchedBusStopTimetables.push(timetable);
                } 
            });
        };
        
        vm.findAvailableTimetablesForSelectedBusLineBusStop = function(){
            console.log('line')
            //vm.searchingMode = 'busLine';
            vm.searchedBusStopTimetables = [];
            vm.date = new Date();
            vm.currentTime_minutes = vm.date.getMinutes();
            vm.currentTime_hour = vm.date.getHours();
            var sumCurrent = vm.currentTime_hour*60+vm.currentTime_minutes;
            var sumTimetableTime = 0;            
            angular.forEach(vm.timetables, function(timetable){
               sumTimetableTime = timetable.time_hour*60+timetable.time_minute;
               if(timetable.busStop.id == vm.selectedBusLineBusStop.id && timetable.busLine.id == vm.selectedBusLine && sumCurrent <= sumTimetableTime){
                    
                    //if(timetable.time_hour<10){timetable.time_hour = '0'+ timetable.time_hour.toString();}
                    //if(timetable.time_minute<10){timetable.time_minute = '0'+ timetable.time_minute.toString();}
                    vm.searchedBusStopTimetables.push(timetable);
               } 
            });
        }; 
        vm.findActiveBusStopBusLines = function(){
            vm.active.busLines = [];
            angular.forEach(vm.busLineConnections, function(busLineConnection){
               if(busLineConnection.busStopConnection.busStopFrom.id == vm.active.id){
                   vm.active.busLines.push(busLineConnection.busLine);
               } 
            });
        };

        vm.findAllBusLineConnections = function () {
            BusLineConnection.findAll().then(function (response) {
                vm.busLineConnections = response;
                angular.forEach(vm.busLineConnections, function (busLineConnection) {
                    BusLineConnection.getBusLineConnectionBusLinePromise(busLineConnection.id).then(function (responseBusLine) {
                        busLineConnection.busLine = responseBusLine;
                        BusLineConnection.getBusLineConnectionBusStopConnectionPromise(busLineConnection.id).then(function (responseBusStopConnection) {
                            busLineConnection.busStopConnection = responseBusStopConnection;
                            BusStopConnection.getBusStopConnectionBusStopFromPromise(busLineConnection.busStopConnection.id).then(function(responseBusStopConnectionBusStopFrom){
                                busLineConnection.busStopConnection.busStopFrom = responseBusStopConnectionBusStopFrom;
                                busLineConnection.busStopConnection.busStopFrom.position =  [busLineConnection.busStopConnection.busStopFrom.latitude, busLineConnection.busStopConnection.busStopFrom.longitude];
                            })
                            
                            BusStopConnection.getBusStopConnectionBusStopToPromise(busLineConnection.busStopConnection.id).then(function(responseBusStopConnectionBusStopTo){
                                busLineConnection.busStopConnection.busStopTo = responseBusStopConnectionBusStopTo;
                                busLineConnection.busStopConnection.busStopTo.position = [busLineConnection.busStopConnection.busStopTo.latitude, busLineConnection.busStopConnection.busStopTo.longitude];
                            });
                            
                            //console.log(busLineConnection)
                        });
                    });
                });
            });
        };
        vm.findAllBusLineConnections();

        vm.createBusLineConnection = function () {
            vm.busLineConnectionExist = false;
            console.log(vm.newBusLineConnection)
            //var savedBusLineConnection = {};
            angular.forEach(vm.busLineConnections, function (bLC) {
                if (bLC.busLine.id == vm.newBusLineConnection.busLine.id && bLC.busStopConnection.id == vm.newBusLineConnection.busStopConnection.id && vm.busLineConnectionExist === false) {
                    vm.busLineConnectionExist = true;
                    Notifications.showNotification("<strong>Błąd! </strong>Ta linia posiada już to połączenie", "danger", 5000);
                }
                if(bLC.busLine.id == vm.newBusLineConnection.busLine.id && bLC.busLineOrder == vm.newBusLineConnection.busLineOrder && vm.busLineConnectionExist === false){
                    vm.busLineConnectionExist = true;
                    Notifications.showNotification("<strong>Błąd! </strong>Ten numer kolejności połączenia dla tej linii jest już zajęty! Wybierz inny numer", "danger", 5000);                    
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
                                    Notifications.showNotification("<strong>Sukces! </strong>Udało się dodać połączenie dla linii autobusowej", 'success', 5000);
                                    var tempFilterDef = vm.selectedBusLine;
                                    vm.selectedBusLine = null;
                                    $timeout(function () {
                                        vm.busLineConnectionExist = null;
                                        vm.selectedBusLine = tempFilterDef;
                                    }, 1000);
                                    
                                    console.log(vm.newBusLineConnection)
                                });
                            });
                        });
                    });
                });
            }
        };
        vm.findAllTimetables = function(){
            Timetable.findAll().then(function(response){
                vm.timetables = response;
                angular.forEach(vm.timetables, function(timetable){
                   Timetable.getTimetableBusStopPromise(timetable.id).then(function(responseBusStop){
                      timetable.busStop = responseBusStop;
                      Timetable.getTimetableBusLinePromise(timetable.id).then(function(responseBusLine){
                          timetable.busLine = responseBusLine;
                      });
                   }); 
                });
                console.log(vm.timetables)
            });
        };
        vm.findAllTimetables();
        
        vm.saveNewTimetable = function(){
            vm.newTimetable.busStop = vm.newTimetable.busStop.id;
            vm.newTimetable.busLine = vm.newTimetable.busLine.id;
            //vm.newTimetable1.busLine = vm.newTimetable.busLine;
            var busLineConnectionsToSave = {};
            var timeDif = 0;
            var hour = vm.newTimetable.time_hour;
            var minute = vm.newTimetable.time_minute;
            angular.forEach(vm.busLineConnections, function(busLineConnection){
                if(busLineConnection.busLine.id == vm.newTimetable.busLine){
                    busLineConnectionsToSave[busLineConnection.busLineOrder] = busLineConnection;
                }
            });
            console.log(busLineConnectionsToSave)
            Timetable.save(vm.timetables, vm.newTimetable).then(function (savedTimetable) {
               Timetable.getTimetableBusStopPromise(savedTimetable.id).then(function(responseBusStop){
                  savedTimetable.busStop = responseBusStop;
                  Timetable.getTimetableBusLinePromise(savedTimetable.id).then(function(responseBusLine){
                      savedTimetable.busLine = responseBusLine;
                      vm.timetables.push(savedTimetable)
                      Notifications.showNotification("<strong>Sukces! </strong>Udało się dodac pozycje do rozkladu jazdy", "success", 5000);
                  });
               });                 
               
                //for(var key in busLineConnectionsToSave){
//                    timeDif = Math.ceil(busLineConnectionsToSave[key].busStopConnection.distance / 300);
//                    minute = minute+timeDif;
//                    if(minute >59){
//                        minute = minute - 60;
//                        hour++;
//                    }
//                    vm.newTimetable1.busStop = busLineConnectionsToSave[key].busStopConnection.busStopTo.id
//                    vm.newTimetable1.time_minute = minute;
//                    vm.newTimetable1.time_hour = hour;
//                    
//                    
//                    //console.log(vm.newTimetable)
//                    Timetable.save(vm.timetables, vm.newTimetable1)

                    //console.log(timeDif, ' - ', hour,':',minute, busLineConnectionsToSave[key].busStopConnection.busStopTo.id)
                //}                
                //Notifications.showNotification("<strong>Sukces! </strong>Udało się dodac pozycje do rozkladu jazdy", "success", 5000);
            });
            //console.log(busLineConnectionsToSave)
        };
        

        
        
        
    }
]);
