**Usage**: `new Opcode(data)`  
**Description**: Instantiate an Opcode from its Opcode string or number

| parameters                                | type          | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|---------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **arg**                                   | Number/String | yes                | The opcode number or string                            |

**Returns**: {Opcode} A new Opcode instance

## Opcode.map
**Description**: map of the available opcodes

## Opcode.isSmallIntOp(opcode)
**Description**: Instantiate a new Opcode from a Buffer

**Parameters**: 

| parameters                                | type           | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **opcode**                                | Opcode         | yes                |                                              |
 
**Returns**: {Boolean} - true if opcode is one of OP_0, OP_1, ..., OP_16 

## Opcode.fromBuffer(buf)
**Description**: Instantiate a new Opcode from a Buffer

**Parameters**: 

| parameters                                | type           | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **buf**                                   | Buffer         | yes                | A Buffer of the script                                               |
 
**Returns**: {Opcode} 

## Opcode.fromNumber(num)
**Description**: Instantiate a new Opcode from a Number

**Parameters**: 

| parameters                                | type           | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **num**                                   | Number         | yes                | A valid opcode number                                              |
 
**Returns**: {Opcode} 

## Opcode.smallInt(n)
**Description**: Instantiate a new Opcode from a smallInt

**Parameters**: 

| parameters                                | type           | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **n**                                     | Number         | yes                | a small int                                               |
 
**Returns**: {Opcode} 

## .toHex()
**Description**: Will return the Opcode as an hex

**Parameters**: None.  

**Returns**: {string} 

## .toBuffer()
**Description**: Will return the opcode as a buffer

**Parameters**: None.  

**Returns**: {Buffer} A buffer of the opcode

## .toNumber()
**Description**: Will output the opcode encoded as hex string

**Parameters**: None.  

**Returns**: {number}

## .inspect()
**Description**: Will return a string formatted for the console

**Parameters**: None.  

**Returns**: {string} Script Opcode representation

```js
const opcode = new Opcode(...);
opcode.toInspect() // <Opcode: 041ff0fe0f7b15ffaa....>
```

