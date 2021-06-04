**Usage**: `new Address(data, network, type)`  
**Description**: Instantiate an address from an address String or Buffer, a public key or script hash Buffer.

**Parameters**:

| parameters  | type           | required     | Description                                                                                                 |
| ----------- | -------------- | ------------ | ----------------------------------------------------------------------------------------------------------- |
| **data**    | String/Buffer  | yes          | The encoded data in various format (PublicKey, PublicKeyHash, ScriptHash, Script, Buffer, Object or String) |
| **network** | Network/String | no[=livenet] | The network as a Network instance or a string                                                               |
| **type**    | string         | no           | The type of address (script or pubkey)                                                                      |

Returns : A new valid and frozen instance of an Address

## Address.createMultisig(publicKeys, threshold, network)

**Description**: Creates a P2SH address from a set of public keys and a threshold.

The addresses will be sorted lexicographically.  
To create an address from unsorted public keys, use the Script#buildMultisigOut

**Parameters**:

| parameters     | type           | required     | Description                                          |
| -------------- | -------------- | ------------ | ---------------------------------------------------- |
| **publicKeys** | Array          | yes          | a set of public keys to create an address            |
| **threshold**  | number         | yes          | the number of signatures needed to release the funds |
| **network**    | Network/String | no[=livenet] | The network as a Network instance or a string        |

```js
const public1 =
  '02da5798ed0c055e31339eb9b5cef0d3c0ccdec84a62e2e255eb5c006d4f3e7f5b';
const public2 =
  '0272073bf0287c4469a2a011567361d42529cd1a72ab0d86aa104ecc89342ffeb0';
const public3 =
  '02738a516a78355db138e8119e58934864ce222c553a5407cf92b9c1527e03c1a2';
const publics = [public1, public2, public3];
const address = Address.createMultisig(publics, 2, Networks.livenet);
```

Returns :{Address} A new valid and frozen instance of an Address

## Address.fromPublicKey(data, network)

**Description**: Instantiate an address from a PublicKey instance.

**Parameters**:

| parameter   | type           | required     | Description                                   |
| ----------- | -------------- | ------------ | --------------------------------------------- |
| **data**    | PublicKey      | yes          |                                               |
| **network** | Network/String | no[=livenet] | The network as a Network instance or a string |

Returns : {Address} A new valid and frozen instance of an Address

```js
const pubkey = new PublicKey(
  '0285e9737a74c30a873f74df05124f2aa6f53042c2fc0a130d6cbd7d16b944b004'
);
const address = Address.fromPublicKey(pubkey);
```

## Address.fromPublicKeyHash(data, network)

**Description**: Instantiate an address from a PublicKey hash.

**Parameters**:

| parameter   | type           | required     | Description                                   |
| ----------- | -------------- | ------------ | --------------------------------------------- |
| **data**    | Buffer         | yes          | An instance of buffer of the hash             |
| **network** | Network/String | no[=livenet] | The network as a Network instance or a string |

Returns : {Address} A new valid and frozen instance of an Address

```js
const pubkeyhash = Buffer.from(
  '3c3fa3d4adcaf8f52d5b1843975e122548269937',
  'hex'
);
const address = Address.fromPublicKeyHash(pubkeyhash, 'livenet');
```

## Address.fromScriptHash(hash, network)

**Description**: Instantiate an address from a ripemd160 script hash

**Parameters**:

| parameter   | type           | required     | Description                                   |
| ----------- | -------------- | ------------ | --------------------------------------------- |
| **data**    | Buffer         | yes          | An instance of buffer of the hash             |
| **network** | Network/String | no[=livenet] | The network as a Network instance or a string |

Returns : {Address} A new valid and frozen instance of an Address

```js
const scriptHash = Buffer.from(
  '19a7d869032368fd1f1e26e5e73a4ad0e474960e',
  'hex'
);
const address = Address.fromScriptHash(scriptHash, 'livenet');
```

