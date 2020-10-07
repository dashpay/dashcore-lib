**Usage**: `new PrivateKey(data, network)`  
**Description**: Instantiate a PrivateKey from a BN, Buffer and WIF.

| parameters                                | type              | required           | Description                                                                   |  
|-------------------------------------------|-------------------|--------------------| ----------------------------------------------------------------------------- |
| **data**                                  | String            | no                 | The encoded data in various formats. When excluded, a random key is generated |
| **network**                               | Network/string    | no                 | a Network object, or a string with the network name                           |

**Returns**: {PrivateKey} A new valid instance of a PrivateKey

## PrivateKey.fromBuffer(buff, network)
**Description**: Instantiate a PublicKey from a Buffer

**Parameters**: 

| parameters                                | type           | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **buff**                                  | Buffer         | yes                | A Buffer of the private key                                               |
| **network**                               | Network/String | no                 | a Network object, or a string with the network name. Default on livenet.  |
 
**Returns**: {PrivateKey} A new valid instance of PrivateKey

## PrivateKey.fromString(str)
**Description**: Instantiate a PrivateKey from a WIF string

**Parameters**: 

| parameters                                | type      | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **str**                                   | String    | yes                |  The WIF encoded private key string                          |
 
**Returns**: {PublicKey} A new valid instance of PublicKey

## PrivateKey.fromObject(obj)
**Description**: Instantiate a PrivateKey from a plain JavaScript object

**Parameters**: 

| parameters                                | type      | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **obj**                                   | Object    | yes                |  The output from privateKey.toObject()                          |
 
**Returns**: {PublicKey} A new valid instance of PublicKey

## PrivateKey.fromRandom(network)
**Description**: Instantiate a PublicKey from random bytes

**Parameters**: 

| parameters                                | type           | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **network**                               | Network/String | no                 | a Network object, or a string with the network name. Default on livenet.  |
 
**Returns**: {PrivateKey} A new valid instance of PrivateKey

## PrivateKey.getValidationError(data, network)
**Description**: Check if there would be any errors when initializing a PrivateKey

**Parameters**: 

| parameters                                | type           | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **data**                                  | String         | yes                | The encoded data in various formats                           |
| **network**                               | Network/String | no                 | a Network object, or a string with the network name. Default on livenet.  |

**Returns**: {null|Error}  An error if exists

## PrivateKey.isValid(data, network)
**Description**: Check if the parameters are valid

**Parameters**: 

| parameters                                | type           | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **data**                                  | String         | yes                | The encoded data in various formats                           |
| **network**                               | Network/String | no                 | a Network object, or a string with the network name. Default on livenet.  |

**Returns**: {Boolean}  If the private key is would be valid


## .toPublicKey()
**Description**: Will return the corresponding public key

**Parameters**: None.  

**Returns**: {PublicKey} - A public key generated from the private key

## .toAddress(network)
**Description**: Will return an address for the private key

**Parameters**: 

| parameters                                | type           | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **network**                               | Network/String | no                 | a Network object, or a string with the network name. Default on livenet.  |


**Returns**: {Address} - An address generated from the private key

## .toWIF()
**Description**: Will output the PrivateKey to a WIF string

**Parameters**: None.  

**Returns**: {string} A WIP representation of the private key

## .toBigNumber()
**Description**: Will return the private key as a BN instance

**Parameters**: None.  

**Returns**: {BN} A BN instance of the private key

## .toBuffer()
**Description**: Will return a buffer representation of the private key

**Parameters**: None.  

**Returns**: {Buffer} A buffer of the private key


## .toObject() / .toJSON()
**Description**: Will return an object representation of the private key

**Parameters**: None.  

**Returns**: {Object} A plain object with the private key properties

## .toString()
**Description**: Will output the PrivateKey encoded as hex string

**Parameters**: None.  

**Returns**: {string} A hex encoded string

## .inspect()
**Description**: Will return a string formatted for the console

**Parameters**: None.  

**Returns**: {string} Private Key hex representation

```js
const privateKey = new PrivateKey(...);
privateKey.toInspect() // <PrivateKey: 041ff0fe0f7b15ffaa....>
```

