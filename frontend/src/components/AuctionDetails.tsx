import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import App from '../App';

import '../App.css'
import 'bootstrap/dist/css/bootstrap.min.css';

function AuctionDetails(props) {

    var deadLine: Date = props.auction.blockDeadline;

    function handleHome(){
        ReactDOM.render(
            <React.StrictMode>
              <App />
            </React.StrictMode>,
            document.getElementById('root')
          );
    }

    return (
        <Container className="p-3">
            <Jumbotron>
                <Button variant="link" onClick={handleHome}>Home</Button>
                <div className="App">
                    <h3>Auction details</h3>
                    <img className="img" src={props.auction.metaData} />
                    <p>{props.auction.title}</p>
                    <p>Start price: {props.auction.startPrice} ETH</p>
                    <p>Auction ends in: {deadLine.toString()}</p>
                    <Button className="blockButton" variant="primary">Bid </Button>
                    <Button className="blockButton" variant="success" disabled>Finalize </Button>
                    <Button className="blockButton" variant="danger" disabled>Cancel </Button>
                </div>
            </Jumbotron>
        </Container>
    )
}

export default AuctionDetails;