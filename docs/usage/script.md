**Usage**: `new Script(data)`  
**Description**: Instantiate a Script from optional data.

| parameters                                | type      | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **data**                                  | Object/string/Buffer    | yes                | from optional data to populate script                            |

**Returns**: {Script} A new instance of a Script


## Script.fromBuffer(buff)
**Description**: Instantiate a Script from a Buffer

**Parameters**: 

| parameters                                | type           | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **buff**                                  | Buffer         | yes                | A Buffer of the script                                               |
 
**Returns**: {Script} A new valid instance of Script


## Script.fromASM(str)
**Description**: Instantiate a Script from ASM

**Parameters**: 

| parameters                                | type           | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **str**                                  | String         | yes                |                                                |
 
**Returns**: {Script} A new valid instance of Script

## Script.fromHex(str)
**Description**: Instantiate a Script from hex representation

**Parameters**: 

| parameters                                | type           | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **str**                                  | String         | yes                |                                                |
 
**Returns**: {Script} A new valid instance of Script

## Script.fromString(str)
**Description**: Instantiate a Script from string representation

**Parameters**: 

| parameters                                | type           | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **str**                                  | String         | yes                |                                                |
 
**Returns**: {Script} A new valid instance of Script

## Script.buildMultisigOut(publicKeys, threshold, opts)
**Description**: Instantiate a new Multisig output script for the given public keys, requiring m of those public keys to spend

**Parameters**: 

| parameters                                | type           | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **publicKeys**                                  | PublicKey[]         | yes                |   ist of all public keys controlling the output                                             |
| **threshold**                                  | Number         | yes                |    amount of required signatures to spend the output                                             |
| **opts**                                  | Object         | no                |   Several options: - noSorting: defaults to false, if true, don't sort the given public keys before creating the script                                             |
 
**Returns**: {Script} a new Multisig output script for given public keys, requiring m of those public keys to spend

## Script.buildMultisigIn(publicKeys, threshold, signatures, opts)
**Description**: Instantiate a new Multisig input script for the given public keys, requiring m of those public keys to spend

**Parameters**: 

| parameters                                | type           | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **publicKeys**                                  | PublicKey[]         | yes                |   ist of all public keys controlling the output                                             |
| **threshold**                                  | Number         | yes                |    amount of required signatures to spend the output                                             |
| **signatures**                                  | Array         | yes                |   signatures and array of signature buffers to append to the script                                             |
| **opts**                                  | Object         | no                |   Several options: - noSorting: defaults to false, if true, don't sort the given public keys before creating the script                                             |
 
**Returns**: {Script} a new Multisig input script for given public keys, requiring m of those public keys to spend


## Script.buildP2SHMultisigIn(publicKeys, threshold, signatures, opts)
**Description**: Instantiate a new P2SH Multisig input script for the given public keys, requiring m of those public keys to spend

**Parameters**: 

| parameters                                | type           | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **publicKeys**                                  | PublicKey[]         | yes                |   ist of all public keys controlling the output                                             |
| **threshold**                                  | Number         | yes                |    amount of required signatures to spend the output                                             |
| **signatures**                                  | Array         | yes                |   signatures and array of signature buffers to append to the script                                             |
| **opts**                                  | Object         | no                |   Several options: - noSorting: defaults to false, if true, don't sort the given public keys before creating the script                                             |
 
**Returns**: {Script} a new P2SH Multisig input script for the given public keys, requiring m of those public keys to spend

## Script.buildPublicKeyHashOut(to)
**Description**: Instantiate a new pay to public key hash output for the given address or public key

**Parameters**: 

| parameters                                | type           | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **to**                                  | Address/PublicKey         | yes                |   destination address or public key                                            |
 
**Returns**: {Script} a new pay to public key hash output for the given address or public key

## Script.buildPublicKeyOut(pubkey)
**Description**: Instantiate a new pay to public key output for the given public key

**Parameters**: 

| parameters                                | type           | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **pubkey**                                  | PublicKey         | yes                |   public key                                            |
 
**Returns**: {Script} a new pay to public key output for the given public key


## Script.buildDataOut(data, encoding)
**Description**: Instantiate a new OP_RETURN script with data

**Parameters**: 

| parameters                                | type      | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **data**                                  | String/Buffer    | yes                | the data to embed in the output                          |
| **encoding**                              | String    | no                 | The type of string encoding                        |
 
**Returns**: {Script} a new OP_RETURN script with data


## .set(obj)
**Description**: Set Script chunks from provided object. Replace any previous chunks.

**Parameters**: 

| parameters                            | type              | required           | Description                                                                                                                                                                    |  
|---------------------------------------|-------------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **obj**                               | Object    | yes                |                             |
 
**Returns**: {Script} 

## .prepend(obj)
**Description**: Adds a script element at the start of the script.

**Parameters**: 

