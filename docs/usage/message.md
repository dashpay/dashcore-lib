**Usage**: `new Message(string)`  
**Description**: Instantiate a new message instance helpers for signing and verifying.

| parameters  | type   | required | Description |
| ----------- | ------ | -------- | ----------- |
| **message** | String | yes      |             |

**Returns**: {Message} A new instance of a Message

## Message.fromString(str)

**Description**: Instantiate a Message from a string

**Parameters**:

| parameter | type   | required | Description             |
| --------- | ------ | -------- | ----------------------- |
| **str**   | Object | yes      | A string of the message |

Returns : {Message} An instance of Message

## Message.fromJSON(obj)

**Description**: Instantiate a Message from an object

**Parameters**:

| parameter | type   | required | Description                                 |
| --------- | ------ | -------- | ------------------------------------------- |
| **obj**   | Object | yes      | An JSON string or Object with keys: message |

**Returns** : {Message} An instance of Message

## .magicHash()

**Description**: Return a Buffer hash prefixed with MAGIC_BYTES

**Parameters**:

| parameter | type   | required | Description                                 |
| --------- | ------ | -------- | ------------------------------------------- |
| **obj**   | Object | yes      | An JSON string or Object with keys: message |

**Returns**: {string} A base64 encoded compact signature

## .sign()

**Description**: Will sign a message with a given Dash private key.

**Parameters**:

| parameter      | type       | required | Description               |
| -------------- | ---------- | -------- | ------------------------- |
| **privateKey** | PrivateKey | yes      | An instance of PrivateKey |

**Returns**: {String} A base64 encoded compact signature

## .verify()

**Description**: Will return a boolean of the signature is valid for a given dash address.  
If it isn't the specific reason is accessible via the "error" member.

**Parameters**:

| parameter   | type           | required | Description    |
| ----------- | -------------- | -------- | -------------- |
| **address** | Address/String | yes      | A dash address |

**Returns**: {Boolean}

## .toObject() / .toJSON()

**Description**: Will return an object representation of the message

**Parameters**: None.

**Returns**: {Object} A plain object with the Message properties

## .toString()

**Description**:Will return a string representation of the message

**Parameters**: None.

**Returns**: {string} A string representation of the message

## .inspect()

**Description**: Will return a string formatted for the console

**Parameters**: None.

**Returns**: {string} Console representation of this message.

```js
const message = new Message(...);
message.toInspect() // <Message: hello, world>
```
