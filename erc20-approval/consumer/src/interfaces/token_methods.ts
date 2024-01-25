import { IToken } from "./token.js";

/**
 * this class contains methods to interact with the database methods
 * 
 * @returns implementation of all the token model method
 */
const statics = {

    async updateTokens(data: IToken[]): Promise<void> {
        for (let approvalToken of data) {
            //@ts-ignore
            await this.updateOne(
                { txHash: approvalToken.txHash },
                { 
                    txHash: approvalToken.txHash,
                    ownerAddress: approvalToken.ownerAddress,
                    spenderAddress: approvalToken.spenderAddress,
                    amount: approvalToken.amount,
                },
                { upsert: true }
            );
        }
        return;
    }
}

export default statics;
