use anchor_lang::prelude::*;

declare_id!("HRNkDCeaArkBn2mM3pMa1JwAMmgaNgWpXnPYeNq5eFvg");

#[program]
mod anchor_voting {

    use super::*;

    // setup base account for anchor voting
    pub fn initialize_voting(ctx: Context<InitializeVoting>) -> ProgramResult {
        let base_account = &mut ctx.accounts.base_account;
        base_account.total_proposal_count = 0;
        Ok(())
    }

    // create a new proposal
    pub fn add_proposal(
        ctx: Context<AddProposal>,
        proposal_account_bump: u8,
        proposal_id: u64,
        title: String,
        description: String,
    ) -> ProgramResult {
        let base_account = &mut ctx.accounts.base_account;
        let proposal = &mut ctx.accounts.proposal;
        let user = &mut ctx.accounts.user;

        if title.chars().count() > 80 {
            return Err(ErrorCode::TitleIsTooLong.into());
        }

        if description.chars().count() > 1024 {
            return Err(ErrorCode::DescriptionIsTooLong.into());
        }

        proposal.id = proposal_id;
        proposal.owner = *user.to_account_info().key;
        proposal.title = title;
        proposal.description = description;
        proposal.vote_yes =  0;
        proposal.vote_no = 0;
        proposal.created_at = Clock::get()?.unix_timestamp;

        proposal.bump = proposal_account_bump;

        // increment total proposal count
        base_account.total_proposal_count += 1;
        Ok(())
    }

    // vote on a proposal
    pub fn vote_for_proposal(
        ctx: Context<VoteForProposal>,
        vote_account_bump: u8,
        proposal_id: u64,
        vote: bool,
    ) -> ProgramResult {
        let proposal = &mut ctx.accounts.proposal;
        let vote_account = &mut ctx.accounts.vote;
        let user = &mut ctx.accounts.user;

        vote_account.proposal_id = proposal_id;
        vote_account.voter = *user.to_account_info().key;
        vote_account.vote = vote;
        vote_account.created_at =  Clock::get()?.unix_timestamp;
        vote_account.bump =  vote_account_bump;

        // check if user has already voted on this proposal
        // if proposal_account
        //     .proposal
        //     .voted_users
        //     .contains(&*user.to_account_info().key)
        // {
        //     // return error if user has already voted on this proposal
        //     return Err(ErrorCode::YouAlreadyVotedForThisProposal.into());
        // }

        // add user to voted users.
        // proposal_account
        //     .proposal
        //     .voted_users
        //     .push(*user.to_account_info().key);

        // corespoing vote count base on `vote`
        if vote {
            proposal.vote_yes += 1
        } else {
            proposal.vote_no += 1
        }
        Ok(())
    }
}
#[derive(Accounts)]
pub struct InitializeVoting<'info> {
    // base account which holds all proposals
    #[account(init, payer = user, space = 10240)]
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(proposal_account_bump: u8, proposal_id: u64)]
pub struct AddProposal<'info> {
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>,

    #[account(init, seeds = [b"proposal_account".as_ref(), proposal_id.to_le_bytes().as_ref()], bump =  proposal_account_bump, payer = user, space = Proposal::LEN)]
    pub proposal: Account<'info, Proposal>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(vote_account_bump: u8, proposal_id: u64)]
pub struct VoteForProposal<'info> {
    #[account(mut, seeds = [b"proposal_account".as_ref(), proposal_id.to_be_bytes().as_ref()], bump = proposal.bump)]
    pub proposal: Account<'info, Proposal>,

    #[account(init, seeds = [b"vote_account".as_ref(), proposal_id.to_le_bytes().as_ref(), user.key.as_ref()] , bump = vote_account_bump, payer = user, space = Vote::LEN)]
    pub vote: Account<'info, Vote>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Proposal {
    pub id: u64, // unique id for each proposal
    pub owner: Pubkey,
    pub created_at: i64,
    pub title: String,
    pub description: String,
    pub vote_yes: u64,
    pub vote_no: u64,
    pub bump: u8,
}

#[account]
pub struct Vote {
    pub proposal_id: u64,
    pub vote: bool,
    pub voter: Pubkey,
    pub created_at: i64,
    pub bump: u8,
}

// Tell Solana what we want to store on this account.
#[account]
pub struct BaseAccount {
    pub total_proposal_count: u64,
}

#[error]
pub enum ErrorCode {
    #[msg("No Proposal at this index")]
    ProposalIndexOutOfBounds,
    #[msg("You have already voted for this proposal")]
    YouAlreadyVotedForThisProposal,
    #[msg("Title is too long. maximum: 80 character")]
    TitleIsTooLong,
    #[msg("Description is too long. maximum: 1024 character")]
    DescriptionIsTooLong,
}

const U64_LEN: usize = 8;
const DISCRIMINATOR_LENGTH: usize = 8;
const PUBKEY_LENGTH: usize = 32;
const TIMESTAMP_LENGTH: usize = 8;
const STRING_LENGTH_PREFIX: usize = 4;
const MAX_PROPOSAL_TITLE_LENGTH: usize = 80 * STRING_LENGTH_PREFIX;
const MAX_PROPOSAL_DESCRIPTION_LENGTH: usize = 1024 * STRING_LENGTH_PREFIX;
const VOTE_COUNT_LENGTH: usize = U64_LEN;
const BUMP_LENGTH: usize = 1;
const BOOL_LENGTH: usize = 1;

impl Proposal {
    const LEN: usize = DISCRIMINATOR_LENGTH 
    + U64_LEN // id
    + PUBKEY_LENGTH // Author
    + TIMESTAMP_LENGTH // Timestamp
    + MAX_PROPOSAL_TITLE_LENGTH // Title 
    + MAX_PROPOSAL_DESCRIPTION_LENGTH // Description 
    + VOTE_COUNT_LENGTH // vote yes count
    + VOTE_COUNT_LENGTH // vote no count
    + BUMP_LENGTH;
}

impl Vote {
    const LEN: usize = DISCRIMINATOR_LENGTH 
    + U64_LEN // proposal id
    + BOOL_LENGTH // vote
    + PUBKEY_LENGTH // Author
    + TIMESTAMP_LENGTH
    + BUMP_LENGTH;
}