import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

export default function Index() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    console.log('Index: Authentication state check - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);
    
    // Only proceed with redirection when loading is complete
    if (!isLoading) {
      if (isAuthenticated) {
        console.log('Index: User authenticated, redirecting to main app');
        router.replace("/(tabs)/overview");
      } else {
        console.log('Index: User not authenticated, redirecting to login');
        router.replace("/(auth)/login");
      }
    } else {
      console.log('Index: Still checking authentication state...');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background
      }}>
        <Text style={{ color: colors.text, fontSize: 16 }}>Checking authentication...</Text>
      </View>
    );
  }

  // Return null while redirecting to prevent flash
  return null;
}



