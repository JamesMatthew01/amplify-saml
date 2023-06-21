import React, {useEffect, useState} from "react";
import {Amplify, Auth, Hub} from "aws-amplify";
import {Flex, View} from '@aws-amplify/ui-react';

import "./App.css";


Amplify.configure({
  Auth: {
    region: "us-east-1",
    userPoolId: "us-east-1_FHaiC3l4F",
    userPoolWebClientId: "5uev9n9e0njp32ik84kpb364j7",
    oauth: {
      domain: "jcmtest.auth.us-east-1.amazoncognito.com",
      scope: ["email", "openid"],
      redirectSignIn: "http://localhost:3000",
      redirectSignOut: "http://localhost:3000",
      responseType: "code"
    }
  }
});

function App() {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    Hub.listen("auth", ({payload: {event, data}}) => {
      switch (event) {
        case "signIn":
        case "cognitoHostedUI":
          setToken("granting...");
          getToken().then(userToken => setToken(userToken.idToken.jwtToken));
          setUsername(data.username);
          break;
        case "signOut":
          setToken(null);
          break;
        case "signIn_failure":
        case "cognitoHostedUI_failure":
          console.log("Sign in failure", data);
          break;
        default:
          break;
      }
    });
  }, []);

  function getToken() {
    return Auth.currentSession()
      .then(session => session)
      .catch(err => console.log(err));
  }

  return (
    <View>
      {token ? <div level = {1}> Welcome - {username} </div> : <div> Welcome - please sign in </div>}
      <Flex>
        {token ?
          <button onClick = {() => Auth.signOut()}> Sign Out </button> : 
          <button onClick = {() => Auth.federatedSignIn()}> Sign In </button> //optionally can add the argument {provider: "azuread"} to go straight to microsoft sign in and skip cognito hosted ui
          }
      </Flex>
    </View>
  );
}

export default App;