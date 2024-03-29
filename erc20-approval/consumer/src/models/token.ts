import { Database } from "@maticnetwork/chain-indexer-framework/mongo/database";
import { Model, Schema } from "mongoose";
import { IToken } from "../interfaces/token.js";
import statics from "../interfaces/token_methods.js";

const TokenSchema = new Schema<IToken>({
    txHash:{
        type: String
    },
    ownerAddress:{
        type: String
    },
    spenderAddress:{
        type: String
    },
    amount:{
        type: Number
    },
},
    {
        versionKey: false,
        statics,
    }
);
/**
 * This class represents Token Model
 * 
 * @class
 */
export class TokenModel {
    /**
    * Get the token model defined on this mongoose database instance
    * 
    * @param {Database} database 
    * 
    */
    public static async new(database: Database) {
        const model = database.model<IToken, Model<IToken>>(
            "token",
            TokenSchema
        );
        await model.createCollection();

        return model;
    }
}
