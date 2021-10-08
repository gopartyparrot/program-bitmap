## usage

if you need to test program on devnet replace `metadata->address` in `app/idl.json` to devnet program id

```bash
export ANCHOR_WALLET=~/.config/solana/id.json
#export RPC_URL=https://api.devnet.solana.com
export RPC_URL=https://api.mainnet-beta.solana.com

# init with capacity(8x, eg: 48 800 16000)
# or: ANCHOR_WALLET=~/.config/solana/id.json RPC_URL=https://api.devnet.solana.com ts-node app/cli.ts init 48
ts-node app/cli.ts init 48

#set env bitmap address
export BITMAP=$yourBitmapAddress

# inspect
ts-node app/cli.ts inspect $BITMAP

# set
px ts-node app/cli.ts set $BITMAP $INDEX

# close
ts-node app/cli.ts close $BITMAP
```

## program id

### devnet

- `EGouPpM75ScRYBos5nYoafDDYVqMJptYQf5oqEoYZ7Xz`
- 2021-10-08T17:28:10+08:00
- commit: `86bce50a4f3a80856af4ff9537ec246ccdb44fc0`

### mainnet

- `BMP23Y1u4FdGSwknSH7PVswT9ru7f9YsyjqR18pHGmBJ`
- 2021-10-08T20:20:46+08:00
- commit `809e74fa8f74c32039e78045e6e59435400cb0f3`
