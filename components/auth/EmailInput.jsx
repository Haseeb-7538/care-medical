import { Ionicons } from "@expo/vector-icons";
import { Text, TextInput, View } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";

export default function EmailInput({ value, onChangeText }) {
  const { colors } = useTheme();

  return (
    <View style={{ marginBottom: 20 }}>
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
        backgroundColor: colors.background,
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
          placeholder="Enter your email"
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
    </View>
  );
}