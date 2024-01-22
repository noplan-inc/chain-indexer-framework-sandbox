import Long from "long";

export default interface INFTMetadataUpdateTx {
    transactionIndex: Long,
    transactionHash: string,
    transactionInitiator: string,
    tokenAddress: string,
    tokenId: number,
}
