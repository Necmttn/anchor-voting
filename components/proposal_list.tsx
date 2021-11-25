import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getProposalList } from "../solana";

export const ProposalList = () => {
  const { wallet } = useWallet();
  const [proposals, setProposals] = useState([]);

  // TODO: use SWR for caching
  useEffect(() => {
    (async () => {
      const p = await getProposalList();
      console.log(p);
      setProposals(p);
    })();
  }, [wallet]);
  return (
    <div className={"w-full flex flex-col bg-gray-50 h-full px-2"}>
      <h1>Proposal List</h1>
      <div className={"flex flex-col space-y-4 p-2"}>
        {proposals.map((p) => (
          <ProposalItem key={`proposal_${p?.id.toNumber()}`} proposal={p} />
        ))}
      </div>
    </div>
  );
};

const ProposalItem = ({ proposal }) => {
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
        <div className={"flex space-x-2 text-lg"}>
          <div>👍</div>
          <div>👎</div>
        </div>
      </div>
      <p className={"text-gray-700 mt-4"}>{proposal.description}</p>
    </div>
  );
};
