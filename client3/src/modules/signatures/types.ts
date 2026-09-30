export interface Signature {
  id: string;
  name: string;
  // data URL once saved; a Blob while the add form is being filled in
  field?: string | Blob;
}

export interface SignaturesMap {
  [id: string]: Signature;
}
