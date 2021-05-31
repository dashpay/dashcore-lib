**Usage**: `new Transaction(arg)`  
**Description**: Instantiate a new instance of Transaction that represents a transaction, a set of inputs and outputs to change ownership of tokens

| parameters | type                             | required | Description |
| ---------- | -------------------------------- | -------- | ----------- |
| **arg**    | String/Buffer/Object/Transaction | yes      |             |

**Returns**: {Transaction} A new instance of a Transaction

## Transaction.shallowCopy(transaction)

**Description**: Create a 'shallow' copy of the transaction, by serializing and deserializing it dropping any additional information that inputs and outputs may have hold.

**Parameters**:

| parameter       | type        | required | Description |
| --------------- | ----------- | -------- | ----------- |
| **transaction** | Transaction | yes      |             |

**Returns** : {Transaction} An new copy instance of the provided transaction

## Transaction.fromString(str)

**Description**: Instantiate a Transaction from a string

**Parameters**:

| parameter | type   | required | Description             |
| --------- | ------ | -------- | ----------------------- |
| **str**   | Object | yes      | A string of the message |

Returns : {Transaction} An instance of Transaction

## Transaction.fromJSON(obj)

**Description**: Instantiate a Transaction from an object

**Parameters**:

| parameter | type   | required | Description                                 |
| --------- | ------ | -------- | ------------------------------------------- |
| **obj**   | Object | yes      | An JSON string or Object with keys: message |

**Returns** : {Transaction} An instance of Transaction

## .serialize(unsafe)

**Description**: Retrieve a hex string that can be used with dashd's CLI interface (decoderawtransaction, sendrawtransaction)
Flags that can be used to skip tests:

- `disableAll`: disable all checks
- `disableSmallFees`: disable checking for fees that are too small
- `disableLargeFees`: disable checking for fees that are too large
- `disableIsFullySigned`: disable checking if all inputs are fully signed
- `disableDustOutputs`: disable checking if there are no outputs that are dust amounts
- `disableMoreOutputThanInput`: disable checking if the transaction spends more bitcoins than the sum of the input amounts

**Parameters**:

| parameter  | type           | required | Description                                                                                                       |
| ---------- | -------------- | -------- | ----------------------------------------------------------------------------------------------------------------- |
| **unsafe** | Boolean/Object | yes      | unsafe if true, skip all tests. if it's an object, it's expected to contain a set of flags to skip certain tests. |

**Returns**: {string}

## .checkSerialize(opts)

**Description**: Retrieve a hex string that can be used with dashd's CLI interface (decoderawtransaction, sendrawtransaction)

**Parameters**:

