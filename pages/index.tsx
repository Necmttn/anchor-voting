import { useWallet } from "@solana/wallet-adapter-react";
import { Button, message } from "antd";
import type { NextPage } from "next";
import Head from "next/head";
import React from "react";
import { CreateProposalModal } from "../components/create_proposal";
import { ProposalList } from "../components/proposal_list";
import { createBaseAccountForProposals, useBaseAccount } from "../solana";

const Home: NextPage = () => {
  const { connected } = useWallet();
  const { baseAccount, isError } = useBaseAccount();
  const handleCreateBaseAccount = async () => {
    if (!connected) {
      message.warn("Connect the wallet first!");
      return;
    }
    await createBaseAccountForProposals();
  };

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
        {!baseAccount && isError ? (
          <div>
            <Button onClick={handleCreateBaseAccount}>
              Deploy Base Account
            </Button>
          </div>
        ) : (
          <>
            <CreateProposalModal />
            <ProposalList />
          </>
        )}
      </main>
    </>
  );
};

export default Home;
