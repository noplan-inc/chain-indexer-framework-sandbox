import { ITransformedBlock } from "@maticnetwork/chain-indexer-framework/interfaces/transformed_block";
import { ITransaction } from "@maticnetwork/chain-indexer-framework/interfaces/transaction";
import { IBlock } from "@maticnetwork/chain-indexer-framework/interfaces/block";
import { Logger } from "@maticnetwork/chain-indexer-framework/logger";
import { IConsumerConfig } from "@maticnetwork/chain-indexer-framework/interfaces/consumer_config";
import { IProducerConfig } from "@maticnetwork/chain-indexer-framework/interfaces/producer_config";
import { transform } from "@maticnetwork/chain-indexer-framework/data_transformation/transform";
import ITokenApprovalTx from "./interfaces/token_approval_tx.js";
import { TokenApprovalMapper } from "./mappers/token_approval_mapper.js";

export default async function startTransforming(
    consumerConfig: IConsumerConfig,
    producerConfig: IProducerConfig,
    tokenApprovalMapper: TokenApprovalMapper
): Promise<void> {
    try {
        transform<IBlock, ITokenApprovalTx>({
            consumerConfig,
            producerConfig,
            type: 'asynchronous'
        }, {
            transform: async (block: IBlock): Promise<ITransformedBlock<ITokenApprovalTx>> => {
                let approvals: ITokenApprovalTx[] = [];

                block.transactions.forEach((transaction: ITransaction) => {
                    approvals = approvals.concat(tokenApprovalMapper.map(transaction));
                });

                return {
                    blockNumber: block.number,
                    timestamp: block.timestamp,
                    data: approvals
                };
            },
            error(err: Error) {
                console.error('something wrong occurred: ' + err);
            },
        })
    } catch (error) {
        Logger.error(`Transformer instance is exiting due to error: ${error}`);
        process.exit(1);

    }
}
