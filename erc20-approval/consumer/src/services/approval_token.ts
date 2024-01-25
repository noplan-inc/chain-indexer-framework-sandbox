import { Logger } from "@maticnetwork/chain-indexer-framework/logger";
import { Model } from "mongoose";
import { IToken } from "../interfaces/token.js";


export default class ApprovalTokenService {
    constructor(
        private tokenModel: Model<IToken>,
    ) { }

    public async save(data: IToken[]): Promise<boolean> {
        Logger.debug({
            location: "approval_token_service",
            function: "saveApprovalToken",
            status: "function call",
            data: {
                length: data.length
            }
        });


        if (data && data.length) {
            //@ts-ignore
            await this.tokenModel.updateTokens(data);
        }

        Logger.debug({
            location: "approval_token_service",
            function: "saveApprovalToken",
            status: "function completed"
        });

        return true;
    }
}
