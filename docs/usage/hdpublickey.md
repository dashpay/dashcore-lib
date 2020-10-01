**Usage**: `new HDPublicKey(data)`  
**Description**: Instantiate an instance of a hierarchically derived public key (read more about HD in the [BIP-32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki)).

| parameters                                | type                   | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|------------------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **data**                                  | Object/Buffer/String   | yes                | A Buffer, JSON string, or Object                            |

**Returns**: {HDPublicKey} A new instance of a HDPublicKey

## HDPublicKey.isValidPath(path)

**Description**: Verifies that a given path is valid.

**Parameters**:

| parameter                                 | type            | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **path**                                  | String/Number   | yes                | A path                                                                                                                             |

**Returns**: {Boolean}

## HDPublicKey.isValidSerialized(data, network)

**Description**: Verifies that a given serialized public key in base58 with checksum format is valid.

**Parameters**: 

| parameter                                 | type            | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **data**                                  | String/Buffer   | yes                | the serialized public key                                                                                                                             |
| **network**                               | String/Network  | no                 | optional, if present, checks that the network provided matches the network serialized.                                                                                                                             |

**Returns**: {Boolean}

## HDPublicKey.getSerializedError(data, network)
**Description**: Checks what's the error that causes the validation of a serialized public key in base58 with checksum to fail.

| parameter                                 | type            | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **data**                                  | String/Buffer   | yes                | the serialized public key                                                                                                                             |
| **network**                               | String/Network  | no                 | optional, if present, checks that the network provided matches the network serialized.                                                                                                                             |


## HDPublicKey.fromString(str)
**Description**: Instantiate a HDPublicKey from a string representation

**Parameters**:

| parameter                                | type            | required           | Description                                                                                                                                                                    |  
|------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **str**                                  | String          | yes                |                                                                                                             |

Returns : {HDPublicKey} An instance of HDPublicKey

## HDPublicKey.fromObject(obj)
**Description**: Instantiate a HDPublicKey from an object

**Parameters**:

| parameter                                | type            | required           | Description                                                                                                                                                                    |  
|------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **obj**                                  | Object          | yes                |                                                                                                             |

Returns : {HDPublicKey} An instance of HDPublicKey

## HDPublicKey.fromBuffer(buf)
**Description**: Instantiate a HDPublicKey from a buffer

**Parameters**:

| parameter                                | type            | required           | Description                                                                                                                                                                    |  
|------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **buf**                                  | Buffer          | yes                |                                                                                                             |

Returns : {HDPublicKey} An instance of HDPublicKey

## .deriveChild(arg)
**Description**: Get a derived child based on a string or number.   
If the first argument is a string, it's parsed as the full path of derivation. Valid values for this argument include "m" (which returns the same public key), "m/0/1/40/2'/1000", where the ' quote means a hardened derivation.  
If the first argument is a number, the child with that index will be derived. If the second argument is truthy, the hardened version will bederived. See the example usage for clarification.
     
**Parameters**: None.  

**Returns**: {string} A hex encoded string of the HD public key

```js 
const parent = new HDPublicKey('xprv...');
const child_0_1_2h = parent.deriveChild(0).deriveChild(1).deriveChild(2, true);
const copy_of_child_0_1_2h = parent.deriveChild("m/0/1/2'");
assert(child_0_1_2h.xpubkey === copy_of_child_0_1_2h);
```

## .toString()
**Description**:Will return a string representation of the HD public key

**Parameters**: None.  

**Returns**: {string} A hex encoded string of the HD public key

## .toObject()
**Description**: Will return an object representation of the HD public key

**Parameters**: None.  

**Returns**: {Object} A plain object with the HDPublicKey properties

## .toBuffer()
**Description**: Will return a buffer representation of the HD public key

**Parameters**: None.  

**Returns**: {Buffer} A buffer of the HD public key

## .inspect()
**Description**: Will return a string formatted for the console

**Parameters**: None.  

**Returns**: {string} Console representation of this extended public key.

```js
const hdPublicKey = new HDPublicKey(...);
hdPublicKey.toInspect() // <HDPublicKey: xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi>
```


