

var fare = (function() {
	
	var rates = [
		
		{
			name : 'Rate 1',
			id : 1,
			description : 'Monday to Friday (6.00 am to 8.00 pm)',
			initialCharge : 3.00,
			oneMile : 3.80,
			additionalMiles : 1.60
		}, 
			
		{
			name : 'Rate 2',
			id : 2,
			description : 'Monday to Thursday (8.00 pm to 6.00 am)',
			initialCharge : 3.40,
			oneMile : 4.20,
			additionalMiles : 1.60
		}, 
		
		{
			name : 'Rate 3',
			id : 3,
			description : 'Fri, Sat, Sun (8.00 pm to 6.00 am)',
			initialCharge : 4.20,
			oneMile : 5.00,
			additionalMiles : 1.60
		},
		
		{
			name : 'Rate 4',
			id : 4,
			description : 'Sat, Sun (6am to 8pm)',
			initialCharge : 4.20,
			oneMile : 5.00,
			additionalMiles : 1.60
		},
		
		{
			name : 'Null Rate',
			id : 5,
			description : 'When journey is not active',
			initialCharge : 0,
			oneMile : 0,
			additionalMiles : 0
		}
	];
	
	var ppermile = 50;
	
	function determineRate(data) {
		
		var rateIndex;
		
		if (data.isActive){
			
			var dateTime = new Date(data.dateTime);
			
			switch(true) {
					
				//Monday to Friday 6am-8pm
				case ((dateTime.getUTCDay() >= 1 && dateTime.getUTCDay() <= 5) && (dateTime.getUTCHours() >= 6 && dateTime.getUTCHours() <= 19)):
					
					rateIndex = 0;
					break;
				
				//Monday to Thursday 8pm-6am
				case ((dateTime.getUTCDay() >= 1 && dateTime.getUTCDay() <= 4) && ((dateTime.getUTCHours() >= 20 && dateTime.getUTCHours() <= 23) || ((dateTime.getUTCHours() >= 0) && (dateTime.getUTCHours() < 6)))):
					
					rateIndex = 1;
					break;
					
				//Fri, Sat, Sun 8pm-6am
				case ((dateTime.getUTCDay() === 5 || dateTime.getUTCDay() === 6 || dateTime.getUTCDay() === 0) && ((dateTime.getUTCHours() >= 20 && dateTime.getUTCHours() <= 23) || ((dateTime.getUTCHours() >= 0) && (dateTime.getUTCHours() < 6)))):
					
					rateIndex = 2;
					break;
					
				//Sat, Sun 6am - 8pm
				case ((dateTime.getUTCDay() === 6 || dateTime.getUTCDay() === 0) && (dateTime.getUTCHours() >= 6 && dateTime.getUTCHours() <= 19)):
					
					rateIndex = 3;
					break;
				
			}
		}
		
		else {
			rateIndex = 4;
		}	
		
		return rateIndex;
	}
	
	function calculateFare(routeData, journeyInfo) {
			
			var outRate = determineRate(journeyInfo.out);
			var returnRate = determineRate(journeyInfo.return);
			
			var distanceMeters = 0;
			var timeSeconds = 0;
			var distanceMiles;
			var timeMins;
			var legs = routeData.routes[0].legs;
			var i;
			var outQuote;
			var returnQuote;
			
			for ( i = 0; i < legs.length; i++ ){
				
				distanceMeters += legs[i].distance.value;
				timeSeconds += legs[i].duration.value;
				
			}
			
			distanceMiles = round(distanceMeters * 0.000621371, 1);
			timeMins = round(timeSeconds / 60);
		
			switch(true) {
					
				case ((distanceMiles > 0) && (distanceMiles <= 0.5)):
					outQuote = rates[outRate].initialCharge;
					returnQuote = rates[returnRate].initialCharge;	
					break;
					
				case ((distanceMiles > 0.5) && (distanceMiles <= 1)):
					outQuote = rates[outRate].oneMile;
					returnQuote = rates[returnRate].oneMile;
					break;
					
				case (distanceMiles > 1):
					outQuote = rates[outRate].oneMile + (distanceMiles - 1)*rates[outRate].additionalMiles;
					returnQuote = rates[returnRate].oneMile + (distanceMiles - 1)*rates[returnRate].additionalMiles;
					break;
			}
			
			var quote = round(outQuote + returnQuote, 2);
			var journeyStatus = journeyInfo.return.isActive ?  'Return ' + journeyInfo.return.dateTime : 'One Way';
		
			var fareData = {
				distance : distanceMiles,
				time : timeMins,
				quote : quote,
				journeyStatus : journeyStatus
			};
		
			return fareData;
	}
	
	function displayFare(fareData) {
			$('span#journey-length').text(fareData.distance + ' miles');
			$('span#journey-time').text(fareData.time + ' mins');
			$('span#journey-quote').text('£' + fareData.quote);
			$('span#journey-status').text(fareData.journeyStatus);
	}
	
	return {
		calculateFare: calculateFare,
		displayFare : displayFare
	};
	
})();