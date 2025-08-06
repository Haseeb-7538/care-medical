import { Text, View } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import SaveButton from "./SaveButton";

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
      <SaveButton
        onPress={onSave}
        isLoading={isLoading}
        buttonText={buttonText}
        style={{ paddingVertical: 12 }}
      />
    </View>
  );
}

