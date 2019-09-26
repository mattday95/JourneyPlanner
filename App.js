(function() {
	
	var journeyApp = {
	
		init: function() {
			this.cacheDOM();
			this.initAutocompleteFields();
			this.initDatePicker();
			this.setListeners();
		},
		
		initDatePicker : function() {
	
			var fields = this.cachedProps.dateFields;
			var picker = [];
		
			fields.forEach(function(field, index){
				picker[index] = new Pikaday({ field: field });
			});
		},
		
		cacheDOM : function() {
			
			this.cachedProps = {
				name : document.getElementById('name'),
				email : document.getElementById('email'),
				phone : document.getElementById('phone'),
				dateFields : document.querySelectorAll('.date-picker'),
				from :  document.getElementById('from-loc'),
				fromNoEdit :  document.getElementById('from-no-edit'),
				via :  document.getElementById('via-loc'),
				viaNoEdit :  document.getElementById('via-no-edit'),
				to :  document.getElementById('to-loc'),
				toNoEdit :  document.getElementById('to-no-edit'),
				autocompleteFields : document.querySelectorAll('.autocomplete-field')
			};
		},
		
		animateToStage : function(i) {
			$('.app-stage').removeClass('stage-active');
			$('.app-stage-' + i).addClass('stage-active');
		},
		
		validationStage1 : function() {
			
			this.extractCustomerData();
				
			if(this.customerIsValid()){
				this.animateToStage(2);
			}
		},
		
		validationStage2 : function() {
			
			if (this.journeyIsValid()){
				this.setLocations();
				this.calculateAndDisplayRoute();
				this.animateToStage(3);
			}
		},
			
		setLocations : function() {
				this.cachedProps.fromNoEdit.value = this.cachedProps.from.value;
				this.cachedProps.viaNoEdit.value = this.cachedProps.via.value;
				this.cachedProps.toNoEdit.value = this.cachedProps.to.value;
		},
		
		swapFields : function() {
			
			var fromOld = this.cachedProps.from.value;
			var toOld = this.cachedProps.to.value;
			this.cachedProps.from.value = toOld;
			this.cachedProps.to.value = fromOld;
		},
	
		setListeners : function() {
		
			$('#next-1').click(this.validationStage1.bind(this));

			$('#prev-1').click(function(){
				this.animateToStage(1);
			}.bind(this));

			$('#prev-2').click(function(){
				this.animateToStage(2);
			}.bind(this));

			$('button.get-fare').click(this.validationStage2.bind(this));
	
			$('#one-way').click(function(){
				$('#return').prop('checked', false);
				$('.journey-date-time-row:last-of-type .app-input-field:nth-of-type(2)').addClass('hide-element');
				$('.journey-date-time-row:last-of-type .app-input-field:last-of-type').addClass('hide-element');
			});
	
			$('#return').click(function(){
				$('#one-way').prop('checked', false);
				$('.journey-date-time-row:last-of-type .app-input-field:nth-of-type(2)').removeClass('hide-element');
				$('.journey-date-time-row:last-of-type .app-input-field:last-of-type').removeClass('hide-element');
			});	
	
			$('span.swap-icon').click(this.swapFields.bind(this));
		},
		
	
		extractCustomerData : function() {
		
			var customerData = {

				name : this.cachedProps.name.value,
				email : this.cachedProps.email.value,
				phone : this.cachedProps.phone.value
			};
		
			this.customerData = customerData;
		},
	
		customerIsValid : function() {
			
			var regExStrings = defineRegEx();
			var validFields = 0;
			
			for (var property in regExStrings) {
				
				if (regExStrings.hasOwnProperty(property)) {
					
					if (regExStrings[property].test(this.customerData[property])) {
						$('span#' + property + '-error').removeClass('message-active');
						validFields++;
					}
					else {
						$('span#' + property + '-error').addClass('message-active');
					}
				}
			}
			
			return (validFields === Object.keys(regExStrings).length ? true : false);
		},
	
		journeyIsValid : function() {
			if (this.locationIsValid() && this.datesTimeIsValid()){
				return true;
			}
			else {
				return false;
			}
		},
	
		locationIsValid : function() {
			var locations = ['from', 'to'];
			var validFields = 0;
			var i;
			
			for (i = 0; i < locations.length; i++) { 
  				if (document.getElementById(locations[i] + '-loc').value === ""){
					$('span#' + locations[i] + '-loc-error').addClass('message-active');
				}
				
				else {
					$('span#' + locations[i] + '-loc-error').removeClass('message-active');
					validFields++;
				}
			}
			
			return (validFields === locations.length ? true : false);
		},
	
		datesTimeIsValid : function() {
			
			var outboundDateTime;
			var returnDateTime;
			var now = new Date();
			
			if (document.getElementById("outbound-date").value === ""){
				$('span#date-time-error').addClass('message-active');
				$('span#date-time-error').text("Please supply an outbound date");
				return false;
			}
			
			else {
				$('span#date-time-error').removeClass('message-active');
				outboundDateTime = document.getElementById("outbound-date").value + ' ' + document.getElementById("outbound-time-hours").value + ':' + document.getElementById("outbound-time-mins").value;
				if (Date.parse(outboundDateTime) < now){
					$('span#date-time-error').addClass('message-active');
					$('span#date-time-error').text("Outbound dates cannot be in the past");
					return false;
				}
				else {
					$('span#date-time-error').removeClass('message-active');
				}
			}
				
			if($('#return').is(':checked')) { 
				if (document.getElementById("return-date").value === ""){
					$('span#date-time-error').addClass('message-active');
					$('span#date-time-error').text("Please supply a return date");
					return false;
				}
				else {
					$('span#date-time-error').removeClass('message-active');
					returnDateTime = document.getElementById("return-date").value + ' ' + document.getElementById("return-time-hours").value + ':' + document.getElementById("return-time-mins").value;
					if (Date.parse(returnDateTime) <= Date.parse(outboundDateTime)){
						$('span#date-time-error').text("Return time cannot be before outbound time");
					    return false;
					}
					else {
						return true;
					}
				}
			}
			
			else {
				return true;
			}
		},
	
		initAutocompleteFields : function() {
			
			var input = [];
			var i;
			var autocompleteFields = this.cachedProps.autocompleteFields;

			for (i = 0; i < autocompleteFields.length; i++) { 
  				input[i] = new google.maps.places.Autocomplete(autocompleteFields[i]);
			}
		},
	
		setMap : function() {
			
			this.directionsDisplay = new google.maps.DirectionsRenderer;
			
			this.map = new google.maps.Map(document.getElementById('app-map'), {
			  zoom: 6,
			  center: {lat: 53.3781, lng: -1},
			  styles: [
					{elementType: 'geometry', stylers: [{color: '#242f3e'}]},
					{elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
					{elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
					{
					  featureType: 'administrative.locality',
					  elementType: 'labels.text.fill',
					  stylers: [{color: '#d59563'}]
					},
					{
					  featureType: 'poi',
					  elementType: 'labels.text.fill',
					  stylers: [{color: '#d59563'}]
					},
					{
					  featureType: 'poi.park',
					  elementType: 'geometry',
					  stylers: [{color: '#263c3f'}]
					},
					{
					  featureType: 'poi.park',
					  elementType: 'labels.text.fill',
					  stylers: [{color: '#6b9a76'}]
					},
					{
					  featureType: 'road',
					  elementType: 'geometry',
					  stylers: [{color: '#38414e'}]
					},
					{
					  featureType: 'road',
					  elementType: 'geometry.stroke',
					  stylers: [{color: '#212a37'}]
					},
					{
					  featureType: 'road',
					  elementType: 'labels.text.fill',
					  stylers: [{color: '#9ca5b3'}]
					},
					{
					  featureType: 'road.highway',
					  elementType: 'geometry',
					  stylers: [{color: '#746855'}]
					},
					{
					  featureType: 'road.highway',
					  elementType: 'geometry.stroke',
					  stylers: [{color: '#1f2835'}]
					},
					{
					  featureType: 'road.highway',
					  elementType: 'labels.text.fill',
					  stylers: [{color: '#f3d19c'}]
					},
					{
					  featureType: 'transit',
					  elementType: 'geometry',
					  stylers: [{color: '#2f3948'}]
					},
					{
					  featureType: 'transit.station',
					  elementType: 'labels.text.fill',
					  stylers: [{color: '#d59563'}]
					},
					{
					  featureType: 'water',
					  elementType: 'geometry',
					  stylers: [{color: '#17263c'}]
					},
					{
					  featureType: 'water',
					  elementType: 'labels.text.fill',
					  stylers: [{color: '#515c6d'}]
					},
					{
					  featureType: 'water',
					  elementType: 'labels.text.stroke',
					  stylers: [{color: '#17263c'}]
					}
          		]
				
			});
			
			this.directionsDisplay.setMap(this.map);
		},
		
		calculateFare : function(){
			
			var ppermile = 50;
			var distanceMeters = 0;
			var timeSeconds = 0;
			var distanceMiles;
			var timeMins;
			var i;
			
			var legs = this.routeData.routes[0].legs;
			
			for ( i = 0; i < legs.length; i++ ){
				
				distanceMeters += legs[i].distance.value;
				timeSeconds += legs[i].duration.value;
				
			}
			
			distanceMiles = round(distanceMeters * 0.000621371, 1);
			timeMins = round(timeSeconds / 60);
			
			var quote = round(distanceMiles * ppermile * 1/100, 2);
			
			$('span#journey-length').text(distanceMiles + ' miles');
			$('span#journey-time').text(timeMins + ' mins');
			$('span#journey-quote').text('£' + quote);
		},
	
		calculateAndDisplayRoute : function() {
			
			this.setMap();
			
			this.directionsService = new google.maps.DirectionsService;
			
			if (!(this.cachedProps.via.value == "")){
				var waypts = [];
				waypts.push({
					location: this.cachedProps.via.value,
					stopover: true
				});
			}

			this.directionsService.route({
				
				  origin: this.cachedProps.from.value,
				  destination: this.cachedProps.to.value,
				  waypoints: waypts,
				  optimizeWaypoints: true,
				  travelMode: 'DRIVING'
				
			}, function(response, status) {
				  if (status === 'OK') {
					this.directionsDisplay.setDirections(response);
					this.routeData = response;
					this.calculateFare();
				  } else {
					window.alert('Directions request failed due to ' + status);
				  }
			}.bind(journeyApp));
		}
};

	
journeyApp.init();

	
})();



	
			
