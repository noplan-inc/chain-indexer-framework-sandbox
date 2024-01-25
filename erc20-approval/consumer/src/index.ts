import { Database } from "@maticnetwork/chain-indexer-framework/mongo/database";
import { Logger } from "@maticnetwork/chain-indexer-framework/logger";

import TokenApprovalMapper from "./mapper/token_approval_mapper.js";
import ApprovalTokenService from "./services/approval_token.js";
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

        const approvalTokenService = new ApprovalTokenService(
            await TokenModel.new(database),
        );

        await startConsuming(approvalTokenService, new TokenApprovalMapper());

    } catch (error) {
        Logger.error(`Error when starting consumer service: ${(error as Error).message}`);
    }
}

start();
