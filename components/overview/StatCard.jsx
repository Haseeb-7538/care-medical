import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";

export default function StatCard({ title, value, icon, color, onPress }) {
  const { colors } = useTheme();
  
  const CardContent = (
    <View style={{
      flex: 1,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 16,
      marginRight: 12,
      shadowColor: colors.secondary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8
      }}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={{
          marginLeft: 8,
          fontSize: 14,
          fontWeight: '600',
          color: colors.text
        }}>
          {title}
        </Text>
      </View>
      <Text style={{
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text
      }}>
        {value}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
}
