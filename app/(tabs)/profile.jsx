import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { supabase } from "../../lib/supabase";

const Profile = () => {
  const router = useRouter();
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const { logout, user } = useAuth();
  
  // Photo upload states
  const [photoUploading, setPhotoUploading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  
  // Update profile photo when user data changes
  useEffect(() => {
    if (user?.user_metadata?.avatar_url) {
      setProfilePhoto(user.user_metadata.avatar_url);
    }
  }, [user]);
  
  // Initialize profile photo on component mount
  useEffect(() => {
    if (user?.user_metadata?.avatar_url) {
      setProfilePhoto(user.user_metadata.avatar_url);
    }
  }, []);
  
  // Password change states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Edit profile states
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  // Initialize edit profile form when modal opens
  useEffect(() => {
    if (showEditProfileModal) {
      setEditFullName(user?.user_metadata?.full_name || '');
      setEditEmail(user?.email || '');
    }
  }, [showEditProfileModal, user]);

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: async () => {
            const result = await logout();
            
            if (result.success) {
              router.replace("/(auth)/login");
            }
          }
        }
      ]
    );
  };

  const handlePhotoSelection = () => {
    Alert.alert(
      "Update Profile Photo",
      "Choose an option",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Camera", onPress: () => openImagePicker('camera') },
        { text: "Photo Library", onPress: () => openImagePicker('library') }
      ]
    );
  };

  const openImagePicker = async (source) => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to access photos');
        return;
      }

      if (source === 'camera') {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus !== 'granted') {
          Alert.alert('Permission Required', 'Please grant permission to access camera');
          return;
        }
      }

      const options = {
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      };

      let result;
      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled && result.assets[0]) {
        await uploadProfilePhoto(result.assets[0]);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const uploadProfilePhoto = async (imageAsset) => {
    try {
      setPhotoUploading(true);

      // Use simpler filename structure
      const fileName = `profile_${user.id}_${Date.now()}.jpg`;
      
      // Convert image to ArrayBuffer
      const response = await fetch(imageAsset.uri);
      const arrayBuffer = await response.arrayBuffer();

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update user metadata with new avatar URL
      const { data: updatedUser, error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) {
        throw updateError;
      }

      // Update local state immediately
      setProfilePhoto(publicUrl);
      
      Alert.alert('Success', 'Profile photo updated successfully!');

    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Upload Failed', error.message || 'Failed to upload photo. Please try again.');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handlePasswordChange = async () => {
    // Validation
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

    try {
      setPasswordLoading(true);

      // Verify current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (verifyError) {
        Alert.alert('Error', 'Current password is incorrect');
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        throw updateError;
      }

      Alert.alert('Success', 'Password changed successfully!');
      
      // Clear form and close modal
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordModal(false);

    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', error.message || 'Failed to change password. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    // Validation
    if (!editFullName.trim()) {
      Alert.alert('Error', 'Full name is required');
      return;
    }

    if (!editEmail.trim()) {
      Alert.alert('Error', 'Email address is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editEmail.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setProfileLoading(true);

      // Update user metadata and email
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
      
      // Clear form and close modal
      setEditFullName("");
      setEditEmail("");
      setShowEditProfileModal(false);

    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.statusBarBackground} />
      
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 30,
          alignItems: 'center'
        }}>
          {/* Profile Photo */}
          <TouchableOpacity
            onPress={handlePhotoSelection}
            disabled={photoUploading}
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
              position: 'relative'
            }}
          >
            {profilePhoto ? (
              <Image 
                source={{ uri: `${profilePhoto}?t=${Date.now()}` }} 
                style={{ 
                  width: 100, 
                  height: 100, 
                  borderRadius: 50 
                }}
              />
            ) : (
              <Ionicons name="person" size={50} color="#FFFFFF" />
            )}
            
            {/* Upload indicator */}
            {photoUploading && (
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderRadius: 50,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <ActivityIndicator color="#FFFFFF" size="small" />
              </View>
            )}
            
            {/* Camera icon overlay */}
            <View style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              backgroundColor: colors.primary,
              borderRadius: 15,
              width: 30,
              height: 30,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: colors.background
            }}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 4
          }}>
            {user?.user_metadata?.full_name || 'Admin User'}
          </Text>
          <Text style={{
            fontSize: 16,
            color: colors.textSecondary
          }}>
            {user?.email || 'Care Medical & Pharma Clinic'}
          </Text>
        </View>

        {/* Settings Section */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 16
          }}>
            Settings
          </Text>

          {/* Change Password */}
          <TouchableOpacity
            onPress={() => setShowPasswordModal(true)}
            style={{
              backgroundColor: colors.cardBackground,
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
              shadowColor: colors.secondary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
            activeOpacity={0.7}
          >
            <View style={{
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              <Ionicons 
                name="lock-closed-outline" 
                size={24} 
                color={colors.icon} 
                style={{ marginRight: 16 }}
              />
              <View>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.text
                }}>
                  Change Password
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginTop: 2
                }}>
                  Update your account password
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Edit Profile */}
          <TouchableOpacity
            onPress={() => setShowEditProfileModal(true)}
            style={{
              backgroundColor: colors.cardBackground,
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
              shadowColor: colors.secondary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
            activeOpacity={0.7}
          >
            <View style={{
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              <Ionicons 
                name="person-outline" 
                size={24} 
                color={colors.icon} 
                style={{ marginRight: 16 }}
              />
              <View>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.text
                }}>
                  Edit Profile
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginTop: 2
                }}>
                  Update your personal information
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Theme Toggle */}
          <View style={{
            backgroundColor: colors.cardBackground,
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            shadowColor: colors.secondary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Ionicons 
                  name={isDarkMode ? "moon" : "sunny"} 
                  size={24} 
                  color={colors.icon} 
                  style={{ marginRight: 16 }}
                />
                <View>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: colors.text
                  }}>
                    Dark Mode
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: colors.textSecondary,
                    marginTop: 2
                  }}>
                    {isDarkMode ? 'Dark theme enabled' : 'Light theme enabled'}
                  </Text>
                </View>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.textSecondary + '30', true: colors.primary + '50' }}
                thumbColor={isDarkMode ? colors.primary : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              backgroundColor: colors.cardBackground,
              borderRadius: 16,
              padding: 20,
              shadowColor: colors.secondary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
            activeOpacity={0.7}
          >
            <View style={{
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              <Ionicons 
                name="log-out-outline" 
                size={24} 
                color="#FF6B6B" 
                style={{ marginRight: 16 }}
              />
              <View>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#FF6B6B'
                }}>
                  Logout
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginTop: 2
                }}>
                  Sign out of your account
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.textSecondary + '20'
          }}>
            <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: colors.text
            }}>
              Change Password
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }}>
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
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.cardBackground,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: colors.textSecondary + '30'
              }}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.icon} />
                <TextInput
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 16,
                    color: colors.text
                  }}
                  placeholder="Enter current password"
                  placeholderTextColor={colors.textSecondary}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrentPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={{ padding: 4 }}
                >
                  <Ionicons
                    name={showCurrentPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={colors.icon}
                  />
                </TouchableOpacity>
              </View>
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
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.cardBackground,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: colors.textSecondary + '30'
              }}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.icon} />
                <TextInput
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 16,
                    color: colors.text
                  }}
                  placeholder="Enter new password (min 6 characters)"
                  placeholderTextColor={colors.textSecondary}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={{ padding: 4 }}
                >
                  <Ionicons
                    name={showNewPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={colors.icon}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={{ marginBottom: 32 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 8
              }}>
                Confirm New Password
              </Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.cardBackground,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: colors.textSecondary + '30'
              }}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.icon} />
                <TextInput
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 16,
                    color: colors.text
                  }}
                  placeholder="Confirm new password"
                  placeholderTextColor={colors.textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ padding: 4 }}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={colors.icon}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Change Password Button */}
            <TouchableOpacity
              onPress={handlePasswordChange}
              disabled={passwordLoading}
              style={{
                backgroundColor: colors.primary,
                paddingVertical: 16,
                borderRadius: 12,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 8,
                opacity: passwordLoading ? 0.7 : 1,
                marginBottom: 20
              }}
              activeOpacity={0.8}
            >
              {passwordLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={{
                  color: '#FFFFFF',
                  fontSize: 18,
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  Change Password
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditProfileModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditProfileModal(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.textSecondary + '20'
          }}>
            <TouchableOpacity onPress={() => setShowEditProfileModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: colors.text
            }}>
              Edit Profile
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }}>
            {/* Full Name */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 8
              }}>
                Full Name
              </Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.cardBackground,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: colors.textSecondary + '30'
              }}>
                <Ionicons name="person-outline" size={20} color={colors.icon} />
                <TextInput
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 16,
                    color: colors.text
                  }}
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.textSecondary}
                  value={editFullName}
                  onChangeText={setEditFullName}
                />
              </View>
            </View>

            {/* Email Address */}
            <View style={{ marginBottom: 32 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 8
              }}>
                Email Address
              </Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.cardBackground,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: colors.textSecondary + '30'
              }}>
                <Ionicons name="mail-outline" size={20} color={colors.icon} />
                <TextInput
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 16,
                    color: colors.text
                  }}
                  placeholder="Enter your email address"
                  placeholderTextColor={colors.textSecondary}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Update Profile Button */}
            <TouchableOpacity
              onPress={handleProfileUpdate}
              disabled={profileLoading}
              style={{
                backgroundColor: colors.primary,
                paddingVertical: 16,
                borderRadius: 12,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 8,
                opacity: profileLoading ? 0.7 : 1,
                marginBottom: 20
              }}
              activeOpacity={0.8}
            >
              {profileLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={{
                  color: '#FFFFFF',
                  fontSize: 18,
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  Update Profile
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default Profile;
