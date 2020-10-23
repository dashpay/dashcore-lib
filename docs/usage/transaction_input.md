**Usage**: `new Transaction.Input(params)`  
**Description**: Instantiate an Input from an Object

| parameters                                | type      | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **params**                                | Object    | yes                | The encoded data in various formats                            |

**Returns**: {Input} A new instance of an Input

## Input.fromObject(obj)
**Description**: Instantiate a new Input from a plain JavaScript object

**Parameters**: 

| parameters                                | type      | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **obj**                                   | Object    | yes                |  The output from input.toObject()                          |
 
**Returns**: {Input} A instance of an Input


## .fromBufferReader(br)
**Description**: Set a script from a Buffer. Replace any previously set script

**Parameters**: 

| parameters                                | type      | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **br**                                    | Buffer    | yes                |                            |
 
**Returns**: {Input}

## .toBufferWriter(bw)
**Description**: Set a script from a Buffer. Replace any previously set script

**Parameters**: 

| parameters                                | type      | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **bw**                                    | BufferWriter    | no                |                            |
 
**Returns**: {BufferWriter}

## .setScript(script)
**Description**: Set a script from a Buffer. Replace any previously set script

**Parameters**: 

| parameters                                | type                    | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-------------------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **script**                                | Script/Buffer/String    | yes                 |                            |
 
**Returns**: {Input}

## .getSignatures(transaction, privateKey, inputIndex, number, sigType, addressHash)
**Description**: Retrieve signatures for the provided PrivateKey.

**Parameters**: 

| parameters                                | type         | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|--------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **transaction**                           | Transaction  | yes                 | the transaction to be signed                           |
| **privateKey**                            | PrivateKey   | yes                 | the private key to use when signing                           |
| **inputIndex**                            | Number       | yes                 | the index of this input in the provided transaction                           |
| **sigType**                               | Number       | no                 | defaults to Signature.SIGHASH_ALL                           |
| **addressHash**                           | Number       | no                 |  if provided, don't calculate the hash of the public key associated with the private key provided                          |
 
**Returns**: {}

## .isFinal()
**Description**: Answer if the input is final based on it's sequence number

**Parameters**: None.  

**Returns**: {Boolean} - based on it's sequence number, is input final.

## .isValidSignature(transaction, signature)
**Description**: Verifies the signature and returns if it's valid or not

**Parameters**: 

| parameters                                | type         | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|--------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **transaction**                           | Transaction  | yes                | the transaction to check                           |
| **signature**                             | Object       | yes                | the signature to verify                            |
 

**Returns**: {Boolean} - is the signature valid

## .isNull()
**Description**: Will return true if this is a coinbase input (represents no input)

**Parameters**: None.  

**Returns**: {Boolean} is this a coinbase input 

## .toObject() / .toJSON()
**Description**: Will return an object representation of the input

**Parameters**: None.  

**Returns**: {Object} A plain object with the input informations
