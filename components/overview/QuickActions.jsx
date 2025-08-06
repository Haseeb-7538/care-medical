import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";

export default function QuickActions({ onAddSale, onAddStock }) {
  const { colors } = useTheme();

  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 16
      }}>
        Quick Actions
      </Text>
      
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between'
      }}>
        <TouchableOpacity
          onPress={onAddSale}
          style={{
            flex: 1,
            backgroundColor: colors.primary,
            paddingVertical: 16,
            paddingHorizontal: 12,
            borderRadius: 16,
            marginRight: 8,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 8,
            alignItems: 'center'
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={{
            color: '#fff',
            fontWeight: '600',
            marginTop: 8,
            textAlign: 'center'
          }}>
            Add Sale
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onAddStock}
          style={{
            flex: 1,
            backgroundColor: colors.secondary,
            paddingVertical: 16,
            paddingHorizontal: 12,
            borderRadius: 16,
            marginLeft: 8,
            shadowColor: colors.secondary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 8,
            alignItems: 'center'
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="cube-outline" size={24} color="#fff" />
          <Text style={{
            color: '#fff',
            fontWeight: '600',
            marginTop: 8,
            textAlign: 'center'
          }}>
            Add Stock
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
