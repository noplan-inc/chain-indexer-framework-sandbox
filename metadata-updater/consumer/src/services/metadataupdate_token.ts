import { Logger } from "@maticnetwork/chain-indexer-framework/logger";
import { Model } from "mongoose";
import { IToken } from "../interfaces/token.js";


export default class MetadataUpdateTokenService {
    constructor(
        private metadataUpdateModel: Model<IToken>,
    ) { }

    /**
     * this is a public function which takes an array of NFT transfer events and save it in mongodb.
     * 
     * @param {IToken[]} data - data to be saved in mongo
     * 
     * @returns {Promise<boolean>}
     */
    public async save(data: IToken[]): Promise<boolean> {
        Logger.debug({
            location: "transfer_token_service",
            function: "saveTokenTransfers",
            status: "function call",
            data: {
                length: data.length
            }
        });


        if (data && data.length) {
            //@ts-ignore
            await this.metadataUpdateModel.updateTokens(data);
        }

        Logger.debug({
            location: "transfer_token_service",
            function: "saveTokenTransfers",
            status: "function completed"
        });

        return true;
    }
}
