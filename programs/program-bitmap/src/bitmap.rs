pub trait Bitmap {
    fn bm_with_capacity(capacity: usize) -> Self;

    fn bm_capacity(&self) -> u32;
    fn bm_reset(&mut self);

    fn bm_set(&mut self, index: u32, value: bool);
    fn bm_get(&self, index: u32) -> bool;
    fn bm_count_true(&self) -> u32;
}

impl Bitmap for Vec<u8> {
    fn bm_with_capacity(capacity: usize) -> Self {
        if capacity % 8 != 0 {
            panic!("bitmap capacity should be 8x");
        }
        vec![0u8; capacity / 8]
    }

    fn bm_capacity(&self) -> u32 {
        (self.len() * 8) as u32
    }
    fn bm_reset(&mut self) {
        for x in self {
            *x = 0;
        }
    }

    fn bm_set(&mut self, index: u32, value: bool) {
        if index > self.bm_capacity() {
            panic!("bitmap capacity overflow")
        }
        let (vec_index, bit_index) = (index / 8, index % 8);
        if value {
            self[vec_index as usize] |= 1 << bit_index;
        } else {
            self[vec_index as usize] &= !(2u8.pow(bit_index));
        }
    }

    fn bm_get(&self, index: u32) -> bool {
        if index > self.bm_capacity() {
            panic!("bitmap capacity overflow")
        }
        let (vec_index, bit_index) = (index / 8, (index % 8) as u8);
        self[vec_index as usize] >> bit_index & 1 == 1
    }

    // O(N) = n
    fn bm_count_true(&self) -> u32 {
        let mut count = 0u32;
        self.iter().for_each(|f| {
            for i in 0..8 {
                if f >> i & 1 == 1 {
                    count += 1;
                }
            }
        });
        count
    }
}

#[cfg(test)]
mod tests {
    use crate::bitmap::*;

    #[test]
    pub fn test_bitmap() {
        let mut bm = Vec::<u8>::bm_with_capacity(8 * 5);
        assert_eq!(bm.bm_capacity(), 40);

        for x in 0..bm.bm_capacity() {
            bm.bm_set(x, true);
            assert!(bm.bm_get(x), "should be true");
            assert_eq!(bm.bm_count_true(), x + 1);
            println!("count {} {:?}", bm.bm_count_true(), bm);
        }
        for x in 0..bm.bm_capacity() {
            bm.bm_set(x, false);
            assert!(!bm.bm_get(x), "should be false");
            assert_eq!(bm.bm_count_true(), bm.bm_capacity() - x - 1);
            println!("count {} {:?}", bm.bm_count_true(), bm);
        }
    }
}
