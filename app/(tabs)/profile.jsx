// React and React Native imports
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Local imports
import ChangePasswordModal from "../../components/profile/ChangePasswordModal";
import EditProfileModal from "../../components/profile/EditProfileModal";
import ProfileHeader from "../../components/profile/ProfileHeader";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";

const Profile = () => {
  const router = useRouter();
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const { logout, user } = useAuth();
  
  // Modal states
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Photo state
  const [profilePhoto, setProfilePhoto] = useState(null);
  
  // Update profile photo when user data changes
  useEffect(() => {
    if (user?.user_metadata?.avatar_url) {
      setProfilePhoto(user.user_metadata.avatar_url);
    }
  }, [user]);

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

  const ProfileMenuItem = ({ icon, title, onPress, showArrow = true, rightComponent }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: colors.cardBackground,
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 16,
        shadowColor: colors.secondary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
      activeOpacity={0.7}
    >
      <View style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
      }}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      
      <Text style={{
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: colors.text
      }}>
        {title}
      </Text>
      
      {rightComponent || (showArrow && (
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      ))}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.statusBarBackground} />
      
      <ScrollView 
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <ProfileHeader 
          profilePhoto={profilePhoto}
          setProfilePhoto={setProfilePhoto}
        />

        {/* Menu Items */}
        <View style={{ paddingVertical: 24 }}>
          <ProfileMenuItem
            icon="person-outline"
            title="Edit Profile"
            onPress={() => setShowEditProfileModal(true)}
          />
          
          <ProfileMenuItem
            icon="lock-closed-outline"
            title="Change Password"
            onPress={() => setShowPasswordModal(true)}
          />
          
          <ProfileMenuItem
            icon={isDarkMode ? "moon" : "sunny"}
            title="Dark Mode"
            onPress={toggleTheme}
            showArrow={false}
            rightComponent={
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.textSecondary + '30', true: colors.primary + '50' }}
                thumbColor={isDarkMode ? colors.primary : '#f4f3f4'}
                ios_backgroundColor={colors.textSecondary + '30'}
              />
            }
          />
          
          <ProfileMenuItem
            icon="log-out-outline"
            title="Logout"
            onPress={handleLogout}
          />
        </View>

        {/* Footer */}
        <Footer paddingBottom={100} />
      </ScrollView>

      {/* Modals */}
      <EditProfileModal
        visible={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
      />
      
      <ChangePasswordModal
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </SafeAreaView>
  );
};

export default Profile;
