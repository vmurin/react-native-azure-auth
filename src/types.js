//@flow

export type ADConfig = {
  client_secret : string | null,
  client_id : string | null,
  redirect_uri : string | null,
  tenant : string | null,
  prompt : string | null,
  resources : Array<string> | null,
  token_uri: string | null,
  scope: Array<string> | null
};

export type ADCredentials = {
  [key:string] : ReactNativeADCredential | null
}

export type GrantTokenResp = {
  resource : string,
  response : Object
};

export type ReactNativeADConfig = {
  client_id : string,
  redirect_uri? : string,
  authority_host : string,
  tenant : string,
  client_secret : string,
  resources : any,
  onSuccess : Function,
};

export type ReactNativeADCredential = {
  access_token : string,
  expires_in : number,
  expires_on : number,
  id_token : string,
  not_before : number,
  pwd_exp : string,
  pwd_url : string,
  refresh_token : string,
  resource : string,
  scope : string,
  token_type : 'Bearer'
};
