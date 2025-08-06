import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import { Platform, Text, View } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";

export default function TabsLayout() {
  const { colors } = useTheme();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    console.log('TabsLayout: Authentication state check - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);
    
    // Only redirect when loading is complete and user is not authenticated
    if (!isLoading && !isAuthenticated) {
      console.log('TabsLayout: User not authenticated, redirecting to login');
      router.replace("/(auth)/login");
    } else if (!isLoading && isAuthenticated) {
      console.log('TabsLayout: User authenticated, staying in tabs');
    } else {
      console.log('TabsLayout: Still checking authentication state...');
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
        <Text style={{ color: colors.text, fontSize: 16 }}>Verifying access...</Text>
      </View>
    );
  }

  // Don't render tabs if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  const tabBarBackground = () => (
    <BlurView
      intensity={Platform.OS === "ios" ? 80 : 50}
      tint={colors.mode === "dark" ? "dark" : "light"} // Fixed: use colors.mode
      style={{
        flex: 1,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        overflow: "hidden",
      }}
    />
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, // Hide titles
        tabBarActiveTintColor: colors.primary, // ✅ Correct: #00BFA6
        tabBarInactiveTintColor: colors.tabDefault, // ✅ Fixed: Now theme-specific
        tabBarStyle: {
          position: "absolute",
          bottom: 0, // Stick to bottom
          left: 0,
          right: 0,
          height: 70,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          shadowColor: colors.primary,
          shadowOpacity: 0.12,
          shadowOffset: { width: 0, height: -3 },
          shadowRadius: 10,
          elevation: 12,
          backgroundColor: "transparent",
        },
        tabBarBackground,
      }}
    >
      <Tabs.Screen
        name="overview"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size + (focused ? 4 : 0)}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="sales"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "cart" : "cart-outline"}
              size={size + (focused ? 2 : 0)}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "cube" : "cube-outline"}
              size={size + (focused ? 2 : 0)}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size + (focused ? 2 : 0)}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}




