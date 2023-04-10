import React, {useEffect, useState} from 'react';
import {PublicKey,} from "@solana/web3.js";
import {getVotes, sendVote} from "./program/program";
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

    const [disable, setDisable] = useState(false);
    const vote = (choice: number) => {
        sendVote(choice, provider as PhantomProvider).then(()=> {
            fetchBlockchain()
                .catch(console.error);
        });
        setDisable(true);
        localStorage.setItem("disableAll", JSON.stringify(true));
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

    useEffect(() => {
        if (disable) {
          localStorage.setItem("disableAll", JSON.stringify(true));
        }
      }, [disable]);

    return (
        <div className="App">
            <header className="App-header">
                <h3>Cast your Vote in our decentrtalized voting system</h3>
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
                            <h3>Which party do you wish to vote</h3>
                            <div className="VoteButtons">
                                <button disabled={disable} onClick={() => vote(0)}>Bjp</button>
                                <button disabled={disable} onClick={() => vote(1)}>NOTA</button>
                                <button disabled={disable} onClick={() => vote(2)}>Congress</button>
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
            <footer id="footer" className="footer">



        <div className="footer-legal text-center">
            <div className="container d-flex flex-column flex-lg-row justify-content-center justify-content-lg-between align-items-center">

            <div className="d-flex flex-column align-items-center align-items-lg-start">
                <div className="copyright">
                    &copy; Copyright <strong><span>@2023</span></strong>. All Rights Reserved
                </div>
                <div className="credits">

                    <a href="https://bootstrapmade.com/">Shashank and yadu</a>
                </div>
            </div>

            <div className="social-links order-first order-lg-last mb-3 mb-lg-0">
                <a href="#" className="twitter"><i className="bi bi-twitter"></i></a>
                <a href="#" className="facebook"><i className="bi bi-facebook"></i></a>
                <a href="#" className="instagram"><i className="bi bi-instagram"></i></a>
                <a href="#" className="google-plus"><i className="bi bi-skype"></i></a>
                <a href="#" className="linkedin"><i className="bi bi-linkedin"></i></a>
            </div>

        </div>
    </div>

</footer>
        </div>
    );
}

export default App;
