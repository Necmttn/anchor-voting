import { useWallet } from "@solana/wallet-adapter-react";
import { Button, message, Progress } from "antd";
import React, { useEffect } from "react";
import { useGetUserVoteForProposal, voteForProposal } from "../solana";
import Countdown from "antd/lib/statistic/Countdown";
import { WalletItem } from "./wallet_item";
import { VoteList } from "./vote_list";
import Link from "next/link";

export const ProposalItem = ({
  proposal,
  showVotes = false,
}: {
  proposal: any;
  showVotes?: boolean;
}) => {
  const { connected } = useWallet();
  const handleOnVote = async (vote: boolean) => {
    if (!connected) {
      message.warn("Connect to wallet first");
      return;
    }
    await voteForProposal(proposal.id, vote);
  };
  const { vote } = useGetUserVoteForProposal(proposal.id.toNumber());
  const { publicKey } = useWallet();
  // const hasVoted =
  //   publicKey && proposal.votedUsers.some((k) => k.equals(publicKey));
  const hasVoted = vote?.account;
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
          <Link href={`/${proposal.id.toNumber()}`} passHref>
            <span className={"text-gray-700 text-2xl mr-4 cursor-pointer"}>
              #{proposal.id.toNumber()}
            </span>
          </Link>
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
        <Link href={`/${proposal.id.toNumber()}`} passHref>
          <h2 className={"text-xl font-bold leading-tight cursor-pointer"}>
            {proposal?.title as string}
          </h2>
        </Link>
        <p className={"text-gray-700 mt-4 text-lg"}>
          {proposal.description as string}
        </p>
      </div>
      {showVotes && voteCount > 0 ? (
        <VoteList proposalId={proposal.id} />
      ) : null}
      <div className={"py-2 px-4 mt-4 flex justify-between"}>
        <div className="flex flex-col ">
          <span className={"text-gray-700 font-bold flex-1 mb-2 text-lg"}>
            Proposed by:
          </span>
          <WalletItem pubKey={proposal.owner} />
        </div>
        <div>
          {!showVotes ? (
            <Link href={`/${proposal.id.toNumber()}`} passHref>
              <Button>Details</Button>
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
};
