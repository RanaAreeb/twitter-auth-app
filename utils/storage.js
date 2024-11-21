// utils/storage.js
let codeVerifier = null;

export const setCodeVerifier = (verifier) => {
  codeVerifier = verifier;
};

export const getCodeVerifier = () => {
  return codeVerifier;
};
