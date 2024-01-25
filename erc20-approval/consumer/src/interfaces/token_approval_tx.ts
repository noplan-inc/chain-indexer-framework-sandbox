import Long from "long";

export default interface ITokenApprovalTx {
    transactionIndex: Long,
    transactionHash: string,
    transactionInitiator: string,
    tokenAddress: string,
    ownerAddress: string,
    spenderAddress: string,
    amount: number,
}
