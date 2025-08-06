import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { supabase } from "../../lib/supabase";

export default function TopSellingMedicines() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const [topMedicines, setTopMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTopSellingMedicines = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from("tbl_sale_items")
        .select(`
          quantity,
          tbl_medicines!inner(id, name, unit),
          tbl_sales!inner(created_at)
        `)
        .gte("tbl_sales.created_at", thirtyDaysAgo.toISOString());

      if (error) throw error;

      // Group by medicine and sum quantities
      const medicineStats = {};
      data?.forEach(item => {
        const medicineId = item.tbl_medicines.id;
        if (medicineStats[medicineId]) {
          medicineStats[medicineId].totalQuantity += item.quantity;
        } else {
          medicineStats[medicineId] = {
            id: medicineId,
            name: item.tbl_medicines.name,
            unit: item.tbl_medicines.unit,
            totalQuantity: item.quantity
          };
        }
      });

      // Sort by quantity and take top 5
      const sortedMedicines = Object.values(medicineStats)
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, 5);

      setTopMedicines(sortedMedicines);
    } catch (error) {
      console.error("Error fetching top selling medicines:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopSellingMedicines();
  }, []);

  const renderTopMedicine = ({ item, index }) => (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.background,
      borderRadius: 12,
      marginBottom: 8,
    }}>
      <View style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16
      }}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'white' }}>
          {index + 1}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 2 }}>
          {item.name}
        </Text>
        <Text style={{ fontSize: 14, color: colors.textSecondary }}>
          {item.totalQuantity} {item.unit} sold
        </Text>
      </View>
      <Ionicons name="trending-up" size={20} color={colors.primary} />
    </View>
  );

  if (loading) {
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
      }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>
          Top Selling (30 days)
        </Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', paddingVertical: 20 }}>
          Loading top selling medicines...
        </Text>
      </View>
    );
  }

  if (topMedicines.length === 0) {
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
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>
            Top Selling (30 days)
          </Text>
          <TouchableOpacity onPress={() => router.push('components/overview/sales-analytics')}>
            <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '600' }}>
              View All
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          <Ionicons name="analytics-outline" size={48} color={colors.textSecondary} />
          <Text style={{ color: colors.textSecondary, fontSize: 16, marginTop: 12, textAlign: 'center' }}>
            No sales data available
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 4, textAlign: 'center' }}>
            Sales data will appear here once you make some sales
          </Text>
        </View>
      </View>
    );
  }

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
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>
          Top Selling (30 days)
        </Text>
        <TouchableOpacity onPress={() => router.push('/sales-analytics')}>
          <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '600' }}>
            View All
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={topMedicines}
        renderItem={renderTopMedicine}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
