//Width and height of map
const width = 1280;
const height = 600;

let selected_day = "2020-01-21";
let most_recent_day, color;
let most_num_cases = 0;

// animation
let inter = null;

const svg = d3.select("div#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// D3 Projection
const projection = d3.geoAlbersUsa()
    .translate([width / 2.5, height / 2])    // translate to center of screen
    .scale([1200]);          // scale things down so see entire US

// Define path generator
const path = d3.geoPath()     // path generator that will convert GeoJSON to SVG paths
    .projection(projection);  // tell path generator to use albersUsa projection

const cleaned_data = {};

d3.csv('us-counties.csv').then(data => {

    data.forEach(dp => {

        if (parseInt(dp.cases) > most_num_cases) {
            most_num_cases = parseInt(dp.cases);
        }
        // new day
        most_recent_day = dp.date;

        // usually id is fips, but for specific places like NYC it's the county name
        const dp_id = dp.fips != "" ? dp.fips : dp.county;
        if (!(dp.date in cleaned_data)) cleaned_data[dp.date] = {};
        cleaned_data[dp.date][dp_id] = dp;
    });
});

// function startInt() {
//     if(!!inter) {
//         return;
//       }    
//     inter = window.setInterval(incrementDayAndReload, 400);
// }

function loadMap() {
    d3.json('county.geojson').then(data => {
        today_covid_data = cleaned_data[selected_day];

        svg.selectAll("path")
            .data(data.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr('fill', function (d) {
                const dfips = d.properties.FIPS_CODE.replace('-', '');
                if (dfips in today_covid_data)
                    return "red";

                // handle NYC- sigh
                if (d.properties.COUNTY_STATE_NAME.includes("New York City")) {
                    if ("New York City" in today_covid_data)
                        return "red";
                }
                return "white";
            })
            .attr('stroke', 'black')
            .attr("stroke-width", '1px');
    });
}

function updateMap() {
    let temp_max_cases = 0;
    const today_data = cleaned_data[selected_day];

    Object.values(today_data).forEach(dp => {
        if (parseInt(dp.cases) > temp_max_cases) temp_max_cases = parseInt(dp.cases);
    });

    color = d3.scaleLog().domain([1, temp_max_cases])
        .range(["rgba(205, 0, 0, 0.1)", "rgba(205, 0, 0, 1)"]);


    svg.selectAll('path')
        .attr('fill', function (d) {
            const dfips = d.properties.FIPS_CODE.replace('-', '');

            if (dfips in today_data)
                return color(today_data[dfips].cases);
            // handle NYC- sigh
            if (d.properties.COUNTY_STATE_NAME.includes("New York City")) {
                if ("New York City" in today_data)
                    return color(today_data["New York City"].cases);
            }
            return "white";
        });


}

// takes in a date-string, returns a date-string
function incrementSelectedDay() {
    const dayObj = new Date(selected_day);
    dayObj.setTime(dayObj.getTime() + 86400000);
    selected_day = dayObj.toISOString().slice(0, 10);
    dayObj.setTime(dayObj.getTime() + 86400000);
    document.getElementById('curr_day').innerHTML = dayObj.toLocaleDateString();
}

function incrementDayAndReload() {
    if (selected_day != most_recent_day) {
        incrementSelectedDay();
        updateMap();
    }
}

function stopInt() {
    clearInterval(inter);
}
function startInt() {
    if(!!inter) {
        return;
      }    
    inter = window.setInterval(incrementDayAndReload, 350);
}

loadMap();





