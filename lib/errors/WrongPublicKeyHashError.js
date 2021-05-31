function WrongPublicKeyHashError(message) {
  this.name = this.constructor.name;
  this.message = message;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack;
  }
}

module.exports = WrongPublicKeyHashError;
