import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";

export default function SaveButton({
  onPress,
  isLoading = false,
  buttonText = "Save",
  disabled = false,
  style = {},
  ...props
}) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: isLoading || disabled ? colors.textSecondary : colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
        opacity: isLoading || disabled ? 0.7 : 1,
        ...style
      }}
      activeOpacity={0.8}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator color="#fff" size="small" />
          <Text
            style={{
              color: "#fff",
              fontWeight: "600",
              fontSize: 16,
              marginLeft: 8,
            }}
          >
            Saving...
          </Text>
        </View>
      ) : (
        <Text style={{
          color: '#fff',
          fontWeight: '600',
          textAlign: 'center',
          fontSize: 16
        }}>
          {buttonText}
        </Text>
      )}
    </TouchableOpacity>
  );
}