window.onload = () => {

    // Setting the latitude and longitude using the Geolocation API
    // navigator.geolocation.getCurrentPosition = function(success, failure) {
    //     success({ coords: {
    //         latitude: 32.486622764985288,
    //         longitude: 98.36985785616653,

    //     }, timestamp: Date.now() });
    // }

    // navigator.geolocation.getCurrentPosition(function (position) {
    //     console.log(position.coords)
    // })

    // if you want to dynamically add places, de-comment following line
    // let method = 'dynamic';
	let method = 'static';

    if (method === 'static') {
        let places = staticLoadPlaces();
        renderPlaces(places);
    }

    if (method !== 'static') {

        // first get current user location
        return navigator.geolocation.getCurrentPosition(function (position) {

            // than use it to load from remote APIs some places nearby
            dynamicLoadPlaces(position.coords)
                .then((places) => {
                    renderPlaces(places);
                })
        },
            (err) => console.error('Error in retrieving position', err),
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 27000,
            }
        );
    }
};

function staticLoadPlaces() {
    return [
        {
            name: "Gate-09",
            location: {
                lat: 22.486739042916515, // add here latitude if using static data
                lng: 88.36984015381692 // add here longitude if using static data
            }
        },
        {
            name: 'Others',
            location: {
                lat: 22.486727890718882,
                lng: 88.36991994955132
            }
        },
        {
            name: 'Restroom',
            location: {
                lat: 22.486802858550426,
                lng: 88.3698891041027
            }
        },
        {
            name: 'Kalpana Appartment',
            location: {
                lat: 22.486649406547915,
                lng: 88.36969692380812
            }
        },
        {
            name: 'Charulata',
            location: {
                lat: 22.48660727558182,
                lng: 88.36996849717492
            }
        }
    ];
}

// getting places from REST APIs
function dynamicLoadPlaces(position) {
    let params = {
        radius: 300,    // search places not farther than this value (in meters)
        clientId: 'BJUS1TD2RCTFXG13T1BKIBEK2TX01YMH4SSPBROCTCS2CGGX',   // add your credentials here
        clientSecret: 'OGBY14DM3E1WXLWHPDUKV4RP32MYIOEJJ0VR2VE2YNG43FR4',   // add your credentials here
        version: '20300101',    // foursquare versioning, required but unuseful for this demo
    };

    // CORS Proxy to avoid CORS problems
    let corsProxy = 'https://cors-anywhere.herokuapp.com/';

    // Foursquare API
    let endpoint = `${corsProxy}https://api.foursquare.com/v2/venues/search?intent=checkin
        &ll=${position.latitude},${position.longitude}
        &radius=${params.radius}
        &client_id=${params.clientId}
        &client_secret=${params.clientSecret}
        &limit=15
        &v=${params.version}`;
    return fetch(endpoint)
        .then((res) => {
            return res.json()
                .then((resp) => {
                    return resp.response.venues;
                })
        })
        .catch((err) => {
            console.error('Error with places API', err);
        })
};

function renderPlaces(places) {
    let scene = document.querySelector('a-scene');

    places.forEach((place) => {
        const latitude = place.location.lat;
        const longitude = place.location.lng;
		
		// console.log("latitude: ", latitude, " longitude: ", longitude)

        // add place icon
        const icon = document.createElement('a-image');
        icon.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude}`);
        icon.setAttribute('name', place.name);

        if(place.name === 'Gate-09')
            icon.setAttribute('src', './assets/gate-09.png');
        else if(place.name === 'Restroom')
            icon.setAttribute('src', './assets/restroom.jpg');
        else
            icon.setAttribute('src', './assets/map-marker.png');

        // for debug purposes, just show in a bigger scale, otherwise I have to personally go on places...
        // icon.setAttribute('scale', '20, 20');

        icon.addEventListener('loaded', () => window.dispatchEvent(new CustomEvent('gps-entity-place-loaded')));

        const clickListener = function (ev) {
            ev.stopPropagation();
            ev.preventDefault();

            const name = ev.target.getAttribute('name');

            const el = ev.detail.intersection && ev.detail.intersection.object.el;

            if (el && el === ev.target) {
                const label = document.createElement('span');
                const container = document.createElement('div');
                container.setAttribute('id', 'place-label');
                label.innerText = name;
                container.appendChild(label);
                document.body.appendChild(container);

                setTimeout(() => {
                    container.parentElement.removeChild(container);
                }, 1500);
            }
        };

        icon.addEventListener('click', clickListener);

        scene.appendChild(icon);
    });
}