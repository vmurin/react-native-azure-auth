//@flow

export type ADConfig = {
  client_secret?: string,
  client_id: string,
  redirect_uri?: string,
  tenant?: string,
  prompt?: string,
  token_uri?: string,
  scope: Array<string>
};

export type ADCredentials = {
  [scope: string]: ReactNativeADCredential
};

export type GrantTokenResp = {
  resource: string,
  response: Object
};

export type ReactNativeADConfig = {
  client_id: string,
  redirect_uri?: string,
  authority_host: string,
  tenant: string,
  client_secret: string,
  onSuccess: Function
};

export type ReactNativeADCredential = {
  access_token: string,
  expires_in: number,
  expires_on: number,
  id_token: string,
  not_before: number,
  pwd_exp: string,
  pwd_url: string,
  refresh_token: string,
  scope: string,
  token_type: 'Bearer'
};
