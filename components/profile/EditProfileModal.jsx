import { Ionicons } from "@expo/vector-icons";
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

export default function EditProfileModal({ 
  visible, 
  onClose 
}) {
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  const handleProfileUpdate = async () => {
    if (!editFullName.trim() || !editEmail.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editEmail.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setProfileLoading(true);

      const { data: updatedUser, error: updateError } = await supabase.auth.updateUser({
        email: editEmail.trim(),
        data: { 
          full_name: editFullName.trim()
        }
      });

      if (updateError) {
        throw updateError;
      }

      Alert.alert('Success', 'Profile updated successfully!');
      
      setEditFullName("");
      setEditEmail("");
      onClose();

    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
    } finally {
      setProfileLoading(false);
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
            Edit Profile
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1, padding: 20 }}>
          {/* Full Name Input */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 8
            }}>
              Full Name
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
              placeholder={user?.user_metadata?.full_name || "Enter your full name"}
              placeholderTextColor={colors.textSecondary}
              value={editFullName}
              onChangeText={setEditFullName}
            />
          </View>

          {/* Email Input */}
          <View style={{ marginBottom: 30 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 8
            }}>
              Email Address
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
              placeholder={user?.email || "Enter your email"}
              placeholderTextColor={colors.textSecondary}
              value={editEmail}
              onChangeText={setEditEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <SaveButton
            onPress={handleProfileUpdate}
            isLoading={profileLoading}
            buttonText="Update Profile"
            style={{ marginBottom: 20 }}
          />
        </ScrollView>
      </View>
    </Modal>
  );
}