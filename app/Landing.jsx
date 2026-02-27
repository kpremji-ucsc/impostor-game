import { GoogleLogin } from "@react-oauth/google";
import { decode as atob } from "base-64";
import { useRouter } from "expo-router";

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
    const router = useRouter();
  return (
    <GoogleLogin
      onSuccess={credentialResponse => {
        const decoded = decodeJwt(credentialResponse.credential);
        console.log(decoded);
        const userId = decoded.sub;
        localStorage.setItem("userId", userId);
         console.log(userId);
          router.replace({ pathname: "/lobbyUI", params: { preview: "true" } });
      }}
      onError={() => console.log("Login Failed")}
    />
  );

}
