import { ITransformedBlock } from "@maticnetwork/chain-indexer-framework/interfaces/transformed_block";
import { Logger } from "@maticnetwork/chain-indexer-framework/logger";
import INFTMetadataUpdateTx from "../interfaces/nft_metadataupdate_tx.js";
import { IToken } from "../interfaces/token.js";

/**
 * TransferTokenMapper class is a mapper class which has function to map the data according to all NFT transfers and
 * these functions are not async as there is only data transformation according to the way it will be saved in mongodb.
 * 
 * @class TransferTokenMapper
 */
export default class MetadataUpdateTokenMapper {
    
    public map(transformedBlock: ITransformedBlock<INFTMetadataUpdateTx>): IToken[] {
        let tokens: IToken[] = [];
        for (const metadataupdate of transformedBlock.data) {
            tokens.push({
                tokenId: metadataupdate.tokenId,
                txHash: metadataupdate.transactionHash,
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
