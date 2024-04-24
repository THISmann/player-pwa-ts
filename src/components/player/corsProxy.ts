// corsProxy.ts
const corsProxyUrl = 'https://cors-anywhere.herokuapp.com/';

export const addCorsProxy = (url: string): string => {
  return corsProxyUrl + url;
};
