import { produce } from "@maticnetwork/chain-indexer-framework/kafka/producer/produce";
import { Logger } from "@maticnetwork/chain-indexer-framework/logger";
import dotenv from 'dotenv';
import { BlockPollerProducer } from "@maticnetwork/chain-indexer-framework/block_producers/block_polling_producer";
import { BlockProducerError, KafkaError } from "@maticnetwork/chain-indexer-framework";
import { DeliveryReport, Metadata } from "node-rdkafka/index.js";

dotenv.config();
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

// Import the required module

// Set up and start the Block Poller Producer
// const producer = new BlockPollerProducer({
//     startBlock: parseInt(process.env.START_BLOCK || ""),
//     rpcWsEndpoints: [process.env.HTTP_PROVIDER || ""],
//     blockPollingTimeout: parseInt(process.env.BLOCK_POLLING_TIMEOUT || ""),
//     topic: process.env.PRODUCER_TOPIC || "",
//     maxReOrgDepth: parseInt(process.env.MAX_REORG_DEPTH || ""),
//     maxRetries: parseInt(process.env.MAX_RETRIES || ""),
//     // mongoUrl: '<MONGO_DB_URL>',
//     "bootstrap.servers": process.env.KAFKA_CONNECTION_URL || "localhost:9092",
//     "security.protocol": "plaintext"
// })


class OriginalProducer extends BlockPollerProducer{
    // private forceStop: boolean = false;
    constructor(){
        super({
            startBlock: parseInt(process.env.START_BLOCK || ""),
            rpcWsEndpoints: [process.env.HTTP_PROVIDER || ""],
            blockPollingTimeout: parseInt(process.env.BLOCK_POLLING_TIMEOUT || ""),
            topic: process.env.PRODUCER_TOPIC || "",
            maxReOrgDepth: parseInt(process.env.MAX_REORG_DEPTH || ""),
            maxRetries: parseInt(process.env.MAX_RETRIES || ""),
            // mongoUrl: '<MONGO_DB_URL>',
            "bootstrap.servers": process.env.KAFKA_CONNECTION_URL || "localhost:9092",
            "security.protocol": "plaintext"
        })
    }
    
    public async start(): Promise<Metadata | KafkaError> {
        // super.forceStop = false;
        // await this.database.connect();
        const metadata = await super.start();

        this.on("delivered", async (report: DeliveryReport) => {
            if (report.partition === -1) {
                const error = new BlockProducerError(
                    "Kafka topic does not exist",
                    undefined,
                    true,
                    "Kafka topic does not exist or could not be created.",
                    "remote"
                );
                
                this.onError(error);

                return;
            }

            Logger.info("Delivery-report:" + JSON.stringify({
                ...report.opaque, 
                offset: report.offset
            }));

            try {
                this.mongoInsertQueue.enqueue(report.opaque);

                if (!this.mongoInsertInProcess) {
                    this.queueProcessingPromise = this.processQueue();
                }
            } catch (error) {
                Logger.error(error as string | object);
            }
        });

        await this.blockSubscription.subscribe(
            {
                next: async (block: IBlock) => {
                    //TODO - Simplify below logic.
                    const producingBlockPromise = this.produceBlock(block);

                    this.producingBlockPromises.push(producingBlockPromise);

                    await producingBlockPromise;

                    this.producingBlockPromises = this.producingBlockPromises.filter(
                        (promise) => promise !== producingBlockPromise
                    );
                },
                error: this.onError.bind(this),
                closed: () => {
                    Logger.info("Closed");
                }
            },
            await this.getStartBlock()
        );

        return metadata;
    }

    private async onError(error: KafkaError | BlockProducerError): Promise<void> {
        Logger.error(error);

        if (
            error.message === "Local: Erroneous state" ||
            error.message === "Erroneous state"
        ) {
            // this.forceStop = true;

            try {
                await this.stop();
            } catch { }
            
            this.emit(
                "blockProducer.fatalError",
                error
            );

            return;
        }

        if (error.isFatal) {
            await super.restartBlockProducer();
        }
    }

    private async restartBlockProducer(): Promise<void> {
        try {
            if (this.restartPromise) {
                return await this.restartPromise;
            }

            this.restartPromise = new Promise(async (resolve, reject) => {
                try {
                    await this.stop();

                    if (!this.forceStop) {
                        await this.start();
                    }

                    resolve();
                } catch (error) {
                    reject(error);
                }
            });

            await this.restartPromise;

            this.restartPromise = undefined;
        } catch (error) {
            this.restartPromise = undefined;

            Logger.error(error as string | object);
            this.emit(
                "blockProducer.fatalError",
                BlockProducerError.createUnknown(error)
            );
        }
    }

}

const producer = new OriginalProducer();

// Handle fatal error
producer.on("blockProducer.fatalError", (error) => {
    console.error(`Block producer exited. ${error.message}`);
    process.exit(1); // Exiting process on fatal error. Process manager needs to restart the process.
});

producer.on("blockProducer.fatalError", (error: any) => {
    Logger.error(`Block producer exited. ${error.message}`);

    process.exit(1); //Exiting process on fatal error. Process manager needs to restart the process.
});