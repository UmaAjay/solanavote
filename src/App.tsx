import React, {useEffect, useState} from 'react';
import {PublicKey, Transaction, TransactionInstruction,} from "@solana/web3.js";
import {Buffer} from 'buffer';
import {connection, getVotes, votesPubkey, programId} from "./program/program";
import {getProvider, PhantomProvider} from "./wallet/wallet";
import './App.css';

function App() {
    const [provider, setProvider] = useState<PhantomProvider | undefined>(undefined);
    const [wallet, setWallet] = useState<PublicKey | undefined>(undefined);
    const [votes, setVotes] = useState<number[]>([0, 0, 0]);

    const connectWallet = async () => {
        if (!wallet) {
            const key = await provider?.connect();
            if (key) {
                setWallet(key.publicKey);
            }
        } else {
            provider?.disconnect()
            setWallet(undefined);
        }
    }

    const vote = (choice: number) => {
        const sendVote = async () => {
            const instruction = new TransactionInstruction({
                keys: [{pubkey: votesPubkey, isSigner: false, isWritable: true}],
                programId,
                data: Buffer.from([choice]),
            });

            const transaction = new Transaction().add(instruction);
            transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
            transaction.feePayer = provider?.publicKey;
            // @ts-ignore
            const {signature} = await provider?.signAndSendTransaction(transaction);
            console.log(`Signature: ${JSON.stringify(signature)}`)
            await connection.confirmTransaction(signature as string);
        }

        sendVote().then(()=> {
            fetchBlockchain()
                .catch(console.error);
        });
    }

    const fetchBlockchain = async () => {
        const newVotes = await getVotes();
        setVotes(newVotes);
    }

    useEffect(() => {
        const provider = getProvider();
        if (provider) {
            setProvider(provider);
        } else setProvider(undefined);

        fetchBlockchain()
            .catch(console.error);

    }, []);

    return (
        <div className="App">
            <header className="App-header">
                <h2>Connect to Solana wallet and make your choice</h2>
                {provider && (
                    <button
                        onClick={() => connectWallet()}
                    >
                        {wallet ? wallet.toBase58() : 'Connect to Phantom Wallet'}
                    </button>
                )}

                {
                    wallet && (
                        <>
                            <h3>Are you vote for peace in all world?</h3>
                            <div className="VoteButtons">
                                <button onClick={() => vote(0)}>Yes</button>
                                <button onClick={() => vote(1)}>Don't know</button>
                                <button onClick={() => vote(2)}>No</button>
                            </div>
                            <div className="VoteResults">
                                <p id="yes">{votes[0]}</p>
                                <p id="abstain">{votes[1]}</p>
                                <p id="no">{votes[2]}</p>
                            </div>
                        </>
                    )
                }

                {!provider && (
                    <p>
                        No provider found. Install{" "}
                        <a href="https://phantom.app/">Phantom Browser extension</a>
                    </p>
                )}

            </header>
        </div>
    );
}

export default App;
