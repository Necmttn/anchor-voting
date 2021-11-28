import { AnchorVoting } from "./../target/types/anchor_voting";
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SystemProgram } from "@solana/web3.js";
import assert from "assert";
import { base64 } from "@project-serum/anchor/dist/cjs/utils/bytes";

describe("anchor-voting", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AnchorVoting as Program<AnchorVoting>;

  // The Account to create.
  const baseAccount = anchor.web3.Keypair.generate();

  const getProposalIdBuffer = (total: number) => {
    const totalProposalAccountBuf = Buffer.alloc(8);
    totalProposalAccountBuf.writeUIntLE(total, 0, 6);
    return totalProposalAccountBuf;
  };

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
    let account = await program.account.baseAccount.fetch(
      baseAccount.publicKey
    );
    console.log("Your account", account);
    const proposalId = getProposalIdBuffer(
      account.totalProposalCount.toNumber()
    );
    const [proposalAccountPublicKey, accountBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("proposal_account"), proposalId],
        anchor.workspace.AnchorVoting.programId
      );
    console.log({
      proposalAccountPublicKey: proposalAccountPublicKey.toString(),
      bump: accountBump,
      seed: [Buffer.from("proposal_account"), proposalId],
    });
    await program.rpc.addProposal(
      new anchor.BN(accountBump),
      account.totalProposalCount,
      "Test Title",
      "Test Description",
      {
        accounts: {
          baseAccount: baseAccount.publicKey,
          proposal: proposalAccountPublicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      }
    );

    account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    console.log("Your account", account);

    const secondProposalId = getProposalIdBuffer(
      account.totalProposalCount.toNumber()
    );
    const [secondProposalAccountPublicKey, secondAccountBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("proposal_account"), secondProposalId],
        anchor.workspace.AnchorVoting.programId
      );

    console.log("SECOND:", secondProposalAccountPublicKey, secondAccountBump);

    await program.rpc.addProposal(
      secondAccountBump,
      account.totalProposalCount,
      "Second Test Title",
      "Second Test Description",
      {
        accounts: {
          baseAccount: baseAccount.publicKey,
          proposal: secondProposalAccountPublicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      }
    );

    account = await program.account.baseAccount.fetch(baseAccount.publicKey);

    const proposals = await program.account.proposal.all();
    assert.ok(proposals.length === account.totalProposalCount.toNumber());
    console.log("🗳 Base Account ", account);
  });

  it("Can vote for a proposal!", async () => {
    const proposalId = getProposalIdBuffer(0);
    const [proposalAccountPublicKey] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("proposal_account"), proposalId],
        anchor.workspace.AnchorVoting.programId
      );

    const [voteAccountPublicKey, voteBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("vote_account"), proposalId],
        anchor.workspace.AnchorVoting.programId
      );
    console.log(voteAccountPublicKey.toString(), voteBump);
    await program.rpc.voteForProposal(voteBump, new anchor.BN(0), true, {
      accounts: {
        proposal: proposalAccountPublicKey,
        user: provider.wallet.publicKey,
        vote: voteAccountPublicKey,
        systemProgram: SystemProgram.programId,
      },
    });
    const account = await program.account.baseAccount.fetch(
      baseAccount.publicKey
    );
    const proposal = await program.account.proposal.all([
      {
        memcmp: {
          offset: 8, // Discriminator.
          bytes: base64.encode(1),
        },
      },
    ]);
    const vote = await program.account.vote.all();

    assert.ok(proposal.length === 2);
    console.log(account, proposal, vote);
    // const firstProposalAccount = await program.account.proposal.fetch(
    //   firstProposalPubKey
    // );
    // assert.ok(firstProposalAccount.voteYes.toNumber() === 1);
    // assert.ok(firstProposalAccount.voteNo.toNumber() === 0);

    // const votes = await program.account.vote.all();
    // assert.ok(votes.length === 1);
  });

  // it("Can not vote for a same proposal twice!", async () => {
  //   await assert.rejects(
  //     async () => {
  //       const proposalId = getProposalIdBuffer(0);
  //       const [proposalAccountPublicKey] =
  //         await anchor.web3.PublicKey.findProgramAddress(
  //           [Buffer.from("proposal_account"), proposalId],
  //           anchor.workspace.AnchorVoting.programId
  //         );
  //       await program.rpc.voteForProposal(new anchor.BN(0), true, {
  //         accounts: {
  //           baseAccount: baseAccount.publicKey,
  //           proposalAccount: proposalAccountPublicKey,
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
  //   const firstProposalPubKey = account.proposalList[0];
  //   const firstProposalAccount = await program.account.proposalAccount.fetch(
  //     firstProposalPubKey
  //   );
  //   assert.ok(firstProposalAccount.proposal.votedUsers.length === 1);
  //   assert.ok(firstProposalAccount.proposal.voteYes.toNumber() === 1);
  //   assert.ok(firstProposalAccount.proposal.voteNo.toNumber() === 0);
  //   console.log("🗳 Proposal List: ", firstProposalAccount);
  // });

  // it("We Can filter Proposals", async () => {
  //   const proposal = await program.account.proposalAccount.all([
  //     {
  //       memcmp: {
  //         offset: 8, // Discriminator.
  //         bytes: base64.encode(1),
  //       },
  //     },
  //   ]);
  //   console.log("🗳 Proposal List: ", proposal);
  // });
});
