/// <reference path="./.sst/platform/config.d.ts" />
import RemotionLambda from "./src/utils/sst-remotion";

export default $config({
  app(input) {
    return {
      name: "RemotionTang",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        // change to a valid region. look up valid regions in utils/hosted-layers.ts
        aws: { region: "eu-central-1" },
      },
    };
  },
  async run() {
    // needs to be in root folder
    // npx remotion bundle rem/index.ts is the default  - in the sst-remtoion.ts file
    // if you want another folder name change the entrypoint in sst-remotion or set bundleCommand in the RemotionLambda below
    // if you use the folder name remotion as intended it might give you bad dev xp for 'remotion' import from node modules

    const rem = new RemotionLambda("RemotionTest", {
      // It seems that keeping to path "" is the only way working
      path: "",
      // force destroy will delete your s3 bucket on command sst remove - good for testing but not recommended for prod
      // forceDestroy: true,  default is false
    });
    const secretTursoUrl = new sst.Secret("TursoUrl");
    const secretTursoToken = new sst.Secret("TursoToken");
    const secretResendKey = new sst.Secret("ResendApiKey");

    new sst.aws.Astro("RemotionWebsite", {
      environment: {
        TURSO_DB_URL: "",
        TURSO_TOKEN: ""
      },
      // set your domain. if you have purchased a route53 domain you can just insert here 
      // if your domain is on another host then good luck 
      // domain: ""
      link: [rem, secretTursoUrl, secretTursoToken, secretResendKey],
      transform: {
        server: {
          // not sure if necessary to have arm64
          architecture: "arm64",
          nodejs: {
            // we don't use sharp for image optimization but we should. Will change from squoosh to default astro sharp when it's not broken anymore
            install: ["sharp", "@libsql/linux-arm64-gnu"],
          },
        },
      },
    });
  },
});
