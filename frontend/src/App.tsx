import React from 'react';
import Auction from './components/Auction';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Container from 'react-bootstrap/Container';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  return (
    <Container className="p-3">
      <Jumbotron>
        <h1 className="header">Real Estate Decentralized Auction</h1>
        <Auction></Auction>
      </Jumbotron>
    </Container>
  );
}

export default App;
