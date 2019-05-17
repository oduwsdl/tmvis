function getHistogram(fromYear, fromMonth, fromDate, toYear, toMonth, toDate, dateArray){
	// set the dimensions and margins of the graph
	var margin = {top: 10, right: 30, bottom: 30, left: 110},
	    width = 1000 - margin.left - margin.right,
	    height = 90 - margin.top - margin.bottom;

	// parse the date / time
	var parseDate = d3.timeParse("%Y-%m-%d");


	// set the ranges
	var x = d3.scaleTime()
		  .domain([new Date(fromYear, fromMonth, fromDate), new Date(toYear, toMonth, toDate)])
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

	var data = dateArray;
	
	// get the data
	for(i = 0; i < data.length; i++){
		data[i].event_display_date = data[i].event_display_date.substring(0, 10);
	}

	  // format the data
	  data.forEach(function(d) {
	      d.date = parseDate(d.event_display_date);
	  });
	
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
			  return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
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
	  svg.append("g")
	      .attr("transform", "translate(0," + height + ")")
	      .call(d3.axisBottom(x));

	  // add the y Axis
	  /*svg.append("g")
	      .call(d3.axisLeft(y));*/
}
