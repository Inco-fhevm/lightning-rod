# Lightning Rod

Lightning Rod is the home of the Dapp Developer Kit (DDK) for Inco Lightning network.

<img src="./docs/images/lightning-rod.png" alt="Lightning Rod" width="300" style="float: right; margin-left: 20px; margin-bottom: 20px;">

To start working with Inco Lightning and the Lighting Rod template repository, work through the [Quick Start](#quick-start) section below.

Further [documentation](#documentation) is linked below.

## Documentation

- [Inco Lightning SDK](docs/inco-lightning.md)

## Quick Start

### Prerequisites

We require recent versions of

- [Docker](https://www.docker.com/)
- [Bun](https://bun.sh/)
- [Foundry](https://getfoundry.sh/)

to be installed.

### Install dependencies

To install the dependencies, run:

```bash
bun install
```

### Local test network

To run a local test network, you need to have Docker installed. You can use the following command to start the network:

```bash
docker compose up
```

This is useful to deploy your dapp locally and test it in a simulated environment.

### Running simple end-to-end test

This test makes sure your local inco environment works properly.  
You can run the [`incolite.local.e2e.test.ts`](./test/src/incolite.local.e2e.test.ts) and automatically boot the local test network with:

```bash
# no need to have docker compose running prior to this command. Have the docker daemon up.
bun test:e2e
```

This compiles some contracts with Foundry and run a local Inco Lightning environment (runs the docker compose) in the background.

If you have the docker compose already running in the background, you can run the test like so:

```bash
cd backend && bun run test:e2e
```

### Testing a Confidential Smart Contract

An example of a simple confidential token using inco is provided in `contracts/`.  
To test run:

```bash
bun install
cd contracts
forge test
```
