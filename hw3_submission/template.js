// Load the data 
const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, proceed with plotting
socialMedia.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = d.Likes ? +d.Likes : 0; // Convert Likes to numeric values
    });

    // Define the dimensions and margins for the SVG
    const margin = { top: 40, right: 30, bottom: 50, left: 60 },
          width = 800 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#boxplot")
                  .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales for x and y axes
    // You can use the range 0 to 1000 for the number of Likes, or if you want, you can use
    // d3.min(data, d => d.Likes) to achieve the min value and 
    // d3.max(data, d => d.Likes) to achieve the max value
    // For the domain of the xscale, you can list all four platforms or use
    // [...new Set(data.map(d => d.Platform))] to achieve a unique list of the platform
    const xScale = d3.scaleBand()
                     .domain([...new Set(data.map(d => d.Platform))])
                     .range([0, width])
                     .padding(0.2);

    const yScale = d3.scaleLinear()
                     .domain([0, d3.max(data, d => d.Likes)])
                     .range([height, 0]);

    // Add scales to the SVG
    svg.append("g")
       .attr("transform", `translate(0, ${height})`)
       .call(d3.axisBottom(xScale));

    svg.append("g")
       .call(d3.axisLeft(yScale));

    // Add x-axis label
    svg.append("text")
       .attr("x", width / 2)
       .attr("y", height + margin.bottom - 10)
       .attr("text-anchor", "middle")
       .text("Social Media Platform");

    // Add y-axis label
    svg.append("text")
       .attr("transform", "rotate(-90)")
       .attr("y", -margin.left + 15)
       .attr("x", -height / 2)
       .attr("text-anchor", "middle")
       .text("Number of Likes");

    // function to compute quartiles (q1, median, q3) and other metrics
    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.Likes).sort(d3.ascending);
        const min = d3.min(values);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const max = d3.max(values);
        return { min, q1, median, q3, max };
    };

    // Crun function for platform
    const quartilesByPlatform = d3.rollup(data, rollupFunction, d => d.Platform);

    // Draw the boxplot for each platform
    quartilesByPlatform.forEach((quartiles, platform) => {
        const x = xScale(platform); // Position of the box (centered on the platform) -- dont know why this isnt working whatever
        const boxWidth = xScale.bandwidth(); 

        // interquartile range (IQR)
        const IQR = quartiles.q3 - quartiles.q1;

        
        const lowerWhisker = quartiles.q1 - 1.5 * IQR;
        const upperWhisker = quartiles.q3 + 1.5 * IQR;

        // Vertical line (whiskers)
        svg.append("line")
           .attr("x1", x + boxWidth / 2) // Position the whisker line in the middle of the box
           .attr("x2", x + boxWidth / 2)
           .attr("y1", yScale(quartiles.min))
           .attr("y2", yScale(quartiles.max))
           .attr("stroke", "black");

        // Box (rectangle from Q1 to Q3)
        svg.append("rect")
           .attr("x", x - boxWidth / 2) // center box boxWidth/2
           .attr("y", yScale(quartiles.q3)) // q3 top
           .attr("width", boxWidth) 
           .attr("height", yScale(quartiles.q1) - yScale(quartiles.q3)) // height = q3-q1
           .attr("fill", "lightblue")
           .attr("stroke", "black");

        // Median line (horizontal line for median)
        svg.append("line")
           .attr("x1", x - boxWidth / 2) 
           .attr("x2", x + boxWidth / 2) 
           .attr("y1", yScale(quartiles.median)) 
           .attr("y2", yScale(quartiles.median)) 
           .attr("stroke", "black")
           .attr("stroke-width", 2);
    });
});



function computeSocialMediaAvg(data) {
    
    return data.reduce((acc, d) => acc + d.Likes, 0) / data.length;
}

function computeSocialMediaTime(data) {
    
    return data.reduce((acc, d) => acc + d.Likes, 0) / data.length;
}

const socialMediaAvg = d3.csv("SocialMediaAvg.csv");

