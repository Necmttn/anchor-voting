import { NextPage } from "next";
import Head from "next/head";
import React from "react";
import { useProposal } from "../solana";
import { useRouter } from "next/router";
import { ProposalItem } from "../components/proposal_item";
import { Spin } from "antd";

const Proposal: NextPage = () => {
  const { query } = useRouter();
  const { proposal, isLoading, isError } = useProposal(
    parseInt(query.proposalId as string)
  );
  return (
    <>
      <Head>
        <title>Anchor Voting App</title>
        <meta
          name="description"
          content="Solana Voting app built with nextjs, anchor, solana"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={"w-full max-w-5xl"}>
        {!isLoading && !isError ? (
          <ProposalItem proposal={proposal?.account} showVotes={true} />
        ) : (
          <Spin />
        )}
      </main>
    </>
  );
};

export default Proposal;
