export const addTwoAbi = [
  {
    type: "function",
    name: "addTwo",
    inputs: [{ name: "a", type: "bytes32", internalType: "euint256" }],
    outputs: [{ name: "", type: "bytes32", internalType: "euint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addTwoEOA",
    inputs: [{ name: "uint256EInput", type: "bytes", internalType: "bytes" }],
    outputs: [
      { name: "", type: "uint256", internalType: "uint256" },
      { name: "", type: "bytes32", internalType: "euint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addTwoScalar",
    inputs: [{ name: "a", type: "bytes32", internalType: "euint256" }],
    outputs: [{ name: "", type: "bytes32", internalType: "euint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "callback",
    inputs: [
      { name: "", type: "uint256", internalType: "uint256" },
      { name: "result", type: "uint256", internalType: "uint256" },
      { name: "", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "lastResult",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
] as const;
