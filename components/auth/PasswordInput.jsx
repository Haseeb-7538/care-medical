import { Ionicons } from "@expo/vector-icons";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";

export default function PasswordInput({ 
  value, 
  onChangeText, 
  showPassword, 
  onTogglePassword 
}) {
  const { colors } = useTheme();

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8
      }}>
        Password
      </Text>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
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
          placeholder="Enter your password"
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          onPress={onTogglePassword}
          style={{ padding: 4 }}
        >
          <Ionicons
            name={showPassword ? "eye-outline" : "eye-off-outline"}
            size={20}
            color={colors.icon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}