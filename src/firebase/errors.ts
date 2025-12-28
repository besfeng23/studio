export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  constructor(public context: SecurityRuleContext) {
    const deniedMessage = `Firestore Permission Denied: The following request was denied by Firestore Security Rules: \n${JSON.stringify(context, null, 2)}`;
    super(deniedMessage);
    this.name = 'FirestorePermissionError';
  }
}
