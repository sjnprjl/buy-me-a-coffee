import { ChangeEventHandler, useEffect, useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import abi from "../smartcontracts/artifacts/contracts/BuyMeACoffee.sol/BuyMeACoffee.json";
import Web3 from "web3";

const contractAddress = "0x6f854b1c2bc5322b87b6fe36b9676d8c4fdf6b86";

const USER = {
  name: "Sujan Parajuli",
  profile: "https://thispersondoesnotexist.com/image",
};

interface Memo {
  from: string;
  name: string;
  message: string;
  coffeePoint: string;
}

const ONE_COFFEE_EQUIV_ETHER = 0.0001;

function MemoItem({ item }: { item: Memo }) {
  return (
    <div className="memoItem">
      <h2>From: {item.from}</h2>
      <h3>Name: {item.name}</h3>
      <p>{item.message}</p>
      <span>Coffee: {Web3.utils.fromWei(item.coffeePoint)} ETH</span>
    </div>
  );
}

function NavBar() {
  return <nav></nav>;
}

function UserProfile() {
  return (
    <div className="userProfile">
      <img
        style={{
          width: "150px",
          height: "150px",
          borderRadius: "100px",
          marginTop: 10,
        }}
        src={USER.profile}
        alt="creator image"
      />
      <h1>{USER.name}</h1>
    </div>
  );
}

function BuyCoffeeForm({ address }: { address: string }) {
  const [point, setPoint] = useState<number | null>(1);
  const [message, setMessage] = useState<string>("");
  const [name, setName] = useState<string>("");

  function handleCustomPointChange(e: any) {
    if ([1, 2, 4].indexOf(+e.target.value) !== -1) {
      setPoint(+e.target.value);
    } else {
      if (isNaN(e.target.value)) {
        setPoint(1);
      } else setPoint(+e.target.value);
    }
  }

  function handleChange(e: any) {
    const option: any = {
      name: setName,
      message: setMessage,
    };

    option?.[e.target.name]?.(e.target.value);
  }

  function handleSubmit(e: any) {
    e.preventDefault();
    if (message.trim() && name.trim() && point) {
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(abi.abi, contractAddress);

      // TODO: real time show
      contract.methods.buyCoffee(name.trim(), message.trim()).send({
        value: web3.utils.toWei(point * ONE_COFFEE_EQUIV_ETHER + ""),
        from: address,
      });
    }
  }

  return (
    <form className="buyCoffeeForm" onSubmit={handleSubmit}>
      <h2 className="creatorName">
        Buy <strong>{USER.name}</strong> a coffee
      </h2>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
        className="coffeePointWrapper"
      >
        <span className="coffeeIcon">☕</span>
        <span className="crossSign">x</span>
        <div>
          {[1, 2, 4].map((each: number) => {
            return (
              <button
                key={each}
                className={`coffeeAmount ${point === each ? "active" : ""}`}
                onClick={(e) => setPoint(each)}
              >
                {each}
              </button>
            );
          })}
          <input
            className="customCoffeePoint"
            placeholder="6"
            value={point ?? ""}
            onChange={handleCustomPointChange}
          />
        </div>
      </div>
      <input
        name="name"
        value={name}
        className="inputField"
        type="text"
        placeholder="Your name or profile handle"
        onChange={handleChange}
      />
      <textarea
        name="message"
        value={message}
        onChange={handleChange}
        className="inputField"
        placeholder={"Say Something nice... (optional)"}
      ></textarea>
      <button type="submit">
        Support {ONE_COFFEE_EQUIV_ETHER * (point ?? 0)} ETH
      </button>
    </form>
  );
}

function BuyMeACoffee({ address }: { address: string }) {
  const [memos, setMemos] = useState<Memo[]>([]);

  useEffect(() => {
    const { ethereum } = window;
    const web3 = new Web3(ethereum);
    if (!address) return () => {};
    const contract = new web3.eth.Contract(abi.abi, contractAddress);
    const { methods } = contract;
    methods.getMemos().call().then(setMemos);
  }, [address]);

  return (
    <>
      <UserProfile />
      <div className="mainBody">
        <div className="memoList">
          {(memos.length &&
            memos.map((each: Memo, index: number) => {
              return <MemoItem key={index} item={each} />;
            })) || <p className="emptyMemo">Nobody have bought any coffee.</p>}
        </div>
        <BuyCoffeeForm address={address} />
      </div>
    </>
  );
}

function App() {
  const [address, setAddress] = useState<string>("");
  useEffect(() => {
    const { ethereum } = window;
    const web3 = new Web3(ethereum);
    ethereum
      .request({ method: "eth_requestAccounts" })
      .then((each: string[]) => each[0])
      .then((account: string) => setAddress(account));
  }, []);

  return (
    <main>
      <NavBar />
      <BuyMeACoffee address={address} />
    </main>
  );
}

export default App;
