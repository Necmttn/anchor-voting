import React from "react";
import { useProposaList } from "../solana";
import { ProposalItem } from "./proposal_item";
import { Spin } from "antd";

export const ProposalList = () => {
  const { proposalList, isLoading } = useProposaList();

  return (
    <div className={"w-full flex flex-col py-8 h-full "}>
      <h1 className={"text-2xl font-mono"}>Proposal List</h1>
      <div className={"flex flex-col-reverse p-2"}>
        {!isLoading ? (
          proposalList?.map((p) => (
            <ProposalItem
              key={`proposal_${p?.account.id.toNumber()}`}
              proposal={p.account}
            />
          ))
        ) : (
          <Spin />
        )}
      </div>
    </div>
  );
};
