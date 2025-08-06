import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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

export default function StockOverview() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchStockItems = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const { data, error } = await supabase
        .from("tbl_stock_items")
        .select(`
          id,
          quantity,
          unit_price,
          subtotal,
          tbl_medicines!inner(name, unit),
          tbl_stock!inner(
            created_at,
            tbl_suppliers!inner(name)
          )
        `)
        .order("quantity", { ascending: false });

      if (error) throw error;
      setStockItems(data || []);
    } catch (error) {
      console.error("Error fetching stock items:", error);
      Alert.alert("Error", "Failed to load stock items");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStockItems();
  }, []);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return stockItems;
    }
    return stockItems.filter(item =>
      item.tbl_medicines.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      item.tbl_stock.tbl_suppliers.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [stockItems, searchQuery]);

  const renderStockItem = ({ item }) => (
    <View style={{
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: colors.secondary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 4
          }}>
            {item.tbl_medicines.name}
          </Text>
          <Text style={{
            fontSize: 14,
            color: colors.textSecondary,
            marginBottom: 8
          }}>
            Supplier: {item.tbl_stock.tbl_suppliers.name}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{
              fontSize: 14,
              color: colors.textSecondary
            }}>
              Quantity: {item.quantity} {item.tbl_medicines.unit || 'units'}
            </Text>
            <Text style={{
              fontSize: 14,
              color: colors.textSecondary
            }}>
              Unit Price: ₹{item.unit_price}
            </Text>
          </View>
        </View>
        <View style={{
          backgroundColor: item.quantity < 10 ? '#fef3c7' : '#d1fae5',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 8,
          marginLeft: 12
        }}>
          <Text style={{
            fontSize: 12,
            fontWeight: '600',
            color: item.quantity < 10 ? '#d97706' : '#059669'
          }}>
            {item.quantity < 10 ? 'Low Stock' : 'In Stock'}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.statusBarBackground} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 16, fontSize: 16, color: colors.textSecondary }}>
            Loading stock items...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.statusBarBackground} />
      
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            padding: 8,
            marginRight: 12,
            borderRadius: 8,
            backgroundColor: colors.cardBackground
          }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: colors.text,
          flex: 1
        }}>
          Stock Overview ({filteredItems.length})
        </Text>
      </View>

      {/* Search Bar */}
      <View style={{
        paddingHorizontal: 20,
        marginBottom: 16
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.cardBackground,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={{
              flex: 1,
              marginLeft: 12,
              fontSize: 16,
              color: colors.text
            }}
            placeholder="Search medicines or suppliers..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Stock Items List */}
      <FlatList
        data={filteredItems}
        renderItem={renderStockItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchStockItems(true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Ionicons name="cube-outline" size={64} color={colors.textSecondary} />
            <Text style={{
              fontSize: 18,
              color: colors.textSecondary,
              marginTop: 16,
              textAlign: 'center'
            }}>
              {searchQuery ? 'No stock items found' : 'No stock items available'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}