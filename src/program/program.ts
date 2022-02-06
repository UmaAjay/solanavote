import * as borsh from 'borsh';
import {Connection, PublicKey, Transaction, TransactionInstruction} from "@solana/web3.js";
import {Buffer} from "buffer";
import {PhantomProvider} from "../wallet/wallet";

export let connection: Connection;
export const programId = new PublicKey('EHqdqk9g59SWebexZ2saoHPaxNRgxNsp83kJxCCMwRRF');
export const votesPubkey = new PublicKey('4e1eyBzxriLLBSjEwJ4oArA6cG9JvqrFkBN1posQG7Xu');

function getRpcUrl(): string {
    // return 'http://localhost:8899';
    return 'https://api.devnet.solana.com';
}

/**
 * Establish a connection to the cluster
 */
export async function establishConnection(): Promise<void> {
    const rpcUrl = getRpcUrl();
    connection = new Connection(rpcUrl, 'confirmed');
    const version = await connection.getVersion();
    console.log('Connection to cluster established:', rpcUrl, version);
}

/**
 * The state of a vote account managed by the vote program
 */
class VoteAccount {
    yes = 0;
    abstained = 0;
    no = 0;

    constructor(fields: { yes: number, abstained: number, no: number } | undefined = undefined) {
        if (fields) {
            this.yes = fields.yes;
            this.abstained = fields.abstained;
            this.no = fields.no;
        }
    }
}

/**
 * Borsh schema definition for votes account
 */
const VoteSchema = new Map([
    [
        VoteAccount,
        {
            kind: 'struct',
            fields: [
                ['yes', 'u32'],
                ['abstained', 'u32'],
                ['no', 'u32'],
            ]
        }
    ],
]);


/**
 * Request votes state from Solana
 */
export async function getVotes(): Promise<number[]> {
    if (!connection) {
        throw new Error(`We have no connection`);
    }
    const votesInfo = await connection.getAccountInfo(votesPubkey);
    if (votesInfo === null) {
        throw new Error('Error: cannot find the greeted account');
    }
    const votes = borsh.deserialize(VoteSchema, VoteAccount, votesInfo.data);
    console.log(votesPubkey.toBase58(), `votes: yes = ${votes.yes}, abstained = ${votes.abstained}, no = ${votes.no}`);
    return [votes.yes, votes.abstained, votes.no];
}

/**
 * Store vote in Solana
 */
export const sendVote = async (choice: number, provider: PhantomProvider) => {
    if (!provider) {
        console.error('Provider not found');
        return;
    }
    const instruction = new TransactionInstruction({
        keys: [{pubkey: votesPubkey, isSigner: false, isWritable: true}],
        programId,
        data: Buffer.from([choice]),
    });

    const transaction = new Transaction().add(instruction);
    transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
    transaction.feePayer = provider.publicKey;
    const {signature} = await provider.signAndSendTransaction(transaction);
    console.log(`Signature: ${JSON.stringify(signature)}`)
    await connection.confirmTransaction(signature as string);
}
