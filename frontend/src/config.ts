import DeedContract from './contracts/DeedContract.json';
import AuctionContract from './contracts/AuctionContract.json';

const Config = {

    DEEDCONTRACT_ADDRESS: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    AUCTIONCONTRACT_ADDRESS: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',

    DEEDCONTRACT_ABI: DeedContract.abi,
    AUCTIONCONTRACT_ABI: AuctionContract.abi,

    GAS_AMOUNT: 500000,
}

export default Config;