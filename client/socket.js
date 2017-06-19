import io from 'socket.io-client'
import {map} from './components/Map'
const clientSocket = io(window.location.origin);

const makeCircle = (center, sentimentScore, sentimentMag) => {
    let color = sentimentScore > 0 ? '#7800ce' : '#FF0000';
    if (sentimentScore === 0) {
        color = '#ffffff';
    }
    return new google.maps.Circle({
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: color,
        fillOpacity: 0.35,
        map: map,
        center: center,
        clickable: true,
        radius: 1000 * sentimentMag * 750
    });
}

export const allMarkers = [];
const allTweets = [];
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
                            const marker = makeCircle(result.geometry.location, tweet.score, tweet.magnitude);
                            marker.addListener('click', () => {
                                infowindow.setPosition(result.geometry.location);
                                infowindow.open(map, marker);
                            });
                            tweet.marker = marker;
                            allMarkers.push(marker);
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
                const marker = makeCircle(center, tweet.score, tweet.magnitude)
                marker.addListener('click', () => {
                    infowindow.setPosition(center);
                    infowindow.open(map, marker);
                })
                tweet.marker = marker;
                allMarkers.push(marker);
            }
        })
        
    })

    clientSocket.on('step', () => {});
})();

export default clientSocket;