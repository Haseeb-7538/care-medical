import { Alert, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { supabase } from "../../lib/supabase";

export default function ForgotPasswordLink() {
  const { colors } = useTheme();

  const handleForgotPassword = () => {
    Alert.prompt(
      "Reset Password",
      "Enter your email address to receive a password reset link:",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Send Reset Link",
          onPress: async (email) => {
            if (!email || !email.trim()) {
              Alert.alert("Error", "Please enter your email address");
              return;
            }

            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
              Alert.alert("Error", "Please enter a valid email address");
              return;
            }

            try {
              const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: 'your-app://reset-password',
              });

              if (error) {
                Alert.alert("Error", error.message);
                return;
              }

              Alert.alert(
                "Reset Link Sent",
                "Please check your email for a password reset link. If you don't see it, check your spam folder.",
                [{ text: "OK" }]
              );
            } catch (error) {
              console.error("Password reset error:", error);
              Alert.alert("Error", "Failed to send reset email. Please try again.");
            }
          }
        }
      ],
      "plain-text",
      "",
      "email-address"
    );
  };

  return (
    <View style={{ alignItems: 'flex-end', marginBottom: 24 }}>
      <TouchableOpacity onPress={handleForgotPassword}>
        <Text style={{
          fontSize: 14,
          color: colors.primary,
          fontWeight: '500'
        }}>
          Forgot Password?
        </Text>
      </TouchableOpacity>
    </View>
  );
}