| parameters                            | type              | required           | Description                                                                                                                                                                    |  
|---------------------------------------|-------------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **obj**                               | String/Number/Opcode/Buffer/Object    | yes                | a string, number, Opcode, Buffer, or object to add                            |
 
**Returns**: {Script} 


## .equals(script)
**Description**: Compares a script with another script

**Parameters**: 

| parameters                            | type              | required           | Description                                                                                                                                                                    |  
|---------------------------------------|-------------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **script**                               | Script    | yes                | a script to compare with                            |
 
**Returns**: {Script} 



## .add(obj)
**Description**: Adds a script element to the end of the script.

**Parameters**: 

| parameters                            | type              | required           | Description                                                                                                                                                                    |  
|---------------------------------------|-------------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **obj**                               | String/Number/Opcode/Buffer/Object    | yes                | a string, number, Opcode, Buffer, or object to add                            |
 
**Returns**: {Script} 




## .getPublicKey()
**Description**: Will return the public key

**Parameters**: None.  

**Returns**: {PublicKey}

## .getPublicKeyHash()
**Description**: Will return the public key hash

**Parameters**: None.  

**Returns**: {PublicKey}


## .getData()
**Description**: Retrieve the associated data for this script. In the case of a pay to public key hash or P2SH, return the hash. In the case of a standard OP_RETURN, return the data

**Parameters**: None.  

**Returns**: {Buffer}

## .classify()
**Description**: Retrieve the Script type if it is a known form, or Script.UNKNOWN if it isn't

**Parameters**: None.  

**Returns**: {string} - Member of Script.types

## .classifyOutput()
**Description**: Retrieve the Script type if it is a known form, or Script.UNKNOWN if it isn't

**Parameters**: None.  

**Returns**: {string} - Member of Script.types

## .classifyInput()
**Description**: Retrieve the Script type if it is a known form, or Script.UNKNOWN if it isn't

**Parameters**: None.  

**Returns**: {string} - Member of Script.types

## .isStandard()
**Description**: Verify if script is one of the known types

**Parameters**: None.  

**Returns**: {Boolean} - if script is one of the known types

## .isPublicKeyHashOut()
**Description**: Verify if this is a pay to pubkey hash output script

**Parameters**: None.  

**Returns**: {Boolean} - if this is a pay to pubkey hash output script

## .isPublicKeyHashIn()
**Description**: Verify if this is a pay to public key hash input script

**Parameters**: None.  

**Returns**: {Boolean} - if this is a pay to public key hash input script

## .isPublicKeyOut()
**Description**: Verify if this is a public key output script

**Parameters**: None.  

**Returns**: {Boolean} - if this is a public key output script

## .isPublicKeyIn()
**Description**: Verify if this is a public key input script

**Parameters**: None.  

**Returns**: {Boolean} - if this is a public key input script

## .isScriptHashOut()
**Description**: Verify if this is a p2sh output script

**Parameters**: None.  

**Returns**: {Boolean} - if this is a p2sh output script

## .isScriptHashIn()
**Description**: Verify if this is a p2sh input script. These are frequently indistinguishable from pubkeyhashin.

**Parameters**: None.  

**Returns**: {Boolean} - if this is a p2sh input script

## .isMultisigOut()
**Description**: Verify if this is a multisig output script.

**Parameters**: None.  

**Returns**: {Boolean} - if this is a multisig output script

## .isMultisigIn()
**Description**: Verify if this is a multisig input script.

**Parameters**: None.  

**Returns**: {Boolean} - if this is a multisig input script

## .isDataOut()
**Description**: Verify if this is a valid standard OP_RETURN output

**Parameters**: None.  

**Returns**: {Boolean} - if this is a valid standard OP_RETURN output

## .isPushOnly()
**Description**: Verify if the script is only composed of data pushing opcodes or small int opcodes (OP_0, OP_1, ..., OP_16)

**Parameters**: None.  

**Returns**: {Boolean}

## .toASM()
**Description**: Will return an ASM representation of the script

**Parameters**: None.  

**Returns**: {String}

## .toHex()
**Description**: Will return an hex representation of the script

**Parameters**: None.  

**Returns**: {String}

## .toBuffer()
**Description**: Will return a buffer representation of the script

**Parameters**: None.  

**Returns**: {Buffer} A buffer of the script

## .toObject() / .toJSON()
**Description**: Will return an object representation of the script

**Parameters**: None.  

**Returns**: {Object} A plain object with the script properties

## .toString()
**Description**: Will output the stringified script

**Parameters**: None.  

**Returns**: {string}

## .inspect()
**Description**: Will return a string formatted for the console

**Parameters**: None.  

**Returns**: {string} Public Key hex representation

```js
const script = new Script(...);
script.toInspect() // <Script: 041ff0fe0f7b15ffaa....>
```






## PublicKey.fromDER(buf, strict)
**Description**: Instantiate a PublicKey from an X Point

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

