// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ConfidentialERC20Module = buildModule("ConfidentialERC20Module", (m) => {
  const confidentialERC20Module = m.contract("ConfidentialERC20");
  return { confidentialERC20Module };
});

export default ConfidentialERC20Module;