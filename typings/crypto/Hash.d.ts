export interface HashFunction {
  blocksize: number;
  (buf: Buffer): Buffer;
}

export namespace Hash {
  export const sha1: HashFunction;
  export const sha256: HashFunction;
  export const sha256sha256: HashFunction;
  export const x11: HashFunction;
  export const ripemd160: HashFunction;
  export const sha256ripemd160: HashFunction;
  export const sha512: HashFunction;
  export function hmac(hashf: HashFunction, data: Buffer, key: Buffer): Buffer;
  export function sha256hmac(data: Buffer, key: Buffer): Buffer;
  export function sha512hmac(data: Buffer, key: Buffer): Buffer;
}
