import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";
import { supabase } from "../../lib/supabase";

export default function ExpiryManagement() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const [expiringItems, setExpiringItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchExpiringItems = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      setError(null);

      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const { data, error } = await supabase
        .from("tbl_stock_items")
        .select(`
          id,
          quantity,
          expiry_date,
          batch_number,
          tbl_medicines!inner(name, unit)
        `)
        .not("expiry_date", "is", null)
        .lte("expiry_date", thirtyDaysFromNow.toISOString().split('T')[0])
        .gt("quantity", 0)
        .order("expiry_date", { ascending: true });

      if (error) {
        setError(error.message);
        throw error;
      }
      
      setExpiringItems(data || []);
    } catch (error) {
      console.error("Error fetching expiring items:", error);
      setError(error.message);
      Alert.alert("Error", "Failed to load expiry data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExpiringItems();
  }, []);

  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getUrgencyLevel = (daysLeft) => {
    if (daysLeft < 0) return 'expired';
    if (daysLeft <= 7) return 'urgent';
    return 'warning';
  };

  const groupItemsByUrgency = (items) => {
    const groups = {
      expired: [],
      urgent: [],
      warning: []
    };

    items.forEach(item => {
      const daysLeft = getDaysUntilExpiry(item.expiry_date);
      const urgency = getUrgencyLevel(daysLeft);
      groups[urgency].push({ ...item, daysLeft });
    });

    return groups;
  };

  const filteredItems = expiringItems.filter(item =>
    item.tbl_medicines.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedItems = groupItemsByUrgency(filteredItems);

  const renderExpiryItem = ({ item }) => {
    const isExpired = item.daysLeft < 0;
    const isUrgent = item.daysLeft <= 7 && item.daysLeft >= 0;

    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: isExpired 
          ? (isDarkMode ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2') 
          : isUrgent 
          ? (isDarkMode ? 'rgba(245, 158, 11, 0.1)' : '#fef3c7') 
          : (isDarkMode ? 'rgba(59, 130, 246, 0.1)' : '#f0f9ff'),
        borderRadius: 12,
        marginBottom: 8,
        borderLeftWidth: 3,
        borderLeftColor: isExpired ? '#ef4444' : isUrgent ? '#f59e0b' : colors.primary
      }}>
        <Ionicons 
          name={isExpired ? "alert-circle" : "time-outline"} 
          size={20} 
          color={isExpired ? '#ef4444' : isUrgent ? '#f59e0b' : colors.primary} 
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ 
            fontSize: 16, 
            fontWeight: '600', 
            color: colors.text,
            marginBottom: 2
          }}>
            {item.tbl_medicines.name}
          </Text>
          <Text style={{ 
            fontSize: 14, 
            color: colors.textSecondary 
          }}>
            {item.quantity} {item.tbl_medicines.unit} • {item.batch_number || 'No batch'}
          </Text>
          <Text style={{ 
            fontSize: 12, 
            color: colors.textSecondary,
            marginTop: 2
          }}>
            Expires: {new Date(item.expiry_date).toLocaleDateString()}
          </Text>
        </View>
        <Text style={{
          fontSize: 14,
          fontWeight: '600',
          color: isExpired ? '#ef4444' : isUrgent ? '#f59e0b' : colors.primary
        }}>
          {isExpired ? 'Expired' : `${item.daysLeft}d`}
        </Text>
      </View>
    );
  };

  const renderSection = (title, items, icon, color) => {
    if (items.length === 0) return null;

    return (
      <View style={{ marginBottom: 24 }}>
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          marginBottom: 12,
          paddingHorizontal: 4
        }}>
          <Ionicons name={icon} size={20} color={color} />
          <Text style={{ 
            fontSize: 18, 
            fontWeight: 'bold', 
            color: colors.text,
            marginLeft: 8
          }}>
            {title} ({items.length})
          </Text>
        </View>
        <FlatList
          data={items}
          renderItem={renderExpiryItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={{ alignItems: 'center', marginTop: 60 }}>
      <Ionicons name="checkmark-circle" size={64} color={colors.primary} />
      <Text style={{
        fontSize: 18,
        color: colors.textSecondary,
        marginTop: 16,
        textAlign: 'center'
      }}>
        {searchQuery ? 'No matching medicines found' : 'No medicines expiring soon'}
      </Text>
      <Text style={{
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 8,
        textAlign: 'center'
      }}>
        {searchQuery ? 'Try adjusting your search' : 'All medicines are within safe expiry dates'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
        
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
        }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
            marginLeft: 16
          }}>
            Expiry Management
          </Text>
        </View>

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary, fontSize: 16 }}>
            Loading expiry data...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
        
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
        }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
            marginLeft: 16
          }}>
            Expiry Management
          </Text>
        </View>

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
          <Ionicons name="alert-circle" size={64} color="#ef4444" />
          <Text style={{ color: '#ef4444', fontSize: 18, marginTop: 16, textAlign: 'center' }}>
            Unable to load expiry data
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 8, textAlign: 'center' }}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => fetchExpiringItems()}
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
              marginTop: 20
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: colors.text,
          marginLeft: 16
        }}>
          Expiry Management
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
          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
        }}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={{
              flex: 1,
              marginLeft: 12,
              fontSize: 16,
              color: colors.text
            }}
            placeholder="Search medicines..."
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

      {/* Content */}
      <FlatList
        data={[1]} // Dummy data to render sections
        renderItem={() => (
          <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
            {renderSection("Expired", groupedItems.expired, "alert-circle", "#ef4444")}
            {renderSection("Urgent (≤7 days)", groupedItems.urgent, "warning", "#f59e0b")}
            {renderSection("Warning (≤30 days)", groupedItems.warning, "time", colors.primary)}
          </View>
        )}
        keyExtractor={() => "sections"}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchExpiringItems(true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}