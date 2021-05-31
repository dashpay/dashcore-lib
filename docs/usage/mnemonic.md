**Usage**: `new Mnemonic(data, wordlist)`  
**Description**: Instantiate an instance of a BIP39 Mnemonic.  
A Mnemonic can be used to generate a seed using an optional passphrase, for later generate a HDPrivateKey.

| parameters   | type                 | required | Description                             |
| ------------ | -------------------- | -------- | --------------------------------------- |
| **data**     | Object/Buffer/String | yes      | A Buffer, JSON string, or Object        |
| **wordlist** | String[]             | no       | the wordlist to generate mnemonics from |

**Returns**: {HDPublicKey} A new instance of a HDPublicKey

## Mnemonic.isValid(mnemonic, wordlist)

**Description**: Verifies that a given serialized public key in base58 with checksum format is valid.

**Parameters**:

| parameter    | type          | required | Description               |
| ------------ | ------------- | -------- | ------------------------- |
| **data**     | String/Buffer | yes      | the serialized public key |
| **wordlist** | String[]      | no       |                           |

**Returns**: {Boolean}

## Mnemonic.fromSeed(seed, wordlist)

**Description**: Will generate a Mnemonic object based on a seed.

**Parameters**:

| parameter    | type     | required | Description |
| ------------ | -------- | -------- | ----------- |
| **seed**     | Buffer   | yes      |             |
| **wordlist** | String[] | no       |             |

Returns : {Mnemonic}

## .toHDPrivateKey()

**Description**: Generates a HD Private Key from a Mnemonic.  
Optionally receive a passphrase and dash network.

**Parameters**:

| parameter      | type           | required     | Description                                   |
| -------------- | -------------- | ------------ | --------------------------------------------- |
| **passphrase** | String         | no           | a password for the seed                       |
| **network**    | Network/String | no[=livenet] | The network as a Network instance or a string |

**Returns**: {[HDPrivateKey](/usage/Mnemonic)}

## .toString()

**Description**:Will return a string representation of the mnemonic

**Parameters**: None.

**Returns**: {string} A hex encoded string of the mnemonic

## .toSeed(passphrase)

**Description**: ill generate a seed based on the mnemonic and optional passphrase.

**Parameters**:

| parameter      | type   | required | Description             |
| -------------- | ------ | -------- | ----------------------- |
| **passphrase** | String | no       | a password for the seed |

**Returns**: {Buffer} Seed as a Buffer

## .inspect()

**Description**: Will return a string formatted for the console

**Parameters**: None.

**Returns**: {string} Console representation of this mnemonic.

```js
const mnemonic = new Mnemonic(...);
mnemonic.toInspect() // <Mnemonic: pilots foster august tomorrow kit daughter unknown awesome model town village master>
```
