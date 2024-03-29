import { Database } from "@maticnetwork/chain-indexer-framework/mongo/database";
import { Logger } from "@maticnetwork/chain-indexer-framework/logger";

import MetadataUpdateTokenMapper from "./mapper/updatemetadata_mapper.js";
import MetadataUpdateTokenService from "./services/metadataupdate_token.js";
import { TokenModel } from "./models/token.js";

import startConsuming from "./consumer.js";

async function start(): Promise<void> {
    try {
        Logger.create({
            sentry: {
                dsn: process.env.SENTRY_DSN,
                level: 'error'
            },
            datadog: {
                api_key: process.env.DATADOG_API_KEY,
                service_name: process.env.DATADOG_APP_KEY
            },
            console: {
                level: "debug"
            }
        });

        const database = new Database(process.env.MONGO_URL || 'mongodb://localhost:27017/chain-indexer');
        await database.connect();

        const metadataUpdateTokenService = new MetadataUpdateTokenService(
            await TokenModel.new(database),
        );

        await startConsuming(metadataUpdateTokenService, new MetadataUpdateTokenMapper());

    } catch (error) {
        Logger.error(`Error when starting consumer service: ${(error as Error).message}`);
    }
}

start();
