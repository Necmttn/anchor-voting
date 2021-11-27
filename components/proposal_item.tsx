import { IdlTypes } from "@project-serum/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Button, message, Progress } from "antd";
import React from "react";
import { AnchorVoting } from "../anchor-voting/target/types/anchor_voting";
import { voteForProposal } from "../solana";
import Identicon from "react-identicons";

export const ProposalItem = ({
  proposal,
}: {
  proposal: IdlTypes<AnchorVoting>["Proposal"];
}) => {
  const { connected } = useWallet();
  const handleOnVote = async (vote: boolean) => {
    if (!connected) {
      message.warn("Connect to wallet first");
      return;
    }
    await voteForProposal(proposal.id, vote);
  };
  const { publicKey } = useWallet();
  const hasVoted =
    publicKey && proposal.votedUsers.some((k) => k.equals(publicKey));
  const voteCount = proposal.voteCount.toNumber();
  const voteYes = proposal.voteYes.toNumber();
  const voteNo = proposal.voteNo.toNumber();
  return (
    <div className={"p-2 rounded shadow bg-white mb-4"}>
      <div className={"flex justify-between bg-gray-100 p-4"}>
        <div className={"flex items-center"}>
          <span className={"text-gray-700 text-2xl mr-4"}>
            #{proposal.id.toNumber()}
          </span>{" "}
          <h2 className={"text-lg font-bold leading-tight"}>
            {proposal?.title as string}
          </h2>
        </div>
        {hasVoted ? (
          <div className="p-2 border rounded ">Already Voted. ✅</div>
        ) : (
          <div className={"flex space-x-2 text-2xl"}>
            <Button shape="circle" onClick={() => handleOnVote(true)}>
              👍
            </Button>
            <Button shape="circle" onClick={() => handleOnVote(false)}>
              👎
            </Button>
          </div>
        )}
      </div>
      <div className={"py-2 px-4"}>
        <div className="flex">
          <span className={"text-gray-700 font-bold"}>Proposed by:</span>
          <WalletItem publicKey={proposal.owner} />
        </div>
      </div>
      <div className={"px-8"}>
        <div className="flex justify-between">
          <div>
            <h4 className={"text-2xl"}>👎</h4>
            <span>{voteNo}</span>
          </div>
          <div>
            <h4 className={"text-2xl"}>👍</h4>
            <span>{voteYes}</span>
          </div>
        </div>
        <Progress
          percent={voteCount ? 100 : 0}
          success={{ percent: (voteYes / voteCount) * 100 }}
          status={"active"}
        />
      </div>
      <div className={"px-4"}>
        <h2 className={"font-bold text-lg"}>Description</h2>
        <p className={"text-gray-700 mt-4 text-lg"}>
          {proposal.description as string}
        </p>
      </div>
      {proposal.voteCount.toNumber() > 0 ? (
        <div className={"px-4 mt-4"}>
          <h2 className={"font-bold text-lg"}>Participants:</h2>
          <div className={"shadow-inner bg-gray-50 p-2 grid grid-cols-3 gap-4"}>
            {proposal.votedUsers.map((v) => (
              <WalletItem key={v.toBase58()} publicKey={v} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const WalletItem: React.FC<{ publicKey: PublicKey }> = ({ publicKey }) => {
  const pubKeyString = publicKey.toString();
  const shortPublicKey = `${pubKeyString.slice(0, 6)}...${pubKeyString.slice(
    pubKeyString.length - 6
  )}`;
  return (
    <div className={"flex"}>
      <div className={"w-8 h-8"}>
        <Identicon string={publicKey.toString()} size={20} />
      </div>
      <div>{shortPublicKey}</div>
    </div>
  );
};