## Address.fromScript(hash, network)

**Description**: Extract address from a Script. The script must be of one of the following types: p2pkh input, p2pkh output, p2sh input or p2sh output.
This will analyze the script and extract address information from it.
If you want to transform any script to a p2sh Address paying to that script's hash instead, use Address.payingTo()

**Parameters**:

| parameter   | type           | required     | Description                                   |
| ----------- | -------------- | ------------ | --------------------------------------------- |
| **script**  | Script         | yes          | An instance of Script                         |
| **network** | Network/String | no[=livenet] | The network as a Network instance or a string |

Returns : {Address} A new valid and frozen instance of an Address

```js
const script = new Script(
  'OP_DUP OP_HASH160 20 0xc8e11b0eb0d2ad5362d894f048908341fa61b6e1 OP_EQUALVERIFY OP_CHECKSIG'
);
const address = Address.fromScript(script);
```

## Address.fromObject(json)

**Description**: Instantiate an address from an Object

**Parameters**:

| parameter | type          | required | Description                                                |
| --------- | ------------- | -------- | ---------------------------------------------------------- |
| **json**  | String/Object | yes      | An JSON string or Object with keys: hash, network and type |

Returns : {Address} A new valid and frozen instance of an Address

## Address.payingTo(script, network)

**Description**: Builds a p2sh address paying to script. This will hash the script and use that to create the address.

**Parameters**:

| parameter   | type           | required     | Description                                   |
| ----------- | -------------- | ------------ | --------------------------------------------- |
| **script**  | Script         | yes          | An instance of Script                         |
| **network** | Network/String | no[=livenet] | The network as a Network instance or a string |

Returns : {Address} A new valid and frozen instance of an Address

## Address.isValid(data, network, type)

**Description**: Will return a boolean if an address is valid

**Parameters**:

| parameter   | type           | required     | Description                                   |
| ----------- | -------------- | ------------ | --------------------------------------------- |
| **data**    | Script         | yes          | The encoded data                              |
| **network** | Network/String | no[=livenet] | The network as a Network instance or a string |
| **type**    | String         | no           | The type of address: 'script' or 'pubkey'     |

Returns : {Boolean|String} if valid a boolean, else the corresponding error message

## Address.getValidationError(data, network, type)

**Description**: Will return a validation error if exists

**Parameters**:

| parameter   | type           | required     | Description                                   |
| ----------- | -------------- | ------------ | --------------------------------------------- |
| **data**    | Script         | yes          | The encoded data                              |
| **network** | Network/String | no[=livenet] | The network as a Network instance or a string |
| **type**    | String         | no           | The type of address: 'script' or 'pubkey'     |

**Returns**: {null|Error} An error if exists

## .isPayToPublicKeyHash()

**Description**: Returns true if an address is of pay to public key hash type

**Parameters**: None.

Returns : {boolean} - if it's a pay to public key hash type address

## .isPayToScriptHash()

**Description**: Returns true if an address is of pay to script hash type

**Parameters**: None.

Returns : {boolean} - if it's a pay to script hash type address

## .toBuffer()

**Description**: Will return a buffer representation of the address

**Parameters**: None.

**Returns**: {Buffer} Dash address buffer

## .toString()

**Description**:Will return a string representation of the address

**Parameters**: None.

**Returns**: {string} Dash address

```js
const address = new Address(...);
address.toString() // XgBQcYbKff4q7cEs7AaxoPN2CAiBbFc2JT
```

## .toJSON() / .toObject()

**Description**: Will return an object representation of the address

**Parameters**: None.

**Returns**: {Object} A plain object with the address information

## .inspect()

**Description**: Will return a string formatted for the console

**Parameters**: None.

**Returns**: {string} Dash address

```js
const address = new Address(...);
address.toInspect() // <Address: XgBQcYbKff4q7cEs7AaxoPN2CAiBbFc2JT, type: pubkeyhash, network: livenet>
```
