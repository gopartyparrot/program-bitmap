use anchor_lang::prelude::*;
use bitmap::Bitmap;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

mod bitmap;

#[program]
pub mod program_bitmap {
    use crate::bitmap::Bitmap;

    use super::*;
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let len: usize = ctx.accounts.ob.to_account_info().data_len();
        let ob = &mut ctx.accounts.ob;
        ob.owner = *ctx.accounts.owner.to_account_info().key;
        ob.bitmap = Vec::<u8>::bm_with_capacity((len - 44) * 8); //exclude sig hash and owner space
        Ok(())
    }

    // current value in $index must be !$value then set new value to $value
    pub fn must_swap(ctx: Context<Admin>, iv: IndexValue) -> Result<()> {
        let ob = &mut ctx.accounts.ob;
        ob.check_index(iv.index)?;
        if ob.bitmap.bm_get(iv.index) != !iv.value {
            return Err(ErrorCode::ValueNotMatch.into());
        }
        ob.bitmap.bm_set(iv.index, iv.value);
        Ok(())
    }

    pub fn must_swap_batch(ctx: Context<Admin>, ivs: Vec<IndexValue>) -> Result<()> {
        let ob = &mut ctx.accounts.ob;
        for iv in ivs {
            ob.check_index(iv.index)?;
            if ob.bitmap.bm_get(iv.index) != !iv.value {
                return Err(ErrorCode::ValueNotMatch.into());
            }
            ob.bitmap.bm_set(iv.index, iv.value);
        }
        Ok(())
    }

    pub fn set(ctx: Context<Admin>, iv: IndexValue) -> Result<()> {
        let ob = &mut ctx.accounts.ob;
        ob.check_index(iv.index)?;
        ob.bitmap.bm_set(iv.index, iv.value);
        Ok(())
    }

    pub fn set_batch(ctx: Context<Admin>, ivs: Vec<IndexValue>) -> Result<()> {
        let ob = &mut ctx.accounts.ob;
        for iv in ivs {
            ob.check_index(iv.index)?;
            ob.bitmap.bm_set(iv.index, iv.value);
        }
        Ok(())
    }

    pub fn reset(ctx: Context<Admin>) -> Result<()> {
        let ob = &mut ctx.accounts.ob;
        ob.bitmap.bm_reset();
        Ok(())
    }

    pub fn set_owner(ctx: Context<SetOwner>) -> Result<()> {
        let ob = &mut ctx.accounts.ob;
        ob.owner = *ctx.accounts.new_owner.to_account_info().key;
        Ok(())
    }
}

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct IndexValue {
    pub index: u32,
    pub value: bool,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(zero)]
    pub ob: Account<'info, OwnedBitmap>,
    #[account(signer)]
    pub owner: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct Admin<'info> {
    #[account(mut, has_one = owner)]
    pub ob: Account<'info, OwnedBitmap>,
    #[account(signer)]
    pub owner: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct SetOwner<'info> {
    #[account(mut, has_one = owner)]
    pub ob: Account<'info, OwnedBitmap>,
    #[account(signer)]
    pub owner: AccountInfo<'info>,
    #[account()]
    pub new_owner: AccountInfo<'info>,
}

#[account]
pub struct OwnedBitmap {
    owner: Pubkey,
    bitmap: Vec<u8>,
}

impl OwnedBitmap {
    pub fn check_index(&self, index: u32) -> Result<()> {
        if self.bitmap.bm_capacity() <= index {
            return Err(ErrorCode::IndexOverflow.into());
        }
        Ok(())
    }
}

#[error]
pub enum ErrorCode {
    #[msg("value not match")]
    ValueNotMatch, //300 0x12c
    #[msg("index overflow")]
    IndexOverflow, //301 0x12d
}
