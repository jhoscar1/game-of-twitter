import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { logout } from '../reducer/user';
import SearchForm from './SearchForm';
import GMap from './Map';
import clientSocket from '../socket';
// Component //

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      term: ''
    }
    this.onSubmit = this.onSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({
      term: event.target.value
    })
  }

  onSubmit(event) {
      event.preventDefault();
      clientSocket.emit('term', this.state.term)
      this.setState({
        term: ''
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
