**Usage**: `new BlockHeader(data)`  
**Description**: Instantiate a BlockHeader from a Buffer, JSON object, or Object with the properties of the BlockHeader

| parameters                                | type                   | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|------------------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **data**                                  | Object/Buffer/String   | yes                | A Buffer, JSON string, or Object                            |

Returns : {BlockHeader} A new instance of a BlockHeader


## BlockHeader.fromObject(json)

**Description**: Instantiate a block from an Object

Parameters: 

| parameter                                | type            | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **obj**                                   | Object          | yes                | A plain JavaScript object                                                                                                                              |

Returns : {BlockHeader} An instance of block header


## BlockHeader.fromRawBlock()
**Description**: Instantiate a block from an Object

Parameters: 

| parameter                                | type            | required           | Description                                                                                                                                                                    |  
|------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **data**                                 | Buffer          | yes                | Raw block binary data or buffer                                                                                                         |

Returns : {BlockHeader} An instance of block header


## BlockHeader.fromBuffer(buffer)
**Description**: Instantiate a block from a Buffer

Parameters: 

| parameter                                | type            | required           | Description                                                                                                                                                                    |  
|------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **buffer**                               | Buffer          | yes                | A buffer of the block header                                                                                                                |

Returns : {BlockHeader} An instance of block header


## Block.fromBufferReader(bufferReader)

**Description**: Instantiate a BlockHeader from a BufferReader

Parameters: 

| parameter                                | type            | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **bufferReader**                          | BufferReader    | yes                | A buffer reader of the block header                                                                                                                              |

Returns : {BlockHeader} An instance of block header

## Block.fromString(str)
**Description**: Instantiate a block header from a string representation

**Parameters**:

| parameter                                | type            | required           | Description                                                                                                                                                                    |  
|------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **str**                                  | String          | yes                | A hex encoded string of the block header                                                                                                             |

Returns : {BlockHeader} An instance of block header

## .getTargetDifficulty(bits)

**Description**: Returns the target difficulty for this block

**Parameters**:

| parameter                                | type            | required           | Description                                                                                                                                                                    |  
|------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **bits**                                 | Number          | no                 | bits number                                                                                                       |

**Returns**: {BN} An instance of BN with the decoded difficulty bits

## .getDifficulty()

**Description**: Returns the difficulty value

**Parameters**: None

**Returns**: {Number}

## .toJSON() / .toObject()
**Description**: Will return an object representation of the block header

**Parameters**: None.  

**Returns**: {Object} A plain object with the block header properties

## .toBuffer()
**Description**: Will return a buffer representation of the block header

**Parameters**: None.  

**Returns**: {Buffer} A buffer of the block header
## .toString()
**Description**:Will return a string representation of the block header

**Parameters**: None.  

**Returns**: {string} A hex encoded string of the block header

## .toBufferWriter(bw)
**Description**: Instantiate a block header from an BufferWriter

**Parameters**:

| parameter                                 | type            | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **bw**                                    | BufferWriter    | no                 | An existing instance of BufferWriter                                                                                                                  |

**Returns**: {BufferWriter} An instance of BufferWriter representation of the Block Header

## .validTimestamp()
**Description**: Verifies that the timestamp is not too far in the future

**Parameters**: None.  

**Returns**: {Boolean} If timestamp is not too far in the future

## .validProofOfWork()
**Description**: Verifies that the proof-of-work hash satisfies the target difficulty

**Parameters**: None.  

**Returns**: {Boolean}
## .inspect()
**Description**: Will return a string formatted for the console

**Parameters**: None.  

**Returns**: {string} Console representation of this block header hash

```js
const block = new BlockHeader(...);
block.toInspect() // <BlockHeader: 0000000cc55c08ed64afb41c7c2f382a64901eadfcc6663c4e70987fdc0e8401>
```


