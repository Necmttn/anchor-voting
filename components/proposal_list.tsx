import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  createBaseAccountForProposals,
  useBaseAccount,
  voteForProposal,
} from "../solana";
import { Button, Progress } from "antd";
import { IdlTypes } from "@project-serum/anchor";
import { AnchorVoting } from "../anchor-voting/target/types/anchor_voting";

export const ProposalList = () => {
  const { baseAccount, isError } = useBaseAccount();
  const proposals =
    (baseAccount?.proposalList as IdlTypes<AnchorVoting>["Proposal"][]) || [];
  console.log(isError);
  return (
    <div className={"w-full flex flex-col py-8 h-full "}>
      <h1>Proposal List</h1>
      {baseAccount?.totalProposalCount.toNumber()}
      {!baseAccount ? (
        <div>
          <Button onClick={() => createBaseAccountForProposals()}>
            Deploy Base Account
          </Button>
        </div>
      ) : (
        <div className={"flex flex-col space-y-4 p-2"}>
          {proposals.reverse().map((p) => (
            <ProposalItem key={`proposal_${p?.id.toNumber()}`} proposal={p} />
          ))}
        </div>
      )}
    </div>
  );
};

const ProposalItem = ({
  proposal,
}: {
  proposal: IdlTypes<AnchorVoting>["Proposal"];
}) => {
  const handleOnVote = async (vote: boolean) => {
    await voteForProposal(proposal.id, vote);
  };
  const { publicKey } = useWallet();
  const hasVoted =
    publicKey && proposal.votedUsers.some((k) => k.equals(publicKey));
  const voteCount = proposal.voteCount.toNumber();
  const voteYes = proposal.voteYes.toNumber();
  const voteNo = proposal.voteNo.toNumber();
  return (
    <div className={"p-2 rounded shadow bg-white "}>
      <div className={"flex justify-between"}>
        <h2 className={"text-lg font-bold"}>
          {" "}
          <span className={"text-gray-700"}>
            #{proposal.id.toNumber()}
          </span>{" "}
          {proposal.title}
        </h2>
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
      <p className={"text-gray-700 mt-4"}>{proposal.description as string}</p>
      <div className={"px-8"}>
        <Progress
          percent={voteCount ? 100 : 0}
          success={{ percent: (voteYes / voteCount) * 100 }}
          status={"active"}
        />
        <div className="flex justify-between">
          <div>{voteYes}</div>
          <div>{voteNo}</div>
        </div>
      </div>
    </div>
  );
};
