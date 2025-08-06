import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { supabase } from "../../lib/supabase";
import SaveButton from "../common/SaveButton";

export default function ChangePasswordModal({ 
  visible, 
  onClose 
}) {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword === currentPassword) {
      Alert.alert('Error', 'New password must be different from your current password');
      return;
    }

    try {
      setPasswordLoading(true);

      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (verifyError) {
        Alert.alert('Error', 'Current password is incorrect');
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        throw updateError;
      }

      Alert.alert('Success', 'Password changed successfully! You will be logged out for security.', [
        {
          text: 'OK',
          onPress: async () => {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            onClose();

            try {
              const logoutResult = await logout();
              if (logoutResult.success) {
                router.replace("/(auth)/login");
              } else {
                Alert.alert('Warning', 'Password changed but logout failed. Please manually log out for security.');
              }
            } catch (logoutError) {
              console.error('Error during logout after password change:', logoutError);
              Alert.alert('Warning', 'Password changed but logout failed. Please manually log out for security.');
            }
          }
        }
      ]);

    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', error.message || 'Failed to change password. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ 
        flex: 1, 
        backgroundColor: colors.background 
      }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.textSecondary + '20'
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text
          }}>
            Change Password
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1, padding: 20 }}>
          {/* Current Password */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 8
            }}>
              Current Password
            </Text>
            <TextInput
              style={{
                backgroundColor: colors.cardBackground,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: colors.text,
                borderWidth: 1,
                borderColor: colors.textSecondary + '30'
              }}
              placeholder="Enter current password"
              placeholderTextColor={colors.textSecondary}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
          </View>

          {/* New Password */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 8
            }}>
              New Password
            </Text>
            <TextInput
              style={{
                backgroundColor: colors.cardBackground,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: colors.text,
                borderWidth: 1,
                borderColor: colors.textSecondary + '30'
              }}
              placeholder="Enter new password (min 6 characters)"
              placeholderTextColor={colors.textSecondary}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
          </View>

          {/* Confirm Password */}
          <View style={{ marginBottom: 30 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 8
            }}>
              Confirm New Password
            </Text>
            <TextInput
              style={{
                backgroundColor: colors.cardBackground,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: colors.text,
                borderWidth: 1,
                borderColor: colors.textSecondary + '30'
              }}
              placeholder="Confirm new password"
              placeholderTextColor={colors.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <SaveButton
            onPress={handlePasswordChange}
            isLoading={passwordLoading}
            buttonText="Change Password"
          />
        </ScrollView>
      </View>
    </Modal>
  );
}