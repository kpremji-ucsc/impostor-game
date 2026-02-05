import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { AuthProvider} from"@/context/auth";

// _layout file is found by expo router automatically to create a stack for pages traversed.
// it keeps track of visited pages and pops or appends during travel forwards and back.

export default function RootLayout() {
    return(
        <PaperProvider>
            <Stack />
        </PaperProvider>

    );
}