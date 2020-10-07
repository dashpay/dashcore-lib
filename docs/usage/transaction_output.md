**Usage**: `new Transaction.Output(params)`  
**Description**: Instantiate an Output from an Object

| parameters                                | type      | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **params**                                | Object    | yes                |                             |

**Returns**: {Output} A new instance of an Output

## Output.fromObject(obj)
**Description**: Instantiate a new Output from a plain JavaScript object

**Parameters**: 

| parameters                                | type      | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **obj**                                   | Object    | yes                |  The output from output.toObject()                          |
 
**Returns**: {Output} A instance of an Output


## Output.fromBufferReader(br)
**Description**: Will create an Output from a bufferReader

**Parameters**: 

| parameters                                | type      | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **br**                                    | Buffer    | yes                |                            |
 
**Returns**: {Output}

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
 
**Returns**: {Output}

## .setScriptFromBuffer(buffer)
**Description**: Set a script from a Buffer. Replace any previously set script

**Parameters**: 

| parameters                                | type                    | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-------------------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **buffer**                                | Buffer    | yes                 |                            |
 
**Returns**: {Output}

## .invalidSatoshis()
**Description**: Tests if the satoshis amount is invalid

**Parameters**: None.  

**Returns**: {String|Boolean} - return reason as string if invalid, or false.

## .toObject() / .toJSON()
**Description**: Will return an object representation of the input

**Parameters**: None.  

**Returns**: {Object} A plain object with the input informations

## .inspect()
**Description**: Will return a string formatted for the console

**Parameters**: None.  

**Returns**: {string} Output representation

```js
const output = new Output(...);
output.toInspect() // <Output: 041ff0fe0f7b15ffaa....>
```

