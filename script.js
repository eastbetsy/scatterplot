document.addEventListener('DOMContentLoaded', function() {
            const dataUrl = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';
            const width = 920;
            const height = 630;
            const margin = { top: 20, right: 30, bottom: 60, left: 70 };
            const innerWidth = width - margin.left - margin.right;
            const innerHeight = height - margin.top - margin.bottom;

            const svg = d3.select("#chart")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);

            const tooltip = d3.select("#tooltip");

            d3.json(dataUrl).then(data => {
                data.forEach(d => {
                    const parsedTime = d.Time.split(':');
                    d.Time = new Date(1970, 0, 1, 0, parsedTime[0], parsedTime[1]);
                    d.Year = +d.Year;
                });


                const xScale = d3.scaleLinear()
                    .domain([d3.min(data, d => d.Year - 1), d3.max(data, d => d.Year + 1)])
                    .range([0, innerWidth]);

                const yScale = d3.scaleTime()
                    .domain(d3.extent(data, d => d.Time))
                    .range([0, innerHeight]);

                const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
                                     .domain(["Doping allegations", "No doping allegations"]);


                const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
                svg.append("g")
                    .attr("id", "x-axis")
                    .attr("transform", `translate(0, ${innerHeight})`)
                    .call(xAxis);

                const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%M:%S"));
                svg.append("g")
                    .attr("id", "y-axis")
                    .call(yAxis);

                svg.append("text")
                   .attr("transform", `translate(${innerWidth / 2}, ${innerHeight + margin.top + 20})`)
                   .style("text-anchor", "middle")
                   .attr("class", "axis-label")
                   .text("Year");

                svg.append("text")
                   .attr("transform", "rotate(-90)")
                   .attr("y", 0 - margin.left + 15)
                   .attr("x", 0 - (innerHeight / 2))
                   .style("text-anchor", "middle")
                   .attr("class", "axis-label")
                   .text("Time in Minutes");

                svg.selectAll(".dot")
                    .data(data)
                    .enter()
                    .append("circle")
                    .attr("class", "dot")
                    .attr("cx", d => xScale(d.Year))
                    .attr("cy", d => yScale(d.Time))
                    .attr("r", 6)
                    .attr("data-xvalue", d => d.Year)
                    .attr("data-yvalue", d => d.Time.toISOString())
                    .style("fill", d => colorScale(d.Doping ? "Doping allegations" : "No doping allegations"))
                    .on("mouseover", (event, d) => {
                        tooltip.style("visibility", "visible")
                               .classed("visible", true)
                               .attr("data-year", d.Year)
                               .html(
                                   `${d.Name}: ${d.Nationality}<br/>` +
                                   `Year: ${d.Year}, Time: ${d3.timeFormat("%M:%S")(d.Time)}` +
                                   (d.Doping ? `<br/><br/>${d.Doping}` : "")
                               );
                    })
                    .on("mousemove", (event) => {
                        tooltip.style("top", (event.pageY - 10) + "px")
                               .style("left", (event.pageX + 10) + "px");
                    })
                    .on("mouseout", () => {
                        tooltip.style("visibility", "hidden")
                               .classed("visible", false);
                    });

                const legendContainer = d3.select("#legend");
                const legend = legendContainer.selectAll(".legend-item")
                    .data(colorScale.domain())
                    .enter()
                    .append("div")
                    .attr("class", "legend-item");

                legend.append("div")
                    .attr("class", "legend-color")
                    .style("background-color", colorScale);

                legend.append("p")
                    .text(d => d);

            }).catch(error => {
                console.error('Error fetching or parsing data:', error);
            });
        });