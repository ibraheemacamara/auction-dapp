import { ethers } from 'ethers';
import provider from '../services/provider';
import DeedContractConnexion from '../services/DeedContractConnexion';
import Config from '../config';

export default class Deed {
    contractInstance: any = null;
    contractSignedInstance: any = null;
    account: string = '';
    gas: number;

    constructor() {
        this.contractInstance = DeedContractConnexion.getInstance();
        this.contractSignedInstance = DeedContractConnexion.getSignedInstance();
        this.gas = Config.GAS_AMOUNT;
    }

    setAccount(account: string) {
        this.account = account;
    }

    getCurrentBlock(): Promise<number> {
        return provider.getBlockNumber();
    }

    create(deedId: number, deedUri: string){
        return new Promise((resolve, reject) => {
            this.contractSignedInstance.registerDeed(deedId, deedUri, { from: this.account, gas: this.gas }
                , (err: any, transaction: any) => {
                    if (!err) {
                        resolve(transaction);
                    }
                    else {
                        reject(err);
                    }
                })
        })
    }

    exists(deeId: number){
        return new Promise((resolve, reject) => {
            this.contractInstance.exists(deeId, { from: this.account, gas: this.gas }
                , (err: any, transaction: any) => {
                    if (!err) {
                        resolve(transaction);
                    }
                    else {
                        reject(err);
                    }
                })
        })
    }

    transferTo(to: string, deedId: number) {
        // if (!ethers.utils.isAddress(to)) {
        //     console.log(to, " is not a valid address!");
        //     return false;
        // }
        return new Promise((resolve, reject) => {
            this.contractSignedInstance.transferFrom(this.account, to, deedId, { from: this.account, gas: this.gas }
                , (err: any, transaction: any) => {
                    if (!err) {
                        resolve(transaction);
                    }
                    else {
                        reject(err);
                    }
                })
        })
    }

    async watchIfDeedCreated(callback: any){
        var currentBlockNumber: number = await this.getCurrentBlock();
        var eventWatcher = this.contractInstance.DeedRegistred({}, {fromBlock: currentBlockNumber - 1, toBlock: 'latest'});
        eventWatcher.watch(callback);
    }

    async watchIfDeedTransfered(callback: any){
        var currentBlockNumber: number = await this.getCurrentBlock();
        var eventWatcher = this.contractInstance.Transfer({}, {fromBlock: currentBlockNumber - 1, toBlock: 'latest'});
        eventWatcher.watch(callback);
    }
}