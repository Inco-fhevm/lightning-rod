//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AddTwo
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LibTest
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const libTestAbi = [
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'euint256', type: 'bytes32' },
    ],
    name: 'testAdd',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'testAddScalar',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'euint256', type: 'bytes32' },
    ],
    name: 'testAnd',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'ebool', type: 'bytes32' },
      { name: 'b', internalType: 'ebool', type: 'bytes32' },
    ],
    name: 'testAndBool',
    outputs: [{ name: '', internalType: 'ebool', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'ebool', type: 'bytes32' },
      { name: 'b', internalType: 'bool', type: 'bool' },
    ],
    name: 'testAndBoolScalar',
    outputs: [{ name: '', internalType: 'ebool', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'testAndScalar',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'euint256', type: 'bytes32' },
    ],
    name: 'testDiv',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'testDivScalar',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'euint256', type: 'bytes32' },
    ],
    name: 'testEq',
    outputs: [{ name: '', internalType: 'ebool', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'eaddress', type: 'bytes32' },
      { name: 'b', internalType: 'eaddress', type: 'bytes32' },
    ],
    name: 'testEqAddress',
    outputs: [{ name: '', internalType: 'ebool', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'eaddress', type: 'bytes32' },
      { name: 'b', internalType: 'address', type: 'address' },
    ],
    name: 'testEqAddressScalar',
    outputs: [{ name: '', internalType: 'ebool', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'testEqScalar',
    outputs: [{ name: '', internalType: 'ebool', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'euint256', type: 'bytes32' },
    ],
    name: 'testGe',
    outputs: [{ name: '', internalType: 'ebool', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'testGeScalar',
    outputs: [{ name: '', internalType: 'ebool', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'euint256', type: 'bytes32' },
    ],
    name: 'testGt',
    outputs: [{ name: '', internalType: 'ebool', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'testGtScalar',
    outputs: [{ name: '', internalType: 'ebool', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'euint256', type: 'bytes32' },
    ],
    name: 'testLe',
    outputs: [{ name: '', internalType: 'ebool', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'testLeScalar',
    outputs: [{ name: '', internalType: 'ebool', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'euint256', type: 'bytes32' },
    ],
    name: 'testLt',
    outputs: [{ name: '', internalType: 'ebool', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'testLtScalar',
    outputs: [{ name: '', internalType: 'ebool', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'euint256', type: 'bytes32' },
    ],
    name: 'testMax',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'testMaxScalar',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'euint256', type: 'bytes32' },
    ],
    name: 'testMin',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'testMinScalar',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'euint256', type: 'bytes32' },
    ],
    name: 'testMul',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'testMulScalar',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'euint256', type: 'bytes32' },
    ],
    name: 'testNe',
    outputs: [{ name: '', internalType: 'ebool', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'eaddress', type: 'bytes32' },
      { name: 'b', internalType: 'eaddress', type: 'bytes32' },
    ],
    name: 'testNeAddress',
    outputs: [{ name: '', internalType: 'ebool', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'eaddress', type: 'bytes32' },
      { name: 'b', internalType: 'address', type: 'address' },
    ],
    name: 'testNeAddressScalar',
    outputs: [{ name: '', internalType: 'ebool', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'testNeScalar',
    outputs: [{ name: '', internalType: 'ebool', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ciphertext', internalType: 'bytes', type: 'bytes' },
      { name: 'user', internalType: 'address', type: 'address' },
    ],
    name: 'testNewEaddress',
    outputs: [{ name: '', internalType: 'eaddress', type: 'bytes32' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ciphertext', internalType: 'bytes', type: 'bytes' },
      { name: 'user', internalType: 'address', type: 'address' },
    ],
    name: 'testNewEbool',
    outputs: [{ name: '', internalType: 'ebool', type: 'bytes32' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ciphertext', internalType: 'bytes', type: 'bytes' },
      { name: 'user', internalType: 'address', type: 'address' },
    ],
    name: 'testNewEuint256',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'a', internalType: 'ebool', type: 'bytes32' }],
    name: 'testNot',
    outputs: [{ name: '', internalType: 'ebool', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'euint256', type: 'bytes32' },
    ],
    name: 'testOr',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'ebool', type: 'bytes32' },
      { name: 'b', internalType: 'ebool', type: 'bytes32' },
    ],
    name: 'testOrBool',
    outputs: [{ name: '', internalType: 'ebool', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'ebool', type: 'bytes32' },
      { name: 'b', internalType: 'bool', type: 'bool' },
    ],
    name: 'testOrBoolScalar',
    outputs: [{ name: '', internalType: 'ebool', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'testOrScalar',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'testRand',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'upperBound', internalType: 'uint256', type: 'uint256' }],
    name: 'testRandBounded',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'upperBound', internalType: 'euint256', type: 'bytes32' }],
    name: 'testRandBoundedEncrypted',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'euint256', type: 'bytes32' },
    ],
    name: 'testRem',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'testRemScalar',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'a', internalType: 'eaddress', type: 'bytes32' }],
    name: 'testRevealEAddress',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'a', internalType: 'ebool', type: 'bytes32' }],
    name: 'testRevealEBool',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'a', internalType: 'euint256', type: 'bytes32' }],
    name: 'testRevealEUint',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'euint256', type: 'bytes32' },
    ],
    name: 'testRotl',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'testRotlScalar',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'euint256', type: 'bytes32' },
    ],
    name: 'testRotr',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'testRotrScalar',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'euint256', type: 'bytes32' },
    ],
    name: 'testShl',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'testShlScalar',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'euint256', type: 'bytes32' },
    ],
    name: 'testShr',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'testShrScalar',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'euint256', type: 'bytes32' },
    ],
    name: 'testSub',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'testSubScalar',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'euint256', type: 'bytes32' },
    ],
    name: 'testXor',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'ebool', type: 'bytes32' },
      { name: 'b', internalType: 'ebool', type: 'bytes32' },
    ],
    name: 'testXorBool',
    outputs: [{ name: '', internalType: 'ebool', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'ebool', type: 'bytes32' },
      { name: 'b', internalType: 'bool', type: 'bool' },
    ],
    name: 'testXorBoolScalar',
    outputs: [{ name: '', internalType: 'ebool', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'a', internalType: 'euint256', type: 'bytes32' },
      { name: 'b', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'testXorScalar',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SimpleConfidentialToken
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const simpleConfidentialTokenAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'valueInput', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'ebool', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'euint256', type: 'bytes32' },
    ],
    name: 'transfer',
    outputs: [{ name: 'success', internalType: 'ebool', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
] as const
