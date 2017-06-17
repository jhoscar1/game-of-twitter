import React, {Component} from 'react';
import clientSocket from '../socket';

class Map extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 4,
            center: {lat: 40.750120, lng: -73.985099}
        })
        console.log(map)
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