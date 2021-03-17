import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import AuctionDetails from './AuctionDetails';
import AuctionForm from './AuctionForm';

import house1 from '../assets/house1.jpeg';
import house2 from '../assets/house2.jpeg';

import '../App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactDOM from 'react-dom';
import getAccounts from '../services/account';
import AuctionContract from '../models/Auction';
import IPFS from '../services/IPFS';

function Auction() {

    const [accounts, setAccounts] = useState();

    var currentDate = new Date();

    var auctions = [
        {
            title: "house 1",
            auctionId: 1,
            deedId: 2,
            startPrice: 3,
            metaData: house1,
            blockDeadline: new Date(currentDate.getTime() + 5 * 60000)
        },
        {
            auctionId: 2,
            title: "house 2",
            deedId: 5,
            startPrice: 23,
            metaData: house2,
            blockDeadline: new Date(currentDate.getTime() + 10 * 60000)
        },
        {
            auctionId: 3,
            title: "house 2",
            deedId: 6,
            startPrice: 23,
            metaData: house2,
            blockDeadline: new Date(currentDate.getTime() + 10 * 60000)
        }
    ]

    useEffect(() => {
        getAccounts().then(function (result) {
            setAccounts(result);
        }).catch(function (error) {
            console.log(error);
        });

        var auctionContract = new AuctionContract();
        auctionContract.getCount().then(result => {
            console.log("Number of auctions: ", result);

            if(result > 0){
                //var tmpAuctions: any = [];
                for (let auctionId = 0; auctionId < result; auctionId++) {
                    auctionContract.getAuctionById(auctionId).then(value => {
                        var price = parseFloat(value.startPrice) / 10 ** 18;
                        var deadLine = new Date(value.blockDeadline.toNumber());

                        var ipfs = new IPFS();
                        ipfs.getFile(value.metaData).then(md => {
                            console.log(md);
                            var acc = {
                                title: value.name,
                                auctionId: auctionId,
                                deedId: value.deedId.toNumber(),
                                startPrice: price,
                                metaData: md,
                                blockDeadline: deadLine,
                                owner: value.owner
                            }
                            //src="data:image/png;base64,<%=project.image1.toString('base64')%>"
                            auctions.push(acc);
                        }).catch(error => {
                            console.log(error);
                        });

                    }).catch(err => {
                        console.log(err);
                    })
                }
                console.log(auctions);
            }
        }).catch(error => {
            console.log(error);
        })

    }, []);

    function handleCreateAuction() {

        var lastAuction = auctions[auctions.length - 1];

        ReactDOM.render(

            <AuctionForm data={{previousAuction: lastAuction, account: accounts[0]}}/>
            ,
            document.getElementById('root')
        );
    }

    function auctionInfos(auctionId: number) {
        let selectedAuction = auctions.find(x => x.auctionId === auctionId);
        console.log(selectedAuction)

        ReactDOM.render(

            <AuctionDetails auction={selectedAuction}/>
            ,
            document.getElementById('root')
        );
    }

    return (
        <>
            {auctions.map((auction) => (
                <ListGroup key={auction.auctionId} horizontal>
                    <ListGroup.Item className="bids">
                        <img src={'data:image/png;base64,${auction.metaData}'} />
                        <p>Title: {auction.title}</p>
                        <Button onClick={() => auctionInfos(auction.auctionId)}>More infos</Button>
                    </ListGroup.Item>
                </ListGroup>
            ))}
            <div className="App">
                <Button className="App" onClick={handleCreateAuction}>Create an Auction</Button>
            </div>
        </>
    )
}

export default Auction;


