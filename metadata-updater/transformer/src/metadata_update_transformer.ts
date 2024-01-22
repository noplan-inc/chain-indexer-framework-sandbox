import { ITransformedBlock } from "@maticnetwork/chain-indexer-framework/interfaces/transformed_block";
import { ITransaction } from "@maticnetwork/chain-indexer-framework/interfaces/transaction";
import { IBlock } from "@maticnetwork/chain-indexer-framework/interfaces/block";
import { Logger } from "@maticnetwork/chain-indexer-framework/logger";
import { IConsumerConfig } from "@maticnetwork/chain-indexer-framework/interfaces/consumer_config";
import { IProducerConfig } from "@maticnetwork/chain-indexer-framework/interfaces/producer_config";
import { transform } from "@maticnetwork/chain-indexer-framework/data_transformation/transform";
import IMetadataUpdateTx from "./interfaces/metadata_update_tx.js";
import { MetadataUpdateMapper } from "./mappers/metadata_update_mapper.js";

export default async function startTransforming(
    consumerConfig: IConsumerConfig,
    producerConfig: IProducerConfig,
    metadataUpdateMapper: MetadataUpdateMapper
): Promise<void> {
    try {
        transform<IBlock, IMetadataUpdateTx>({
            consumerConfig,
            producerConfig,
            type: 'asynchronous'
        }, {
            transform: async (block: IBlock): Promise<ITransformedBlock<IMetadataUpdateTx>> => {
                let metadataUpdates: IMetadataUpdateTx[] = [];

                block.transactions.forEach((transaction: ITransaction) => {
                    metadataUpdates = metadataUpdates.concat(metadataUpdateMapper.map(transaction));
                });

                return {
                    blockNumber: block.number,
                    timestamp: block.timestamp,
                    data: metadataUpdates
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
