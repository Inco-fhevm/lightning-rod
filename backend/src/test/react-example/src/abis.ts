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

// CreditScoreGate ABI
export const creditScoreGateAbi = [
  {
    type: 'constructor',
    inputs: [{ name: '_threshold', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getFee',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getHandle',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'isApproved',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'ctScore', internalType: 'bytes', type: 'bytes' }],
    name: 'setCreditScore',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'decryption',
        internalType: 'struct DecryptionAttestation',
        type: 'tuple',
        components: [
          { name: 'handle', internalType: 'bytes32', type: 'bytes32' },
          { name: 'value', internalType: 'bytes32', type: 'bytes32' },
        ],
      },
      { name: 'signatures', internalType: 'bytes[]', type: 'bytes[]' },
    ],
    name: 'submitCreditCheck',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'threshold',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'user', internalType: 'address', type: 'address', indexed: true }],
    name: 'CreditCheckFailed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'user', internalType: 'address', type: 'address', indexed: true }],
    name: 'CreditCheckPassed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'user', internalType: 'address', type: 'address', indexed: true }],
    name: 'CreditScoreSet',
  },
  { type: 'error', inputs: [], name: 'FeeNotPaid' },
] as const;

// AttestedComputeDemo ABI
export const attestedComputeDemoAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'OP_EQ',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'OP_GE',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'OP_GT',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'OP_LE',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'OP_LT',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'OP_NE',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getFee',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getHandle',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint8', type: 'uint8' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'hasResult',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint8', type: 'uint8' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'results',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'ct', internalType: 'bytes', type: 'bytes' }],
    name: 'setEncryptedValue',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'op', internalType: 'uint8', type: 'uint8' },
      { name: 'scalar', internalType: 'uint256', type: 'uint256' },
      {
        name: 'decryption',
        internalType: 'struct DecryptionAttestation',
        type: 'tuple',
        components: [
          { name: 'handle', internalType: 'bytes32', type: 'bytes32' },
          { name: 'value', internalType: 'bytes32', type: 'bytes32' },
        ],
      },
      { name: 'signatures', internalType: 'bytes[]', type: 'bytes[]' },
    ],
    name: 'submitAttestation',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      { name: 'op', internalType: 'uint8', type: 'uint8', indexed: false },
      { name: 'scalar', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'result', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'AttestationVerified',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'user', internalType: 'address', type: 'address', indexed: true }],
    name: 'ValueSet',
  },
  { type: 'error', inputs: [], name: 'FeeNotPaid' },
  { type: 'error', inputs: [{ name: 'op', internalType: 'uint8', type: 'uint8' }], name: 'InvalidOperation' },
] as const;
