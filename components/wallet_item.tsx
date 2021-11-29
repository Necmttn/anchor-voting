import { PublicKey } from "@solana/web3.js";
import React from "react";
import Identicon from "react-identicons";

export const WalletItem: React.FC<{ pubKey: PublicKey }> = ({ pubKey }) => {
  const pubKeyString = pubKey.toString();
  const shortPublicKey = `${pubKeyString.slice(0, 6)}...${pubKeyString.slice(
    pubKeyString.length - 6
  )}`;
  return (
    <div className={"flex w-full group"}>
      <Identicon string={pubKeyString} size={20} />
      <div className={"pl-2 font-mono  text-gray-600 group-hover:text-black"}>
        {shortPublicKey}
      </div>
    </div>
  );
};
