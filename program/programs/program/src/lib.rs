use anchor_lang::prelude::*;

declare_id!("E7T5m2vsc2xrzjGxU4Khh2Qz2nFJHKudyvFoJM6fLjaa");

#[program]
pub mod anchor_voting {
    use super::*;

    pub fn create_proposal(ctx: Context<CreateProposal>) -> ProgramResult {
        //TODO
        Ok(())
    }

    pub fn cancel_proposal(ctx: Context<CancelProposal>) -> ProgramResult {
        //TODO
        Ok(())
    }

    pub fn vote(ctx: Context<Vote>) -> ProgramResult {
        //TODO
        Ok(())
    }

}

#[derive(Accounts)]
pub struct CreateProposal<'info> {
    // TODO
    #[account(mut, signer)]
    pub initializer:  AccountInfo<'info>
}

#[derive(Accounts)]
pub struct CancelProposal<'info> {
    #[account(mut, signer)]
    pub initializer: AccountInfo<'info>,


}

#[derive(Accounts)]
pub struct Vote<'info> {
    #[account(mut, signer)]
    pub initializer: AccountInfo<'info>,
    pub mint: Account<'info>,

}



#[account]
pub struct ProposalAccount {
    pub initializer_key: Pubkey,
    pub name: String,
    pub description: String,
    pub vote_count: u64,
    pub vote_yes: u64,
    pub vote_no: u64,
    pub vote_accounts: Vec<Pubkey>,
}

#[account]
pub struct VoteAccount {
    pub initializer_key: Pubkey,
    pub proposal_id: Pubkey,
    pub vote: bool,
}
