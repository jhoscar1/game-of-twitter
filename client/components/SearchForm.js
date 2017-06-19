import React, {Component} from 'react';
import {connect} from 'react-redux';
import clientSocket from '../socket';

class SearchForm extends Component {

    constructor(props) {
        super(props);
        this.step = this.step.bind(this);
    }

    step(event) {
        event.preventDefault();
        clientSocket.emit('step', this.props.stepTerm);
    }

    render() {
        const style = {
            margin: '0px 3px'
        }
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
                <button
                    className="btn btn-primary"
                    style={style}
                >
                    Get Tweets
                </button>
                { this.props.stepTerm ?
                    <button
                        className="btn btn-success"
                        onClick={this.step}
                        style={style}
                    >
                        {`Step With "${this.props.stepTerm}"`}
                    </button>
                    :
                    null
                }
                <button
                    className="btn btn-warning"
                    onClick={this.props.clear}
                    style={style}
                >
                    Reset
                </button>
            </form>
        )
    }
}

export default SearchForm;