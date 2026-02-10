import { GoogleLogin } from "@react-oauth/google";
import { decode as atob } from "base-64";

function decodeJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}

export function Landing() {
  return (
    <GoogleLogin
      onSuccess={credentialResponse => {
        const decoded = decodeJwt(credentialResponse.credential);
        console.log(decoded);
        const userId = decoded.sub;
         console.log(userId);
      }}
      onError={() => console.log("Login Failed")}
    />
  );
}
