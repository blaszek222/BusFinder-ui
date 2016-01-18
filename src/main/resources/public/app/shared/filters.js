var filters = angular.module('filters', []);

filters.filter('personFullnameFilter', function() {
    
    return function(people, inputname) {
        var filteredArray = [];
        
        if (inputname === undefined || inputname === "") {
            return people;
        }
        
        angular.forEach(people, function(person) {
            fullname = (person.firstName + " " + person.lastName).toLowerCase().escapeDiacritics();
            revertedFullname = (person.lastName + " " + person.firstName).toLowerCase().escapeDiacritics();
            lastname = person.lastName.toLowerCase().escapeDiacritics();
            input = inputname.toLowerCase().escapeDiacritics();
            
            if (fullname.indexOf(input) === 0 ||
                lastname.indexOf(input) === 0 ||
                revertedFullname.indexOf(input) === 0) {
                filteredArray.push(person);
            }
        });
        return filteredArray;
    };
});


String.prototype.escapeDiacritics = function() {
    return  this.replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e')
                .replace(/ł/g, 'l').replace(/ń/g, 'n').replace(/ó/g, 'o')
                .replace(/ś/g, 's').replace(/ż/g, 'z').replace(/ź/g, 'z');
};


filters.filter('filterPeopleWithoutRoom', function(){
    
    return function(items){
        var arrayToReturn = [];   
        if(items.length < 1)
            return [];
        for (var i=0; i<items.length; i++){
            if (!items[i].hasRoom) {
                arrayToReturn.push(items[i]);
            }
        }
        return arrayToReturn;
    };
});
