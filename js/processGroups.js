var groupNames = [
            "Achi",
            "Akateka",
            "Awakateka",
            "Ch'orti'",
            "Chalchiteka",
            "Chuj",
            "Itza'",
            "Ixil",
            "Jakalteko/Popti'",
            "K'iche'",
            "Kaqchiquel",
            "Mam",
            "Mopan",
            "Poqomam",
            "Poqomchi'",
            "Q'anjob'al",
            "Q'eqchi'",
            "Sakapulteka",
            "Sipakapense",
            "Tektiteka",
            "Tz'utujil",
            "Uspanteka",
            "Maya",
            "Garífuna",
            "Xinka",
            "Afrodescendiente/Creole/Afromestizo",
            "Ladina(o)",
            "Extranjera(o)",
            "total_grupos",
            "Total de personas"
      ];

function loadData(){
    Promise.all([
      d3.json("data/ethnic_groups_municipios.geojson"),
      d3.json("data/municipios_topo.json"),
      d3.json("data/focusArea_extent.geojson"),
      d3.json("data/raster_extent.geojson"),
      d3.json("data/countries_topo.json")
    ])
    .then(function([groupsJSON,municipiosTOPO,focusAreaJSON,rasterAreaJSON,countriesTOPO]){
        var groupsData = groupsJSON.features;
        var municipios = topojson.feature(municipiosTOPO, municipiosTOPO.objects.municipios).features;
        var focusBox = focusAreaJSON;
        var rasterBox = rasterAreaJSON;
        var countries = topojson.feature(countriesTOPO, countriesTOPO.objects.countries).features;

        positionMap(municipios,focusBox,rasterBox,countries);

    });
}

//creates full screen base map and lines up raster and vector layers
function positionMap(municipios,focusBox,rasterBox,countries){
    var screenRatio = window.innerWidth/window.innerHeight;
    var focusAreaRatio = 0.95676;

    var w = $("div.map").width();
    var h = $("div.map").height();

    var margin = {top: 20, right: 20, bottom: 20, left: 20}

    //create guatemalaprojection
    const centerLocation = {
      "longitude": -90.2299,
      "latitude": 15.7779
    };
    //albers centered on guatemala
    const albersGuate = d3.geoConicEqualArea()
                      .parallels([14.8,16.8]) 
                      .rotate([centerLocation["longitude"]*-1,0,0])
                      .center([0,centerLocation["latitude"]])
                      .fitExtent([[margin.left,margin.top],[w-margin.right,h-margin.bottom]], focusBox);
                      // .fitExtent([[0,0],[w,h]], focusBox);

    //path generator
    const pathGuate = d3.geoPath()
             .projection(albersGuate);

    var svg = d3.select("div.map")
              .append("svg")
              .attr("viewBox", `0 0 ${w} ${h}`)
              .attr("overflow", "visible")
              .style("position","relative");


    //calculate raster extent percentages
    var rasterBounds = pathGuate.bounds(rasterBox);
    var rasterWidth = (rasterBounds[1][0] - rasterBounds[0][0])/w*100;
    var rasterOrigin = [rasterBounds[0][0]/w*100,rasterBounds[0][1]/h*100];

    //append raster background
    svg.append("image")
            .attr("href", "img/hs_light.jpg")
            .attr("x", rasterOrigin[0]+"%")
            .attr("y", rasterOrigin[1]+"%")
            .attr("width", rasterWidth + "%")
            .attr("transform", "translate(0,5)");

    //draw municipios
    var municipios = svg.append("g")
                            .selectAll(".municipio")
                            .data(municipios)
                            .enter()
                            .append("path")
                                .attr("d", pathGuate)
                                .attr("class", "municipio");

    //draw countries
    var municipios = svg.append("g")
                            .selectAll(".country")
                            .data(countries)
                            .enter()
                            .append("path")
                                .attr("d", pathGuate)
                                .attr("class", "country");

    //draw labels as HTML so it doesn't scale with viewbox
    var countriesLabels = d3.select("div.map").selectAll(".countryLabels")
                                .data(countries)
                                .enter()
                                .append("p")
                                .text(d=>d.properties["NAME"])
                                    .style("left", function(d){
                                        console.log(d);
                                        console.log(pathGuate.centroid(d)[0])
                                        return pathGuate.centroid(d)[0]/w*100+"%";
                                    })
                                    .style("top", function(d){
                                        console.log(d);
                                        return pathGuate.centroid(d)[1]/h*100+"%";
                                    });



}


function drawDotDensity(){

}

loadData();
