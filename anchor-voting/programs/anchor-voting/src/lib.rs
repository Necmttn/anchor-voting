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
        title: String,
        description: String,
        end_time_stamp: u128,
    ) -> ProgramResult {
        let base_account = &mut ctx.accounts.base_account;
        let user = &mut ctx.accounts.user;

        let proposal = Proposal {
            id: base_account.total_proposal_count,
            title,
            owner: *user.to_account_info().key,
            description,
            voted_users: Vec::new(),
            vote_yes: 0,
            vote_no: 0,
            end_time_stamp,
        };

        // add proposal to base account proposals
        base_account.proposal_list.push(proposal);
        // increment total proposal count
        base_account.total_proposal_count += 1;
        Ok(())
    }

    // vote on a proposal
    pub fn vote_for_proposal(
        ctx: Context<VoteForProposal>,
        index: u64,
        vote: bool,
    ) -> ProgramResult {
        let base_account = &mut ctx.accounts.base_account;
        let user = &mut ctx.accounts.user;
        // get proposal
        let proposal = base_account.proposal_list.get_mut(index as usize);
        // check if proposal exists
        if let None = proposal {
            // return error if proposal does not exist
            return Err(ErrorCode::ProposalIndexOutOfBounds.into());
        }
        // unwrap proposal so we can access it
        let proposal = proposal.unwrap();

        // check if user has already voted on this proposal
        if proposal.voted_users.contains(&*user.to_account_info().key) {
            // return error if user has already voted on this proposal
            return Err(ErrorCode::YouAlreadyVotedForThisProposal.into());
        }

        if (Clock::get()?.unix_timestamp as u128) > proposal.end_time_stamp {
            // return error if proposal has ended
            return Err(ErrorCode::ProposalHasEnded.into());
        }

        // add user to voted users.
        proposal.voted_users.push(*user.to_account_info().key);
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
pub struct AddProposal<'info> {
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct VoteForProposal<'info> {
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
}

// Tell Solana what we want to store on this account.
#[account]
pub struct BaseAccount {
    pub total_proposal_count: u64,
    pub proposal_list: Vec<Proposal>,
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct Proposal {
    pub id: u64, // unique id for each proposal
    pub title: String,
    pub description: String,
    pub voted_users: Vec<Pubkey>, //we wanna keep track of who voted
    pub owner: Pubkey,
    pub vote_yes: u64,
    pub vote_no: u64,
    pub end_time_stamp: u128,
    // pub vote_yes: Vec<Pubkey>, if we wanna keep track of who voted yes
    // pub vote_no: Vec<Pubkey>, if we wanna keep track of who voted no
}

#[error]
pub enum ErrorCode {
    #[msg("No Proposal at this index")]
    ProposalIndexOutOfBounds,
    #[msg("You have already voted for this proposal")]
    YouAlreadyVotedForThisProposal,
    #[msg("Proposal deadline is past")]
    ProposalHasEnded,
}
