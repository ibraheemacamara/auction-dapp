import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';
import DatePicker from 'react-datepicker';
import App from '../App';
import IPFS from '../services/IPFS';
import Auction from '../models/Auction';
import Deed from '../models/Deed';

import '../App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import "react-datepicker/dist/react-datepicker.css";

var CryptoJs = require('crypto-js');

function AuctionForm(props) {

    const [startDate, setStartDate] = useState(new Date());
    const [startPrice, setStartPrice] = useState(0);
    const [title, setTitle] = useState("");
    const [metaData, setMetaData] = useState("");
    const [file, setFile] = useState();
    const [showFailure, setShowFailure] = useState(false);
    const [showSuccess, setShowSucces] = useState(false);

    function handleFormSubmit(event) {
        event.preventDefault();

        console.log(startPrice)
        if (startPrice === undefined || startPrice <= 0) {
            setShowFailure(true);
            return;
        }

        console.log(file);
        var ipfs = new IPFS();
        ipfs.addFile(file).then(value => {
            console.log(value);
            setMetaData(value);
            creatAuction(value);
        }).catch(err => {
            console.log(err);
        });

    }

    function creatAuction(deedHash: string) {
        //create deed first
        var deedId: number = props.data.previousAuction.deedId + 5;
        var deed = new Deed();
        deed.setAccount(props.data.account);
        deed.create(deedId, deedHash).then(result => {
            console.log("Deed Created: ", result);

            //deed succesfully created, now create auction
            var auctionInstance = new Auction();
            auctionInstance.setAccount(props.data.account);
            console.log("MEta Data: ", deedHash);
            auctionInstance.createAuction(title, deedId, startPrice, deedHash, startDate.getTime())
                .then(value => {
                    console.log("Auction Created: ", value);
                    setShowSucces(true);
                }).catch(error => {
                    console.log(error)
                });
        }).catch(error => {
            console.log(error);
            return;
        })
    }

    function getFile() {
        var ipfs = new IPFS();
        ipfs.getFile(metaData).then(value => {
            console.log(value)
        }).catch(error => {
            console.log(error);
        });
    }

    function handleTitle(event) {
        setTitle(event.target.value);
        console.log(title);
    }

    function handleStartPrice(event) {
        setStartPrice(event.target.value);
        console.log(startPrice);
    }

    function handleFile(event) {
        var fileLoaded = event.target.files[0];

        if (fileLoaded !== undefined) {
            var reader = new FileReader();
            reader.readAsArrayBuffer(fileLoaded);
            reader.onloadend = () => {
                var wordArray = CryptoJs.lib.WordArray.create(reader.result);

                var encrypted = CryptoJs.AES.encrypt(wordArray, 'password').toString();
                setFile(new Buffer(encrypted));
            }
            // reader.readAsArrayBuffer(file);
            // reader.onloadend = () => {
            //     if (reader.result != null) {
            //         setFile(new Buffer(reader.result.toString()));
            //     }
            // }
        }
    }

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
                <Form className="App" onSubmit={handleFormSubmit}>
                    <h3>Create new Auction</h3>
                    <Col xs="auto">
                        <Form.Group>
                            <Form.Label>Title</Form.Label>
                            <Form.Control required type="text" placeholder="Auction's title" onChange={handleTitle} />
                        </Form.Group>
                    </Col>
                    <Form.Group>
                        <Form.Label>Start price</Form.Label>
                        <Form.Control required type="number" onChange={handleStartPrice} />
                    </Form.Group>
                    <Form.Group>
                        <Form.File required id="metaData" label="Choose an image" onChange={handleFile} />
                    </Form.Group>
                    <Form.Group>
                        <DatePicker selected={startDate} onChange={date => setStartDate(date)} />
                    </Form.Group>
                    <Form.Group>
                        <Button className="submit" variant="primary" type="submit">
                            Create
                            </Button>
                    </Form.Group>
                </Form>
                {
                    showFailure &&
                    <Alert variant="danger" onClose={() => setShowFailure(false)} dismissible>
                        <Alert.Heading>Something went wrong!</Alert.Heading>
                        <p>
                            Start Price is not correct.
                    </p>
                    </Alert>
                }
                {
                    showSuccess &&
                    <Alert variant="success" onClose={handleHome} dismissible>
                        <Alert.Heading>Auction Created</Alert.Heading>
                        <p>
                            The auction is succesfully created.
                    </p>
                    </Alert>
                }
            </Jumbotron>
        </Container>
    );
}

export default AuctionForm;
