import React, { useEffect } from "react";
import { useProposaList } from "../solana";
import { ProposalItem } from "./proposal_item";
import { Button, Spin } from "antd";
import Link from "next/link";
import Countdown from "antd/lib/statistic/Countdown";

export const ProposalList = () => {
  const { proposalList, isLoading } = useProposaList();
  return (
    <div className={"w-full flex flex-col py-8 h-full "}>
      <h1 className={"text-2xl font-mono"}>Proposal List</h1>
      <div className={"flex flex-col-reverse p-2"}>
        {!isLoading ? (
          proposalList?.map((p) => (
            <ProposalItemSmall
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

export const ProposalItemSmall: React.FC<{ proposal: any }> = ({
  proposal,
}) => {
  const voteYes = proposal.voteYes.toNumber();
  const voteNo = proposal.voteNo.toNumber();
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
    <Link href={`/${proposal.id.toNumber()}`} passHref>
      <div
        className={
          "p-4 rounded shadow flex items-center cursor-pointer hover:scale-105 bg-white hover:border-blue-600 mt-2"
        }
      >
        <span className={"text-gray-700 text-2xl mr-4 cursor-pointer"}>
          #{proposal.id.toNumber()}
        </span>
        <h2 className={"text-xl font-bold leading-tight cursor-pointer"}>
          {proposal?.title as string}
        </h2>
        <div className={"ml-auto flex "}>
          {isExpired ? null : (
            <div className={"flex items-center ml-4 justify-center"}>
              <span className={"text-gray-500"}>finishes at:</span>
              <Countdown
                title={null}
                value={endTimeStamp}
                format="HH:mm:ss"
                className={"ml-1"}
              />
            </div>
          )}
          <span className={"ml-4 text-3xl"}>{getState()}</span>
        </div>
      </div>
    </Link>
  );
};
