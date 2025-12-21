import ImageKit from "imagekit";
import config from "./env";

const imagekit = new ImageKit({
  publicKey: config.CdnPublicKey,
  privateKey: config.CdnPrivateKey,
  urlEndpoint: config.CdnPublicUrl,
});

export default imagekit;
