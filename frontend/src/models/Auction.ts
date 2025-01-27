import { ethers } from 'ethers';
import provider from '../services/provider';
import AuctionContractConnexion from '../services/AuctionContractConnexion';
import Config from '../config';

export default class Auction {
    contractInstance: any = null;
    contractSignedInstance: any = null;
    account: string = '';
    gas: number;

    constructor() {
        this.contractInstance = AuctionContractConnexion.getInstance();
        this.contractSignedInstance = AuctionContractConnexion.getSignedInstance();
        this.gas = Config.GAS_AMOUNT;
    }

    setAccount(account: string) {
        this.account = account;
    }

    getCurrentBlockNumber(): Promise<number> {
        return provider.getBlockNumber();
    }

    async getCount(): Promise<number> {
        return await this.contractInstance.getAuctionsCount()
    }

    async getAuctionById(auctionId: number) {
        return await this.contractInstance.getAuctionById(auctionId);
    }

    //Create new auction
    async createAuction(title: string, deedId: number, stratPrice: number, metaData: string, blockDeadline: number) {
        
        var signedContract = this.contractInstance.connect(provider.getSigner(this.account));
        var price = ethers.utils.parseEther(stratPrice.toString());
        console.log("Start Price: ", price);
        return await signedContract.createAuction(title, deedId, Config.DEEDCONTRACT_ADDRESS, price, metaData, blockDeadline);
        
        // return new Promise((resolve, reject) => {
        //     signedContract.createAuction(
        //         title, deedId, Config.DEEDCONTRACT_ADDRESS, stratPrice, metaData, blockDeadline
        //         , (transaction: any, err: any) => {
        //             if (!err) resolve(transaction);
        //             else reject(err);
        //         }
        //     )
        // })
    }

    //Bid on auction
    bid(auctionId: number, amount: number) {
        var amountInWei = ethers.utils.parseEther(amount.toString());
        return new Promise((resolve, reject) => {
            this.contractSignedInstance.bidOnAuction(auctionId, { from: this.account, value: amountInWei, gas: this.gas }
                , (transaction: any, err: any) => {
                    if (!err) resolve(transaction);
                    else reject(err);
                })
        })
    }

    cancelAuction(auctionId: number) {
        return new Promise((resolve, reject) => {
            this.contractSignedInstance.cancelAuction(auctionId, { from: this.account, gas: this.gas }
                , (transaction: any, err: any) => {
                    if (!err) resolve(transaction);
                    else reject(err);
                })
        })
    }

    finalizeAuction(auctionId: number) {
        return new Promise((resolve, reject) => {
            this.contractSignedInstance.finalizeAuction(auctionId, { from: this.account, gas: this.gas }
                , (transaction: any, err: any) => {
                    if (!err) resolve(transaction);
                    else reject(err);
                })
        })
    }

    findAuctionById(auctionId: number): Promise<number> {
        return new Promise((resolve, reject) => {
            this.contractInstance.getAuctionById(auctionId, { from: this.account, gas: this.gas }
                , (transaction: any, err: any) => {
                    if (!err) resolve(transaction);
                    else reject(err);
                })
        })
    }

    getNumberOfBids(auctionId: number): Promise<number> {
        return new Promise((resolve, reject) => {
            this.contractInstance.getBidsCount(auctionId, { from: this.account, gas: this.gas }
                , (transaction: any, err: any) => {
                    if (!err) resolve(transaction);
                    else reject(err);
                })
        })
    }

    getCurrentBid(auctionId: number): Promise<number> {
        return new Promise((resolve, reject) => {
            this.contractInstance.getLastBid(auctionId, { from: this.account, gas: this.gas }
                , (transaction: any, err: any) => {
                    if (!err) resolve(transaction);
                    else reject(err);
                })
        })
    }

    async watchIfCreated(callback: any) {
        const currentBlock = await this.getCurrentBlockNumber()
        const eventWatcher = this.contractInstance.AuctionCreated({}, {fromBlock: currentBlock - 1, toBlock: 'latest'})
        eventWatcher.watch(callback)
    }

    async watchIfBidSuccess(callback: any) {
        const currentBlock = await this.getCurrentBlockNumber()
        const eventWatcher = this.contractInstance.BidSuccess({}, {fromBlock: currentBlock - 1, toBlock: 'latest'})
        eventWatcher.watch(callback)
    }

    async watchIfCanceled(callback: any) {
        const currentBlock = await this.getCurrentBlockNumber()
        const eventWatcher = this.contractInstance.AuctionCanceled({}, {fromBlock: currentBlock - 1, toBlock: 'latest'})
        eventWatcher.watch(callback)
    }

    async watchIfFinalized(callback: any) {
        const currentBlock = await this.getCurrentBlockNumber()
        const eventWatcher = this.contractInstance.AuctionFinalized({}, {fromBlock: currentBlock - 1, toBlock: 'latest'})
        eventWatcher.watch(callback)
    }
}