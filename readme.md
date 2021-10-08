## usage

```bash
# init
ANCHOR_WALLET=~/.config/solana/id.json RPC_URL=https://api.devnet.solana.com ts-node app/cli.ts init 240

# inspect
ANCHOR_WALLET=~/.config/solana/id.json RPC_URL=https://api.devnet.solana.com ts-node app/cli.ts inspect $BITMAP

# set
ANCHOR_WALLET=~/.config/solana/id.json RPC_URL=https://api.devnet.solana.com px ts-node app/cli.ts set $BITMAP $INDEX

# close
ANCHOR_WALLET=~/.config/solana/id.json RPC_URL=https://api.devnet.solana.com ts-node app/cli.ts close $BITMAP
```

## program id

### devnet

- `EGouPpM75ScRYBos5nYoafDDYVqMJptYQf5oqEoYZ7Xz`
- 2021-10-08T17:28:10+08:00
- commit: `86bce50a4f3a80856af4ff9537ec246ccdb44fc0`

### mainnet

- `BMP23Y1u4FdGSwknSH7PVswT9ru7f9YsyjqR18pHGmBJ`
