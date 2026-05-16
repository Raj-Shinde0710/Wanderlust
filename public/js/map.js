
    mapboxgl.accessToken = mapToken;
    console.log(mapToken)   
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
        zoom: 12, // starting zoom
        style: 'mapbox://styles/mapbox/streets-v12'
    });

    // Wait for map to load before adding marker
    map.on('load', function() {
        console.log('Map loaded, coordinates:', listing.geometry.coordinates);
        
        const marker = new mapboxgl.Marker({color: 'red'})
            .setLngLat(listing.geometry.coordinates)
            .setPopup(new mapboxgl.Popup({offset: 25})
    .setHTML(`<h6>${listing.title}</h6> <p> Exact location will be provided after booking </p>`))
         
            .addTo(map);
        
        // Fly to marker location
        map.flyTo({
            center: coordinates,
            zoom: 12,
            essential: true
        });
        
        console.log('Marker added successfully');
    });