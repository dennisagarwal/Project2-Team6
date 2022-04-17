import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PostNFTServiceService } from 'src/app/services/post-nftservice.service';
import { ethers } from 'ethers';
import { lastValueFrom } from 'rxjs';
import { User } from 'src/app/models/user-model';
import { NFT } from 'src/app/models/nft';
import { HttpClient } from '@angular/common/http';
import { UserImagesComponent } from '../user-images/user-images.component';

// TODO find a workaround for this direct paste of abi, bytecode info, import as JSON?
const abi = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'approved',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'approved',
        type: 'bool',
      },
    ],
    name: 'ApprovalForAll',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'getApproved',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
    ],
    name: 'isApprovedForAll',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'string',
        name: 'tokenURI',
        type: 'string',
      },
    ],
    name: 'mintNFT',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'ownerOf',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: '_data',
        type: 'bytes',
      },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'approved',
        type: 'bool',
      },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: 'interfaceId',
        type: 'bytes4',
      },
    ],
    name: 'supportsInterface',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'tokenURI',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

const bytecode =
  '60806040523480156200001157600080fd5b506040518060400160405280600581526020017f4d794e46540000000000000000000000000000000000000000000000000000008152506040518060400160405280600381526020017f4e46540000000000000000000000000000000000000000000000000000000000815250816000908051906020019062000096929190620001a6565b508060019080519060200190620000af929190620001a6565b505050620000d2620000c6620000d860201b60201c565b620000e060201b60201c565b620002bb565b600033905090565b6000600760009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905081600760006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b828054620001b49062000256565b90600052602060002090601f016020900481019282620001d8576000855562000224565b82601f10620001f357805160ff191683800117855562000224565b8280016001018555821562000224579182015b828111156200022357825182559160200191906001019062000206565b5b50905062000233919062000237565b5090565b5b808211156200025257600081600090555060010162000238565b5090565b600060028204905060018216806200026f57607f821691505b602082108114156200028657620002856200028c565b5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b612fe980620002cb6000396000f3fe608060405234801561001057600080fd5b506004361061010b5760003560e01c8063715018a6116100a2578063b88d4fde11610071578063b88d4fde146102a4578063c87b56dd146102c0578063e985e9c5146102f0578063eacabe1414610320578063f2fde38b146103505761010b565b8063715018a6146102425780638da5cb5b1461024c57806395d89b411461026a578063a22cb465146102885761010b565b806323b872dd116100de57806323b872dd146101aa57806342842e0e146101c65780636352211e146101e257806370a08231146102125761010b565b806301ffc9a71461011057806306fdde0314610140578063081812fc1461015e578063095ea7b31461018e575b600080fd5b61012a60048036038101906101259190611f98565b61036c565b60405161013791906123e4565b60405180910390f35b61014861044e565b60405161015591906123ff565b60405180910390f35b61017860048036038101906101739190611fea565b6104e0565b604051610185919061237d565b60405180910390f35b6101a860048036038101906101a39190611f5c565b610565565b005b6101c460048036038101906101bf9190611e02565b61067d565b005b6101e060048036038101906101db9190611e02565b6106dd565b005b6101fc60048036038101906101f79190611fea565b6106fd565b604051610209919061237d565b60405180910390f35b61022c60048036038101906102279190611d9d565b6107af565b6040516102399190612661565b60405180910390f35b61024a610867565b005b6102546108ef565b604051610261919061237d565b60405180910390f35b610272610919565b60405161027f91906123ff565b60405180910390f35b6102a2600480360381019061029d9190611ecc565b6109ab565b005b6102be60048036038101906102b99190611e51565b6109c1565b005b6102da60048036038101906102d59190611fea565b610a23565b6040516102e791906123ff565b60405180910390f35b61030a60048036038101906103059190611dc6565b610b75565b60405161031791906123e4565b60405180910390f35b61033a60048036038101906103359190611f08565b610c09565b6040516103479190612661565b60405180910390f35b61036a60048036038101906103659190611d9d565b610cbd565b005b60007f80ac58cd000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916148061043757507f5b5e139f000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916145b80610447575061044682610db5565b5b9050919050565b60606000805461045d906128b7565b80601f0160208091040260200160405190810160405280929190818152602001828054610489906128b7565b80156104d65780601f106104ab576101008083540402835291602001916104d6565b820191906000526020600020905b8154815290600101906020018083116104b957829003601f168201915b5050505050905090565b60006104eb82610e1f565b61052a576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610521906125c1565b60405180910390fd5b6004600083815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050919050565b6000610570826106fd565b90508073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1614156105e1576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016105d890612621565b60405180910390fd5b8073ffffffffffffffffffffffffffffffffffffffff16610600610e8b565b73ffffffffffffffffffffffffffffffffffffffff16148061062f575061062e81610629610e8b565b610b75565b5b61066e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161066590612501565b60405180910390fd5b6106788383610e93565b505050565b61068e610688610e8b565b82610f4c565b6106cd576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016106c490612641565b60405180910390fd5b6106d883838361102a565b505050565b6106f8838383604051806020016040528060008152506109c1565b505050565b6000806002600084815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614156107a6576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161079d90612541565b60405180910390fd5b80915050919050565b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415610820576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161081790612521565b60405180910390fd5b600360008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b61086f610e8b565b73ffffffffffffffffffffffffffffffffffffffff1661088d6108ef565b73ffffffffffffffffffffffffffffffffffffffff16146108e3576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016108da906125e1565b60405180910390fd5b6108ed6000611291565b565b6000600760009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b606060018054610928906128b7565b80601f0160208091040260200160405190810160405280929190818152602001828054610954906128b7565b80156109a15780601f10610976576101008083540402835291602001916109a1565b820191906000526020600020905b81548152906001019060200180831161098457829003601f168201915b5050505050905090565b6109bd6109b6610e8b565b8383611357565b5050565b6109d26109cc610e8b565b83610f4c565b610a11576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a0890612641565b60405180910390fd5b610a1d848484846114c4565b50505050565b6060610a2e82610e1f565b610a6d576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a64906125a1565b60405180910390fd5b6000600660008481526020019081526020016000208054610a8d906128b7565b80601f0160208091040260200160405190810160405280929190818152602001828054610ab9906128b7565b8015610b065780601f10610adb57610100808354040283529160200191610b06565b820191906000526020600020905b815481529060010190602001808311610ae957829003601f168201915b505050505090506000610b17611520565b9050600081511415610b2d578192505050610b70565b600082511115610b62578082604051602001610b4a929190612359565b60405160208183030381529060405292505050610b70565b610b6b84611537565b925050505b919050565b6000600560008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b6000610c13610e8b565b73ffffffffffffffffffffffffffffffffffffffff16610c316108ef565b73ffffffffffffffffffffffffffffffffffffffff1614610c87576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c7e906125e1565b60405180910390fd5b610c9160086115de565b6000610c9d60086115f4565b9050610ca98482611602565b610cb381846117dc565b8091505092915050565b610cc5610e8b565b73ffffffffffffffffffffffffffffffffffffffff16610ce36108ef565b73ffffffffffffffffffffffffffffffffffffffff1614610d39576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d30906125e1565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161415610da9576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610da090612441565b60405180910390fd5b610db281611291565b50565b60007f01ffc9a7000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916149050919050565b60008073ffffffffffffffffffffffffffffffffffffffff166002600084815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614159050919050565b600033905090565b816004600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550808273ffffffffffffffffffffffffffffffffffffffff16610f06836106fd565b73ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45050565b6000610f5782610e1f565b610f96576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610f8d906124e1565b60405180910390fd5b6000610fa1836106fd565b90508073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff16148061101057508373ffffffffffffffffffffffffffffffffffffffff16610ff8846104e0565b73ffffffffffffffffffffffffffffffffffffffff16145b8061102157506110208185610b75565b5b91505092915050565b8273ffffffffffffffffffffffffffffffffffffffff1661104a826106fd565b73ffffffffffffffffffffffffffffffffffffffff16146110a0576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161109790612461565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415611110576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611107906124a1565b60405180910390fd5b61111b838383611850565b611126600082610e93565b6001600360008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461117691906127cd565b925050819055506001600360008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546111cd9190612746565b92505081905550816002600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550808273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60405160405180910390a461128c838383611855565b505050565b6000600760009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905081600760006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b8173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1614156113c6576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016113bd906124c1565b60405180910390fd5b80600560008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31836040516114b791906123e4565b60405180910390a3505050565b6114cf84848461102a565b6114db8484848461185a565b61151a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161151190612421565b60405180910390fd5b50505050565b606060405180602001604052806000815250905090565b606061154282610e1f565b611581576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161157890612601565b60405180910390fd5b600061158b611520565b905060008151116115ab57604051806020016040528060008152506115d6565b806115b5846119f1565b6040516020016115c6929190612359565b6040516020818303038152906040525b915050919050565b6001816000016000828254019250508190555050565b600081600001549050919050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415611672576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161166990612581565b60405180910390fd5b61167b81610e1f565b156116bb576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016116b290612481565b60405180910390fd5b6116c760008383611850565b6001600360008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546117179190612746565b92505081905550816002600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550808273ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60405160405180910390a46117d860008383611855565b5050565b6117e582610e1f565b611824576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161181b90612561565b60405180910390fd5b8060066000848152602001908152602001600020908051906020019061184b929190611bc1565b505050565b505050565b505050565b600061187b8473ffffffffffffffffffffffffffffffffffffffff16611b9e565b156119e4578373ffffffffffffffffffffffffffffffffffffffff1663150b7a026118a4610e8b565b8786866040518563ffffffff1660e01b81526004016118c69493929190612398565b602060405180830381600087803b1580156118e057600080fd5b505af192505050801561191157506040513d601f19601f8201168201806040525081019061190e9190611fc1565b60015b611994573d8060008114611941576040519150601f19603f3d011682016040523d82523d6000602084013e611946565b606091505b5060008151141561198c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161198390612421565b60405180910390fd5b805181602001fd5b63150b7a0260e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916149150506119e9565b600190505b949350505050565b60606000821415611a39576040518060400160405280600181526020017f30000000000000000000000000000000000000000000000000000000000000008152509050611b99565b600082905060005b60008214611a6b578080611a549061291a565b915050600a82611a64919061279c565b9150611a41565b60008167ffffffffffffffff811115611aad577f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6040519080825280601f01601f191660200182016040528015611adf5781602001600182028036833780820191505090505b5090505b60008514611b9257600182611af891906127cd565b9150600a85611b079190612963565b6030611b139190612746565b60f81b818381518110611b4f577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350600a85611b8b919061279c565b9450611ae3565b8093505050505b919050565b6000808273ffffffffffffffffffffffffffffffffffffffff163b119050919050565b828054611bcd906128b7565b90600052602060002090601f016020900481019282611bef5760008555611c36565b82601f10611c0857805160ff1916838001178555611c36565b82800160010185558215611c36579182015b82811115611c35578251825591602001919060010190611c1a565b5b509050611c439190611c47565b5090565b5b80821115611c60576000816000905550600101611c48565b5090565b6000611c77611c72846126a1565b61267c565b905082815260208101848484011115611c8f57600080fd5b611c9a848285612875565b509392505050565b6000611cb5611cb0846126d2565b61267c565b905082815260208101848484011115611ccd57600080fd5b611cd8848285612875565b509392505050565b600081359050611cef81612f57565b92915050565b600081359050611d0481612f6e565b92915050565b600081359050611d1981612f85565b92915050565b600081519050611d2e81612f85565b92915050565b600082601f830112611d4557600080fd5b8135611d55848260208601611c64565b91505092915050565b600082601f830112611d6f57600080fd5b8135611d7f848260208601611ca2565b91505092915050565b600081359050611d9781612f9c565b92915050565b600060208284031215611daf57600080fd5b6000611dbd84828501611ce0565b91505092915050565b60008060408385031215611dd957600080fd5b6000611de785828601611ce0565b9250506020611df885828601611ce0565b9150509250929050565b600080600060608486031215611e1757600080fd5b6000611e2586828701611ce0565b9350506020611e3686828701611ce0565b9250506040611e4786828701611d88565b9150509250925092565b60008060008060808587031215611e6757600080fd5b6000611e7587828801611ce0565b9450506020611e8687828801611ce0565b9350506040611e9787828801611d88565b925050606085013567ffffffffffffffff811115611eb457600080fd5b611ec087828801611d34565b91505092959194509250565b60008060408385031215611edf57600080fd5b6000611eed85828601611ce0565b9250506020611efe85828601611cf5565b9150509250929050565b60008060408385031215611f1b57600080fd5b6000611f2985828601611ce0565b925050602083013567ffffffffffffffff811115611f4657600080fd5b611f5285828601611d5e565b9150509250929050565b60008060408385031215611f6f57600080fd5b6000611f7d85828601611ce0565b9250506020611f8e85828601611d88565b9150509250929050565b600060208284031215611faa57600080fd5b6000611fb884828501611d0a565b91505092915050565b600060208284031215611fd357600080fd5b6000611fe184828501611d1f565b91505092915050565b600060208284031215611ffc57600080fd5b600061200a84828501611d88565b91505092915050565b61201c81612801565b82525050565b61202b81612813565b82525050565b600061203c82612703565b6120468185612719565b9350612056818560208601612884565b61205f81612a50565b840191505092915050565b60006120758261270e565b61207f818561272a565b935061208f818560208601612884565b61209881612a50565b840191505092915050565b60006120ae8261270e565b6120b8818561273b565b93506120c8818560208601612884565b80840191505092915050565b60006120e160328361272a565b91506120ec82612a61565b604082019050919050565b600061210460268361272a565b915061210f82612ab0565b604082019050919050565b600061212760258361272a565b915061213282612aff565b604082019050919050565b600061214a601c8361272a565b915061215582612b4e565b602082019050919050565b600061216d60248361272a565b915061217882612b77565b604082019050919050565b600061219060198361272a565b915061219b82612bc6565b602082019050919050565b60006121b3602c8361272a565b91506121be82612bef565b604082019050919050565b60006121d660388361272a565b91506121e182612c3e565b604082019050919050565b60006121f9602a8361272a565b915061220482612c8d565b604082019050919050565b600061221c60298361272a565b915061222782612cdc565b604082019050919050565b600061223f602e8361272a565b915061224a82612d2b565b604082019050919050565b600061226260208361272a565b915061226d82612d7a565b602082019050919050565b600061228560318361272a565b915061229082612da3565b604082019050919050565b60006122a8602c8361272a565b91506122b382612df2565b604082019050919050565b60006122cb60208361272a565b91506122d682612e41565b602082019050919050565b60006122ee602f8361272a565b91506122f982612e6a565b604082019050919050565b600061231160218361272a565b915061231c82612eb9565b604082019050919050565b600061233460318361272a565b915061233f82612f08565b604082019050919050565b6123538161286b565b82525050565b600061236582856120a3565b915061237182846120a3565b91508190509392505050565b60006020820190506123926000830184612013565b92915050565b60006080820190506123ad6000830187612013565b6123ba6020830186612013565b6123c7604083018561234a565b81810360608301526123d98184612031565b905095945050505050565b60006020820190506123f96000830184612022565b92915050565b60006020820190508181036000830152612419818461206a565b905092915050565b6000602082019050818103600083015261243a816120d4565b9050919050565b6000602082019050818103600083015261245a816120f7565b9050919050565b6000602082019050818103600083015261247a8161211a565b9050919050565b6000602082019050818103600083015261249a8161213d565b9050919050565b600060208201905081810360008301526124ba81612160565b9050919050565b600060208201905081810360008301526124da81612183565b9050919050565b600060208201905081810360008301526124fa816121a6565b9050919050565b6000602082019050818103600083015261251a816121c9565b9050919050565b6000602082019050818103600083015261253a816121ec565b9050919050565b6000602082019050818103600083015261255a8161220f565b9050919050565b6000602082019050818103600083015261257a81612232565b9050919050565b6000602082019050818103600083015261259a81612255565b9050919050565b600060208201905081810360008301526125ba81612278565b9050919050565b600060208201905081810360008301526125da8161229b565b9050919050565b600060208201905081810360008301526125fa816122be565b9050919050565b6000602082019050818103600083015261261a816122e1565b9050919050565b6000602082019050818103600083015261263a81612304565b9050919050565b6000602082019050818103600083015261265a81612327565b9050919050565b6000602082019050612676600083018461234a565b92915050565b6000612686612697565b905061269282826128e9565b919050565b6000604051905090565b600067ffffffffffffffff8211156126bc576126bb612a21565b5b6126c582612a50565b9050602081019050919050565b600067ffffffffffffffff8211156126ed576126ec612a21565b5b6126f682612a50565b9050602081019050919050565b600081519050919050565b600081519050919050565b600082825260208201905092915050565b600082825260208201905092915050565b600081905092915050565b60006127518261286b565b915061275c8361286b565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0382111561279157612790612994565b5b828201905092915050565b60006127a78261286b565b91506127b28361286b565b9250826127c2576127c16129c3565b5b828204905092915050565b60006127d88261286b565b91506127e38361286b565b9250828210156127f6576127f5612994565b5b828203905092915050565b600061280c8261284b565b9050919050565b60008115159050919050565b60007fffffffff0000000000000000000000000000000000000000000000000000000082169050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b82818337600083830152505050565b60005b838110156128a2578082015181840152602081019050612887565b838111156128b1576000848401525b50505050565b600060028204905060018216806128cf57607f821691505b602082108114156128e3576128e26129f2565b5b50919050565b6128f282612a50565b810181811067ffffffffffffffff8211171561291157612910612a21565b5b80604052505050565b60006129258261286b565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82141561295857612957612994565b5b600182019050919050565b600061296e8261286b565b91506129798361286b565b925082612989576129886129c3565b5b828206905092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6000601f19601f8301169050919050565b7f4552433732313a207472616e7366657220746f206e6f6e20455243373231526560008201527f63656976657220696d706c656d656e7465720000000000000000000000000000602082015250565b7f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160008201527f6464726573730000000000000000000000000000000000000000000000000000602082015250565b7f4552433732313a207472616e736665722066726f6d20696e636f72726563742060008201527f6f776e6572000000000000000000000000000000000000000000000000000000602082015250565b7f4552433732313a20746f6b656e20616c7265616479206d696e74656400000000600082015250565b7f4552433732313a207472616e7366657220746f20746865207a65726f2061646460008201527f7265737300000000000000000000000000000000000000000000000000000000602082015250565b7f4552433732313a20617070726f766520746f2063616c6c657200000000000000600082015250565b7f4552433732313a206f70657261746f7220717565727920666f72206e6f6e657860008201527f697374656e7420746f6b656e0000000000000000000000000000000000000000602082015250565b7f4552433732313a20617070726f76652063616c6c6572206973206e6f74206f7760008201527f6e6572206e6f7220617070726f76656420666f7220616c6c0000000000000000602082015250565b7f4552433732313a2062616c616e636520717565727920666f7220746865207a6560008201527f726f206164647265737300000000000000000000000000000000000000000000602082015250565b7f4552433732313a206f776e657220717565727920666f72206e6f6e657869737460008201527f656e7420746f6b656e0000000000000000000000000000000000000000000000602082015250565b7f45524337323155524953746f726167653a2055524920736574206f66206e6f6e60008201527f6578697374656e7420746f6b656e000000000000000000000000000000000000602082015250565b7f4552433732313a206d696e7420746f20746865207a65726f2061646472657373600082015250565b7f45524337323155524953746f726167653a2055524920717565727920666f722060008201527f6e6f6e6578697374656e7420746f6b656e000000000000000000000000000000602082015250565b7f4552433732313a20617070726f76656420717565727920666f72206e6f6e657860008201527f697374656e7420746f6b656e0000000000000000000000000000000000000000602082015250565b7f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572600082015250565b7f4552433732314d657461646174613a2055524920717565727920666f72206e6f60008201527f6e6578697374656e7420746f6b656e0000000000000000000000000000000000602082015250565b7f4552433732313a20617070726f76616c20746f2063757272656e74206f776e6560008201527f7200000000000000000000000000000000000000000000000000000000000000602082015250565b7f4552433732313a207472616e736665722063616c6c6572206973206e6f74206f60008201527f776e6572206e6f7220617070726f766564000000000000000000000000000000602082015250565b612f6081612801565b8114612f6b57600080fd5b50565b612f7781612813565b8114612f8257600080fd5b50565b612f8e8161281f565b8114612f9957600080fd5b50565b612fa58161286b565b8114612fb057600080fd5b5056fea264697066735822122078bf1315c8bf68e22bf6c4f7211fc2b41606169e43fea8060560df7b36a422df64736f6c63430008010033';

