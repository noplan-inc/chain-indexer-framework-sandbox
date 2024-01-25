import { ITransformedBlock } from "@maticnetwork/chain-indexer-framework/interfaces/transformed_block";
import { Logger } from "@maticnetwork/chain-indexer-framework/logger";
import ITokenApprovalTx from "../interfaces/token_approval_tx.js";
import { IToken } from "../interfaces/token.js";

export default class ApprovalTokenMapper {
    
    public map(transformedBlock: ITransformedBlock<ITokenApprovalTx>): IToken[] {
        let tokens: IToken[] = [];
        for (const approvalTx of transformedBlock.data) {
            tokens.push({
                txHash: approvalTx.transactionHash,
                ownerAddress: approvalTx.ownerAddress,
                spenderAddress: approvalTx.spenderAddress,
                amount: approvalTx.amount,
            });
        }

        //Remove below when app is stable
        Logger.debug({
            location: "mapper: tokens",
            function: "mapTokens",
            status: "function completed",
        })
        return tokens;
    }
}
