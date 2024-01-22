import { ITransformedBlock } from "@maticnetwork/chain-indexer-framework/interfaces/transformed_block";
import { DeserialisedMessage } from "@maticnetwork/chain-indexer-framework/interfaces/deserialised_kafka_message";
import { consume } from "@maticnetwork/chain-indexer-framework/kafka/consumer/consume";
import { Logger } from "@maticnetwork/chain-indexer-framework/logger";

import UpdateMetadataTokenService from "./services/metadataupdate_token.js";
import MetadataUpdateTokenMapper from "./mapper/updatemetadata_mapper.js";
import INFTMetadataUpdateTx from "./interfaces/nft_metadataupdate_tx.js";

import dotenv from 'dotenv';
import path from "path";

dotenv.config()


export default async function startConsuming(updateMetadataTokenService: UpdateMetadataTokenService, transferTokenMapper: MetadataUpdateTokenMapper): Promise<void> {
    try {
        consume({
            "metadata.broker.list": process.env.KAFKA_CONNECTION_URL || "localhost:9092",
            "group.id": process.env.CONSUMER_GROUP_ID || "matic.transfer.consumer",
            "security.protocol": "plaintext",
            topic: process.env.TRANSFER_TOPIC || "apps.1.matic.transfer",
            coders: {
                fileName: "nft_metadataupdate",
                packageName: "nftmetadataupdatepackage",
                messageType: "NFTMetadataUpdateBlock",
                fileDirectory: path.resolve("dist", "./schemas")
            },
            type: 'synchronous'
        }, {
            next: async (message: DeserialisedMessage) => {
                const transformedBlock = message.value as ITransformedBlock<INFTMetadataUpdateTx>;
                const metadataupdates: INFTMetadataUpdateTx[] = transformedBlock.data as INFTMetadataUpdateTx[];

                if (metadataupdates && metadataupdates.length > 0) {
                    await updateMetadataTokenService.save(
                        transferTokenMapper.map(transformedBlock)
                    );
                }
            },
            error(err: Error) {
                console.error('something wrong occurred: ' + err);
            },
            closed: () => {
                Logger.info(`subscription is ended.`);
                throw new Error("Consumer stopped");
            },
        });
    } catch (error) {
        Logger.error(`Consumer instance is exiting due to error: ${error}`);
        process.exit(1);

    }
}
