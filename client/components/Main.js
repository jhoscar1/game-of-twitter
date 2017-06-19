import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { logout } from '../reducer/user';
import SearchForm from './SearchForm';
import GMap from './Map';
import clientSocket, {allMarkers} from '../socket';
import {map} from './Map'

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      term: '',
      stepTerm: ''
    }
    this.onSubmit = this.onSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.resetGame = this.resetGame.bind(this);
  }

  handleChange(event) {
    this.setState({
      term: event.target.value
    })
  }

  resetGame() {
    allMarkers.forEach(marker => {
      marker.setMap(null);
    });
    this.setState({
      term: '',
      stepTerm: ''
    })
    clientSocket.disconnect();
    clientSocket.connect();
  }

  onSubmit(event) {
      event.preventDefault();
      clientSocket.emit('term', this.state.term)
      this.setState({
        term: '',
        stepTerm: this.state.term
      })
  }

  render() {
    const { children } = this.props
    return (
      <div>
        <h1>Tweet Heat</h1>
        <div id="container">
          <SearchForm
            submitHandler={this.onSubmit}
            handleChange={this.handleChange}
            term={this.state.term}
            stepTerm={this.state.stepTerm}
            clear={this.resetGame}
          />
          <GMap />
        </div>
        <hr />
        { children }
      </div>
  );
  }
}

export default Main;
