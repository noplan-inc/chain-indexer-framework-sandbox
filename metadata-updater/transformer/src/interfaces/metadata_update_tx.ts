import Long from "long";

export default interface IMetadataUpdateTx {
    transactionIndex: Long,
    transactionHash: string,
    transactionInitiator: string,
    nftAddress: string,
    tokenId: number,
}
