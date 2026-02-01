import config from "../configs/env";

const validateClientSecret = async (
  clientId: string,
  client_secret: string,
): Promise<boolean> => {
  const expectedSecret = config.ClientIdSecret.get(clientId);

  if (!expectedSecret) {
    return false;
  }

  return expectedSecret === client_secret;
};

export default validateClientSecret;
