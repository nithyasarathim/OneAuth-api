class EnvError extends Error {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.message = message;
    this.statusCode = 500;
  }
}
export default EnvError;
