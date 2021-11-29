import { BN } from "@project-serum/anchor";
import { Spin } from "antd";
import React from "react";
import { useVotesForProposal } from "../solana";
import { WalletItem } from "./wallet_item";

export const VoteList = ({ proposalId }: { proposalId: BN }) => {
  const { voters, isLoading } = useVotesForProposal(proposalId);
  return (
    <div className={"px-4 mt-4"}>
      <h2 className={"font-bold text-lg"}>Participants:</h2>
      <div className={"shadow-inner bg-gray-50 p-2 grid grid-cols-3 gap-4"}>
        {!isLoading ? (
          voters?.map((v) => (
            <VoteItem key={v.publicKey.toString()} vote={v.account} />
          ))
        ) : (
          <Spin />
        )}
      </div>
    </div>
  );
};

const VoteItem: React.FC<{
  vote: any;
}> = ({ vote }) => {
  return (
    <div
      className={`${
        vote.vote ? "bg-green-100" : "bg-red-100"
      } p-1 items-center rounded flex justify-center`}
    >
      <WalletItem pubKey={vote.voter} />
    </div>
  );
};
