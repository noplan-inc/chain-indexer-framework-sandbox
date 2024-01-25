
/**
 * Interface for token details and its owner
*/
export interface IToken {
    txHash: string,
    ownerAddress: string,
    spenderAddress: string,
    amount: number,
}
