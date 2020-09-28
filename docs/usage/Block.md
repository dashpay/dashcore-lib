**Usage**: `new Block(data)`  
**Description**: Instantiate a Block from a Buffer, JSON object, or Object with the properties of the Block

| parameters                                | type                   | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|------------------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **data**                                  | Object/Buffer/String   | yes                | A Buffer, JSON string, or Object                            |

Returns : {Block} A new instance of a Block


## Block.fromObject(json)

**Description**: Instantiate a block from an Object

Parameters: 

| parameter                                | type            | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **obj**                                   | Object          | yes                | A plain JavaScript object                                                                                                                              |

Returns : {Block} A instance of a Block

## Block.fromBufferReader(bufferReader)

**Description**: Instantiate a block from a BufferReader

Parameters: 

| parameter                                | type            | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **bufferReader**                          | BufferReader    | yes                | A buffer reader of the block                                                                                                                              |

Returns : {Block} A instance of a Block

## Block.fromBuffer(buffer)
**Description**: Instantiate a block from an Object

Parameters: 

| parameter                                | type            | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **buffer**                          | Buffer          | yes                | a Buffer                                                                                                                   |

Returns : {Block} A instance of a Block

## Block.fromString(str)
**Description**: Instantiate a block from an Object

Parameters: 

| parameter                                | type            | required           | Description                                                                                                                                                                    |  
|------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **str**                                  | String          | yes                | A hex encoded string of the block                                                                                                                  |

Returns : {Block} A instance of a Block

## Block.fromRawBlock()
**Description**: Instantiate a block from an Object

Parameters: 

| parameter                                | type            | required           | Description                                                                                                                                                                    |  
|------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **data**                                 | Buffer          | yes                | Raw block binary data or buffer                                                                                                                  |

Returns : {Block} A instance of a Block

## .getTransactionHashes()

**Description**: Will iterate through each transaction and return an array of hashes  

**Parameters**: None.  

**Returns**: {Buffer[]} An array with transaction hashes

## .toJSON() / .toObject()
**Description**: Will return an object representation of the block

**Parameters**: None.  

**Returns**: {Object} A plain object with the Block properties

## .toBuffer()
**Description**: Will return a buffer representation of the block

**Parameters**: None.  

**Returns**: {Buffer} A buffer of the block
## .toString()
**Description**:Will return a string representation of the block

**Parameters**: None.  

**Returns**: {string} A hex encoded string of the block

## .toBufferWriter(bw)
**Description**: Instantiate a block from an BufferWriter

**Parameters**:

| parameter                                | type            | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **bw**                                    | BufferWriter    | no                 | An existing instance of BufferWriter                                                                                                                  |

**Returns**: {BufferWriter} An instance of BufferWriter representation of the Block
## .getMerkleTree()
**Description**: Will build a merkle tree of all the transactions, ultimately arriving at a single point, the merkle root.

**Parameters**: None.  

**Returns**: {Buffer[]} An array with each level of the tree after the other.
## .getMerkleRoot()
**Description**: Calculates the merkleRoot from the transactions.

**Parameters**: None.  

**Returns**: {Buffer} A buffer of the merkle root hash
## .validMerkleRoot()
**Description**: Verifies that the transactions in the block match the header merkle root

**Parameters**: None.  

**Returns**: {Boolean} If the merkle roots match
## .inspect()
**Description**: Will return a string formatted for the console

**Parameters**: None.  

**Returns**: {string} Block hash

```js
const block = new Block(...);
block.toInspect() // <Block: 00000ffd590b1485b3caadc19b22e6379c733355108f107a430458cdf3407ab6>
```


