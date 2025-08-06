import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { supabase } from "../../lib/supabase";

export default function StockValueSummary() {
  const { colors, isDarkMode } = useTheme();
  const [stockValue, setStockValue] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchStockValue = async () => {
    try {
      const { data, error } = await supabase
        .from("tbl_stock_items")
        .select("quantity, unit_price");

      if (error) throw error;

      const totalValue = data?.reduce((sum, item) => 
        sum + (item.quantity * item.unit_price), 0) || 0;

      setStockValue(totalValue);
    } catch (error) {
      console.error("Error fetching stock value:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockValue();
  }, []);

  const formatValue = (value) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`;
    } else {
      return `₹${value.toFixed(0)}`;
    }
  };

  return (
    <View style={{
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      shadowColor: colors.secondary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      flexDirection: 'row',
      alignItems: 'center',
    }}>
      <View style={{
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#10b981',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16
      }}>
        <Ionicons name="wallet" size={28} color="white" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ 
          fontSize: 16, 
          color: colors.textSecondary, 
          marginBottom: 4,
          fontWeight: '500'
        }}>
          Total Stock Value
        </Text>
        <Text style={{ 
          fontSize: 28, 
          fontWeight: 'bold', 
          color: colors.text 
        }}>
          {loading ? "..." : formatValue(stockValue)}
        </Text>
      </View>
    </View>
  );
}
