import { AnchorVoting } from "./../target/types/anchor_voting";
import * as anchor from "@project-serum/anchor";
import { IdlTypes, Program } from "@project-serum/anchor";
import { SystemProgram } from "@solana/web3.js";
import assert from "assert";

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
    const account = await program.account.baseAccount.fetch(
      baseAccount.publicKey
    );
    console.log("Your account", account);

    const [proposalAccountPublicKey, accountBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from("proposal_account"),
          account.totalProposalCount.toBuffer(),
        ],
        anchor.workspace.AnchorVoting.programId
      );

    console.log([
      proposalAccountPublicKey.toString(),
      new anchor.BN(accountBump),
      account.totalProposalCount,
      "Test Title",
      "Test Description",
      {
        accounts: {
          baseAccount: baseAccount.publicKey,
          proposalAccount: proposalAccountPublicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      },
    ]);
    await program.rpc.addProposal(
      new anchor.BN(accountBump),
      account.totalProposalCount,
      "Test Title",
      "Test Description",
      {
        accounts: {
          baseAccount: baseAccount.publicKey,
          proposalAccount: proposalAccountPublicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        // signers: [baseAccount],
      }
    );

    // account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    // console.log("Your account", account);

    // const [secondProposalAccountPublicKey, secondAccountBump] =
    //   await anchor.web3.PublicKey.findProgramAddress(
    //     [
    //       Buffer.from("proposal_account"),
    //       account.totalProposalCount.toBuffer(),
    //     ],
    //     anchor.workspace.AnchorVoting.programId
    //   );

    // console.log("SECOND:", secondProposalAccountPublicKey, secondAccountBump);

    // await program.rpc.addProposal(
    //   secondAccountBump,
    //   account.totalProposalCount,
    //   "Second Test Title",
    //   "Second Test Description",
    //   {
    //     accounts: {
    //       baseAccount: baseAccount.publicKey,
    //       proposalAccount: secondProposalAccountPublicKey,
    //       user: provider.wallet.publicKey,
    //       systemProgram: SystemProgram.programId,
    //     },
    //   }
    // );

    // account = await program.account.baseAccount.fetch(baseAccount.publicKey);

    // const proposalList = account.proposalList;

    // proposalList.forEach(async (proposal) => {
    //   const proposalAccount = await program.account.proposalAccount.fetch(
    //     proposal
    //   );
    //   console.log(proposalAccount);
    // });

    // assert.ok(account.totalProposalCount.toNumber() === 2);
    // console.log("🗳 Base Account ", account);
  });

  // it("Can vote for a proposal!", async () => {
  //   await program.rpc.voteForProposal(new anchor.BN(0), true, {
  //     accounts: {
  //       baseAccount: baseAccount.publicKey,
  //       user: provider.wallet.publicKey,
  //     },
  //   });
  //   const account = await program.account.baseAccount.fetch(
  //     baseAccount.publicKey
  //   );
  //   assert.ok(account.totalProposalCount.toNumber() === 1);
  //   const firstProposal = (
  //     account.proposalList as IdlTypes<AnchorVoting>["Proposal"][]
  //   )[0];
  //   assert.ok(firstProposal.votedUsers.length === 1);
  //   assert.ok(firstProposal.voteYes.toNumber() === 1);
  //   assert.ok(firstProposal.voteNo.toNumber() === 0);
  //   console.log("🗳 Proposal List: ", account.proposalList);
  // });

  // it("Can not vote for a same proposal twice!", async () => {
  //   await assert.rejects(
  //     async () => {
  //       await program.rpc.voteForProposal(new anchor.BN(0), true, {
  //         accounts: {
  //           baseAccount: baseAccount.publicKey,
  //           user: provider.wallet.publicKey,
  //         },
  //       });
  //     },
  //     {
  //       name: "Error",
  //       message: "301: You have already voted for this proposal",
  //     }
  //   );
  //   const account = await program.account.baseAccount.fetch(
  //     baseAccount.publicKey
  //   );
  //   assert.ok(account.totalProposalCount.toNumber() === 1);
  //   const firstProposal = (
  //     account.proposalList as IdlTypes<AnchorVoting>["Proposal"][]
  //   )[0];
  //   assert.ok(firstProposal.votedUsers.length === 1);
  //   assert.ok(firstProposal.voteYes.toNumber() === 1);
  //   assert.ok(firstProposal.voteNo.toNumber() === 0);
  // });
});
