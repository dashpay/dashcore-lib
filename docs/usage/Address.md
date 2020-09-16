**Usage**: `new Address(data, network, type)`  
**Description**: Instantiate an address from an address String or Buffer, a public key or script hash Buffer.

Parameters: 

| parameters                                | type            | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **data**                                  | String|Buffer   | yes                | The encoded data in various format (PublicKey, PublicKeyHash, ScriptHash, Script, Buffer, Object or String)                                                                                                                                     |
| **network**                               | Network|String  | no[=livenet]       | The network as a Network instance or a string                                                              |
| **type**                                  | string          | no                 | The type of address (script or pubkey) |

Returns : A new valid and frozen instance of an Address

## Address.createMultisig(publicKeys, threshold, network)

**Description**: Creates a P2SH address from a set of public keys and a threshold.  

The addresses will be sorted lexicographically.   
To create an address from unsorted public keys, use the Script#buildMultisigOut

Parameters: 

| parameters                                | type            | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **publicKeys**                            | Array           | yes                | a set of public keys to create an address                                                                                                                                     |
| **threshold**                             | number          | yes                | the number of signatures needed to release the funds                                                             |
| **network**                               | Network|String  | no[=livenet]       | The network as a Network instance or a string                                                              |

```js
const public1 = '02da5798ed0c055e31339eb9b5cef0d3c0ccdec84a62e2e255eb5c006d4f3e7f5b';
const public2 = '0272073bf0287c4469a2a011567361d42529cd1a72ab0d86aa104ecc89342ffeb0';
const public3 = '02738a516a78355db138e8119e58934864ce222c553a5407cf92b9c1527e03c1a2';
const publics = [public1, public2, public3];
const address = Address.createMultisig(publics, 2, Networks.livenet);
```

Returns :{Address} A new valid and frozen instance of an Address

## Address.fromPublicKey(data, network)

**Description**: Instantiate an address from a PublicKey instance.

Parameters: 

| parameters                                | type            | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **data**                                  | PublicKey           | yes            |                                                                                                                                      |
| **network**                               | Network|String  | no[=livenet]       | The network as a Network instance or a string                                                              |

Returns : {Address} A new valid and frozen instance of an Address

```js
const pubkey = new PublicKey('0285e9737a74c30a873f74df05124f2aa6f53042c2fc0a130d6cbd7d16b944b004');
const address = Address.fromPublicKey(pubkey);
```

## Address.fromPublicKeyHash(data, network)

**Description**: Instantiate an address from a PublicKey instance.

Parameters: 

| parameters                                | type            | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **data**                                  | Buffer          | yes                | An instance of buffer of the hash                                                                                                                                    |
| **network**                               | Network|String  | no[=livenet]       | The network as a Network instance or a string                                                              |

Returns : {Address} A new valid and frozen instance of an Address

```js
const pubkeyhash = Buffer.from('3c3fa3d4adcaf8f52d5b1843975e122548269937', 'hex');
const address = Address.fromPublicKeyHash(pubkeyhash, 'livenet');
```

## .isPayToPublicKeyHash()

**Description**: Returns true if an address is of pay to public key hash type

Parameters: 

| parameters                                | type            | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |

Returns : {boolean}

## .isPayToScriptHash()

**Description**: Returns true if an address is of script hash type

| parameters                                | type            | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |

Returns : {boolean}


## .toString()
**Description**:Will return a string representation of the address

| parameters                                | type            | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |

returns: {string} Dash address

```js
const address = new Address(...);
address.toString() // XgBQcYbKff4q7cEs7AaxoPN2CAiBbFc2JT
```

## .toJSON()
## .toObject()
**Description**: Will return an object representation of the address

| parameters                                | type            | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |

returns: {Object} A plain object with the address information

## .toBuffer()
**Description**: Will return a buffer representation of the address

| parameters                                | type            | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |

returns: {Buffer} Dash address buffer

## .inspect()
**Description**: Will return a string formatted for the console

| parameters                                | type            | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |

returns: {string} Dash address

```js
const address = new Address(...);
address.toInspect() // <Address: XgBQcYbKff4q7cEs7AaxoPN2CAiBbFc2JT, type: pubkeyhash, network: livenet>
```


