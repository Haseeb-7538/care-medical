import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { supabase } from "../../lib/supabase";

export default function ProfileHeader({ 
  profilePhoto, 
  setProfilePhoto 
}) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [photoUploading, setPhotoUploading] = useState(false);

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
      let result;
      
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Camera permission is required to take photos');
          return;
        }
        
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Photo library permission is required to select photos');
          return;
        }
        
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadProfilePhoto(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const uploadProfilePhoto = async (imageAsset) => {
    try {
      setPhotoUploading(true);

      const fileName = `profile_${user.id}_${Date.now()}.jpg`;
      
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

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) {
        throw updateError;
      }

      setProfilePhoto(publicUrl);
      Alert.alert('Success', 'Profile photo updated successfully!');

    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', 'Failed to upload photo. Please try again.');
    } finally {
      setPhotoUploading(false);
    }
  };

  return (
    <View style={{
      alignItems: 'center',
      paddingVertical: 32,
      backgroundColor: colors.cardBackground,
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 24,
      shadowColor: colors.secondary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    }}>
      {/* Profile Photo */}
      <TouchableOpacity
        onPress={handlePhotoSelection}
        style={{
          position: 'relative',
          marginBottom: 16
        }}
        disabled={photoUploading}
      >
        <View style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: colors.background,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 4,
          borderColor: colors.primary,
          overflow: 'hidden'
        }}>
          {photoUploading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : profilePhoto ? (
            <Image
              source={{ uri: profilePhoto }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="person-outline" size={50} color={colors.icon} />
          )}
        </View>
        
        {!photoUploading && (
          <View style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            backgroundColor: colors.primary,
            borderRadius: 20,
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 3,
            borderColor: colors.cardBackground
          }}>
            <Ionicons name="camera-outline" size={20} color="#fff" />
          </View>
        )}
      </TouchableOpacity>

      {/* User Info */}
      <Text style={{
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4
      }}>
        {user?.user_metadata?.full_name || 'User Name'}
      </Text>
      
      <Text style={{
        fontSize: 16,
        color: colors.textSecondary,
        marginBottom: 8
      }}>
        {user?.email}
      </Text>
    </View>
  );
}