import enigma from '@/utils/enigma';
import Blowfish from '@/utils/blowfish';

const localStorageKey = 'ecotaxi-user';
const rpName = 'Ecotaxi';
const userName = 'Ecotaxi User';
const rpId = IS_PRODUCTION ? location.origin.href : 'localhost';

const EcoTaxi = {
  generateUserKeypair: () => enigma.generate_keypair(),
  packUserStorage: (name, keypair, rooms = [], contacts = {}) => {
    const combinedKeypair = (keypair) => {
      const combined = new Uint8Array(32 + 33);
      combined.set(Buffer.from(keypair.private, 'base64'), 0);
      combined.set(Buffer.from(keypair.public, 'base64'), 32);
      return Buffer.from(combined).toString('base64');
    };
    return [[name, combinedKeypair(keypair)], rooms, contacts];
  },
  buildUserLink: (keypair, baseUrl) => {
    const generateUserLinkPath = (keypair) => `/chat/${Buffer.from(keypair.public, 'base64').toString('hex')}`;

    const generateUserLink = (baseLink, keypair) => `${baseLink}${generateUserLinkPath(keypair)}`;

    return generateUserLink(baseUrl, keypair);
  },
  registerUser: async (name, keypair, baseUrl) => {
    const signUser = (name, keypair, baseUrl) =>
      graphqlRequest(baseUrl, {
        query: 'mutation SignUp($name: String!, $keypair: InputKeyPair) {\n  userSignUp(name: $name, keypair: $keypair) {\n    name\n    keys {\n      private_key\n      public_key\n    }\n  }\n}',
        variables: {
          name: name,
          keypair: {
            publicKey: Buffer.from(keypair.public, 'base64').toString('hex'),
            privateKey: Buffer.from(keypair.private, 'base64').toString('hex'),
          },
        },
      });

    return await signUser(name, keypair, baseUrl);
  },
  sendMessage: async (baseUrl, myKeyPair, peerPublicKey_hex, text) => {
    const timestamp = Math.floor(Date.now() / 1000);

    const response = graphqlRequest(baseUrl, {
      query: `
          mutation ($keypair: InputKeyPair!, $peer: PublicKey!, $text: String!, $timestamp: Int!) {
            chatSendText(myKeypair: $keypair, peerPublicKey: $peer, text: $text, timestamp: $timestamp) {
              id
              index
            }
          }
        `,
      variables: {
        keypair: {
          publicKey: Buffer.from(myKeyPair.public, 'base64').toString('hex'),
          privateKey: Buffer.from(myKeyPair.private, 'base64').toString('hex'),
        },
        peer: peerPublicKey_hex,
        text: text,
        timestamp: timestamp,
      },
    });
    return await response;
  },
  getMessages: async (baseUrl, myKeyPair, peerPublicKey_hex, amount, beforeIndex) => {
    const response = await graphqlRequest(baseUrl, {
      query: `
          query ($keypair: InputKeyPair!, $peer: PublicKey!, $lastIndex: Int, $amount: Int!) {
            chatRead(myKeypair: $keypair, peerPublicKey: $peer, amount: $amount, before: $lastIndex) {
              id
              index
              timestamp
              author {
                publicKey
                name
              }
              content {
                __typename
                ... on FileContent {
                  url
                  type
                  sizeBytes
                  initialName
                }
                ... on TextContent {
                 text
                }
              }
            }
          }
        `,
      variables: {
        keypair: {
          publicKey: Buffer.from(myKeyPair.public, 'base64').toString('hex'),
          privateKey: Buffer.from(myKeyPair.private, 'base64').toString('hex'),
        },
        peer: peerPublicKey_hex,
        amount: amount,
        lastIndex: beforeIndex,
      },
    });

    return response?.data?.chatRead;
  },
  saveToStorage: (user, data) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('data', JSON.stringify(data));
  },
  isDataStored: () => {
    return !!localStorage.getItem(localStorageKey);
  },
  getData: async (pinCode) => {
    try {
      const data = JSON.parse(localStorage.getItem(localStorageKey));
      const blf = new Blowfish(pinCode);
      const passkey = data.passkey;
      const encrypted = blf.base64Decode(passkey.id);
      let decryptedId = blf.trimZeros(blf.decrypt(encrypted));
      passkey.id = parseBase64url(decryptedId);
      console.log('decrypted passkey', passkey);

      const credentials = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          rpId,
          allowCredentials: [passkey], //
          userVerification: 'discouraged',
          timeout: 60000,
        },
      });

      console.log('credentials', credentials);

      const storageEncryptionKey = atob(toBase64url(credentials.response.userHandle));
      console.log('decryptin key', storageEncryptionKey);
      
      const blf2 = new Blowfish(storageEncryptionKey, "cbc");
      let decryptedData = JSON.parse(blf2.trimZeros(blf2.decrypt(blf2.base64Decode(data.encryptedData), pinCode)));
      console.log('decryptedData', decryptedData);
      return decryptedData;
    } catch (error) {
      console.log(error);
      //localStorage.removeItem(localStorageKey)
      return null;
    }
  },
  registerPassKey: async (pinCode, payload) => {
    const encryptionString = enigma.generate_keypair().private;

    const registration = await navigator.credentials.create({
      publicKey: {
        challenge: new Uint8Array(32),
        rp: {
          name: rpName,
          id: rpId,
        },
        user: {
          id: new Uint8Array(Buffer.from(encryptionString)),
          name: userName,
          displayName: userName,
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -8 },
          { type: 'public-key', alg: -7 },
          { type: 'public-key', alg: -257 },
          { type: 'public-key', alg: -37 },
          { type: 'public-key', alg: -35 },
          { type: 'public-key', alg: -258 },
          { type: 'public-key', alg: -38 },
          { type: 'public-key', alg: -36 },
          { type: 'public-key', alg: -259 },
          { type: 'public-key', alg: -39 },
        ],
        timeout: 60000,
        attestation: 'none',
        authenticatorSelection: {
          residentKey: 'discouraged',
          requireResidentKey: false,
          userVerification: 'discouraged',
        },
      },
    });

    const blf = new Blowfish(pinCode);
    const passkey = {
      id: blf.base64Encode(blf.encrypt(registration.id)),
      type: registration.type,
      transports: registration.response.getTransports(),
    };       
    console.log(passkey);

    const blf2 = new Blowfish(encryptionString, "cbc");
    const store = {
      passkey,
      encryptedData: blf.base64Encode(
        blf2.encrypt(
          JSON.stringify({
            keyPair: enigma.generate_keypair(),
            payload,
          }),
          pinCode
        )
      ),
    };
    console.log('store', store);

    localStorage.setItem(localStorageKey, JSON.stringify(store));
  },
};

function toBuffer(txt) {
  return Uint8Array.from(txt, (c) => c.charCodeAt(0)).buffer;
}
function parseBase64url(txt) {
  txt = txt.replaceAll('-', '+').replaceAll('_', '/'); // base64url -> base64
  return toBuffer(atob(txt));
}
function toBase64url(buffer) {
  const txt = btoa(parseBuffer(buffer)); // base64
  return txt.replaceAll('+', '-').replaceAll('/', '_');
}
function parseBuffer(buffer) {
  return String.fromCharCode(...new Uint8Array(buffer));
}
const graphqlRequest = async (baseUrl, graphql) => {
  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    // mode: "cors", // no-cors, *cors, same-origin
    // cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    // credentials: "same-origin", // include, *same-origin, omit
    body: JSON.stringify(graphql),
    redirect: 'follow',
  };

  return fetch(`${baseUrl}/naive_api`, requestOptions)
    .catch((error) => console.error(error))
    .then((response) => response.json());
};

export default EcoTaxi;
