import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { logout } from '../reducer/user';

// Component //

const Main = props => {

  const { children } = props;

  return (
    <div>
      <h1>BOILERMAKER</h1>
      <hr />
      { children }
    </div>
  );
};

// Container //

const mapState = ({ user }) => ({
  loggedIn: !!user.id
});

const mapDispatch = dispatch => ({
  handleClick () {
    dispatch(logout());
  }
});

export default connect(mapState, mapDispatch)(Main);
