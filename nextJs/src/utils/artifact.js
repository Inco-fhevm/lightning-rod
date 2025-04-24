
    const abi = [
      {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "spender",
            "type": "address"
          }
        ],
        "name": "Approval",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "Mint",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferStarted",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          }
        ],
        "name": "Transfer",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "decryptedAmount",
            "type": "uint256"
          }
        ],
        "name": "UserBalanceDecrypted",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "bytes",
            "name": "encryptedAmount",
            "type": "bytes"
          }
        ],
        "name": "_mint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "_name",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "_symbol",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "_totalSupply",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "acceptOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          }
        ],
        "name": "allowance",
        "outputs": [
          {
            "internalType": "euint256",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "bytes",
            "name": "encryptedAmount",
            "type": "bytes"
          }
        ],
        "name": "approve",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "euint256",
            "name": "amount",
            "type": "bytes32"
          }
        ],
        "name": "approve",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "wallet",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "internalType": "euint256",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "decimals",
        "outputs": [
          {
            "internalType": "uint8",
            "name": "",
            "type": "uint8"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "mintedAmount",
            "type": "uint256"
          }
        ],
        "name": "mint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "requestId",
            "type": "uint256"
          },
          {
            "internalType": "bytes32",
            "name": "_decryptedAmount",
            "type": "bytes32"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "name": "onDecryptionCallback",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "pendingOwner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "user",
            "type": "address"
          }
        ],
        "name": "requestUserBalanceDecryption",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "bytes",
            "name": "encryptedAmount",
            "type": "bytes"
          }
        ],
        "name": "transfer",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "euint256",
            "name": "amount",
            "type": "bytes32"
          }
        ],
        "name": "transfer",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "bytes",
            "name": "encryptedAmount",
            "type": "bytes"
          }
        ],
        "name": "transferFrom",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "euint256",
            "name": "amount",
            "type": "bytes32"
          }
        ],
        "name": "transferFrom",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ];
    const bytecode = "0x608060405234801561000f575f5ffd5b50338061003557604051631e4fbdf760e01b81525f600482015260240160405180910390fd5b61003e816100a1565b5060408051808201909152601081526f10dbdb999a59195b9d1a585b081554d160821b602082015260039061007390826101a4565b506040805180820190915260048082526318d554d160e21b60208301529061009b90826101a4565b5061025e565b600180546001600160a01b03191690556100ba816100bd565b50565b5f80546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b634e487b7160e01b5f52604160045260245ffd5b600181811c9082168061013457607f821691505b60208210810361015257634e487b7160e01b5f52602260045260245ffd5b50919050565b601f82111561019f57805f5260205f20601f840160051c8101602085101561017d5750805b601f840160051c820191505b8181101561019c575f8155600101610189565b50505b505050565b81516001600160401b038111156101bd576101bd61010c565b6101d1816101cb8454610120565b84610158565b6020601f821160018114610203575f83156101ec5750848201515b5f19600385901b1c1916600184901b17845561019c565b5f84815260208120601f198516915b828110156102325787850151825560209485019460019092019101610212565b508482101561024f57868401515f19600387901b60f8161c191681555b50505050600190811b01905550565b6112838061026b5f395ff3fe608060405234801561000f575f5ffd5b5060043610610132575f3560e01c80637d32e7bd116100b4578063b3c06f5011610079578063b3c06f5014610287578063c06462fa1461029a578063d28d8852146102ad578063dd62ed3e146102b5578063e30c3978146102c8578063f2fde38b146102d9575f5ffd5b80637d32e7bd146102155780638da5cb5b14610228578063a0712d681461024c578063b09f12661461025f578063b20dea5a14610274575f5ffd5b80635cd2f4d3116100fa5780635cd2f4d3146101b557806370a08231146101c8578063714baf7b146101f0578063715018a61461020357806379ba50971461020d575f5ffd5b8063014647f414610136578063297235111461015e578063313ce567146101715780633eaaf86b1461018b57806349972663146101a2575b5f5ffd5b610149610144366004610e98565b6102ec565b60405190151581526020015b60405180910390f35b61014961016c366004610e98565b61033c565b610179601281565b60405160ff9091168152602001610155565b61019460025481565b604051908152602001610155565b6101496101b0366004610ee7565b610381565b6101496101c3366004610f44565b6103d3565b6101946101d6366004610f6c565b6001600160a01b03165f9081526005602052604090205490565b6101946101fe366004610f6c565b61041e565b61020b61049a565b005b61020b6104ad565b610149610223366004610f44565b6104f6565b5f546001600160a01b03165b6040516001600160a01b039091168152602001610155565b61020b61025a366004610f85565b610529565b6102676105f4565b6040516101559190610fca565b610149610282366004610ff0565b610680565b6101496102953660046110b5565b6106da565b61020b6102a83660046110ef565b6106f5565b6102676107b7565b6101946102c336600461112e565b6107c4565b6001546001600160a01b0316610234565b61020b6102e7366004610f6c565b6107f3565b5f610331846101c385858080601f0160208091040260200160405190810160405280939291908181526020018383808284375f92019190915250339250610863915050565b506001949350505050565b5f6103318461022385858080601f0160208091040260200160405190810160405280939291908181526020018383808284375f92019190915250339250610863915050565b5f6103c7858561029586868080601f0160208091040260200160405190810160405280939291908181526020018383808284375f92019190915250339250610863915050565b50600195945050505050565b5f6103df3384846108d7565b6040516001600160a01b0384169033907ff37f546c25e850257cc0c94f92bec94a17e2f0e884ddda268a25d8144b70eb6a905f90a35060015b92915050565b5f610427610921565b6001600160a01b0382165f90815260056020526040902054610449813061094d565b5f61046a8263b20dea5a60e01b60405180602001604052805f8152506109b9565b5f81815260076020526040902080546001600160a01b0319166001600160a01b038716179055925050505b919050565b6104a2610921565b6104ab5f610a4b565b565b60015433906001600160a01b031681146104ea5760405163118cdaa760e01b81526001600160a01b03821660048201526024015b60405180910390fd5b6104f381610a4b565b50565b335f9081526005602052604081205481906105119084610a64565b905061051f33858584610ab3565b5060019392505050565b335f9081526005602052604090205461054a9061054583610bb8565b610c27565b335f908152600560205260409020819055610565903061094d565b335f8181526005602052604090205461057d9161094d565b335f908152600560205260409020546105a6906105a15f546001600160a01b031690565b61094d565b8060025f8282546105b7919061115f565b909155505060405181815233907f0f6798a560793a54c3bcfe86a93cde1e73087d944c0ea20544137d41213968859060200160405180910390a250565b600480546106019061117e565b80601f016020809104026020016040519081016040528092919081815260200182805461062d9061117e565b80156106785780601f1061064f57610100808354040283529160200191610678565b820191905f5260205f20905b81548152906001019060200180831161065b57829003601f168201915b505050505081565b5f8381526007602090815260408083205490518581526001600160a01b039091169182917f7f01eae6b53977178b7ddf24836b067fb20d33f6af6344b18924e21a1bb63962910160405180910390a2506001949350505050565b5f5f6106e7853385610c44565b905061033185858584610ab3565b61075c60055f336001600160a01b03166001600160a01b031681526020019081526020015f205461054584848080601f0160208091040260200160405190810160405280939291908181526020018383808284375f92019190915250339250610863915050565b335f908152600560205260409020819055610777903061094d565b335f9081526005602052604090205461079b906105a15f546001600160a01b031690565b335f818152600560205260409020546107b39161094d565b5050565b600380546106019061117e565b6001600160a01b038083165f9081526006602090815260408083209385168352929052908120545b9392505050565b6107fb610921565b600180546001600160a01b0383166001600160a01b0319909116811790915561082b5f546001600160a01b031690565b6001600160a01b03167f38d16b8cac22d99fc7c124b9cd0de2d3fa1faef420bfe791d8c362d765e2270060405160405180910390a350565b60405163ba76f2a960e01b81525f905f51602061122e5f395f51905f529063ba76f2a99061089790869086906004016111b6565b6020604051808303815f875af11580156108b3573d5f5f3e3d5ffd5b505050506040513d601f19601f820116820180604052508101906107ec91906111df565b6001600160a01b038084165f908152600660209081526040808320938616835292905220819055610908813061094d565b610912818461094d565b61091c818361094d565b505050565b5f546001600160a01b031633146104ab5760405163118cdaa760e01b81523360048201526024016104e1565b604051635ca4b5b160e11b8152600481018390526001600160a01b03821660248201525f51602061122e5f395f51905f529063b9496b62906044015f604051808303815f87803b15801561099f575f5ffd5b505af11580156109b1573d5f5f3e3d5ffd5b505050505050565b5f5f51602061122e5f395f51905f5263f3ff21f2846109da611c204261115f565b6109e388610cdd565b866040518563ffffffff1660e01b8152600401610a0394939291906111f6565b6020604051808303815f875af1158015610a1f573d5f5f3e3d5ffd5b505050506040513d601f19601f82011682018060405250810190610a4391906111df565b949350505050565b600180546001600160a01b03191690556104f381610ce7565b5f5f51602061122e5f395f51905f52638ff94ab4610a8185610cdd565b610a8a85610cdd565b6040516001600160e01b031960e085901b16815260048101929092526024820152604401610897565b5f610ac78284610ac25f610bb8565b610d36565b6001600160a01b0385165f9081526005602052604081205491925090610aed9083610c27565b6001600160a01b0386165f9081526005602052604090208190559050610b13813061094d565b610b1d818661094d565b6001600160a01b0386165f90815260056020526040812054610b3f9084610d96565b6001600160a01b0388165f9081526005602052604090208190559050610b65813061094d565b610b6f818861094d565b856001600160a01b0316876001600160a01b03167f4853ae1b4d437c4255ac16cd3ceda3465975023f27cb141584cd9d44440fed8260405160405180910390a350505050505050565b6040516333f3d1bf60e11b8152600481018290525f905f51602061122e5f395f51905f52906367e7a37e906024015b6020604051808303815f875af1158015610c03573d5f5f3e3d5ffd5b505050506040513d601f19601f8201168201806040525081019061041891906111df565b5f5f51602061122e5f395f51905f5263f4f9966b610a8185610cdd565b6001600160a01b038084165f9081526006602090815260408083209386168352929052908120545f610c768285610a64565b6001600160a01b0387165f9081526005602052604081205491925090610c9c9086610a64565b90505f610cb28284610cad5f610db3565b610de7565b9050610cd28888610ccd84610cc7898c610d96565b89610d36565b6108d7565b979650505050505050565b5f61041882610e16565b5f80546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b5f5f51602061122e5f395f51905f5263d9d017f6610d5386610e29565b610d5c86610cdd565b610d6586610cdd565b6040516001600160e01b031960e086901b168152600481019390935260248301919091526044820152606401610a03565b5f5f51602061122e5f395f51905f5263de195e2d610a8185610cdd565b604051635d7d539760e01b815281151560048201525f905f51602061122e5f395f51905f5290635d7d539790602401610be7565b5f5f51602061122e5f395f51905f5263d9d017f6610e0486610e29565b610e0d86610e29565b610d6586610e29565b5f81610e25576104185f610bb8565b5090565b5f610418825f81610e25576104185f610db3565b80356001600160a01b0381168114610495575f5ffd5b5f5f83601f840112610e63575f5ffd5b50813567ffffffffffffffff811115610e7a575f5ffd5b602083019150836020828501011115610e91575f5ffd5b9250929050565b5f5f5f60408486031215610eaa575f5ffd5b610eb384610e3d565b9250602084013567ffffffffffffffff811115610ece575f5ffd5b610eda86828701610e53565b9497909650939450505050565b5f5f5f5f60608587031215610efa575f5ffd5b610f0385610e3d565b9350610f1160208601610e3d565b9250604085013567ffffffffffffffff811115610f2c575f5ffd5b610f3887828801610e53565b95989497509550505050565b5f5f60408385031215610f55575f5ffd5b610f5e83610e3d565b946020939093013593505050565b5f60208284031215610f7c575f5ffd5b6107ec82610e3d565b5f60208284031215610f95575f5ffd5b5035919050565b5f81518084528060208401602086015e5f602082860101526020601f19601f83011685010191505092915050565b602081525f6107ec6020830184610f9c565b634e487b7160e01b5f52604160045260245ffd5b5f5f5f60608486031215611002575f5ffd5b8335925060208401359150604084013567ffffffffffffffff811115611026575f5ffd5b8401601f81018613611036575f5ffd5b803567ffffffffffffffff81111561105057611050610fdc565b604051601f8201601f19908116603f0116810167ffffffffffffffff8111828210171561107f5761107f610fdc565b604052818152828201602001881015611096575f5ffd5b816020840160208301375f602083830101528093505050509250925092565b5f5f5f606084860312156110c7575f5ffd5b6110d084610e3d565b92506110de60208501610e3d565b929592945050506040919091013590565b5f5f60208385031215611100575f5ffd5b823567ffffffffffffffff811115611116575f5ffd5b61112285828601610e53565b90969095509350505050565b5f5f6040838503121561113f575f5ffd5b61114883610e3d565b915061115660208401610e3d565b90509250929050565b8082018082111561041857634e487b7160e01b5f52601160045260245ffd5b600181811c9082168061119257607f821691505b6020821081036111b057634e487b7160e01b5f52602260045260245ffd5b50919050565b604081525f6111c86040830185610f9c565b905060018060a01b03831660208301529392505050565b5f602082840312156111ef575f5ffd5b5051919050565b63ffffffff60e01b85168152836020820152826040820152608060608201525f6112236080830184610f9c565b969550505050505056fe00000000000000000000000063d8135af4d393b1db43b649010c8d3ee19fc9fda26469706673582212201434f18a8e438cb8713cf56202a156665d05570904153e6eb1b4b9dcfd8a6c8064736f6c634300081c0033";
    export default { abi, bytecode };