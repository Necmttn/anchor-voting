import { BN, IdlTypes, Program, ProgramAccount } from "@project-serum/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, VoteAccount } from "@solana/web3.js";
import { Button, message, Progress, Spin } from "antd";
import React, { useEffect } from "react";
import { useVotesForProposal, voteForProposal } from "../solana";
import Identicon from "react-identicons";
import Countdown from "antd/lib/statistic/Countdown";
import { AnchorVoting } from "../anchor-voting/target/types/anchor_voting";

export const ProposalItem = ({ proposal }: { proposal: any }) => {
  const { connected } = useWallet();
  const handleOnVote = async (vote: boolean) => {
    if (!connected) {
      message.warn("Connect to wallet first");
      return;
    }
    await voteForProposal(proposal.id, vote);
  };
  const { publicKey } = useWallet();
  // const hasVoted =
  //   publicKey && proposal.votedUsers.some((k) => k.equals(publicKey));
  const hasVoted = false;
  const voteYes = proposal.voteYes.toNumber();
  const voteNo = proposal.voteNo.toNumber();
  const voteCount = voteYes + voteNo;
  const endTimeStamp = (proposal.endTimeStamp as any).toNumber() * 1000;
  const [isExpired, setIsExpired] = React.useState(endTimeStamp < +new Date());

  const getState = () => {
    switch (true) {
      case !isExpired:
        return "🗳"; // ballot box
      case isExpired && voteYes > voteNo:
        return "👍";
      case isExpired && voteYes < voteNo:
        return "👎";
      case isExpired && voteYes === voteNo:
        return "🤝";
    }
  };
  useEffect(() => {
    setIsExpired(endTimeStamp < +new Date());
  }, [endTimeStamp]);
  return (
    <div className={"p-2 rounded shadow bg-white mb-4"}>
      <div className={"flex justify-between bg-gray-100 p-4 shadow-inner"}>
        <div className={"flex items-center"}>
          <span className={"text-gray-700 text-2xl mr-4"}>
            #{proposal.id.toNumber()}
          </span>{" "}
        </div>
        {isExpired ? null : (
          <Countdown
            title="Deadline"
            value={endTimeStamp}
            format="HH:mm:ss:SSS"
          />
        )}
        {isExpired ? (
          <div className={"text-2xl"}>result: {getState()}</div>
        ) : hasVoted ? (
          <div className="flex items-center justify-center px-4 py-2 font-bold bg-white border rounded">
            Already Voted. ✅
          </div>
        ) : (
          <div className={"flex space-x-2 text-2xl"}>
            <Button shape="circle" onClick={() => handleOnVote(false)}>
              👎
            </Button>
            <Button shape="circle" onClick={() => handleOnVote(true)}>
              👍
            </Button>
          </div>
        )}
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
          showInfo={false}
          percent={voteCount > 0 ? 100 : 0}
          success={{ percent: (voteNo / voteCount) * 100 }}
          status={"active"}
        />
      </div>
      <div className={"px-4 mt-4"}>
        <h2 className={"text-xl font-bold leading-tight"}>
          {proposal?.title as string}
        </h2>
        <p className={"text-gray-700 mt-4 text-lg"}>
          {proposal.description as string}
        </p>
      </div>
      {voteCount > 0 ? <Voters proposalId={proposal.id} /> : null}
      <div className={"py-2 px-4 mt-4"}>
        <div className="flex flex-col ">
          <span className={"text-gray-700 font-bold flex-1 mb-2 text-lg"}>
            Proposed by:
          </span>
          <WalletItem pubKey={proposal.owner} />
        </div>
      </div>
    </div>
  );
};

const Voters = ({ proposalId }: { proposalId: BN }) => {
  const { voters, isLoading } = useVotesForProposal(proposalId);
  console.log(voters);
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
  console.log(vote);
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

const WalletItem: React.FC<{ pubKey: PublicKey }> = ({ pubKey }) => {
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
