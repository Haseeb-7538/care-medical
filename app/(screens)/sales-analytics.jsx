import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";
import { supabase } from "../../lib/supabase";

export default function SalesAnalytics() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [sortBy, setSortBy] = useState("quantity"); // quantity, revenue, frequency

  const periods = [
    { label: "7 Days", value: 7 },
    { label: "30 Days", value: 30 },
    { label: "90 Days", value: 90 },
  ];

  const sortOptions = [
    { label: "Quantity Sold", value: "quantity" },
    { label: "Revenue", value: "revenue" },
    { label: "Sales Frequency", value: "frequency" },
  ];

  const fetchSalesAnalytics = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - selectedPeriod);

      const { data, error } = await supabase
        .from("tbl_sale_items")
        .select(`
          quantity,
          unit_price,
          subtotal,
          tbl_medicines!inner(id, name, unit),
          tbl_sales!inner(created_at, id)
        `)
        .gte("tbl_sales.created_at", daysAgo.toISOString());

      if (error) throw error;

      // Process data to calculate analytics
      const medicineStats = {};
      data?.forEach(item => {
        const medicineId = item.tbl_medicines.id;
        const saleId = item.tbl_sales.id;
        
        if (medicineStats[medicineId]) {
          medicineStats[medicineId].totalQuantity += item.quantity;
          medicineStats[medicineId].totalRevenue += item.subtotal;
          medicineStats[medicineId].salesCount += 1;
          medicineStats[medicineId].uniqueSales.add(saleId);
        } else {
          medicineStats[medicineId] = {
            id: medicineId,
            name: item.tbl_medicines.name,
            unit: item.tbl_medicines.unit,
            totalQuantity: item.quantity,
            totalRevenue: item.subtotal,
            salesCount: 1,
            uniqueSales: new Set([saleId]),
            averagePrice: item.unit_price
          };
        }
      });

      // Calculate averages and convert to array
      const processedData = Object.values(medicineStats).map(medicine => ({
        ...medicine,
        frequency: medicine.uniqueSales.size,
        averageQuantity: medicine.totalQuantity / medicine.salesCount,
        uniqueSales: undefined
      }));

      // Sort data based on selected sort option
      const sortedData = processedData.sort((a, b) => {
        switch (sortBy) {
          case "quantity":
            return b.totalQuantity - a.totalQuantity;
          case "revenue":
            return b.totalRevenue - a.totalRevenue;
          case "frequency":
            return b.frequency - a.frequency;
          default:
            return b.totalQuantity - a.totalQuantity;
        }
      });

      setSalesData(sortedData);
    } catch (error) {
      console.error("Error fetching sales analytics:", error);
      Alert.alert("Error", "Failed to load sales analytics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSalesAnalytics();
  }, [selectedPeriod, sortBy]);

  const filteredData = salesData.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    } else {
      return `₹${amount.toFixed(0)}`;
    }
  };

  const renderSalesItem = ({ item, index }) => (
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
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <View style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 16
        }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>
            {index + 1}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 2 }}>
            {item.name}
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>
            {item.unit}
          </Text>
        </View>
        <Ionicons name="trending-up" size={24} color={colors.primary} />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 4 }}>
            Quantity Sold
          </Text>
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>
            {item.totalQuantity} {item.unit}
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 4 }}>
            Revenue
          </Text>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#10b981' }}>
            {formatCurrency(item.totalRevenue)}
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 4 }}>
            Sales
          </Text>
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>
            {item.frequency}
          </Text>
        </View>
      </View>

      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
      }}>
        <Text style={{ fontSize: 14, color: colors.textSecondary }}>
          Avg per sale: {item.averageQuantity.toFixed(1)} {item.unit}
        </Text>
        <Text style={{ fontSize: 14, color: colors.textSecondary }}>
          Avg price: ₹{item.averagePrice.toFixed(2)}
        </Text>
      </View>
    </View>
  );

  const renderPeriodButton = (period) => (
    <TouchableOpacity
      key={period.value}
      onPress={() => setSelectedPeriod(period.value)}
      style={{
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: selectedPeriod === period.value ? colors.primary : colors.cardBackground,
        marginRight: 12,
        borderWidth: 1,
        borderColor: selectedPeriod === period.value ? colors.primary : (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'),
      }}
    >
      <Text style={{
        fontSize: 14,
        fontWeight: '600',
        color: selectedPeriod === period.value ? 'white' : colors.text
      }}>
        {period.label}
      </Text>
    </TouchableOpacity>
  );

  const renderSortButton = (option) => (
    <TouchableOpacity
      key={option.value}
      onPress={() => setSortBy(option.value)}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: sortBy === option.value ? colors.primary : colors.cardBackground,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: sortBy === option.value ? colors.primary : (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'),
      }}
    >
      <Text style={{
        fontSize: 12,
        fontWeight: '500',
        color: sortBy === option.value ? 'white' : colors.text
      }}>
        {option.label}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={{ alignItems: 'center', marginTop: 60 }}>
      <Ionicons name="analytics-outline" size={80} color={colors.textSecondary} />
      <Text style={{
        fontSize: 20,
        color: colors.text,
        marginTop: 20,
        textAlign: 'center',
        fontWeight: '600'
      }}>
        {searchQuery ? 'No medicines found' : 'No sales data available'}
      </Text>
      <Text style={{
        fontSize: 16,
        color: colors.textSecondary,
        marginTop: 8,
        textAlign: 'center'
      }}>
        {searchQuery ? 'Try adjusting your search terms' : 'Sales data will appear here once you make some sales'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.background} 
      />
      
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, flex: 1 }}>
          Sales Analytics
        </Text>
      </View>

      {/* Search Bar */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.cardBackground,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderWidth: 1,
          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        }}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={{
              flex: 1,
              marginLeft: 12,
              fontSize: 16,
              color: colors.text,
            }}
            placeholder="Search medicines..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Period Filter */}
      <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
          Time Period
        </Text>
        <View style={{ flexDirection: 'row' }}>
          {periods.map(renderPeriodButton)}
        </View>
      </View>

      {/* Sort Options */}
      <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
          Sort By
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {sortOptions.map(renderSortButton)}
        </View>
      </View>

      {/* Results Summary */}
      {!loading && (
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>
            Showing {filteredData.length} medicines • Last {selectedPeriod} days
          </Text>
        </View>
      )}

      {/* Sales List */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 16, color: colors.textSecondary, fontSize: 16 }}>
            Loading sales analytics...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          renderItem={renderSalesItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchSalesAnalytics(true)}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
