**Usage**: `new PublicKey(data, extra)`  
**Description**:Instantiate a PublicKey from a PrivateKey, Point, `string`, or `Buffer`.

| parameters                                | type      | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **data**                                  | String    | yes                | The encoded data in various formats                            |
| **extra**                                 | Object    | no                 | additional options                                                                                                                            |
| **extra.network**                         | Object    | no                 | Which network should the address for this public key be for                                                                                                                   |
| **extra.compressed**                      | Boolean   | no                 | If the public key is compressed                                                                                                        |

**Returns**: {PublicKey} A new instance of a PublicKey

## PublicKey.fromPrivateKey(privkey)
**Description**: Instantiate a PublicKey from a private key

**Parameters**: 

| parameters                                | type      | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **privkey**                               | Point     | yes                | An instance of PrivateKey                           |
 
**Returns**: {PublicKey} A new valid instance of PublicKey

## PublicKey.fromDER(buf, strict)
**Description**: Instantiate a PublicKey from a DER buffer

**Parameters**: 

| parameters                                | type      | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **buf**                                   | Buffer    | yes                | A DER hex buffer                          |
| **compressed**                            | Boolean   | no                | if set to false, will loosen some conditions                        |
 
**Returns**: {PublicKey} A new valid instance of PublicKey


## PublicKey.fromPoint(point, compressed)
**Description**: Instantiate a PublicKey from an X Point

**Parameters**: 

| parameters                                | type      | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **point**                                 | Point     | yes                | A Point instance                           |
| **compressed**                            | Boolean   | no                | whether to store this public key as compressed format                         |
 
**Returns**: {PublicKey} A new valid instance of PublicKey


## PublicKey.fromString(str, encoding)
**Description**: Instantiate a PublicKey from a Buffer

**Parameters**: 

| parameters                                | type      | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **str**                                   | String    | yes                | A DER hex string                          |
| **encoding**                              | String    | no                 | The type of string encoding                        |
 
**Returns**: {PublicKey} A new valid instance of PublicKey

## PublicKey.fromX(odd, x)
**Description**: Instantiate a PublicKey from an X Point

**Parameters**: 

| parameters                                | type      | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **odd**                                   | Boolean   | yes                | If the point is above or below the x axis                           |
| **x**                                     | Point     | yes                | The x point                          |
 
**Returns**: {PublicKey} A new valid instance of PublicKey

## PublicKey.getValidationError(data)
**Description**: Check if there would be any errors when initializing a PublicKey

**Parameters**: 

| parameters                                | type      | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **data**                                  | String    | yes                | The encoded data in various formats                           |
 
**Returns**: {null|Error}  An error if exists

## PublicKey.isValid(data)
**Description**: Check if the parameters are valid

**Parameters**: 

| parameters                                | type      | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **data**                                  | String    | yes                | The encoded data in various formats                           |
 
**Returns**: {Boolean}  If the public key would be valid

## .toAddress(network)
**Description**: Will output the PublicKey to a DER encoded hex string

**Parameters**: 

| parameters                                | type              | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-------------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **network**                               | String/Network    | yes                | Which network should the address be for                            |
 
**Returns**: {Address}  An address generated from the public key

## .toDER()
**Description**: Will output the PublicKey to a DER Buffer

**Parameters**: None.  

**Returns**: {Buffer} A DER hex encoded buffer

## .toBuffer()
**Description**: Will return a buffer representation of the public key

**Parameters**: None.  

**Returns**: {Buffer} A buffer of the public key

## .toObject() / .toJSON()
**Description**: Will return an object representation of the public key

**Parameters**: None.  

**Returns**: {Object} A plain object with the public key properties

## .toString()
**Description**: Will output the PublicKey to a DER encoded hex string

**Parameters**: None.  

**Returns**: {string} A DER hex encoded string

## .inspect()
**Description**: Will return a string formatted for the console

**Parameters**: None.  

**Returns**: {string} Public Key hex representation

```js
const publicKey = new PublicKey(...);
publicKey.toInspect() // <PublicKey: 041ff0fe0f7b15ffaa....>
```
