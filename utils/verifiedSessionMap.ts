const VerifiedSessionMap = new Map<
  string,
  { email: string; tokenExpiresAt: number }
>();

export default VerifiedSessionMap;
