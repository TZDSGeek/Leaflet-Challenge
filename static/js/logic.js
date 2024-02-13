// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Depth: ${feature.geometry.coordinates[2]}</p><hr><p>Magnitude: ${feature.properties.mag}</p>`);
  }

  // Create the logic for the color scales
  function depthColor(depth) {
    if (depth <= 10) {
      return '#98EE00';
    } else if (depth <= 30) {
      return '#D4EE00';
    } else if (depth <= 50) {
      return '#EECC00';
    } else if (depth <= 70) {
      return '#EE9C00';
    } else if (depth <= 90) {
      return '#EA822C';
    } else {
      return '#EA2C2C';
    }
  }

  // Create function for the markers and radius size
  function createMarker(feature) {
    let marker = L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
      radius: feature.properties.mag * 4,
      color: depthColor(feature.geometry.coordinates[2]),
      opacity: 1,
      fillOpacity: 1
    });

    // Bind a popup to the marker
    marker.bindPopup(`Magnitude: ${feature.properties.mag}<br>Depth: ${feature.geometry.coordinates[2]}`);

    return marker;
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: createMarker
  });

  // Create a legend to display information about our map.
  let info = L.control({
    position: "bottomright"
  });

  // When the layer control is added, insert a div with the class of "legend".
  info.onAdd = function () {
    let div = L.DomUtil.create("div", "legend");
    let colors = ['#98EE00', '#D4EE00', '#EECC00', '#EE9C00', '#EA822C', '#EA2C2C'];
    let labels = ['-10','10','30','50','70','90'];
    for (let i = 0; i < labels.length; i++) {
      div.innerHTML += "<li style='background-color: "
        + colors[i]
        + "'></li> "
        + labels[i]
        + (labels[i + 1] ? "&ndash;" + labels[i + 1] + "<br>" : "+");
    }
    return div;
  };

  // Create map 
  createMap(earthquakes, info);

}

function createMap(earthquakes, info) {
  // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakes]
  });

  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Add legend to the map
  info.addTo(myMap);
}