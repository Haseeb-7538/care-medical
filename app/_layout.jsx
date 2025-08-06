import { Stack } from "expo-router";
import { Text, View } from "react-native";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";
import "../global.css";

function LoadingScreen() {
  const { colors } = useTheme();
  
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background
    }}>
      <Text style={{ color: colors.text, fontSize: 16 }}>Initializing app...</Text>
    </View>
  );
}

function AppContent() {
  const { isLoading } = useAuth();
  
  // Show loading screen while auth is being initialized
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}






