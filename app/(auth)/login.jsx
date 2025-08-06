// React and React Native imports
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Local imports
import logo from "../../assets/images/logo.png";
import EmailInput from "../../components/auth/EmailInput";
import ForgotPasswordLink from "../../components/auth/ForgotPasswordLink";
import PasswordInput from "../../components/auth/PasswordInput";
import SaveButton from "../../components/common/SaveButton";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";

const Login = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const { login, isAuthenticated, isLoading } = useAuth();
  const currentYear = new Date().getFullYear();
  
  // Form state
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    console.log('Login: Authentication state check - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);
    
    if (!isLoading && isAuthenticated) {
      console.log('Login: User already authenticated, redirecting to main app');
      router.replace("/(tabs)/overview");
    } else if (!isLoading && !isAuthenticated) {
      console.log('Login: User not authenticated, staying on login screen');
    } else {
      console.log('Login: Still checking authentication state...');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoginLoading(true);
    console.log("Login: Attempting login for:", email);
    
    const result = await login(email, password);
    
    if (result.success) {
      console.log("Login: Login successful, auth state will handle redirection");
    } else {
      console.log("Login: Login failed:", result.error);
    }
    
    setLoginLoading(false);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.statusBarBackground} />
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Text style={{ color: colors.text, fontSize: 16 }}>Checking authentication...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Don't render if already authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.statusBarBackground} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ paddingHorizontal: 16, paddingVertical: 20 }}>
            {/* Logo and Welcome Text */}
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Image source={logo} style={{ width: 250, height: 150 }} />
              <Text style={{
                fontSize: 28,
                fontWeight: 'bold',
                color: colors.text,
                marginTop: 16,
                textAlign: 'center'
              }}>
                Welcome Back
              </Text>
              <Text style={{
                fontSize: 16,
                color: colors.textSecondary,
                marginTop: 8,
                textAlign: 'center'
              }}>
                Sign in to your account
              </Text>
            </View>

            {/* Login Form */}
            <View style={{
              backgroundColor: colors.cardBackground,
              borderRadius: 24,
              padding: 24,
              shadowColor: colors.secondary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
            }}>
              <EmailInput 
                value={email}
                onChangeText={setEmail}
              />
              
              <PasswordInput
                value={password}
                onChangeText={setPassword}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
              />

              <ForgotPasswordLink />

              <SaveButton
                onPress={handleLogin}
                isLoading={loginLoading}
                buttonText="Sign In"
              />
            </View>

            {/* Footer */}
            <View style={{ alignItems: 'center', marginTop: 32 }}>
              <Text style={{
                fontSize: 12,
                color: colors.textSecondary,
                textAlign: 'center'
              }}>
                © {currentYear} MedTracker. All rights reserved.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;
