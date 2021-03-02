import { ethers } from 'ethers';
import provider from './provider';
import Config from '../config';

export default class AuctionContractConnexion {
    private static Instance: ethers.Contract;
    private static SignedInstance: ethers.Contract;

    private static createInstance(): void {
        this.Instance = new ethers.Contract(Config.AUCTIONCONTRACT_ADDRESS, Config.AUCTIONCONTRACT_ABI, provider);
    }

    private static createSignedInstance(): void {
        if (this.Instance == null) {
            this.createInstance();
        }
        const signer = provider.getSigner();
        this.SignedInstance = this.Instance.connect(signer);
    }

    public static getInstance(): ethers.Contract {
        if (this.Instance == null) {
            this.createInstance();
        }
        return this.Instance;
    }

    public static getSignedInstance(): ethers.Contract {
        if (this.SignedInstance == null) {
            this.createSignedInstance();
        }
        return this.SignedInstance;
    }
}