import Amplify, { Auth, Hub } from "aws-amplify";
import { awsConfig, signInUrl } from "./auth-config";

class AuthStore {
  constructor(history) {
    Amplify.configure(awsConfig);
    this.history = history;
    this.registerHubListener();
  }

  subscribe = subscriber => {
    this.subscriber = subscriber;
  };
  unsubscribe = () => {
    this.subscriber = null;
  };

  notify = authenticated => {
    if (this.subscriber) this.subscriber(authenticated);
  };
  isAuthenticated = () => {
    return Boolean(Auth.userPool.getCurrentUser());
  };

  getCredentials = async () => {
    try {
      const credentials = await Auth.currentCredentials();
      console.log(credentials)
      this.notify(credentials.authenticated);
      return credentials;

    } catch (err) {
      this.notify(false);
    }
  };

  registerHubListener = () => {
    // const self = this;
    // const hubListener = {
    //   onHubCapsule: async capsule => {
    //     console.log(capsule);
    //     if (capsule.payload.event === "configured") {
    //       self.notify(self.isAuthenticated());
    //     }
    //     if (capsule.payload.event === "cognitoHostedUI") {
    //       self.notify(self.isAuthenticated());
    //       self.history.push("/");
    //     }
    //   }
    // };

    const hubListener = (data) => {
      switch(data.payload.event) {
        case 'signIn':
        console.log('now the user is signed in');
        // const user = data.payload.data;
        break;
        case 'signIn_failure':
        console.log('the user failed to sign in');
        console.log('the error is', data.payload.data);
        break;
        default:
        break;
      }
    }
    Hub.listen("auth", hubListener);
  };

  signIn = () => {
    window.location.assign(signInUrl);
  };

  signOut = async () => {
    try {
      await Auth.signOut();
    } catch (err) {
      console.error(err);
    }
  };
}

export default AuthStore;
