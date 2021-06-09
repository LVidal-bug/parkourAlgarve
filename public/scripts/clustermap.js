
let data = null
let spots = null
let reqURL = `http://localhost:3000${url}`
reqURL = reqURL.replace('allSpots', 'allSpots/API/MAP')
reqURL = reqURL.replace('amp;', '')

//SEARCH SCRIPT
//Search function
const spotsCont = document.querySelector('.spots')

let resultSpots = []
function searchSpot(query) {
    let q = query.toLowerCase()
    let array = []
    for (let spot of spots.features) {
        if (spot.properties.title.toLowerCase().includes(q) || spot.properties.description.toLowerCase().includes(q) || spot.properties.city.toLowerCase().includes(q)) {
            array.push(spot)
        }
    }
    resultSpots = array
    displaySpots(resultSpots)
}

//Display function
function displaySpots(spots) {
    if (!spots.length) {
        return spotsCont.innerHTML = `
        <div class="error">
        <h3>Nenhum spot encontrado 404</h3>
        <p>Não conseguimos encontrar nehum spot correspondente aos dados inseridos.</p>
        </div>
        `
    }
    let spotsArr = []
    let html = []
    spots.forEach((spot) => {
        let htmlstr = `
        <div class="spot">
        <div class="info2">
        <h5 class="title">
        ${spot.properties.title}
        </h5>
        <p class="city">
        ${spot.properties.city}
        </p>
        <p class="shortDes">
        ${spot.properties.description.substring(0, 25)}</p>
        <a href="/spot/${spot.properties.id}" class="btn btn-primary moreInf">Mais detalhes</a>
        </div>
        <img src="${spot.properties.imageURL}" class="">
        </div>
       `
        html.push(htmlstr)
    })
    let finalhtml = ''
    html.map((s) => {
        finalhtml = finalhtml + s
    })
    return spotsCont.innerHTML = finalhtml

}

//GET DATA
let def = null
axios.get('http://localhost:3000/allSpots/API', {
}).then((response) => {
    spots = response.data
    displaySpots(response.data.features)
}, (error) => {
    console.log(error);
});
axios.get(reqURL, {
}).then((response) => {
    data = response.data
}, (error) => {
    console.log(error);
});







const searchBar = document.querySelector('.search')
searchBar.addEventListener('keyup', function (e) {
    searchSpot(e.target.value)

})




//CLUSTER MAP

mapboxgl.accessToken = mapToken;

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    center: [-8.3670494, 37.1248161],
    zoom: 10
});

map.on('load', function () {
    // Add a new source from our GeoJSON data and
    // set the 'cluster' option to true. GL-JS will
    // add the point_count property to your source data.
    map.addSource('spots', {
        type: 'geojson',
        // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
        // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
        data: data,
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    });

    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'spots',
        filter: ['has', 'point_count'],
        paint: {
            // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
            // with three steps to implement three types of circles:
            //   * Blue, 20px circles when point count is less than 100
            //   * Yellow, 30px circles when point count is between 100 and 750
            //   * Pink, 40px circles when point count is greater than or equal to 750
            'circle-color': [
                'step',
                ['get', 'point_count'],
                '#51bbd6',
                100,
                '#f1f075',
                750,
                '#f28cb1'
            ],
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                15,
                50,
                25,
                750,
                35
            ]
        }
    });

    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'spots',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        }
    });

    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'spots',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color': '#11b4da',
            'circle-radius': 4,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
        }
    });

    // inspect a cluster on click
    map.on('click', 'clusters', function (e) {
        var features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters']
        });
        var clusterId = features[0].properties.cluster_id;
        map.getSource('spots',
            function (err, zoom) {
                if (err) return;

                map.easeTo({
                    center: features[0].geometry.coordinates,
                    zoom: zoom
                });
            }
        );
    });

    // When a click event occurs on a feature in
    // the unclustered-point layer, open a popup at
    // the location of the feature, with
    // description HTML from its properties.
    map.on('click', 'unclustered-point', function (e) {

        var coordinates = e.features[0].geometry.coordinates.slice();
        // Ensure that if the map is zoomed out such that
        // multiple copies of the feature are visible, the
        // popup appears over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        console.log(e.features[0].properties.id)
        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(`
               <div class="d-flex flex-column align-items-center">
             <h6 > <a href="/spot/${e.features[0].properties.id}"> ${e.features[0].properties.title}</a></h6>
                <img class="thumbnail " src="${e.features[0].properties.imageURL}">
               </div>
               `)


            .addTo(map);
    });

    map.on('mouseenter', 'clusters', function () {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', function () {
        map.getCanvas().style.cursor = '';
    });
});