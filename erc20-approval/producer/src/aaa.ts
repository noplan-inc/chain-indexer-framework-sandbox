// Import the required modules
import { BlockPollerProducer, BlockProducerError, KafkaError } from "@maticnetwork/chain-indexer-framework";
import { produce } from "@maticnetwork/chain-indexer-framework/kafka/producer/produce";
import { SynchronousProducer } from "@maticnetwork/chain-indexer-framework/kafka/producer/synchronous_producer";
import dotenv from 'dotenv';

dotenv.config();


// Initialize and start the Kafka producer
const producer = produce<SynchronousProducer>(
    {
        topic: process.env.PRODUCER_TOPIC || "apps.1.matic.transfer",
        startBlock: parseInt(process.env.START_BLOCK || "0"),
        "bootstrap.servers": process.env.KAFKA_CONNECTION_URL,
        "security.protocol": "plaintext",
        "message.max.bytes": 26214400,
        coder: {
            fileName: "token_approval",
            packageName: "tokenapprovalpackage",
            messageType: "TokenApprovalBlock",
        },
        type: "synchronous",
    },
    {
        emitter: () => {
            console.log("emitter started ");
            // this.produceEvent("<key: string>", "<message: object>");
        },
        error: (error: KafkaError | BlockProducerError) => {},
        closed: () => {} // On broker connection closed
    }
)