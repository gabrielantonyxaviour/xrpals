import React, { useState } from "react";

import logo from "./assets/logo.png";
import background from "./assets/background.jpg";
import secondbg from "./assets/secondbg.jpg";
import axios from "axios";
function App() {
  const { xrpl } = window;
  var client;
  var wallet;
  const [pals, setPals] = useState([]);
  const [seed, setSeed] = useState("");
  const [id, setId] = useState(-1);
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState(0);
  const [txSuccess, setTxSuccess] = useState("");
  const [paySuccess, setPaySuccess] = useState(false);
  const [alert, setAlert] = useState(false);
  const [newFriend, setnewFriend] = useState({
    id: "",
    name: "",
    image: "",
    accountAddress: "",
  });

  async function connectClient() {
    const SERVER_URL = "wss://s.altnet.rippletest.net:51233";
    console.log("Connecting to " + SERVER_URL);
    client = new xrpl.Client(SERVER_URL);
    await client.connect();
    console.log("Connected to XRPL TESTNET");
  }
  async function fetchWallet(seed) {
    await connectClient();
    try {
      wallet = xrpl.Wallet.fromSeed(seed);
      console.log("Fetched wallet " + wallet.classicAddress);
      setAddress(wallet.classicAddress);
      const balance = await client.getXrpBalance(wallet.address);
      setBalance(balance);
      console.log("Balance: " + balance);
    } catch (err) {
      return false;
    }
    await FetchNFTs(wallet.classicAddress);
    return true;
  }

  async function FetchNFTs(address) {
    const SERVER_URL = "wss://s.altnet.rippletest.net:51233";
    console.log("Connecting to " + SERVER_URL);
    client = new xrpl.Client(SERVER_URL);
    await client.connect();
    console.log("Connected to XRPL TESTNET");
    const nfts = await client.request({
      method: "account_nfts",
      account: address,
    });
    console.log(
      "All NFTS: " + JSON.stringify(nfts.result.account_nfts, null, 2)
    );
    nfts.result.account_nfts.forEach((nft, index) => {
      axios
        .request({
          method: "GET",
          url:
            "https://cors-anywhere.herokuapp.com/https://infura-ipfs.io/ipfs/" +
            xrpl.convertHexToString(nft.URI).slice(7),
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        })
        .then(({ data }) => {
          if (data.custom_fields.key == "XRPaLs123") {
            setPals([
              ...pals,
              {
                id: (pals.length + 1).toString(),
                name: data.name,
                image: data.file_url,
                account: data.custom_fields.accountAddress,
              },
            ]);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }

  function Login() {
    return (
      <div
        style={{
          backgroundImage: `url(${background})`,
          width: "100vw",
          height: "100vh",
        }}
      >
        <div className="h-100 d-flex justify-content-center align-items-center ">
          <div
            className="modal fade"
            id="exampleModal"
            tabIndex="-1"
            aria-labelledby="exampleModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="exampleModalLabel">
                    Modal title
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">...</div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Close
                  </button>
                  <button type="button" className="btn btn-primary">
                    Save changes
                  </button>
                </div>
              </div>
            </div>
          </div>
          <form
            className="p-5 bg-white rounded"
            onSubmit={async (event) => {
              event.preventDefault();
              const res = await fetchWallet(event.target.seed.value);
              if (res) {
                setSeed(wallet.seed);
              } else {
                setAlert(true);
              }
            }}
          >
            <div className="d-flex m-2 justify-content-between mb-4">
              <img
                src={logo}
                className="rounded-circle border border-dark"
                style={{ width: "40px", height: "40px", marginRight: "10px" }}
              />
              <h2 style={{ fontFamily: "Rubik Vinyl" }}>XRPaLs</h2>
            </div>
            <div className="form-outline mb-4">
              <input type="text" id="seed" className="form-control" />
              <label className="form-label" htmlFor="seed">
                Account Seed
              </label>
            </div>

            <button
              type="submit"
              className="d-flex btn btn-primary btn-block mb-4"
              style={{ margin: "auto" }}
            >
              Log in
            </button>
            {alert && (
              <div class="alert alert-danger" role="alert">
                Invalid account seed! Please try again!
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  function ContactCard({ id, image, name }) {
    return (
      <button
        style={{ border: "none", backgroundColor: "white", width: "100%" }}
        onClick={() => {
          setId(id);
        }}
      >
        <div className="row">
          <div className="col-3">
            <img
              src={"https://infura-ipfs.io/ipfs/" + image}
              className="rounded-circle border border-dark"
              style={{ width: "40px", height: "40px", marginRight: "10px" }}
            />
          </div>
          <div className="col-9">
            <h4 style={{ textAlign: "left" }}>{name}</h4>
          </div>
        </div>
        <hr
          className="hr"
          style={{
            border: "0",
            height: "1px",
            backgroundImage:
              " linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0))",
          }}
        />
      </button>
    );
  }

  function AddFriend() {
    const [image, setImage] = useState("");
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");

    async function uploadToIPFS() {
      const form = new FormData();
      form.append("file", image);
      axios
        .request({
          method: "POST",
          url: "https://api.nftport.xyz/v0/files",
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: process.env.NFTPORT_AUTHORIZATION,
          },
          data: form,
        })
        .then(function (response) {
          return response.data.ipfs_url;
        })
        .catch(function (error) {
          console.error(error);
          return null;
        });
    }

    async function uploadMetadataToIPFS(file_url) {
      const options = {
        method: "POST",
        url: "https://api.nftport.xyz/v0/metadata",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          Authorization: process.env.NFTPORT_AUTHORIZATION,
        },
        data: {
          custom_fields: { key: "XRPaLs123", accountAddress: address },
          name: name,
          description: "This is a XRPaL SoulBound NFToken",
          file_url: file_url,
        },
      };

      axios
        .request(options)
        .then(function ({ data }) {
          return data.ipfs_url;
        })
        .catch(function (error) {
          console.error(error);
          return null;
        });
    }

    return (
      <div className="h-100 d-flex justify-content-center align-items-center ">
        <form className="p-5 bg-white rounded">
          <div className="d-flex m-2 justify-content-between mb-4">
            <h5>
              Enter your XRPaL details {"  "}
              <i className="fa-regular fa-face-smile"></i>
            </h5>
          </div>
          <div className="form-outline mb-2">
            <input
              type="text"
              id="address"
              className="form-control"
              onChange={(event) => {
                setAddress(event.target.value);
              }}
            />
            <label className="form-label" htmlFor="form2Example1">
              Account Address
            </label>
          </div>
          <div className="form-outline mb-2">
            <input
              type="text"
              id="name"
              className="form-control"
              onChange={(event) => {
                setName(event.target.value);
              }}
            />
            <label className="form-label" htmlFor="form2Example1">
              XRPaL Name
            </label>
          </div>
          <div>
            <div className="d-flex justify-content-center mb-4">
              <img
                src={
                  image == ""
                    ? "https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg"
                    : image
                }
                className="rounded-circle"
                alt="Fetching from IPFS..."
                style={{ width: "100px" }}
              />
            </div>
            <div className="d-flex justify-content-center">
              <div className="btn btn-primary btn-rounded">
                <label className=" text-white " htmlFor="customFile2">
                  Choose image
                </label>
                <input
                  type="file"
                  className="form-control d-none"
                  id="customFile2"
                  accept=".jpg, .png"
                  onChange={(e) => {
                    var reader = new FileReader();
                    reader.onload = function (res) {
                      setImage(res.target.result);
                    };
                    console.log(e.target.files[0]);
                    reader.readAsDataURL(e.target.files[0]);
                  }}
                />
              </div>
            </div>
          </div>
          <button
            type="button"
            className="d-flex btn btn-primary btn-block mb-4 mt-4"
            style={{ margin: "auto" }}
            onClick={async () => {
              await connectClient();
              await fetchWallet(seed);
              setTxSuccess(true);

              const imageURL = await uploadToIPFS(image);
              if (imageURL != null) {
                setPals([
                  ...pals,
                  {
                    id: pals.length + 1,
                    name: name,
                    image: imageURL,
                    accountAddress: address,
                  },
                ]);

                const metadata_URI = await uploadMetadataToIPFS(imageURL);
                if (metadata_URI == null) return;
                const SERVER_URL = "wss://s.altnet.rippletest.net:51233";
                console.log("Connecting to " + SERVER_URL);
                client = new xrpl.Client(SERVER_URL);
                await client.connect();
                console.log("Connected to XRPL TESTNET");
                wallet = xrpl.Wallet.fromSeed(seed);

                const transactionBlob = {
                  TransactionType: "NFTokenMint",
                  account: address,
                  URI: xrpl.convertStringToHex(metadata_URI),
                  Flags: parseInt("1"),
                  TransferFee: parseInt("0"),
                  NFTokenTaxon: 0, //Required, but if you have no use for it, set to zero.
                };
                const tx = await client.submitAndWait(transactionBlob, {
                  wallet: wallet,
                });
                console.log(
                  "Transaction result: " + tx.result.meta.TransactionResult
                );
                if (tx.result.meta.TransactionResult === "tesSUCCESS")
                  console.log(
                    "Transaction Success\nTransaction Fee: " +
                      parseInt(tx.result.Fee) / 1000000 +
                      "XRP"
                  );
                console.log(tx.result);
                setTxSuccess(
                  "Transaction Success\nTransaction Fee: " +
                    parseInt(tx.result.Fee) / 1000000 +
                    "XRP"
                );
              }
            }}
          >
            Mint XrPal NFT
          </button>
          {txSuccess !== "" && (
            <div className="alert alert-success" role="alert">
              {txSuccess}
            </div>
          )}
        </form>
      </div>
    );
  }
  function Motivation() {
    return (
      <section>
        <div className="container py-5 h-100">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col col-lg-9 col-xl-7">
              <div className="card" style={{ borderRadius: "15px" }}>
                <div className="card-body p-5">
                  <div className="text-center mb-4 pb-2">
                    <img
                      src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-quotes/bulb.webp"
                      alt="Bulb"
                      width="100"
                    />
                  </div>

                  <figure className="text-center mb-0">
                    <blockquote className="blockquote">
                      <p className="pb-3">
                        <i className="fas fa-quote-left fa-xs text-primary"></i>
                        <span className="lead font-italic">
                          {" "}
                          Many of life's failures are people who did not realize
                          how close they were to success when they gave up.{" "}
                        </span>
                        <i className="fas fa-quote-right fa-xs text-primary"></i>
                      </p>
                    </blockquote>
                    <figcaption className="blockquote-footer mb-0">
                      Thomas Edison
                    </figcaption>
                  </figure>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function PayXRPal({ id }) {
    const [amount, setAmount] = useState(0);
    return (
      <div className="h-100 d-flex justify-content-center align-items-center ">
        <form className="p-5 bg-white rounded">
          <div className="d-flex  justify-content-center mb-4">
            <h5>
              Pay XRP <i className="fa-solid fa-sack-dollar"></i>
            </h5>
          </div>
          <div className="d-flex justify-content-center mb-4">
            <img
              src={"https://infura-ipfs.io/ipfs/" + pals[id - 1].image}
              className="rounded-circle"
              alt="Fetching from IPFS..."
              style={{ width: "100px" }}
            />
          </div>
          <div className="d-flex m-2 justify-content-center mb-4">
            <h3>{pals[id - 1].name}</h3>
          </div>

          <div className=" form-outline mb-2">
            <input
              type="number"
              id="amount"
              className="form-control"
              onChange={(event) => {
                setAmount(event.target.value);
              }}
            />
            <label
              className="form-label d-flex justify-content-center m-2"
              htmlFor="form2Example1"
            >
              Enter XRP to be sent
            </label>
          </div>

          <button
            type="button"
            className="d-flex btn btn-primary btn-block mb-4 mt-4"
            style={{ margin: "auto" }}
            onClick={async () => {
              const SERVER_URL = "wss://s.altnet.rippletest.net:51233";
              console.log("Connecting to " + SERVER_URL);
              client = new xrpl.Client(SERVER_URL);
              await client.connect();
              wallet = xrpl.Wallet.fromSeed(seed);
              const prepared = await client.autofill({
                TransactionType: "Payment",
                Account: wallet.classicAddress,
                Amount: xrpl.xrpToDrops(3),
                Destination: pals[id - 1].address,
              });
              console.log(wallet);
              // ------------------------------------------------ Sign prepared instructions
              const signed = wallet.sign(prepared);

              // -------------------------------------------------------- Submit signed blob
              const tx = await client.submitAndWait(signed.tx_blob);
              if (tx.result.meta.TransactionResult === "tesSUCCESS") {
                setBalance(balance - parseInt(tx.result.Fee) - amount);
                setPaySuccess(
                  "Transaction Successful!\nGas Fee: " +
                    (parseInt(tx.result.Fee) / 1000000).toString() +
                    " XRP"
                );
              } else {
                setPaySuccess("Failed! Transaction did not go through!");
              }
            }}
          >
            Send XRP
          </button>
          {paySuccess.slice(0, 1) == "F" ? (
            <div className="alert alert-danger" role="alert">
              {paySuccess}
            </div>
          ) : (
            paySuccess != "" ?? (
              <div className="alert alert-success" role="alert">
                {paySuccess}
              </div>
            )
          )}
        </form>
      </div>
    );
  }

  function SendMoney() {
    if (id == -1) return <Motivation />;
    else if (id == 0) return <AddFriend />;
    else return <PayXRPal id={id} />;
  }

  return seed == "" ? (
    <Login />
  ) : (
    <div
      style={{
        backgroundImage: `url(${background})`,
        width: "100vw",
        height: "100vh",
      }}
    >
      <div className="container bg-white rounded-bottom">
        <div className="row">
          <div className="col-3" style={{ height: "100vh" }}>
            <div className="d-flex m-2 justify-content-between ">
              <img
                src={logo}
                className="rounded-circle border border-dark"
                style={{ width: "40px", height: "40px", marginRight: "10px" }}
              />
              <h2 style={{ fontFamily: "Rubik Vinyl" }}>XRPaLs</h2>
              <button
                style={{ border: "none", backgroundColor: "white" }}
                onClick={() => {
                  setId(0);
                }}
              >
                <i className="fa-solid fa-user-plus"></i>
              </button>
            </div>
            <hr
              className="hr"
              style={{
                height: "10px",
                border: "0",
                boxShadow: "0 10px 10px -10px #8c8b8b inset",
              }}
            />
            <div className="d-flex">
              <h5>Your Address</h5>
            </div>
            <div className="d-flex">
              <p>{address}</p>
            </div>
            <div className="d-flex">
              <h5>Your Balance</h5>
            </div>
            <div className="d-flex mb-3">
              <p>{balance} XRP</p>
            </div>
            {pals !== [] ? (
              pals.map((pal) => (
                <ContactCard id={pal.id} image={pal.image} name={pal.name} />
              ))
            ) : (
              <div>
                <div className="d-flex justify-content-center align-items-center mb-2 mt-5">
                  <i className="fa-solid fa-face-sad-cry fa-2x"></i>
                </div>
                <h5 className="d-flex justify-content-center align-items-center">
                  You have no friends!
                </h5>
                <div className="d-flex justify-content-center align-items-center">
                  <p>
                    Click the <i className="fa-solid fa-user-plus"></i> to add
                    friends
                  </p>
                </div>
              </div>
            )}
          </div>

          <div
            className="col-9"
            style={{
              backgroundImage: `url(${secondbg})`,
              height: "100vh",
            }}
          >
            <SendMoney />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
