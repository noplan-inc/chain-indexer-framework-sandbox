import { IToken } from "./token.js";

/**
 * this class contains methods to interact with the database methods
 * 
 * @returns implementation of all the token model method
 */
const statics = {

    async updateTokens(data: IToken[]): Promise<void> {
        for (let metadataupdate of data) {
            //@ts-ignore
            await this.updateOne({ tokenId: metadataupdate.tokenId }, { txHash: metadataupdate.txHash }, { upsert: true });
        }
        return;
    }
}

export default statics;