| parameter | type           | required | Description                                                     |
| --------- | -------------- | -------- | --------------------------------------------------------------- |
| **opts**  | Boolean/Object | yes      | opts allows to skip certain tests. {see Transaction#serialize}. |

**Returns**: {string}

## .getSerializationError(opts)

**Description**: Retrieve a possible error that could appear when trying to serialize and broadcast this transaction.

**Parameters**:

| parameter | type           | required | Description                                                     |
| --------- | -------------- | -------- | --------------------------------------------------------------- |
| **opts**  | Boolean/Object | yes      | opts allows to skip certain tests. {see Transaction#serialize}. |

## .lockUntilDate(time)

**Description**: Sets nLockTime so that transaction is not valid until the desired date (a timestamp in seconds since UNIX epoch is also accepted)

**Parameters**:

| parameter | type          | required | Description                                            |
| --------- | ------------- | -------- | ------------------------------------------------------ |
| **time**  | Date / Number | yes      | date instance or timestamp in seconds since UNIX epoch |

**Returns**: {Transaction}

## .lockUntilBlockHeight(height)

**Description**: Sets nLockTime so that transaction is not valid until the valid height

**Parameters**:

| parameter  | type          | required | Description  |
| ---------- | ------------- | -------- | ------------ |
| **height** | Date / Number | yes      | block height |

**Returns**: {Transaction}

## .getLockTime()

**Description**: Returns a semantic version of the transaction's nLockTime.  
If nLockTime is 0, it returns null, if it is < 500000000, it returns a block height (number) else it returns a Date object.

**Parameters**:

| parameter  | type          | required | Description  |
| ---------- | ------------- | -------- | ------------ |
| **height** | Date / Number | yes      | block height |

**Returns**: {number / Date}

## .from(utxo, pubkeys, threshold)

**Description**: Add an input to this transaction.  
This is a high level interface to add an input, for more control, use Transaction#addInput.

Can receive, as output information, the output of dashd's `listunspent` command, and a slightly fancier format recognized by dashcore:

```json
{
  "address": "yYo3PeSBv2rMnJeyLUCCzx4Y8VhPppZKkC",
  "txId": "a477af6b2667c29670467e4e0728b685ee07b240235771862318e29ddbe58458",
  "outputIndex": 0,
  "script": null,
  "satoshis": 1020000
}
```

Where `address` can be either a string or a dashcore Address object. The same is true for `script`, which can be a string or a dashcore Script.

**Parameters**:

| parameter     | type         | required | Description                                            |
| ------------- | ------------ | -------- | ------------------------------------------------------ |
| **utxo**      | Array/Object | yes      | Array of utxos or single utxo object or representation |
| **pubkeys**   | Array        | no       | In case of a multisigUtxo.                             |
| **threshold** | Number       | no       |                                                        |

**Returns**: Transaction

## .addInput(input, outputScript, satoshis)

**Description**: Add an input to this transaction. The input must be an instance of the `Input` class.  
It should have information about the Output that it's spending, but if it's not already set, two additional parameters, `outputScript` and `satoshis` can be provided.  
Using .uncheckedAddInput(input) one can add an input without having the input information checked.

**Parameters**:

| parameter        | type          | required | Description                                            |
| ---------------- | ------------- | -------- | ------------------------------------------------------ |
| **input**        | Input         | yes      | Array of utxos or single utxo object or representation |
| **outputScript** | String/Script | no       |                                                        |
| **satoshis**     | Number        | no       |                                                        |

**Returns**: Transaction

## .hasAllUtxoInfo()

**Description**: Returns true if the transaction has enough info on all inputs to be correctly validated.

**Parameters**: None.

**Returns**: {Boolean}

## .fee(amount)

**Description**: Manually set the fee for this transaction. Beware that this resets all the signatures for inputs (in further versions, SIGHASH_SINGLE or SIGHASH_NONE signatures will not be reset).

**Parameters**:

| parameter  | type   | required | Description                   |
| ---------- | ------ | -------- | ----------------------------- |
| **amount** | Number | yes      | amount in satoshis to be sent |

**Returns**: Transaction

## .feePerKb(amount)

**Description**: Manually set the fee per KB for this transaction. Beware that this resets all the signatures for inputs (in further versions, SIGHASH_SINGLE or SIGHASH_NONE signatures will not be reset).

**Parameters**:

| parameter  | type   | required | Description                       |
| ---------- | ------ | -------- | --------------------------------- |
| **amount** | Number | yes      | amount satoshis per KB to be sent |

**Returns**: Transaction

## .change(address)

**Description**: Set the change address for this transaction.
Beware that this resets all the signatures for inputs (in further versions, SIGHASH_SINGLE or SIGHASH_NONE signatures will not be reset).

**Parameters**:

| parameter   | type           | required | Description                          |
| ----------- | -------------- | -------- | ------------------------------------ |
| **address** | Address/String | yes      | An address for change to be sent to. |

**Returns**: Transaction

## .getChangeOutput()

**Description**: Get the change output if it exists

**Parameters**: None.

**Returns**: Output

## .to(address, amount)

**Description**: Add an output to the transaction.
Beware that this resets all the signatures for inputs (in further versions, SIGHASH_SINGLE or SIGHASH_NONE signatures will not be reset).

**Parameters**:

| parameter   | type           | required | Description                 |
| ----------- | -------------- | -------- | --------------------------- |
| **address** | Address/String | yes      | An address to send dash to. |
| **amount**  | Number         | yes      | in satoshis                 |

**Returns**: Transaction

## .addData(value)

**Description**: Add an OP_RETURN output to the transaction.
Beware that this resets all the signatures for inputs (in further versions, SIGHASH_SINGLE or SIGHASH_NONE signatures will not be reset).

**Parameters**:

| parameter | type            | required | Description                                                                                                       |
| --------- | --------------- | -------- | ----------------------------------------------------------------------------------------------------------------- |
| **value** | Buffer / string | yes      | value the data to be stored in the OP_RETURN output. In case of a string, the UTF-8 representation will be stored |

**Returns**: Transaction

## .addOutput(output)

**Description**: Add an output to the transaction.

**Parameters**:

| parameter  | type   | required | Description        |
| ---------- | ------ | -------- | ------------------ |
| **output** | Output | yes      | the output to add. |

**Returns**: Transaction

## .clearOutputs()

**Description**: Remove all outputs from the transaction.

**Parameters**: None.

**Returns**: Output

## .getFee()

**Description**: Calculates the fee of the transaction. If there's a fixed fee set, return that.  
If there is no change output set, the fee is the total value of the outputs minus inputs.  
If there's no fee set and no change address, estimate the fee based on size.

**Parameters**: None.

**Returns**: {Number} fee of this transaction in satoshis

## .sort()

**Description**: Sort a transaction's inputs and outputs according to [BIP69](https://github.com/bitcoin/bips/blob/master/bip-0069.mediawiki)

**Parameters**: None.

**Returns**: Transaction

## .shuffleOutputs()

**Description**: Randomize this transaction's outputs ordering. The shuffling algorithm is a version of the Fisher-Yates shuffle, provided by lodash's \_.shuffle().

**Parameters**: None.

**Returns**: Transaction

## .sortOutputs()

**Description**: Sort this transaction's outputs, according to a given sorting function that takes an array as argument and returns a new array, with the same elements but with a different order.
The argument function MUST NOT modify the order of the original array

**Parameters**:

| parameter           | type     | required | Description      |
| ------------------- | -------- | -------- | ---------------- |
| **sortingFunction** | Function | yes      | sorting function |

**Returns**: Transaction

## .sortInputs()

**Description**: Sort this transaction's inputs, according to a given sorting function that takes an array as argument and returns a new array, with the same elements but with a different order.

**Parameters**:

| parameter           | type     | required | Description      |
| ------------------- | -------- | -------- | ---------------- |
| **sortingFunction** | Function | yes      | sorting function |

**Returns**: Transaction

## .removeInput(txid, outputIndex)

**Description**: Remove a specific input by it's txid and outputindex
**Parameters**:

| parameter       | type   | required | Description |
| --------------- | ------ | -------- | ----------- |
| **txid**        | string | yes      |             |
| **outputIndex** | number | yes      |             |

**Returns**: void

## .sign(privateKey, sigType)

**Description**: Sign the transaction using one or more private keys. It tries to sign each input, verifying that the signature will be valid (matches a public key).
**Parameters**:

| parameter      | type                    | required | Description |
| -------------- | ----------------------- | -------- | ----------- |
| **privateKey** | Array/String/PrivateKey | yes      |             |
| **sigType**    | number                  | no       |             |

**Returns**: Transaction

## .applySignature()

**Description**: Add a signature to the transaction

**Parameters**:

| parameter     | type   | required | Description                                                   |
| ------------- | ------ | -------- | ------------------------------------------------------------- |
| **signature** | Object | yes      | An object having inputIndex, sigtype, publicKey and signature |

**Returns**: Transaction

## .isFullySigned()

**Description**: Check whether the transaction is fully signed

**Parameters**: None.

**Returns**: boolean

## .isValidSignature(signature)

**Description**: Check whether the transaction is fully signed

**Parameters**:

| parameter     | type      | required | Description |
| ------------- | --------- | -------- | ----------- |
| **signature** | Signature | yes      |             |

**Returns**: boolean

## .verifySignature()

**Description**: whether the signature is valid for this transaction input

**Parameters**: None.

**Returns**: boolean

## .verify()

**Description**: Check that a transaction passes basic sanity tests. If not, return a string describing the error. This function contains the same logic as CheckTransaction in bitcoin core.

**Parameters**: None.

**Returns**: boolean or reason for failure as a string

## .isCoinbase()

**Description**: Analogous to dashd's IsCoinBase function in transaction.h

**Parameters**: None.

**Returns**: boolean

## .hasExtraPayload()

**Description**: Checks if transaction has DIP2 extra payload

**Parameters**: None.

**Returns**: boolean

## .setType(type)

**Description**: Set special transaction type and create an empty extraPayload

**Parameters**:

| parameter | type   | required | Description |
| --------- | ------ | -------- | ----------- |
| **type**  | number | yes      |             |

**Returns**: boolean

## .setExtraPayload(payload)

**Description**: Set special transaction extra payload

**Parameters**:

| parameter   | type            | required | Description |
| ----------- | --------------- | -------- | ----------- |
| **payload** | AbstractPayload | yes      |             |

**Returns**: boolean

## .getExtraPayloadSize()

**Description**: Return extra payload size in bytes.

**Parameters**: None.

**Returns**: Number

## .getSignatures()

**Description**:
**Parameters**: None.
**Returns**: Array

## .canHaveNoUtxo()

**Description**:

**Parameters**: None.

**Returns**: Boolean

## .toObject() / .toJSON()

**Description**: Will return an object representation of the transaction

**Parameters**: None.

**Returns**: {Object} A plain object with the transaction properties

## .addFundingOutput(fundingAmount)

**Description**:

**Parameters**:

| parameter         | type   | required | Description |
| ----------------- | ------ | -------- | ----------- |
| **fundingAmount** | Number | yes      |             |

**Returns**: Transaction

## .addBurnOutput(satoshisToBurn, publicKeyHash)

**Description**:

**Parameters**:

| parameter          | type   | required | Description |
| ------------------ | ------ | -------- | ----------- |
| **satoshisToBurn** | Number | yes      |             |
| **publicKeyHash**  | Buffer | yes      |             |

**Returns**: Transaction

## .getOutPointBuffer(outputIndex)

**Description**: Gives an OutPoint buffer for the output at a given index

**Parameters**:

| parameter       | type   | required | Description |
| --------------- | ------ | -------- | ----------- |
| **outputIndex** | Number | yes      |             |

**Returns**: Buffer
