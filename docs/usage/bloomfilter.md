**Usage**: `new BloomFilter(data)`  
**Description**: Instantiate a new bloomfilter.

| parameters                                | type     | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|----------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **data**                                  | Object   | yes                |                           |
| **data.vData**                            | Array    | yes                |  the data of the filter                            |
| **data.nHashFucs**                        | Number   | yes                | the number of hash functions to use                       |
| **data.nTweak**                           | Number   | yes                | the seed used for the hash fuctions                  |
| **data.nFlags**                           | Number   | yes                | flags used to update the filter when matched                            |

Returns : {BloomFilter} A new instance of a BloomFilter

```js
const filter = new BloomFilter({
  vData: [], // the data of the filter
  nHashFucs: 3, // the number of hash functions to use
  nTweak: 2147483649, // the seed used for the hash functions
  nFlags: 0 // flags used to update the filter when matched
});
```

## BloomFilter.create(numberOfElements, falsePositiveRate)

**Description**: A convenient method to initialize a filter from a number of elements and a false positive rate.

Parameters: 

| parameter                                | type            | required           | Description                                                                                                                                                                    |  
|-------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **numberOfElements**                      | Object          | yes                | A plain JavaScript object                                                                                                                              |
| **falsePositiveRate**                     | Object          | yes                | A plain JavaScript object                                                                                                                              |

Returns : {BlockHeader} An instance of block header

```js
const numberOfElements = 3;
const falsePositiveRate = 0.01;
const filter = BloomFilter.create(numberOfElements, falsePositiveRate)
```

## BloomFilter.fromBuffer(buf)
**Description**: Instantiate a BloomFilter from a buffer

**Parameters**:

| parameter                                | type            | required           | Description                                                                                                                                                                    |  
|------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **buf**                                  | Buffer          | yes                |                                                                                                             |

Returns : {BloomFilter} An instance of BloomFilter


## .insert(element)

**Description**: Insert an element into the filter

**Parameters**: 

| parameter                                | type            | required           | Description                                                                                                                                                                    |  
|------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **element**                              |  Buffer         | yes                |                                                                                                                           |


```js
filter.insert(new Buffer('99108ad8ed9bb6274d3980bab5a85c048f0950c8', 'hex'))
```

## .contains(element)

**Description**: Check if element match the filter

**Parameters**: 

| parameter                                | type            | required           | Description                                                                                                                                                                    |  
|------------------------------------------|-----------------|--------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **element**                              |  Buffer         | yes                |                                                                                                                           |


```js
filter.contains(new Buffer('99108ad8ed9bb6274d3980bab5a85c048f0950c8', 'hex'))
```

## .toBuffer()
**Description**: Will return a buffer representation of the BloomFilter

**Parameters**: None.  

**Returns**: {Buffer} A buffer of the bloom filter
