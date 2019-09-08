function getHistogram(dateArray){
	var total_selected = 0;

	// set the dimensions and margins of the graph
	var margin = {top: 10, right: 30, bottom: 30, left: 110},
	    width = 1000 - margin.left - margin.right,
	    height = 90 - margin.top - margin.bottom;

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

	var endPoint = data.length - 1;

	var fromYear = data[0].event_display_date.substring(0,4);
	var fromMonth = data[0].event_display_date.substring(5,7);
	var fromDate = data[0].event_display_date.substring(8,10);
	
	var toYear = data[endPoint].event_display_date.substring(0,4);
	var toMonth = data[endPoint].event_display_date.substring(5,7);
	var toDate = data[endPoint].event_display_date.substring(8,10);

	// get the domain
	var from = new Date(fromYear, fromMonth, fromDate);
	var to = new Date(toYear, toMonth, toDate);
	
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
	
	// create tooltip
	var div = d3.select("body").append("div") 
		.attr("class", "tooltip")       
	    .style("opacity", 0);

	// group the data for the bars
	var bins = histogram(data);

	// Scale the range of the data in the y domain
	y.domain([0, d3.max(bins, function(d) { return d.length; })]);

	// append the bar rectangles to the svg element
	svg.selectAll("rect")
	    .data(bins)
	    .enter().append("rect")
	    .attr("class", "bar")
	    .attr("x", 1)
	    .attr("transform", function(d) {
			return "translate(" + x(d.x0) + "," + y(d.length) + ")"; 
		})
	    .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
	    .attr("height", function(d) { return height - y(d.length); })
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

	// add the x Axis
	var bars = svg.append("g")
	    .attr("transform", "translate(0," + height + ")")
	    .call(d3.axisBottom(x));

	var gBrush = d3.brushX()
	    .extent([[0,0], [width,height]])
	    .on("brush", brushed)
	    .on("end", brushended);

	svg.append("g")
	    .attr("class", "brush")
	    .call(gBrush);

	var fromInput = d3.select("#fromInput");
	var toInput = d3.select("#toInput");

	fromInput.on("blur", updateBrush);
	toInput.on("blur", updateBrush);

	function brushed() {
	  	if (!d3.event.sourceEvent) return; // Transition after input
		if (!d3.event.selection) return; // Ignore when empty

		var d0 = d3.event.selection.map(x.invert);

	  	d3.selectAll("rect.bar").style("fill", function(d, i) {
			if (d.x0 >= d0[0] && d.x0 <= d0[1])
			{
			    total_selected += d.length;
			    return "orange";
			}
			else
			{
			    return "steelblue";
			}
		});

	  	// Format from date
	  	var theFromMonth = d0[0].getMonth() + 1;
        if(theFromMonth <= 9)
            theFromMonth = "0" + theFromMonth;
        var theFromDay = d1[0].getDate();
        if(theFromDay <= 9)
        	theFromDay = "0" + theFromDay;
        // Format to date
	  	var theToMonth = d0[1].getMonth() + 1;
        if(theToMonth <= 9)
            theToMonth = "0" + theToMonth;
        var theToDay = d1[1].getDate();
        if(theToDay <= 9)
        	theToDay = "0" + theToDay;

		var date_selected = d0[0].getFullYear() + "-" + theFromMonth + "-" + theFromDay + " - " + d0[1].getFullYear() + "-" + theToMonth + "-" + theToDay;

		d3.select("#selected_dates").text("Mementos selected: " + total_selected + " mementos " + " | " + date_selected);
		d3.select("#selected_mementos").text("Selected: " + total_selected);

		// Update input values
		document.getElementById("fromInput").value = d0[0].getFullYear() + "-" + theFromMonth + "-" + d0[0].getDate();
		document.getElementById("toInput").value = d0[1].getFullYear() + "-" + theToMonth + "-" + d0[1].getDate();

		total_selected = 0;
	}

	function brushended() {
		if (!d3.event.sourceEvent) return; // Transition after input
		if (!d3.event.selection) return; // Ignore when empty

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

	  	d3.selectAll("rect.bar").style("fill", function(d, i) {
			if (d.x0 >= d1[0] && d.x0 <= d1[1])
			{
			    total_selected += d.length;
			    return "orange";
			}
			else
			{
			    return "steelblue";
			}
		});

		// Format from date
	  	var theFromMonth = d1[0].getMonth() + 1;
        if(theFromMonth <= 9)
            theFromMonth = "0" + theFromMonth;
        var theFromDay = d1[0].getDate();
        if(theFromDay <= 9)
        	theFromDay = "0" + theFromDay;

        // Format to date
	  	var theToMonth = d1[1].getMonth() + 1;
        if(theToMonth <= 9)
            theToMonth = "0" + theToMonth;
        var theToDay = d1[1].getDate();
        if(theToDay <= 9)
        	theToDay = "0" + theToDay;

		var date_selected = d1[0].getFullYear() + "-" + theFromMonth + "-" + theFromDay + " - " + d1[1].getFullYear() + "-" + theToMonth + "-" + theToDay;

		d3.select("#selected_mementos").text("Mementos selected: " + total_selected);

		// Update input values
		document.getElementById("fromInput").value = d1[0].getFullYear() + "-" + theFromMonth + "-" + "01";
		document.getElementById("toInput").value = d1[1].getFullYear() + "-" + theToMonth + "-" + toDays;

		total_selected = 0;
	}

	function updateBrush()
	{
		// Get new date input
		var fromDate = new Date(document.getElementById("fromInput").value);
		var toDate = new Date (document.getElementById("toInput").value);

		// Adjust dates to snap to bars
		fromDate = new Date(fromDate.getFullYear(), fromDate.getMonth()+1, 1, 0,0,0);
		var toDays = new Date(toDate.getFullYear(), (toDate.getMonth() + 1), 0).getDate();
		toDate = new Date(toDate.getFullYear(), toDate.getMonth(), toDays, 11,59,59);

		// Update brush postion with adjusted user input
		gBrush.move(d3.select("g.brush").transition().delay(100).duration(100), [fromDate, toDate].map(x));

	  	d3.selectAll("rect.bar").style("fill", function(d, i) {
			if (d.x0 >= fromDate && d.x0 <= toDate)
			{
			    total_selected += d.length;
			    return "orange";
			}
			else
			{
			    return "steelblue";
			}
		});

		// Format from date
	  	var theFromMonth = fromDate.getMonth() + 1;
        if(theFromMonth <= 9)
            theFromMonth = "0" + theFromMonth;
        var theFromDay = fromDate.getDate();
        if(theFromDay <= 9)
        	theFromDay = "0" + theFromDay;

        // Format to date
	  	var theToMonth = toDate.getMonth() + 1;
        if(theToMonth <= 9)
            theToMonth = "0" + theToMonth;
        var theToDay = toDate.getDate();
        if(theToDay <= 9)
        	theToDay = "0" + theToDay;

		var date_selected = fromDate.getFullYear() + "-" + theFromMonth + "-" + theFromDay + " - " + toDate.getFullYear() + "-" + theToMonth + "-" + theToDay;

		d3.select("#selected_mementos").text("Mementos selected: " + total_selected);

		// Update input values
		document.getElementById("fromInput").value = fromDate.getFullYear() + "-" + theFromMonth + "-" + "01";
		document.getElementById("toInput").value = toDate.getFullYear() + "-" + theToMonth + "-" + toDays;

		total_selected = 0;
	}
}
