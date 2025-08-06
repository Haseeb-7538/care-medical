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

export default function LowStock() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchLowStockItems = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const { data, error } = await supabase
        .from("tbl_stock_items")
        .select(`
          id,
          quantity,
          unit_price,
          medicine_id,
          tbl_medicines!inner(name, unit),
          tbl_stock!inner(
            created_at,
            tbl_suppliers!inner(name, phone, email)
          )
        `)
        .lt("quantity", 10)
        .order("quantity", { ascending: true });

      if (error) throw error;

      // Group by medicine to show total stock per medicine
      const medicineGroups = {};
      data?.forEach(item => {
        const medicineId = item.medicine_id;
        if (medicineGroups[medicineId]) {
          medicineGroups[medicineId].totalQuantity += item.quantity;
          medicineGroups[medicineId].suppliers.push({
            name: item.tbl_stock.tbl_suppliers.name,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            contact: item.tbl_stock.tbl_suppliers.phone,
            email: item.tbl_stock.tbl_suppliers.email
          });
        } else {
          medicineGroups[medicineId] = {
            id: medicineId,
            name: item.tbl_medicines.name,
            unit: item.tbl_medicines.unit,
            totalQuantity: item.quantity,
            suppliers: [{
              name: item.tbl_stock.tbl_suppliers.name,
              quantity: item.quantity,
              unitPrice: item.unit_price,
              contact: item.tbl_stock.tbl_suppliers.phone,
              email: item.tbl_stock.tbl_suppliers.email
            }]
          };
        }
      });

      // Filter out medicines that have total quantity >= 10
      const lowStockMedicines = Object.values(medicineGroups).filter(
        medicine => medicine.totalQuantity < 10
      );

      setLowStockItems(lowStockMedicines);
    } catch (error) {
      console.error("Error fetching low stock items:", error);
      Alert.alert("Error", "Failed to load low stock items");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLowStockItems();
  }, []);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return lowStockItems;
    }
    return lowStockItems.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      item.suppliers.some(supplier => 
        supplier.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
    );
  }, [lowStockItems, searchQuery]);

  const renderLowStockItem = ({ item }) => (
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
      borderLeftWidth: 4,
      borderLeftColor: '#f59e0b'
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 4
          }}>
            {item.name}
          </Text>
          <Text style={{
            fontSize: 14,
            color: '#f59e0b',
            fontWeight: '600'
          }}>
            Total Stock: {item.totalQuantity} {item.unit || 'units'}
          </Text>
        </View>
        <View style={{
          backgroundColor: '#fef3c7',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 8,
        }}>
          <Text style={{
            fontSize: 12,
            fontWeight: '600',
            color: '#d97706'
          }}>
            LOW STOCK
          </Text>
        </View>
      </View>

      {/* Suppliers */}
      <Text style={{
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8
      }}>
        Available from:
      </Text>
      {item.suppliers.map((supplier, index) => (
        <View key={index} style={{
          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          borderRadius: 8,
          padding: 12,
          marginBottom: index < item.suppliers.length - 1 ? 8 : 0
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.text,
              flex: 1
            }}>
              {supplier.name}
            </Text>
            <Text style={{
              fontSize: 14,
              color: colors.textSecondary
            }}>
              {supplier.quantity} units @ ₹{supplier.unitPrice}
            </Text>
          </View>
          {supplier.contact && (
            <Text style={{
              fontSize: 12,
              color: colors.textSecondary,
              marginTop: 4
            }}>
              📞 {supplier.contact}
            </Text>
          )}
        </View>
      ))}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.statusBarBackground} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 16, color: colors.textSecondary }}>Loading low stock items...</Text>
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
          Low Stock Alert ({filteredItems.length})
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

      {/* Low Stock Items List */}
      <FlatList
        data={filteredItems}
        renderItem={renderLowStockItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchLowStockItems(true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Ionicons name="checkmark-circle-outline" size={64} color={colors.primary} />
            <Text style={{
              fontSize: 18,
              color: colors.text,
              marginTop: 16,
              textAlign: 'center',
              fontWeight: '600'
            }}>
              Great! No Low Stock Items
            </Text>
            <Text style={{
              fontSize: 14,
              color: colors.textSecondary,
              marginTop: 8,
              textAlign: 'center'
            }}>
              All medicines are well stocked
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
