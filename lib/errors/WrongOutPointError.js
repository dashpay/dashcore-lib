function WrongOutPointError(message) {
  this.name = 'WrongOutPointError';
  this.message = message;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = (new Error()).stack;
  }
}

module.exports = WrongOutPointError;
