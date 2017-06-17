import React, {Component} from 'react';
import clientSocket from '../socket';

class Map extends Component {
    constructor(props) {
        super(props);
        this.state = {
            zoom: 4
        }
    }

    componentDidMount() {
        this.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 4,
            center: {lat: 40.750120, lng: -73.985099}
        })
        console.log(map)
    }

    handleZoomChange() {
        this.setState({
            zoom: this.map.getZoom()
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