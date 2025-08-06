import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { supabase } from "../../lib/supabase";

export default function ExpiryAlerts() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const [expiringItems, setExpiringItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExpiringItems = async () => {
    try {
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
        .order("expiry_date", { ascending: true })
        .limit(5);

      if (error) {
        setError(error.message);
        throw error;
      }
      
      setExpiringItems(data || []);
    } catch (error) {
      console.error("Error fetching expiring items:", error);
      setError(error.message);
    } finally {
      setLoading(false);
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

  const renderExpiryItem = ({ item }) => {
    const daysLeft = getDaysUntilExpiry(item.expiry_date);
    const isExpired = daysLeft < 0;
    const isUrgent = daysLeft <= 7;

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
        </View>
        <Text style={{
          fontSize: 14,
          fontWeight: '600',
          color: isExpired ? '#ef4444' : isUrgent ? '#f59e0b' : colors.primary
        }}>
          {isExpired ? 'Expired' : `${daysLeft}d`}
        </Text>
      </View>
    );
  };

  // Show loading state
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
          Expiry Alerts
        </Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', paddingVertical: 20 }}>
          Loading expiry alerts...
        </Text>
      </View>
    );
  }

  // Show error state
  if (error) {
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
          Expiry Alerts
        </Text>
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={{ color: '#ef4444', fontSize: 16, marginTop: 12, textAlign: 'center' }}>
            Unable to load expiry data
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 8, textAlign: 'center' }}>
            The expiry_date column may not exist in the database
          </Text>
        </View>
      </View>
    );
  }

  // Show empty state
  if (expiringItems.length === 0) {
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
            Expiry Alerts
          </Text>
          <TouchableOpacity onPress={() => router.push('/(screens)/expiry-management')}>
            <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '600' }}>
              View All
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          <Ionicons name="checkmark-circle" size={48} color={colors.primary} />
          <Text style={{ color: colors.textSecondary, fontSize: 16, marginTop: 12, textAlign: 'center' }}>
            No medicines expiring soon
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 4, textAlign: 'center' }}>
            All medicines are within safe expiry dates
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
          Expiry Alerts
        </Text>
        <TouchableOpacity onPress={() => router.push('/expiry-management')}>
          <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '600' }}>
            View All
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={expiringItems}
        renderItem={renderExpiryItem}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

