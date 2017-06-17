import React, {Component} from 'react';
import {connect} from 'react-redux';

class SearchForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            term: ''
        }
    }

    render() {
        return (
            <form onSubmit={this.props.submitHandler}>
                <div className="form-group">
                    <input
                        className="form-control"
                        name="term"
                        type="text"
                        placeholder="Search By"
                        onChange={this.props.handleChange}
                        value={this.props.term}
                    />
                </div>
                <button className="btn btn-primary">Get Tweets</button>
            </form>
        )
    }
}

export default SearchForm;