@Component({
  selector: 'app-mint-nft',
  templateUrl: './mint-nft.component.html',
  styleUrls: ['./mint-nft.component.css'],
})
export class MintNftComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private postNFTService: PostNFTServiceService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {}

  // TODO get authorID from jwt stored in localStorage instead of from form
  // Don't actually need the image from above, only the imageId should be passed along,
  async mintNFT(
    nftName: string,
    nftSymbol: string,
    tokenURI: string,
    imageId: number,
    userId: number
  ): Promise<NFT> {
    // converts observable to promise to use with async/await
    let user = await lastValueFrom(
      this.http.get<User>('http://localhost:9090/users/' + userId)
    );

    let wallet = await new ethers.Wallet(user.ethAddress);
    let factory = await new ethers.ContractFactory(abi, bytecode, wallet);
    let contract = await factory.deploy(nftName, nftSymbol);
    let receipt = await contract.deployTransaction.wait();
    let contract_rw = await new ethers.Contract(
      receipt.contractAddress,
      abi,
      wallet
    );

    return await {
      id: 0,
      name: nftName,
      symbol: nftSymbol,
      contractAddress: contract_rw.address,
      tokenUri: tokenURI,
      image: {
        id: imageId,
        author: {
          id: userId,
        },
      },
    };
  }

  onSubmit(nftName: string, nftSymbol: string) {
    // form nft from interface and send

    // use mintNFT to get a then-able (and deployed nft)
    // mintNft(...).then(nft => { this.postNFTService.authenticateNFT(nft); })
    this.mintNFT(
      nftName,
      nftSymbol,
      this.data.tokenURI,
      this.data.imageId,
      this.data.userId
    ).then((nft) => {
      this.postNFTService.authenticateNFT(nft);
    });
  }
}
