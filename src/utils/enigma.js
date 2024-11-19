import * as secp from '@noble/secp256k1';
import { Buffer } from 'buffer';
import jsSHA3 from 'jssha';

const help = `All the functions inputs are Base64 encoded strings`;
function hash(b64_data) {
  const shaObj = new jsSHA3('SHA3-256', 'B64');
  shaObj.update(b64_data);
  return shaObj.getHash('B64');
}
function cipher(b64_plain_data, b64_password) {
  const pass_buffer = Buffer.from(b64_password, 'base64');
  pass = Buffer.from(new Uint8Array(pass_buffer.buffer, 8, 16));
  key1 = Buffer.from(new Uint8Array(pass_buffer.buffer, 0, 8));
  key2 = Buffer.from(new Uint8Array(pass_buffer.buffer, 24, 8));

  key = new Array(8);
  for (i = 0; i < 8; i += 1) {
    key[i] = key1[i] ^ key2[i];
  }

  let context = blf.key(Buffer.from(pass));
  let ciphered = blf.cfb(context, Buffer.from(key), Buffer.from(b64_plain_data, 'base64'));

  return ciphered;
}
function decipher(b64_ciphered_data, b64_password) {
  const pass_buffer = Buffer.from(b64_password, 'base64');
  pass = Buffer.from(new Uint8Array(pass_buffer.buffer, 8, 16));
  key1 = Buffer.from(new Uint8Array(pass_buffer.buffer, 0, 8));
  key2 = Buffer.from(new Uint8Array(pass_buffer.buffer, 24, 8));

  key = new Array(8);
  for (i = 0; i < 8; i += 1) {
    key[i] = key1[i] ^ key2[i];
  }

  let context = blf.key(Buffer.from(pass));
  let deciphered = blf.cfb(context, Buffer.from(key), Buffer.from(b64_ciphered_data, 'base64'), true);

  return deciphered;
}
function generate_keypair() {
  const privKey = secp.utils.randomPrivateKey();
  const pubKey = secp.getPublicKey(privKey, true);

  return {
    public: array_to_base64(pubKey),
    private: array_to_base64(privKey),
  };
}
function compute_secret(b64_private_key, b64_public_key) {
  const secret = secp.getSharedSecret(base64_to_array(b64_private_key), base64_to_array(b64_public_key), true);

  console.log(secret);

  return array_to_base64(secret);
}
function encrypt(b64_plain_data, b64_private_key, b64_public_key) {
  secret = compute_secret(b64_private_key, b64_public_key);

  return cipher(b64_plain_data, secret);
}
//encrypt_and_sign: "todo",
//decrypt: "todo",
//decrypt_signed: "todo",
//
//sign: "todo",
//is_valid_sign: "todo",

const keypair = {
  generate: generate_keypair(),
  to_b64_string: 'todo',
  from_b64_string: 'todo',
};

function base64_to_string(b64_data) {
  return Buffer.from(b64_data, 'base64').toString();
}
function base64_to_array(b64_data) {
  const buffer = Buffer.from(b64_data, 'base64');

  return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
}
function array_to_base64(array) {
  return Buffer.from(array).toString('base64');
}
function string_to_base64(string) {
  return Buffer.from(string).toString('base64');
}
function shortcode_form_full_key(b64_full_key) {
  const buffer = Buffer.from(b64_full_key, 'base64');
  const public_key = Buffer.from(new Uint8Array(buffer.buffer, 32, 33)).toString('base64');
  const public_hash = this.hash(public_key);
  const hash_buffer = Buffer.from(public_hash, 'base64');
  const code = Buffer.from(new Uint8Array(hash_buffer.buffer, 0, 3));

  return code.toString('hex');
}

export default {
  hash,
  cipher,
  decipher,
  generate_keypair,
  compute_secret,
  encrypt,
  base64_to_string,
  base64_to_array,
  array_to_base64,
  string_to_base64,
  shortcode_form_full_key,
  keypair,
};
