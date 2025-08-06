import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";

export default function StickyFooter({
  totalAmount,
  onSave,
  isLoading = false,
  buttonText = "Save",
  currencySymbol = "₹",
  totalLabel = "Total Amount:"
}) {
  const { colors } = useTheme();

  return (
    <View style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 12,
      paddingBottom: 50, // 12px padding + 72px tab bar height
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.textSecondary + '20',
      shadowColor: colors.secondary,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
    }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
      }}>
        <Text style={{
          fontSize: 14,
          fontWeight: '600',
          color: colors.text
        }}>
          {totalLabel}
        </Text>
        <Text style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: colors.primary
        }}>
          {currencySymbol}{totalAmount.toFixed(2)}
        </Text>
      </View>
      <TouchableOpacity
        onPress={onSave}
        style={{
          backgroundColor: colors.primary,
          paddingVertical: 12,
          borderRadius: 12,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
          elevation: 8,
        }}
        activeOpacity={0.8}
        disabled={isLoading}
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
                fontSize: 14,
                marginLeft: 6,
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
    </View>
  );
}
