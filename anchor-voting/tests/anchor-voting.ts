import * as anchor from "@project-serum/anchor";
import { IdlTypes, Program } from "@project-serum/anchor";
import { SystemProgram } from "@solana/web3.js";
import assert from "assert";

import { AnchorVoting } from "../target/types/anchor_voting";

describe("anchor-voting", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AnchorVoting as Program<AnchorVoting>;

  // The Account to create.
  const baseAccount = anchor.web3.Keypair.generate();

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.rpc.initializeVoting({
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [baseAccount],
    });
    console.log("Your transaction signature", tx);

    const account = await program.account.baseAccount.fetch(
      baseAccount.publicKey
    );
    console.log("Your account", account);
  });

  it("Can add a proposal!", async () => {
    await program.rpc.addProposal("Test Title", "Test Description", {
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
      },
    });
    const account = await program.account.baseAccount.fetch(
      baseAccount.publicKey
    );
    assert.ok(account.totalProposalCount.toNumber() === 1);
    console.log("🗳 Proposal List: ", account.proposalList);
  });

  it("Can vote for a proposal!", async () => {
    await program.rpc.voteForProposal(new anchor.BN(0), true, {
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
      },
    });
    const account = await program.account.baseAccount.fetch(
      baseAccount.publicKey
    );
    assert.ok(account.totalProposalCount.toNumber() === 1);
    const firstProposal = account
      .proposalList[0] as IdlTypes<AnchorVoting>["Proposal"];
    assert.ok(firstProposal.votedUsers.length === 1);
    assert.ok(firstProposal.voteYes.toNumber() === 1);
    assert.ok(firstProposal.voteNo.toNumber() === 0);
    console.log("🗳 Proposal List: ", account.proposalList);
  });

  it("Can not vote for a same proposal twice!", async () => {
    await assert.rejects(
      async () => {
        await program.rpc.voteForProposal(new anchor.BN(0), true, {
          accounts: {
            baseAccount: baseAccount.publicKey,
            user: provider.wallet.publicKey,
          },
        });
      },
      {
        name: "Error",
        message: "301: You have already voted for this proposal",
      }
    );
    const account = await program.account.baseAccount.fetch(
      baseAccount.publicKey
    );
    assert.ok(account.totalProposalCount.toNumber() === 1);
    const firstProposal = account
      .proposalList[0] as IdlTypes<AnchorVoting>["Proposal"];
    assert.ok(firstProposal.votedUsers.length === 1);
    assert.ok(firstProposal.voteYes.toNumber() === 1);
    assert.ok(firstProposal.voteNo.toNumber() === 0);
  });
});
