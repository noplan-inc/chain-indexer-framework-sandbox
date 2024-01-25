import { Logger } from "@maticnetwork/chain-indexer-framework/logger";
import { BlockProducerError } from "@maticnetwork/chain-indexer-framework/errors/block_producer_error";
import startTransforming from "./transformer.js";
import { TokenApprovalMapper } from "./mappers/token_approval_mapper.js";
import dotenv from 'dotenv';
import path from "path";

dotenv.config();

Logger.create({
    sentry: {
        dsn: process.env.SENTRY_DSN,
        level: 'error'
    },
    datadog: {
        api_key: process.env.DATADOG_API_KEY,
        service_name: process.env.DATADOG_APP_KEY,
    }
});

/**
 * Initialise the transform service with producer topic, proto file names,
 *  producer config, consumer topic and consumer proto files
 */
try {
    startTransforming(
        {
            "bootstrap.servers": process.env.KAFKA_CONNECTION_URL || "localhost:9092",
            "group.id": "matic.transfer.transformer",
            "security.protocol": "plaintext",
            "message.max.bytes": 26214400,
            "fetch.message.max.bytes": 26214400,
            coders: {
                fileName: "block",
                packageName: "blockpackage",
                messageType: "Block"
            },
            topic: process.env.CONSUMER_TOPIC || "polygon.1.blocks",
        },
        {
            topic: process.env.PRODUCER_TOPIC || "apps.1.matic.transfer",
            "bootstrap.servers": process.env.KAFKA_CONNECTION_URL || "localhost:9092",
            "security.protocol": "plaintext",
            "message.max.bytes": 26214400,
            coder: {
                fileName: "token_approval",
                packageName: "tokenapprovalpackage",
                messageType: "TokenApprovalBlock",
                fileDirectory: path.resolve("dist", "./schemas/")
            }
        },
        new TokenApprovalMapper()
    );
} catch (e) {
    Logger.error(BlockProducerError.createUnknown(e));
}
