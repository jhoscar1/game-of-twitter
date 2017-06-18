import io from 'socket.io-client'
import {map} from './components/Map'
const clientSocket = io(window.location.origin);

const makeCircle = (center) => {
    return new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        map: map,
        center: center,
        clickable: true,
        radius: 1000000
    });
}

(() => {
    clientSocket.on('tweet', (tweets) => {
        const geocoder = new google.maps.Geocoder;
        tweets.map(tweet => {
            console.log(tweet);
            const infowindow = new google.maps.InfoWindow({
                content: `${tweet.text} - @${tweet.user.screen_name}`
            })
            if (!tweet.coordinates || tweet.coordinates === null) {
                geocoder.geocode({address: tweet.user.location}, (results, status) => {
                    if (results) {
                        results.forEach(result => {
                        //     const marker = new google.maps.Marker({
                        //         map: map,
                        //         place: {
                        //             placeId: result.place_id,
                        //             location: result.geometry.location
                        //         }
                        //     })
                            const marker = makeCircle(result.geometry.location);
                            marker.addListener('click', () => {
                                infowindow.setPosition(result.geometry.location);
                                infowindow.open(map, marker);
                            });
                            tweet.marker = marker;
                        });
                    }
                })
            }
            else {
                const [lat, long] = tweet.coordinates.coordinates;
                const center = new google.maps.LatLng(lat, long)
                // const marker = new google.maps.Marker({
                //     map: map,
                //     position: new google.maps.LatLng(lat, long)
                // })
                const marker = makeCircle(center)
                marker.addListener('click', () => {
                    infowindow.setPosition(center);
                    infowindow.open(map, marker);
                })
                tweet.marker = marker;
            }
        })
        
    })
})();

export default clientSocket;