import React from "react";
import { useBaseAccount } from "../solana";
import { IdlTypes } from "@project-serum/anchor";
import { AnchorVoting } from "../anchor-voting/target/types/anchor_voting";
import { ProposalItem } from "./proposal_item";

export const ProposalList = () => {
  const { baseAccount } = useBaseAccount();
  const proposals =
    (baseAccount?.proposalList as IdlTypes<AnchorVoting>["Proposal"][]) || [];

  return (
    <div className={"w-full flex flex-col py-8 h-full "}>
      <h1 className={"text-2xl font-mono"}>Proposal List</h1>
      <div className={"flex flex-col-reverse p-2"}>
        {proposals.map((p) => (
          <ProposalItem key={`proposal_${p?.id.toNumber()}`} proposal={p} />
        ))}
      </div>
    </div>
  );
};
