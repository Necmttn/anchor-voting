## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

## Deploying the Smart Contract. 
```bash
cd anchor-voting
anchor build
anchor test
anchor deploy
```
### Copy the idl to frontend for web3.js
in base directory.
```bash
    yarn copy-idl
```

### Creating New Keypair for BaseAccount
Base Account needs to be created after deploying the smart contract. in order to create a new keypair, run the following command:
```bash
    yarn generate-keypair
```

## Deploying the Smart Contract to Devnet.
Change the network to `devnet` in Anchor.toml. follow the steps in deployment section.
