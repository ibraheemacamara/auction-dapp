import { ethers } from "ethers";


const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
//const signer = providerEth.getSigner()

export default provider;