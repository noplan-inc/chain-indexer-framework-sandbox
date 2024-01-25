import { ITransaction } from "@maticnetwork/chain-indexer-framework/interfaces/transaction";
import { IMapper } from "@maticnetwork/chain-indexer-framework/interfaces/mapper";
import { ABICoder } from "@maticnetwork/chain-indexer-framework/coder/abi_coder";
import { BloomFilter } from "@maticnetwork/chain-indexer-framework/filter";
import ITokenApprovalTx from "../interfaces/token_approval_tx.js";
import utils from "web3-utils";

import dotenv from 'dotenv';
import { Logger } from "@maticnetwork/chain-indexer-framework";
dotenv.config();



export class TokenApprovalMapper implements IMapper<ITransaction, ITokenApprovalTx> {
    map(transaction: ITransaction): ITokenApprovalTx[] {
        const logsBloom = transaction.receipt.logsBloom;
        let approvals: ITokenApprovalTx[] = [];

        if (this.isTokenApproval(logsBloom)) {
            let erc20Approval = this.mapApprovalErc20(transaction);
            approvals = [...approvals, ...erc20Approval];
        }

        return approvals;
    }

    private mapApprovalErc20(transaction: ITransaction): ITokenApprovalTx[] {
        let approvals: ITokenApprovalTx[] = [];

        for (const log of transaction.receipt.logs) {
            if (
                log.topics.length && log.topics.length >= 3 &&
                // Check if event was emitted by NFT Contract
                log.address.toLowerCase() === (process.env.TOKEN_CONTRACT as string).toLowerCase() &&
                log.topics[0] === utils.keccak256("Approval(address,address,uint256)")
            ) {
                approvals.push({
                    transactionIndex: transaction.receipt.transactionIndex,
                    transactionHash: transaction.hash.toLowerCase(),
                    transactionInitiator: transaction.from.toLowerCase(),
                    tokenAddress: log.address.toLowerCase(),
                    ownerAddress: ABICoder.decodeParameter("address", log.topics[1]).toLowerCase(),
                    spenderAddress: ABICoder.decodeParameter("address", log.topics[2]).toLowerCase(),
                    amount: utils.toBN(log.data).toNumber(),
                })
            }
        }

        return approvals;
    }

    private isTokenApproval(logsBloom: string): boolean {
        return BloomFilter.isTopicInBloom(logsBloom,
            utils.keccak256("Approval(address,address,uint256)") // Approval(address,address,uint256)
        ) && BloomFilter.isContractAddressInBloom(
            logsBloom,
            process.env.TOKEN_CONTRACT as string
        );
    }
}
