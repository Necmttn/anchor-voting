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
            votes: vec![],
        };

        base_account.proposal_list.push(proposal);
        base_account.total_proposal_count += 1;
        Ok(())
    }

    // pub fn vote_for_proposal(ctx: Context<VoteForProposal>, proposal_id: u32, vote: bool) -> ProgramResult {
    //     let base_account = &mut ctx.accounts.base_account;

    //     Ok(())
    // }
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


// #[derive(Accounts)]
// pub struct VoteForProposal<'info> {
//     #[account(mut)]
//     pub base_account: Account<'info, BaseAccount>,
//     #[account(mut)]
//     pub user: Signer<'info>,
// }




#[derive(Debug,  Clone, AnchorSerialize, AnchorDeserialize)]
pub struct Vote {
    pub proposal_id: u64,
    pub voter_id: Pubkey,
    pub vote: bool,
}

// Tell Solana what we want to store on this account.
#[account]
pub struct BaseAccount {
    pub total_proposal_count: u64,
    pub proposal_list: Vec<Proposal>,
}


#[derive(Debug,  Clone, AnchorSerialize, AnchorDeserialize)]
pub struct Proposal {
    pub id: u64,
    pub title: String,
    pub description: String,
    pub owner: Pubkey,
    pub votes: Vec<Vote>,
}
