function drawHistogram(dateArray){
	// set the dimensions and margins of the graph
	var margin = {top: 10, right: 30, bottom: 30, left: 110},
	    width = 1000 - margin.left - margin.right,
	    height = 90 - margin.top - margin.bottom;
	    height2 = 90 - margin.top - margin.bottom;

	// parse the date / time
	var parseDate = d3.timeParse("%Y-%m-%d");
	
	var data = dateArray;
	
	// get the data
	for(i = 0; i < data.length; i++){
		data[i] = formatDate(new Date(data[i]));
	}

	// grab to and from dates
	var fromDateString = data[0]
	var toDateString = data[data.length - 1]

	// get the domain
	var from = new Date(data[0]);
	var to = new Date(data[data.length - 1]);

	// create brush snapped versoin of domain
	var fromDateSnapped = new Date(from.getFullYear(), from.getMonth(), 1);
	var toDays = new Date(to.getFullYear(), (to.getMonth() + 1), 0).getDate();
	var toDateSnapped = new Date(to.getFullYear(), to.getMonth() + 1, toDays); 
	
	// set the ranges

	// for main histogram
	var x = d3.scaleTime()
		  .domain([from, to])
		  .rangeRound([0, width]);
	var y = d3.scaleLinear()
		  .range([height, 0]);

	// for zoomable histogram
	var y2 = d3.scaleLinear()
		  .range([height2, 0]);
	var x2 = d3.scaleTime()
		  .domain([from, to])
		  .rangeRound([0, width-120]);

	// set the parameters for the histogram
	var histogram = d3.histogram()
	    .value(function(d) { return parseDate(d); })
	    .domain(x.domain())
	    .thresholds(x.ticks(d3.timeMonth));

	// For main histogram
	// append the svg object to the body of the page
	// append a 'group' element to 'svg'
	var svg = d3.select("#histogram").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	    .append("g");

	// For zoomable histogram 
	// append the svg object to the body of the page
	// append a 'group' element to 'svg'
	var zoomsvg = d3.select("#zoom_histogram").append("svg")
	    .attr("width", width + margin.left + margin.right - 120)
	    .attr("height", height2 + margin.top + margin.bottom)
	    .append("g");

	// create tooltip
	var div = d3.select("body").append("div") 
	    .attr("class", "tooltip")       
	    .style("opacity", 0);

	// group the data for the bars
	var bins = histogram(data);

	// Scale the range of the data in the y domain
	y.domain([0, d3.max(bins, function(d) { return d.length; })]);
	// Scale the range of the data in the y domain
	y2.domain([0, d3.max(bins, function(d) { return d.length; })]);

	// add the x Axis
	var xaxis = svg.append("g")
	    .attr("transform", "translate(0," + height + ")")
	    .call(d3.axisBottom(x));

	// add the zoomable x Axis
	var xaxis2 = zoomsvg.append("g")
	    .attr("transform", "translate(0," + height2 + ")")
	    .attr("class", "axis")
	    .call(d3.axisBottom(x2));

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

	// append the bar rectangles to the svg element
	var bars2 = zoomsvg.selectAll("rect")
	    .data(bins)
	    .enter().append("rect")
	    .attr("class", "bar2")
	    .attr("x", 1)
	    .attr("transform", function(d) {
			return "translate(" + x2(d.x0) + "," + y2(d.length) + ")"; 
		})
	    .attr("width", function(d) { return x2(d.x1) - x2(d.x0) -1 ; })
	    .attr("height", function(d) { return height2 - y2(d.length); })
	    .on("mouseover", function(d) {    
		    div	.transition()    
				.duration(200)    
				.style("opacity", .8);    
		    div .html("Number of Mementos: " + d.length + "<br/>" + d.x0.toString().substring(4,7) + " " + d.x0.toString().substring(11,15))  
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px");  
		})          
	    .on("mouseout", function(d) {   
		    div .transition()    
				.duration(500)    
				.style("opacity", 0); 
	    });

	// Append the brush
	svg.append("g")
	    .attr("class", "brush")
	    .call(gBrush);

	// Grab input boxes
	var fromInput = d3.select("#fromInput");
	var toInput = d3.select("#toInput");
	fromInput.on("blur", updateBrush);
	toInput.on("blur", updateBrush);

	function brushed() {
		document.getElementById('date_error').style.display = "none";

	  	if (!d3.event.sourceEvent) return; // Transition after input
		if (!d3.event.selection) return; // Ignore when empty

		document.getElementById("brush_clear").style.background = "#337ab7";

		var total_selected = 0;

		var d0 = d3.event.selection.map(x.invert);

		var total_selected = selectedBars(d0[0], d0[1], total_selected);

		d3.select("#selected_mementos").text(total_selected);
		if(total_selected > 1000) // If more than 1000 mementos selected, tell user up to 1000 will be analyzed 
            document.getElementById("memento_limit").style.visibility = "visible";
        else
        	document.getElementById("memento_limit").style.visibility = "hidden";

		// Prevent range from going past possible domain
		if(d0[0] < from)
			var fromBoxDate = formatDate(fromDateSnapped);
		else
			var fromBoxDate = formatDate(d0[0]);
		if(d0[1] > to)
			var toBoxDate = formatDate(toDateSnapped);
		else
			var toBoxDate = formatDate(d0[1]);

		document.getElementById("fromInput").value = fromBoxDate;
		document.getElementById("toInput").value = toBoxDate;

		total_selected = 0;
	}

	function brushended() {
		document.getElementById('date_error').style.display = "none";

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

		d3.select("#selected_mementos").text(total_selected);
		if(total_selected > 1000) // If more than 1000 mementos selected, tell user up to 1000 will be analyzed 
            document.getElementById("memento_limit").style.visibility = "visible";
        else
        	document.getElementById("memento_limit").style.visibility = "hidden";

		// Prevent range from going past possible domain
		if(d1[0] < from)
			var fromBoxDate = formatDate(fromDateSnapped);
		else
			var fromBoxDate = formatDate(d1[0]);
		if(d1[1] > to)
			var toBoxDate = formatDate(toDateSnapped);
		else
			var toBoxDate = formatDate(d1[1]);

		document.getElementById("fromInput").value = fromBoxDate;
		document.getElementById("toInput").value = toBoxDate;

		// Append tooltips on mouseover
		zoomsvg.selectAll("rect")
		 	.on("mouseover", function(d) {    
		    	div .transition()    
					.duration(200)    
					.style("opacity", .8);    
		    	div .html("Number of Mementos: " + d.length + "<br/>" + d.x0.toString().substring(4,7) + " " + d.x0.toString().substring(11,15))  
					.style("left", (d3.event.pageX) + "px")   
					.style("top", (d3.event.pageY - 28) + "px");  
		    })          
	      	.on("mouseout", function(d) {   
		    	div .transition()    
					.duration(500)    
					.style("opacity", 0);
	       	});

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
			fromDate = new Date(fromDate.replace(/\-/g, "/"));
			toDate = new Date (toDate.replace(/\-/g, "/"));

			if(fromDate < toDate)
			{
				var total_selected = 0;

				// Adjust dates to snap to bars
				var fromDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1, 0,0,0);
				var toDays = new Date(toDate.getFullYear(), (toDate.getMonth() + 1), 0).getDate();
				toDate = new Date(toDate.getFullYear(), toDate.getMonth(), toDays, 11,59,59);

				// Update brush postion with adjusted user input
				gBrush.move(d3.select("g.brush").transition().delay(100).duration(100), [fromDate, toDate].map(x));

				var total_selected = selectedBars(fromDate, toDate, total_selected);

				d3.select("#selected_mementos").text(total_selected);
				if(total_selected > 1000) // If more than 1000 mementos selected, tell user up to 1000 will be analyzed 
		            document.getElementById("memento_limit").style.visibility = "visible";
		        else
		        	document.getElementById("memento_limit").style.visibility = "hidden";

				// Append tooltips on mouseover
				zoomsvg.selectAll("rect")
				 	.on("mouseover", function(d) {    
				    	div .transition()    
							.duration(200)    
							.style("opacity", .8);    
				    	div .html("Number of Mementos: " + d.length + "<br/>" + d.x0.toString().substring(4,7) + " " + d.x0.toString().substring(11,15))  
							.style("left", (d3.event.pageX) + "px")   
							.style("top", (d3.event.pageY - 28) + "px");  
				    })          
			      	.on("mouseout", function(d) {   
				    	div .transition()    
							.duration(500)    
							.style("opacity", 0);
			       	});

				total_selected = 0;
				document.getElementById("brush_clear").style.background = "#337ab7";
			}
			else
			{
				document.getElementById('date_error').innerHTML = "Please enter a from date that is less than the to date";
                document.getElementById('date_error').style.display = "block";
			}
		}
		else
			document.getElementById('date_error').style.display = "block";
	}

	function selectedBars(from, to, total){
		var dataList = [];

		d3.selectAll("rect.bar").style("fill", function(d, i) {
			if (d.x0 >= from && d.x0 <= to)
			{
				total += d.length;
				dataList.push(d);
				return "orange";
			}
			else
			{
				return "steelblue";
			}
		});
		zoomHistogram(zoomsvg, dataList, from, to);
		return total;
	}

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
	    {
	        document.getElementById("date_error").innerHTML = "Please enter dates in YYYY-MM-DD format";
	        return false;
	    }

	    // Parse the date parts to integers
	    var parts = dateString.split("-");
	    var day = parseInt(parts[2], 10);
	    var month = parseInt(parts[1], 10);
	    var year = parseInt(parts[0], 10);

	    // Check the ranges of month and year
	    if(year < 1000 || year > 3000 || month == 0 || month > 12)
	    {
	        document.getElementById("date_error").innerHTML = "Dates are out of range.";
	        return false;
	    }

	    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

	    // Adjust for leap years
	    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
	        monthLength[1] = 29;

	    // Find index of last memento
	    var endPoint = data.length - 1;
	    
	    // Create date objects
	    var from = new Date(data[0]);
	    var to = new Date(data[endPoint]);

	    // Adjust dates to histogram domain
	    from = new Date(from.getFullYear(), from.getMonth(), 1);
	    toDays = new Date(to.getFullYear(), to.getMonth()+2, 0).getDate();
	    to = new Date(to.getFullYear(), to.getMonth()+1, toDays);

	    // Adjust month for date string
	    var fromMonth = from.getMonth()+1;
	    var toMonth = to.getMonth()+1;

	    var fromDateStr = formatDate(from);
	    var toDateStr = formatDate(to);

	    var compareDate = new Date(year, month-1, day);

	    month = month - 1;
	    
	    // Check if input within possible range of mementos
	    if(compareDate < from || compareDate > to)
	    {
	        document.getElementById("date_error").innerHTML = "Please enter dates between " + fromDateStr + " and " + toDateStr;
	        return false;
	    }
	    
	    // Check the range of the day
	    if(day > 0 && day <= monthLength[month])
	        return true;
	    else
	    {
	        document.getElementById("date_error").innerHTML = "Invalid date, please enter in YYYY-MM-DD format";
	    }
	};

	$("#brush_clear").click(function(event){
		// Remove zoom histogram
		document.getElementById("zoom_histogram").style.visibility = "hidden";

		// Reset form input
		document.getElementById("fromInput").value = fromDateString;
        document.getElementById("toInput").value = toDateString;

        // Fade clear button
        document.getElementById("brush_clear").style.background = "#ccc";

		// Reset selected mementos
        d3.select("#selected_mementos").text(data.length);
        if(data.length > 1000) // If more than 1000 mementos selected, tell user up to 1000 will be analyzed 
            document.getElementById("memento_limit").style.visibility = "visible";
        else
        	document.getElementById("memento_limit").style.visibility = "hidden";
		// Remove brush
		d3.select("g.brush").call(gBrush.move, null);

		// Reset fill color of each bar
		d3.selectAll("rect.bar").style("fill", function(d, i) {
			return "steelblue";
		});
	});

	$("#updateDateRange").click(function(event){
		updateBrush();
	});

	function zoomHistogram(zoomsvg, updatedata, from, to){
		bars2.exit();

		x2.domain([from, to]);

   		xaxis2.transition().duration(1000).call(d3.axisBottom(x2));

		var y2 = d3.scaleLinear()
				.range([height, 0]);

		// set the parameters for the histogram
		var histogram2 = d3.histogram()
		    .value(function(d) { return d; })
		    .domain(x2.domain())
		    .thresholds(x2.ticks(d3.timeMonth));

		y2.domain([0,d3.max(updatedata, function(d) { return d.length; })]);

		var bars = zoomsvg.selectAll("rect")
			.data(updatedata, function(d) { return d;});

		bars.exit().remove();

      	bars.attr("class", "bar2")
      		.transition(700)
      		.duration(700)
      		.style("fill-opacity", 1)
		    .attr("transform", function(d) {
				return "translate(" + x2(d.x0) + "," + y2(d.length) + ")"; 
			})
		    .attr("width", function(d) { return x2(d.x1) - x2(d.x0) ; })
		    .attr("height", function(d) { return height2 - y2(d.length); });

		bars.enter().append("rect")
			.attr("class", "bar2")
		    .data(updatedata)
		    .transition()
		    .duration(700)
		    .style("fill-opacity", 1)
		    .attr("transform", function(d) {
				return "translate(" + x2(d.x0) + "," + y2(d.length) + ")"; 
			})
		    .attr("width", function(d) { return x2(d.x1) - x2(d.x0) ; })
		    .attr("height", function(d) { return height2 - y2(d.length); });

		document.getElementById("zoom_histogram").style.visibility = "visible";
	}
}
