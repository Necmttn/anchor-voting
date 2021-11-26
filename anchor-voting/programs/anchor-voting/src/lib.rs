use anchor_lang::prelude::*;

declare_id!("HRNkDCeaArkBn2mM3pMa1JwAMmgaNgWpXnPYeNq5eFvg");

#[program]
mod anchor_voting {

    use super::*;
    
    pub fn initialize_voting(ctx: Context<InitializeVoting>) -> ProgramResult {
        let base_account = &mut ctx.accounts.base_account;
        base_account.total_proposal_count = 0;
        Ok(())
    }

    pub fn add_proposal(ctx: Context<AddProposal>, title: String, description: String) -> ProgramResult {
        let base_account = &mut ctx.accounts.base_account;
        let user = &mut ctx.accounts.user;

        let proposal = Proposal {
            id: base_account.total_proposal_count,
            title,
            owner: *user.to_account_info().key,
            description,
            voted_users: Vec::new(),
            vote_count: 0,
            vote_yes: 0,
            vote_no: 0,
        };

        base_account.proposal_list.push(proposal);
        base_account.total_proposal_count += 1;
        Ok(())
    }

    pub fn vote_for_proposal(ctx: Context<VoteForProposal>, index: u64, vote: bool ) -> ProgramResult {
        let base_account = &mut ctx.accounts.base_account;
        let user = &mut ctx.accounts.user;
        let proposal =  base_account.proposal_list.get_mut(index as usize);
        if let None = proposal {
            return Err(ErrorCode::ProposalIndexOutOfBounds.into());
        }
        let proposal = proposal.unwrap();

        if proposal.voted_users.contains(&*user.to_account_info().key) {
            return Err(ErrorCode::YouAlreadyVotedForThisProposal.into());
        }

        proposal.voted_users.push(*user.to_account_info().key);
        if vote {
            proposal.vote_yes += 1
        } else {
            proposal.vote_no += 1
        }
        proposal.vote_count += 1;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeVoting<'info> {
    #[account(init, payer = user, space = 1000)]
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program <'info, System>,
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




#[derive(Debug, Copy, Clone, AnchorSerialize, AnchorDeserialize)]
pub enum Vote {
  Down = -1,
  Up   =  1,
}

// Tell Solana what we want to store on this account.
#[account]
pub struct BaseAccount {
    pub total_proposal_count: u64,
    pub proposal_list: Vec<Proposal>,
}


#[derive(Debug,  Clone, AnchorSerialize, AnchorDeserialize)]
pub struct UserVote {
    pub owner: Pubkey,
    pub vote: Vote,
}

#[derive(Debug,  Clone, AnchorSerialize, AnchorDeserialize)]
pub struct Proposal {
    pub id: u64,
    pub title: String,
    pub description: String,
    pub owner: Pubkey,
    pub voted_users: Vec<Pubkey>,
    pub vote_count: u64,
    pub vote_yes: u64,
    pub vote_no: u64,
}

#[error]
pub enum ErrorCode {
    #[msg("No Proposal at this index")]
    ProposalIndexOutOfBounds,
    #[msg("You have already voted for this proposal")]
    YouAlreadyVotedForThisProposal,
}