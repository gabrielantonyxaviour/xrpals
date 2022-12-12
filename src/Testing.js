import React, { useEffect, useRef, useState } from "react";

export default function Testing() {
  const dataFetchedRef = useRef(false);
  const { xrpl } = window;

  async function connectClient() {
    const SERVER_URL = "wss://s.altnet.rippletest.net:51233";
    console.log("Connecting to " + SERVER_URL);
    client = new xrpl.Client(SERVER_URL);
    await client.connect();
    console.log("Connected to XRPL TESTNET");
  }

  async function fetchWallet() {
    await connectClient();
    wallet = xrpl.Wallet.fromSeed("sEdTgx6KY6UX1vC5ZrBNbnFMLCNJXNR");
    console.log("Fetched wallet " + wallet.classicAddress);
    const balance = await client.getXrpBalance(wallet.address);
    console.log("Balance: " + balance);
  }

  async function MintNFT() {
    await fetchWallet();
    const transactionBlob = {
      TransactionType: "NFTokenMint",
      Account: wallet.classicAddress,
      URI: xrpl.convertStringToHex(
        "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf4dfuylqabf3oclgtqy55fbzdi"
      ),
      Flags: parseInt("1"),
      TransferFee: parseInt("0"),
      NFTokenTaxon: 0, //Required, but if you have no use for it, set to zero.
    };
    const tx = await client.submitAndWait(transactionBlob, { wallet: wallet });
    console.log("Transaction result: " + tx.result.meta.TransactionResult);
    if (tx.result.meta.TransactionResult === "tesSUCCESS")
      console.log(
        "Transaction Success\nTransaction Fee: " +
          parseInt(tx.result.Fee) / 1000000 +
          "XRP"
      );
    console.log(tx.result);
  }

  async function FetchNFTs() {
    const nfts = await client.request({
      method: "account_nfts",
      account: wallet.classicAddress,
    });
    console.log(
      "All NFTS: " + JSON.stringify(nfts.result.account_nfts, null, 2)
    );
  }

  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    MintNFT().then((res) => {
      FetchNFTs().then((res) => {});
    });
  }, []);

  return <div></div>;
}
