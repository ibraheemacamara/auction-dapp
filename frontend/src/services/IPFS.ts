import Config from '../config';
var IPFSClient = require('ipfs-http-client');
var BufferList = require('bl/BufferList');
var CryptoJs = require('crypto-js');


class IPFS {
    Instance;

    constructor() {
        this.setInstance();
    }

    private setInstance() {
        this.Instance = new IPFSClient({ host: Config.IPFS_URL, port: Config.IPFS_PORT, protocol: Config.IPFS_PROTOCOL });
    }

    public async addFile(file): Promise<any> {
        if (this.Instance === undefined) {
            this.setInstance();
        }
        console.log(file)
        var hash = await this.Instance.add(file);
        return hash.path;
    }

    public async getFile(hash: string): Promise<any> {
        console.log("Getting...", hash);
        if (this.Instance === undefined) {
            this.setInstance();
        }
        for await (var fileBlod of this.Instance.get(hash)) {

            var data = new BufferList();
            for await (const chunk of fileBlod.content) {
                data.append(chunk);
            }

            var decrypt = CryptoJs.AES.decrypt(data.toString(), 'password');

            var result = decrypt.toString(CryptoJs.enc.Base64);
            // var result2 = new ArrayBuffer(decrypt);
            // var reader = new FileReader();
            // var blob = new Blob(result);
            // reader.readAsDataURL(blob);
            // reader.onloadend = () => {
            //     console.log(reader.result);
            // }
            // console.log(result2)
            return result;
        }
    }
}

export default IPFS;