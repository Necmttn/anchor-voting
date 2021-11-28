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

        proposal.bump = proposal_account_bump;

        // add proposal to base account proposals
        base_account
            .proposal_list
            .push(proposal.to_account_info().key.clone());
        // increment total proposal count
        base_account.total_proposal_count += 1;
        Ok(())
    }

    // vote on a proposal
    pub fn vote_for_proposal(
        ctx: Context<VoteForProposal>,
        proposal_id: u64,
        vote: bool,
    ) -> ProgramResult {
        let base_account = &mut ctx.accounts.base_account;
        let proposal_account = &mut ctx.accounts.proposal_account;
        let user = &mut ctx.accounts.user;
        // get proposal
        let proposal = base_account.proposal_list.get_mut(proposal_id as usize);
        // check if proposal exists
        if let None = proposal {
            // return error if proposal does not exist
            return Err(ErrorCode::ProposalIndexOutOfBounds.into());
        }
        // unwrap proposal so we can access it

        // check if user has already voted on this proposal
        if proposal_account
            .proposal
            .voted_users
            .contains(&*user.to_account_info().key)
        {
            // return error if user has already voted on this proposal
            return Err(ErrorCode::YouAlreadyVotedForThisProposal.into());
        }

        // add user to voted users.
        proposal_account
            .proposal
            .voted_users
            .push(*user.to_account_info().key);
        // corespoing vote count base on `vote`
        if vote {
            proposal_account.proposal.vote_yes += 1
        } else {
            proposal_account.proposal.vote_no += 1
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

    #[account(init, seeds = [b"proposal_account".as_ref(), proposal_id.to_le_bytes().as_ref()], bump = {msg!("bump be {}", proposal_account_bump); proposal_account_bump}, payer = user, space = 10240)]
    pub proposal: Account<'info, Proposal>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(proposal_id: u64)]
pub struct VoteForProposal<'info> {
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut, seeds = [b"proposal_account".as_ref(), proposal_id.to_be_bytes().as_ref()], bump = proposal_account.bump)]
    pub proposal_account: Account<'info, Proposal>,
    #[account(mut)]
    pub user: Signer<'info>,
}

#[account]
pub struct Proposal {
    pub id: u64, // unique id for each proposal
    pub owner: Pubkey,
    pub created_at: u64,
    pub title: String,
    pub description: String,
    pub voted_users: Vec<Pubkey>, //we wanna keep track of who voted
    pub vote_yes: u64,
    pub vote_no: u64,
    pub bump: u8,
}

// Tell Solana what we want to store on this account.
#[account]
pub struct BaseAccount {
    pub total_proposal_count: u64,
    pub proposal_list: Vec<Pubkey>,
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

const DISCRIMINATOR_LENGTH: usize = 8;
const PUBKEY_LENGTH: usize = 32;
const TIMESTAMP_LENGTH: usize = 8;
const STRING_LENGTH_PREFIX: usize = 4;
const MAX_PROPOSAL_TITLE_LENGTH: usize = 80 * 4;
const MAX_CONTENT_LENGTH: usize = 1024 * 4;
