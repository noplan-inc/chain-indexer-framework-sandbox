import { ITransaction } from "@maticnetwork/chain-indexer-framework/interfaces/transaction";
import { IMapper } from "@maticnetwork/chain-indexer-framework/interfaces/mapper";
import { ABICoder } from "@maticnetwork/chain-indexer-framework/coder/abi_coder";
import { BloomFilter } from "@maticnetwork/chain-indexer-framework/filter";
import IMetadataUpdateTx from "../interfaces/metadata_update_tx.js";
import { ethers } from "ethers";

import dotenv from 'dotenv';
import { Logger } from "@maticnetwork/chain-indexer-framework";

dotenv.config();

const metadataUpdateHash = ethers.keccak256(ethers.toUtf8Bytes("MetadataUpdate(uint256)"));

export class MetadataUpdateMapper implements IMapper<ITransaction, IMetadataUpdateTx> {
    map(transaction: ITransaction): IMetadataUpdateTx[] {
        const logsBloom = transaction.receipt.logsBloom;
        let metadataUpdates: IMetadataUpdateTx[] = [];

        if (this.isMetadataUpdate(logsBloom)) {
            Logger.info(`MetadataUpdate event found !!!!! in transaction ${transaction.hash}`);
            let nftMetadataUpdate = this.mapTransferErc20(transaction);
            metadataUpdates = [...metadataUpdates, ...nftMetadataUpdate];
        }

        return metadataUpdates;
    }
    private mapTransferErc20(transaction: ITransaction): IMetadataUpdateTx[] {
        let metadataUpdates: IMetadataUpdateTx[] = [];

        for (const log of transaction.receipt.logs) {
            if (
                log.topics.length && log.topics.length >= 1 &&
                // Check if event was emitted by NFT Contract
                log.address.toLowerCase() === (process.env.NFT_CONTRACT as string).toLowerCase()
            ) {
                Logger.info("log.topics.join isssss")
                Logger.info(log.topics)
                metadataUpdates.push({
                    transactionIndex: transaction.receipt.transactionIndex,
                    transactionHash: transaction.hash.toLowerCase(),
                    transactionInitiator: transaction.from.toLowerCase(),
                    nftAddress: log.address.toLowerCase(),
                    tokenId: parseInt(ABICoder.decodeParameter("uint256", log.topics[0])),
                })
            }
        }

        return metadataUpdates;
    }

    private isMetadataUpdate(logsBloom: string): boolean {
        return BloomFilter.isTopicInBloom(logsBloom,
            metadataUpdateHash // MetadataUpdate(uint256)
        ) && BloomFilter.isContractAddressInBloom(
            logsBloom,
            process.env.NFT_CONTRACT as string
        );
    }
}
