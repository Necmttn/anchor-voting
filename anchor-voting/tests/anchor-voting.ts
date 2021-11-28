import { AnchorVoting } from "./../target/types/anchor_voting";
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { LAMPORTS_PER_SOL, SystemProgram } from "@solana/web3.js";
import assert from "assert";
import { base64 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import * as bs58 from "bs58";

describe("anchor-voting", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AnchorVoting as Program<AnchorVoting>;

  // The Account to create.
  const baseAccount = anchor.web3.Keypair.generate();

  const getNumberBuffer = (total: number, alloc = 8) => {
    const totalProposalAccountBuf = Buffer.alloc(alloc);
    totalProposalAccountBuf.writeUIntLE(total, 0, 6);
    totalProposalAccountBuf.write;
    return totalProposalAccountBuf;
  };

  /**
   * BYTE   8-bit unsigned                          buf.writeUInt8()
   * SBYTE  8-bit signed                            buf.writeInt8()
   * BOOL   8-bit boolean (0x00=False, 0xFF=True)   buf.fill(0x00) || buf.fill(0xFF)
   * CHAR   8-bit single ASCII character            buf.from('Text', 'ascii') - Make 8-bit?
   * UNI    16-bit single unicode character         buf.from('A', 'utf16le') - Correct?
   * SHORT  16-bit signed                           buf.writeInt16BE() - @see https://www.reddit.com/r/node/comments/9hob2u/buffer_endianness_little_endian_or_big_endian_how/
   * USHORT 16-bit unsigned                         buf.writeUInt16BE() - @see https://www.reddit.com/r/node/comments/9hob2u/buffer_endianness_little_endian_or_big_endian_how/
   * INT    32-bit signed                           buf.writeInt32BE - @see https://www.reddit.com/r/node/comments/9hob2u/buffer_endianness_little_endian_or_big_endian_how/
   * UINT   32-bit unsigned                         buf.writeUInt32BE - @see https://www.reddit.com/r/node/comments/9hob2u/buffer_endianness_little_endian_or_big_endian_how/
   */

  const TRUE = Buffer.alloc(1).fill(0xff);
  const FALSE = Buffer.alloc(1).fill(0x00);

  const newUser = anchor.web3.Keypair.generate();
  before(async () => {
    const signature = await program.provider.connection.requestAirdrop(
      newUser.publicKey,
      1 * LAMPORTS_PER_SOL
    );
    await program.provider.connection.confirmTransaction(signature);
  });

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
    const proposalId = getNumberBuffer(account.totalProposalCount.toNumber());
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

    const secondProposalId = getNumberBuffer(
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
    const proposalId = getNumberBuffer(0);
    const [proposalAccountPublicKey] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("proposal_account"), proposalId],
        anchor.workspace.AnchorVoting.programId
      );

    const [voteAccountPublicKey, voteBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from("vote_account"),
          proposalId,
          provider.wallet.publicKey.toBuffer(),
        ],
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
    const vote = await program.account.vote.all();
    assert.ok(vote.length === 1);
  });

  it("Can vote for a second proposal!", async () => {
    const proposalId = getNumberBuffer(1);
    const [proposalAccountPublicKey] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("proposal_account"), proposalId],
        anchor.workspace.AnchorVoting.programId
      );

    const [voteAccountPublicKey, voteBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from("vote_account"),
          proposalId,
          provider.wallet.publicKey.toBuffer(),
        ],
        anchor.workspace.AnchorVoting.programId
      );
    console.log(voteAccountPublicKey.toString(), voteBump);
    await program.rpc.voteForProposal(voteBump, new anchor.BN(1), false, {
      accounts: {
        proposal: proposalAccountPublicKey,
        user: provider.wallet.publicKey,
        vote: voteAccountPublicKey,
        systemProgram: SystemProgram.programId,
      },
    });
    const vote = await program.account.vote.all();
    assert.equal(vote.length, 2);
  });

  it("Can not vote for a same proposal twice!", async () => {
    await assert.rejects(
      async () => {
        const proposalId = getNumberBuffer(0);
        const [proposalAccountPublicKey] =
          await anchor.web3.PublicKey.findProgramAddress(
            [Buffer.from("proposal_account"), proposalId],
            anchor.workspace.AnchorVoting.programId
          );

        const [voteAccountPublicKey, voteBump] =
          await anchor.web3.PublicKey.findProgramAddress(
            [
              Buffer.from("vote_account"),
              proposalId,
              provider.wallet.publicKey.toBuffer(),
            ],
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

        // await program.rpc.voteForProposal(voteBump, new anchor.BN(1), false, {
        //   accounts: {
        //     proposal: proposalAccountPublicKey,
        //     user: provider.wallet.publicKey,
        //     vote: voteAccountPublicKey,
        //     systemProgram: SystemProgram.programId,
        //   },
        // });
      },
      {
        name: "Error",
        // message: "301: You have already voted for this proposal",
      }
    );
    const vote = await program.account.vote.all();
    assert.ok(vote.length === 1);
  });

  it("Can not vote for a proposal that does not exist!", async () => {
    await assert.rejects(
      async () => {
        const proposalId = getNumberBuffer(999999009);
        const [proposalAccountPublicKey] =
          await anchor.web3.PublicKey.findProgramAddress(
            [Buffer.from("proposal_account"), proposalId],
            anchor.workspace.AnchorVoting.programId
          );

        const [voteAccountPublicKey, voteBump] =
          await anchor.web3.PublicKey.findProgramAddress(
            [
              Buffer.from("vote_account"),
              proposalId,
              provider.wallet.publicKey.toBuffer(),
            ],
            anchor.workspace.AnchorVoting.programId
          );
        console.log(voteAccountPublicKey.toString(), voteBump);
        await program.rpc.voteForProposal(
          voteBump,
          new anchor.BN(999999009),
          true,
          {
            accounts: {
              proposal: proposalAccountPublicKey,
              user: provider.wallet.publicKey,
              vote: voteAccountPublicKey,
              systemProgram: SystemProgram.programId,
            },
          }
        );
      },
      {
        name: "Error",
        // message: "301: You have already voted for this proposal",
      }
    );

    const vote = await program.account.vote.all();
    assert.ok(vote.length === 1);
  });

  it("New User Can Vote to first proposal", async () => {
    const proposalId = getNumberBuffer(0);
    const [proposalAccountPublicKey] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("proposal_account"), proposalId],
        anchor.workspace.AnchorVoting.programId
      );

    const firstProposal = await program.account.proposal.fetch(
      proposalAccountPublicKey
    );
    assert.ok(firstProposal.title === "Test Title");

    const [voteAccountPublicKey, voteBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("vote_account"), proposalId, newUser.publicKey.toBuffer()],
        anchor.workspace.AnchorVoting.programId
      );

    await program.rpc.voteForProposal(voteBump, new anchor.BN(0), false, {
      accounts: {
        proposal: proposalAccountPublicKey,
        user: newUser.publicKey,
        vote: voteAccountPublicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [newUser],
    });

    const vote = await program.account.vote.all();
    assert.ok(vote.length === 2);
  });

  it("New user can vote to second proposal", async () => {
    const secondProposalId = getNumberBuffer(1);
    const [secondProposalAccountPublicKey] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("proposal_account"), secondProposalId],
        anchor.workspace.AnchorVoting.programId
      );

    const secondProposal = await program.account.proposal.fetch(
      secondProposalAccountPublicKey
    );

    assert.ok(secondProposal.title === "Second Test Title");

    console.log([
      Buffer.from("vote_account"),
      secondProposalId,
      newUser.publicKey.toBuffer(),
    ]);

    const [secondVoteAccountPublicKey, secondVoteBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from("vote_account"),
          secondProposalId,
          newUser.publicKey.toBuffer(),
        ],
        anchor.workspace.AnchorVoting.programId
      );

    console.log(secondVoteAccountPublicKey.toString(), secondVoteBump);

    await program.rpc.voteForProposal(secondVoteBump, secondProposal.id, true, {
      accounts: {
        proposal: secondProposalAccountPublicKey,
        vote: secondVoteAccountPublicKey,
        user: newUser.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [newUser],
    });

    const vote = await program.account.vote.all();
    assert.ok(vote.length === 3);
  });

  it("We can get votes for Proposals", async () => {
    const proposalOneVotes = await program.account.vote.all([
      {
        memcmp: {
          offset: 8, // Discriminator.
          bytes: bs58.encode(getNumberBuffer(0)),
        },
      },
    ]);
    assert.ok(proposalOneVotes.length === 2);
  });

  it("We can filter votes which is yes", async () => {
    const proposalOneYesVotes = await program.account.vote.all([
      {
        memcmp: {
          offset: 8, // Discriminator.
          bytes: bs58.encode(Buffer.concat([getNumberBuffer(0), TRUE])),
        },
      },
    ]);
    console.log(proposalOneYesVotes);
    assert.equal(proposalOneYesVotes.length, 1);
    assert.ok(proposalOneYesVotes[0].account.vote === true);
  });

  it("We can filter votes which is no", async () => {
    const proposalOneNoVotes = await program.account.vote.all([
      {
        memcmp: {
          offset: 8, // Discriminator.
          bytes: bs58.encode(Buffer.concat([getNumberBuffer(0), FALSE])),
        },
      },
    ]);
    console.log(proposalOneNoVotes);
    assert.ok(proposalOneNoVotes.length === 1);
    assert.ok(proposalOneNoVotes[0].account.vote === false);
  });
});