socialMediaAvg.then(function(data) {
    data.forEach(function(d) {
        d.AvgLikes = +d.AvgLikes; // convert to numeric
    });
    console.log(data);

    // Set the dimensions and margins for the SVG canvas
    const margin = { top: 40, right: 30, bottom: 50, left: 60 },
          width = 800 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#barPlot")
                  .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define the color scale for post types
    const colorScale = d3.scaleOrdinal()
                         .domain(["Image", "Link", "Video"])
                         .range(["#1f77b4", "#ff7f0e", "#2ca02c"]); 

    // Define scales for x0 (platform), x1 (post type), and y (average likes)
    const x0 = d3.scaleBand()
                 .domain([...new Set(data.map(d => d.Platform))])  
                 .range([0, width])
                 .padding(0.1); 

    const x1 = d3.scaleBand()
                 .domain(["Image", "Link", "Video"]) 
                 .range([0, x0.bandwidth()])  
                 .padding(0.05); 

    const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.AvgLikes)]) 
                .range([height, 0]); 

    // Add x-axis for platforms
    svg.append("g")
       .attr("transform", `translate(0, ${height})`)
       .call(d3.axisBottom(x0));

    // Add y-axis for average number of Likes
    svg.append("g")
       .call(d3.axisLeft(y));

    // Add x-axis label
    svg.append("text")
       .attr("x", width / 2)
       .attr("y", height + margin.bottom - 10)
       .attr("text-anchor", "middle")
       .text("Social Media Platform");

    // Add y-axis label
    svg.append("text")
       .attr("transform", "rotate(-90)")
       .attr("y", -margin.left + 15)
       .attr("x", -height / 2)
       .attr("text-anchor", "middle")
       .text("Average Number of Likes");

    // Group the data by Platform and PostType
    const groupedData = d3.rollup(data, v => d3.mean(v, d => d.AvgLikes), d => d.Platform, d => d.PostType);

    // Create bars for each PostType within each Platform
    groupedData.forEach((postTypes, platform) => {
        // X position for the platform
        const xPlatform = x0(platform);

        postTypes.forEach((avgLikes, postType) => {
            // x position for the post type  inside platform
            const xPostType = x1(postType);
            const rectHeight = height - y(avgLikes);

            // Draw the bar for the post type
            svg.append("rect")
               .attr("x", xPlatform + xPostType)
               .attr("y", y(avgLikes))
               .attr("width", x1.bandwidth()) 
               .attr("height", rectHeight)
               .attr("fill", colorScale(postType));
        });
    });

    // Create the legend
    const legend = svg.append("g")
                      .attr("transform", `translate(${width - 150}, 20)`);

    const legendItems = ["Image", "Link", "Video"];

    legendItems.forEach((item, index) => {
        // Add the colored rectangle for the legend
        legend.append("rect")
              .attr("x", 0)
              .attr("y", index * 20)
              .attr("width", 15)
              .attr("height", 15)
              .attr("fill", colorScale(item));

        // Add the text label for the legend
        legend.append("text")
              .attr("x", 20)
              .attr("y", index * 20 + 12)
              .text(item)
              .style("font-size", "12px");
    });
});

const socialMediaTime = d3.csv("SocialMediaTime.csv");

socialMediaTime.then(function(data) {
    // log data for check
    console.log("Raw Data:", data);

    // Update the date format to match MM/DD/YYYY
    const parseDate = d3.timeParse("%m/%d/%Y");  

    
    data.forEach(d => {
        d.Date = parseDate(d.Date);  
        d.Likes = +d.AvgLikes;  
        
        // Log each data point to check if Date and Likes are correct
        console.log("Parsed Data Point:", d);
    });

    // Filter out invalid Nans
    data = data.filter(d => d.Date && !isNaN(d.Likes));

    // debug data check
    console.log("Filtered Data:", data);
    if (data.length === 0) {
        console.error("No valid data to plot!");
        return;
    }

    // Define the dimensions and margins for the SVG
    const margin = { top: 40, right: 30, bottom: 50, left: 60 },
          width = 800 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#lineplot")
                  .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales for x and y axes  
    const x = d3.scaleTime()
                .domain(d3.extent(data, d => d.Date))  
                .range([0, width]);

    const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.Likes)])  
                .range([height, 0]);

    // debug check the scales' domains and ranges
    console.log("x domain:", x.domain());
    console.log("y domain:", y.domain());

    // Draw the x-axis
    svg.append("g")
       .attr("transform", `translate(0, ${height})`)
       .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%m/%d/%Y"))) 
       .selectAll("text")
       .attr("transform", "rotate(-45)") 
       .style("text-anchor", "end");

    // Draw the y-axis
    svg.append("g")
       .call(d3.axisLeft(y));

    // Add x-axis label
    svg.append("text")
       .attr("x", width / 2)
       .attr("y", height + margin.bottom - 10)
       .attr("text-anchor", "middle")
       .text("Date");

    // Add y-axis label
    svg.append("text")
       .attr("transform", "rotate(-90)")
       .attr("y", -margin.left + 15)
       .attr("x", -height / 2)
       .attr("text-anchor", "middle")
       .text("Average Likes");

    // Create the line generator with curveNatural
    const line = d3.line()
                   .x(d => x(d.Date))  
                   .y(d => y(d.Likes))  
                   .curve(d3.curveNatural);  

    // Draw the line path
    svg.append("path")
       .datum(data)  
       .attr("fill", "none")
       .attr("stroke", "steelblue")
       .attr("stroke-width", 2)
       .attr("d", line); 

});
