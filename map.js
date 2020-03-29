//Width and height of map
const width = 1280;
const height = 720;

// D3 Projection
const projection = d3.geoAlbersUsa()
    .translate([width / 2, height / 2])    // translate to center of screen
    .scale([1000]);          // scale things down so see entire US

// Define path generator
const path = d3.geoPath()     // path generator that will convert GeoJSON to SVG paths
    .projection(projection);  // tell path generator to use albersUsa projection




d3.json('gz_2010_us_050_00_20m.json').then(data => {

    let svg = d3.select("div#map")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    svg.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr('fill', 'white')
        .attr('stroke', 'black')
        .attr("stroke-width", '1px');
});
