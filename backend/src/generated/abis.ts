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
    name: 'isValidDecryptionAttestation',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'FeeNotPaid' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ElistTest
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const elistTestAbi = [
  { type: 'receive', stateMutability: 'payable' },
  {
    type: 'function',
    inputs: [],
    name: 'boolList',
    outputs: [{ name: '', internalType: 'elist', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'ctValue', internalType: 'bytes', type: 'bytes' }],
    name: 'boolListAppend',
    outputs: [{ name: '', internalType: 'elist', type: 'bytes32' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'index', internalType: 'uint16', type: 'uint16' }],
    name: 'boolListGet',
    outputs: [{ name: '', internalType: 'ebool', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ctIndex', internalType: 'bytes', type: 'bytes' },
      { name: 'ctDefaultValue', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'boolListGetOr',
    outputs: [{ name: '', internalType: 'ebool', type: 'bytes32' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'index', internalType: 'uint16', type: 'uint16' },
      { name: 'ctValue', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'boolListInsert',
    outputs: [{ name: '', internalType: 'elist', type: 'bytes32' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ctIndex', internalType: 'bytes', type: 'bytes' },
      { name: 'ctValue', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'boolListInsertEncryptedIndex',
    outputs: [{ name: '', internalType: 'elist', type: 'bytes32' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'index', internalType: 'uint16', type: 'uint16' },
      { name: 'ctValue', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'boolListSet',
    outputs: [{ name: '', internalType: 'elist', type: 'bytes32' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ctIndex', internalType: 'bytes', type: 'bytes' },
      { name: 'ctValue', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'boolListSetEncryptedIndex',
    outputs: [{ name: '', internalType: 'elist', type: 'bytes32' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ctStart', internalType: 'bytes', type: 'bytes' },
      { name: 'len', internalType: 'uint16', type: 'uint16' },
      { name: 'ctDefaultValue', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'boolListSliceLen',
    outputs: [{ name: '', internalType: 'elist', type: 'bytes32' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'list',
    outputs: [{ name: '', internalType: 'elist', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'ctValue', internalType: 'bytes', type: 'bytes' }],
    name: 'listAppend',
    outputs: [{ name: '', internalType: 'elist', type: 'bytes32' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'cts', internalType: 'bytes[]', type: 'bytes[]' },
      { name: 'listType', internalType: 'enum ETypes', type: 'uint8' },
      { name: 'user', internalType: 'address', type: 'address' },
    ],
    name: 'listConcat',
    outputs: [{ name: '', internalType: 'elist', type: 'bytes32' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'index', internalType: 'uint16', type: 'uint16' }],
    name: 'listGet',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ctIndex', internalType: 'bytes', type: 'bytes' },
      { name: 'ctDefaultValue', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'listGetOr',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'index', internalType: 'uint16', type: 'uint16' }],
    name: 'listGetRange',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ctIndex', internalType: 'bytes', type: 'bytes' },
      { name: 'ctValue', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'listInsert',
    outputs: [{ name: '', internalType: 'elist', type: 'bytes32' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'index', internalType: 'uint16', type: 'uint16' },
      { name: 'ctValue', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'listInsertUint16Index',
    outputs: [{ name: '', internalType: 'elist', type: 'bytes32' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'listLength',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'start', internalType: 'uint16', type: 'uint16' },
      { name: 'end', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'listRange',
    outputs: [{ name: '', internalType: 'elist', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'listReverse',
    outputs: [{ name: '', internalType: 'elist', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ctIndex', internalType: 'bytes', type: 'bytes' },
      { name: 'ctValue', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'listSet',
    outputs: [{ name: '', internalType: 'elist', type: 'bytes32' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'index', internalType: 'uint16', type: 'uint16' },
      { name: 'ctValue', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'listSetUint16Index',
    outputs: [{ name: '', internalType: 'elist', type: 'bytes32' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'listShuffle',
    outputs: [{ name: '', internalType: 'elist', type: 'bytes32' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'start', internalType: 'uint16', type: 'uint16' },
      { name: 'end', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'listShuffledRange',
    outputs: [{ name: '', internalType: 'elist', type: 'bytes32' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ctStart', internalType: 'bytes', type: 'bytes' },
      { name: 'len', internalType: 'uint16', type: 'uint16' },
      { name: 'ctDefaultValue', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'listSlice',
    outputs: [{ name: '', internalType: 'elist', type: 'bytes32' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'start', internalType: 'uint16', type: 'uint16' },
      { name: 'end', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'listSlice',
    outputs: [{ name: '', internalType: 'elist', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'listTypeOf',
    outputs: [{ name: '', internalType: 'enum ETypes', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'inputs', internalType: 'bytes[]', type: 'bytes[]' },
      { name: 'user', internalType: 'address', type: 'address' },
    ],
    name: 'newBoolList',
    outputs: [{ name: '', internalType: 'elist', type: 'bytes32' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'handles', internalType: 'bytes32[]', type: 'bytes32[]' },
      { name: 'listType', internalType: 'enum ETypes', type: 'uint8' },
    ],
    name: 'newEList',
    outputs: [{ name: '', internalType: 'elist', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'inputs', internalType: 'bytes[]', type: 'bytes[]' },
      { name: 'listType', internalType: 'enum ETypes', type: 'uint8' },
      { name: 'user', internalType: 'address', type: 'address' },
    ],
    name: 'newEList',
    outputs: [{ name: '', internalType: 'elist', type: 'bytes32' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'listType', internalType: 'enum ETypes', type: 'uint8' }],
    name: 'newEmptyEList',
    outputs: [{ name: '', internalType: 'elist', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'newRangeList',
    outputs: [{ name: '', internalType: 'elist', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'error',
    inputs: [
      { name: 'i', internalType: 'uint16', type: 'uint16' },
      { name: 'len', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'IndexOutOfRange',
  },
  {
    type: 'error',
    inputs: [
      { name: 'start', internalType: 'uint16', type: 'uint16' },
      { name: 'end', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'InvalidRange',
  },
  {
    type: 'error',
    inputs: [
      { name: 'start', internalType: 'uint16', type: 'uint16' },
      { name: 'end', internalType: 'uint16', type: 'uint16' },
      { name: 'len', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'SliceOutOfRange',
  },
  {
    type: 'error',
    inputs: [{ name: 'listType', internalType: 'enum ETypes', type: 'uint8' }],
    name: 'UnsupportedListType',
  },
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
    stateMutability: 'payable',
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
