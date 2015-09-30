// Park Model
function Park(park) {
	var self = this;

	self.park = park;
	self.name = ko.observable(park.name);
	self.address = ko.observable(park.formatted_address);
	self.position = ko.observable(park.geometry.location);

	var marker = new google.maps.Marker({ //create the marker
	    position: self.position(),
	});

	self.marker = ko.observable(marker);
}

// ViewModel
function ViewModel() {
	var self = this;

	// Initialize a Google Map    
	var map = new google.maps.Map(document.getElementById('map'), {
			zoom: 12,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			center: {lat: 37.83493, lng: -122.12969},
	});

	self.map = map;

	//Create a list of Park objects
	self.parkList = ko.observableArray();

	// Get place data from Google Places Library
	var service = new google.maps.places.PlacesService(map);

	//Populate parkList with park model objects 
	data.parks.forEach(function(park, index) {
		var request = park.pid;
		service.getDetails(request, 
			function(place, status) {
				if (status == google.maps.places.PlacesServiceStatus.OK) {
					// Populate Park list with Park objects
					self.parkList.push( new Park(place) );
				}
			});
	});

	self.filter = ko.observable("");

	var infowindow = new google.maps.InfoWindow();
	self.infowindow = infowindow;
	
	// 
	self.display = function(clickedItem) {
		infowindow.setContent(clickedItem.name());
		infowindow.open(map, clickedItem.marker());
	}

	this.currentPark = ko.observable();
}

// Add 
ko.bindingHandlers.marker = {

	init: function(element, valueAccessor, allBindings, viewModel, bindingContext)  {
		var marker = valueAccessor(); 		//marker reference
		var map = bindingContext.$root.map; //map reference
		marker().setMap(map); 				//Add marker to the map
	},

	update: function(element, valueAccessor, allBindings, viewModel, bindingContext)  {
		var marker = valueAccessor(); 						//marker reference
		var map = bindingContext.$root.map; 				//map reference
		var markerName = allBindings().name(); 				//park name
		var filter = bindingContext.$root.filter(); 		//user input
		var infowindow = bindingContext.$root.infowindow; 	//info window

		// Marker Info Window 
		google.maps.event.addListener(marker(), 'click', function() {
		    infowindow.setContent(allBindings().name());
		    infowindow.open(map, this);
	    });

		// Filter Markers based on user input 
		if (markerName.toLowerCase().indexOf(filter) < 0 ) {
			marker().setMap(null);	//remove marker from view
		} else {
			marker().setMap(map); 	//replace marker
		}
	}
}

ko.applyBindings(new ViewModel()); 