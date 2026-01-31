class SSOError extends Error {
  statusCode: number;
  constructor(message: string, status: number) {
    super(message);
    this.message = message;
    this.statusCode = status;
  }
}
export default SSOError;
