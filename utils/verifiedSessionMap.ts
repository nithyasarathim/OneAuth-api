const VerifiedSessionMap = new Map<
  string,
  { email: string; expiresAt: number }
>();

export default VerifiedSessionMap;
