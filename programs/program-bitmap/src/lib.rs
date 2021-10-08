use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod program_bitmap {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>, len: u32) -> Result<()> {
        let ob = &mut ctx.accounts.ob;
        ob.owner = *ctx.accounts.owner.to_account_info().key;
        ob.bitmap = vec![0u8; len as usize / 8];
        Ok(())
    }

    pub fn set(ctx: Context<Admin>, index: u32) -> Result<()> {
        let ob = &mut ctx.accounts.ob;
        ob.set(index)
    }

    pub fn close(_ctx: Context<Close>) -> Result<()> {
        Ok(())
    }
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
pub struct Close<'info> {
    #[account(mut, close = sol_dest, has_one = owner)]
    pub ob: Account<'info, OwnedBitmap>,
    #[account(signer)]
    pub owner: AccountInfo<'info>,
    #[account(mut)]
    sol_dest: AccountInfo<'info>,
}

#[account]
pub struct OwnedBitmap {
    owner: Pubkey,
    bitmap: Vec<u8>,
}

#[error]
pub enum ErrorCode {
    #[msg("value in index already set")]
    AlreadySet, //300 0x12c
    #[msg("index overflow")]
    IndexOverflow, //301 0x12d
}

impl OwnedBitmap {
    fn set(&mut self, index: u32) -> Result<()> {
        if index >= (self.bitmap.len() * 8) as u32 {
            return Err(ErrorCode::IndexOverflow.into());
        }
        let (vec_index, bit_index) = (index / 8, index % 8);
        let is_set = self.bitmap[vec_index as usize] >> bit_index & 1 == 1;
        if is_set {
            return Err(ErrorCode::AlreadySet.into());
        }
        self.bitmap[vec_index as usize] |= 1 << bit_index;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use anchor_lang::prelude::Pubkey;

    fn bm_count_true(bm: &[u8]) -> u32 {
        let mut count = 0u32;
        bm.iter().for_each(|f| {
            for i in 0..8 {
                if f >> i & 1 == 1 {
                    count += 1;
                }
            }
        });
        count
    }

    fn bm_get(bm: &[u8], index: u32) -> bool {
        let (vec_index, bit_index) = (index / 8, index % 8);
        bm[vec_index as usize] >> bit_index & 1 == 1
    }

    #[test]
    pub fn test_bitmap() {
        let vec_len = 5;
        let capacity = vec_len * 8;
        let mut bm = crate::OwnedBitmap {
            owner: Pubkey::new_unique(),
            bitmap: vec![0u8; vec_len],
        };

        assert_eq!(
            bm.set(capacity as u32).unwrap_err().to_string(),
            crate::ErrorCode::IndexOverflow.to_string(),
            "index overflow"
        );

        for i in 0..capacity {
            let index = i as u32;
            let mut ret = bm.set(index);
            assert!(ret.is_ok());
            assert!(bm_get(&bm.bitmap, index), "should be true");
            assert_eq!(bm_count_true(&bm.bitmap), index + 1);

            ret = bm.set(index);
            assert!(ret.is_err());
            assert_eq!(
                ret.unwrap_err().to_string(),
                crate::ErrorCode::AlreadySet.to_string()
            );
        }
    }
}
