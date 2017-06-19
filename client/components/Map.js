import React, {Component} from 'react';
import clientSocket from '../socket';

export let map;

class Map extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 5,
            center: {lat: 39, lng: -95}
        })
    }

    render() {
        const style = {
            width: '100vw',
            height: '100vh'
        }
        return(
            <div style={style} id="map">
            </div>
        )
    }
}

export default Map;