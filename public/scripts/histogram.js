function getHistogram(dateArray){
	// set the dimensions and margins of the graph
	var margin = {top: 10, right: 30, bottom: 30, left: 110},
	    width = 1050 - margin.left - margin.right,
	    height = 100 - margin.top - margin.bottom;

	// parse the date / time
	var parseDate = d3.timeParse("%Y-%m-%d");
	
	var data = dateArray;
	
	// get the data
	for(i = 0; i < data.length; i++){
		data[i].event_display_date = data[i].event_display_date.substring(0, 10);
	}

	// format the data
	data.forEach(function(d) {
	    d.date = parseDate(d.event_display_date);
	});

	// Get from and to dates
	var fromDateString = data[0].event_display_date.substring(0,10);
	var toDateString = data[data.length - 1].event_display_date.substring(0,10);

	// Convert to date objects to get the domain
	var from = new Date(fromDateString);
	var to = new Date(toDateString);
	
	// set the ranges
	var x = d3.scaleTime()
		  .domain([from, to])
		  .rangeRound([0, width]);
	var y = d3.scaleLinear()
		  .range([height, 0]);

	// set the parameters for the histogram
	var histogram = d3.histogram()
	    .value(function(d) { return d.date; })
	    .domain(x.domain())
	    .thresholds(x.ticks(d3.timeMonth));

	// append the svg object to the body of the page
	// append a 'group' element to 'svg'
	// moves the 'group' element to the top left margin
	var svg = d3.select("#histogram").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	    .append("g")
	    .attr("transform", 
		  "translate(" + margin.left + "," + margin.top + ")");

	// group the data for the bars
	var bins = histogram(data);

	// Scale the range of the data in the y domain
	y.domain([0, d3.max(bins, function(d) { return d.length; })]);

	// add the x Axis
	var xaxis = svg.append("g")
	    .attr("transform", "translate(0," + height + ")")
	    .call(d3.axisBottom(x));

	// Create the brush
	var gBrush = d3.brushX()
	    .extent([[0,0], [width,height]])
	    .on("brush", brushed)
	    .on("end", brushended);

	// append the bar rectangles to the svg element
	var bars = svg.selectAll("rect")
	    .data(bins)
	    .enter().append("rect")
	    .attr("class", "bar")
	    .attr("x", 1)
	    .attr("transform", function(d) {
			return "translate(" + x(d.x0) + "," + y(d.length) + ")"; 
		})
	    .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
	    .attr("height", function(d) { return height - y(d.length); });

	// Append the brush
	svg.append("g")
	    .attr("class", "brush")
	    .call(gBrush);

	d3.select("#fromInput").on("blur", updateBrush);
	d3.select("#toInput").on("blur", updateBrush);

	function brushed() {
	  	if (!d3.event.sourceEvent) return; // Transition after input
		if (!d3.event.selection) return; // Ignore when empty

		//document.getElementById("brush_clear").style.display = "block";
		document.getElementById("brush_clear").style.background = "#337ab7";

		var total_selected = 0;

		var d0 = d3.event.selection.map(x.invert);

		var total_selected = selectedBars(d0[0], d0[1], total_selected);

		d3.select("#selected_mementos").text("Mementos selected: " + total_selected);

		// Update input values
		document.getElementById("fromInput").value = formatDate(d0[0]);
		document.getElementById("toInput").value = formatDate(d0[1]);

		total_selected = 0;
	}

	function brushended() {
		if (!d3.event.sourceEvent) return; // Transition after input
		if (!d3.event.selection) return; // Ignore when empty

		var total_selected = 0;

		var d0 = d3.event.selection.map(x.invert),
		    d1 = d0.map(d3.timeDay.round);

		// If empty when rounded use floor & ceil
		if (d1[0] >= d1[1]) {
		    d1[0] = d3.timeDay.floor(d0[0]);
		    d1[1] = d3.timeDay.offset(d1[0]);
		}

		// Get adjusted from date after brush snap
		var newFrom = new Date(d1[0].getFullYear(), d1[0].getMonth(), 1, 0,0,0);
		d1[0] = newFrom;

		// Get adjusted to date after brush snap
		var toDays = new Date(d1[1].getFullYear(), (d1[1].getMonth() + 1), 0).getDate();
		var newTo = new Date(d1[1].getFullYear(), d1[1].getMonth(), toDays, 11,59,59);
		d1[1] = newTo;

		d3.select(this).transition().call(d3.event.target.move, d1.map(x));

		var total_selected = selectedBars(d1[0], d1[1], total_selected);

		d3.select("#selected_mementos").text("Mementos selected: " + total_selected);

		// Update input values
		document.getElementById("fromInput").value = formatDate(d1[0]);
		document.getElementById("toInput").value = formatDate(d1[1]);

		total_selected = 0;
	}

	function updateBrush()
	{
		// Reset error message
		document.getElementById('date_error').style.display = "none";

		// Get new date input
		var fromDate = document.getElementById("fromInput").value;
		var toDate = document.getElementById("toInput").value;

		if(isValidDate(fromDate) && isValidDate(toDate))
		{
			// Create date objects
			fromDate = new Date(fromDate);
			toDate = new Date (toDate);

			var total_selected = 0;

			// Adjust dates to snap to bars
			fromDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1, 0,0,0);
			var toDays = new Date(toDate.getFullYear(), (toDate.getMonth() + 1), 0).getDate();
			toDate = new Date(toDate.getFullYear(), toDate.getMonth(), toDays, 11,59,59);

			// Update brush postion with adjusted user input
			gBrush.move(d3.select("g.brush").transition().delay(100).duration(100), [fromDate, toDate].map(x));

			var total_selected = selectedBars(fromDate, toDate, total_selected);

			d3.select("#selected_mementos").text("Mementos selected: " + total_selected);

			total_selected = 0;
		}
		else
			document.getElementById('date_error').style.display = "block";
	}

	// Highlight selected bars and tally mementos
	function selectedBars(from, to, total){
		d3.selectAll("rect.bar").style("fill", function(d, i) {
			if (d.x0 >= from && d.x0 <= to)
			{
				total += d.length;
				return "orange";
			}
			else
				return "steelblue";
		});

		return total;
	}

	// Add leading zeros
	function formatDate(date)
	{
		var month = date.getMonth() + 1;
	    if(month <= 9)
	        month = "0" + month;
	    var day = date.getDate();
	    if(day <= 9)
	        day = "0" + day;

	    return date.getFullYear() + "-" + month + "-" + day;
	}

	// Validates that the input string is a valid date formatted as "mm/dd/yyyy"
	function isValidDate(dateString)
	{
	    // First check for the pattern
	    if(!/^\d{4}\-\d{2}\-\d{2}$/.test(dateString))
	        return false;

	    // Parse the date parts to integers
	    var parts = dateString.split("-");
	    var day = parseInt(parts[2], 10);
	    var month = parseInt(parts[1], 10);
	    var year = parseInt(parts[0], 10);

	    // Check the ranges of month and year
	    if(year < 1000 || year > 3000 || month == 0 || month > 12)
	        return false;

	    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

	    // Adjust for leap years
	    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
	        monthLength[1] = 29;

	    // Find index of last memento
	    var endPoint = histoData.length - 1;
	    
	    // Get date of first memento
	    var fromYear = histoData[0].event_display_date.substring(0,4);
	    var fromMonth = histoData[0].event_display_date.substring(5,7);
	    fromMonth = fromMonth - 1;
	    var fromDay = histoData[0].event_display_date.substring(8,10);
	    
	    // Get date of last memento
	    var toYear = histoData[endPoint].event_display_date.substring(0,4);
	    var toMonth = histoData[endPoint].event_display_date.substring(5,7);
	    toMonth = toMonth - 1;
	    var toDay = histoData[endPoint].event_display_date.substring(8,10);
	    
	    month = month - 1;
	    
	    // Create date objects
	    var from = new Date(fromYear, fromMonth, fromDay);
	    var to = new Date(toYear, toMonth, toDay);
	    var compareDate = new Date(year, month, day);
	    
	    // Check if input within possible range of mementos
	    if(compareDate < from || compareDate > to){
	        console.log("out of range");
	        return false;
	    }
	    // Check the range of the day
	    return day > 0 && day <= monthLength[month];
	};

	$("#brush_clear").click(function(event){
		// Reset form input
		document.getElementById("fromInput").value = fromDateString;
        document.getElementById("toInput").value = toDateString;

        // Fade clear button
        document.getElementById("brush_clear").style.background = "#ccc";

		// Reset selected mementos
        d3.select("#selected_mementos").text("Mementos selected: " + data.length);
		// Remove brush
		d3.select("g.brush").call(gBrush.move, null);

		// Reset fill color of each bar
		d3.selectAll("rect.bar").style("fill", function(d, i) {
			return "steelblue";
		});
	});
}
