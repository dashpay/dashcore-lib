**Usage**: `new HDPrivateKey(data)`  
**Description**: Instantiate an instance of a hierarchically derived private key (read more about HD in the [BIP-32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki)).

| parameters                                | type                   | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|------------------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **data**                                  | Object/Buffer/String   | yes                | A Buffer, JSON string, or Object                            |

**Returns**: {HDPrivateKey} A new instance of a HDPrivateKey

## HDPrivateKey.isValidPath(path)

**Description**: Verifies that a given path is valid.

**Parameters**:

| parameter                                 | type            | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **path**                                  | String/Number   | yes                | A path                                                                                                                             |

**Returns**: {Boolean}

## HDPrivateKey.isValidSerialized(data, network)

**Description**: Verifies that a given serialized private key in base58 with checksum format is valid.

**Parameters**: 

| parameter                                 | type            | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **data**                                  | String/Buffer   | yes                | the serialized private key                                                                                                                             |
| **network**                               | String/Network  | no                 | optional, if present, checks that the network provided matches the network serialized.                                                                                                                             |

**Returns**: {Boolean}

## HDPrivateKey.getSerializedError(data, network)
**Description**: Checks what's the error that causes the validation of a serialized private key in base58 with checksum to fail.

| parameter                                 | type            | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **data**                                  | String/Buffer   | yes                | the serialized private key                                                                                                                             |
| **network**                               | String/Network  | no                 | optional, if present, checks that the network provided matches the network serialized.                                                                                                                             |


## HDPrivateKey.fromSeed(hex, network)

**Description**: Verifies that a given serialized private key in base58 with checksum format is valid.

**Parameters**:

| parameter                                 | type            | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **hex**                                   | String/Buffer   | yes                | seed serialized as string a buffer                                                                                                                             |
| **network**                               | String/Network  | no                 |                                                                                                                        |

**Returns**: {HDPrivateKey}


## HDPrivateKey.fromString(str)
**Description**: Instantiate a HDPrivateKey from a string representation

**Parameters**:

| parameter                                | type            | required           | Description                                                                                                                                                                    |  
|------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **str**                                  | String          | yes                |                                                                                                             |

Returns : {HDPrivateKey} An instance of HDPrivateKey

## HDPrivateKey.fromObject(obj)
**Description**: Instantiate a HDPrivateKey from an object

**Parameters**:

| parameter                                | type            | required           | Description                                                                                                                                                                    |  
|------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **obj**                                  | Object          | yes                |                                                                                                             |

Returns : {HDPrivateKey} An instance of HDPrivateKey

## HDPrivateKey.fromBuffer(buf)
**Description**: Instantiate a HDPrivateKey from a buffer

**Parameters**:

| parameter                                | type            | required           | Description                                                                                                                                                                    |  
|------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **buf**                                  | Buffer          | yes                |                                                                                                             |

Returns : {HDPrivateKey} An instance of HDPrivateKey

## .deriveChild(arg)
**Description**: Get a derived child based on a string or number.   
If the first argument is a string, it's parsed as the full path of derivation. Valid values for this argument include "m" (which returns the same private key), "m/0/1/40/2'/1000", where the ' quote means a hardened derivation.  
If the first argument is a number, the child with that index will be derived. If the second argument is truthy, the hardened version will bederived. See the example usage for clarification.
     
**Parameters**: None.  

**Returns**: {string} A hex encoded string of the HD private key

```js 
const parent = new HDPrivateKey('xprv...');
const child_0_1_2h = parent.deriveChild(0).deriveChild(1).deriveChild(2, true);
const copy_of_child_0_1_2h = parent.deriveChild("m/0/1/2'");
assert(child_0_1_2h.xprivkey === copy_of_child_0_1_2h);
```

## .toString()
**Description**:Will return a string representation of the HD private key

**Parameters**: None.  

**Returns**: {string} A hex encoded string of the HD private key

## .toJSON() / .toObject()
**Description**: Will return an object representation of the HD private key

**Parameters**: None.  

**Returns**: {Object} A plain object with the HDPrivateKey properties

## .toBuffer()
**Description**: Will return a buffer representation of the HD private key

**Parameters**: None.  

**Returns**: {Buffer} A buffer of the HD private key

## .inspect()
**Description**: Will return a string formatted for the console

**Parameters**: None.  

**Returns**: {string} Console representation of this extended private key.

```js
const hdPrivateKey = new HDPrivateKey(...);
hdPrivateKey.toInspect() // <HDPrivateKey: xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi>
```


