// AddTwo ABI
export const addTwoAbi = [
  {
    type: 'function',
    inputs: [{ name: 'a', internalType: 'euint256', type: 'bytes32' }],
    name: 'addTwo',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'uint256EInput', internalType: 'bytes', type: 'bytes' }],
    name: 'addTwoEOA',
    outputs: [{ name: 'result', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'a', internalType: 'euint256', type: 'bytes32' }],
    name: 'addTwoScalar',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getFee',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  { type: 'error', inputs: [], name: 'FeeNotPaid' },
] as const;

