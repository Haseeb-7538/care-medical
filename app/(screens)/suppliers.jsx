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
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";
import { supabase } from "../../lib/supabase";

export default function SuppliersList() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSuppliers = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const { data, error } = await supabase
        .from("tbl_suppliers")
        .select("*")
        .order("name");

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      Alert.alert("Error", "Failed to load suppliers");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Filter suppliers based on search query
  const filteredSuppliers = useMemo(() => {
    if (!searchQuery.trim()) {
      return suppliers;
    }
    return suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [suppliers, searchQuery]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  const renderSupplier = ({ item }) => (
    <View style={{
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      shadowColor: colors.secondary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8
      }}>
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          color: colors.text,
          flex: 1
        }}>
          {item.name}
        </Text>
        <View style={{
          backgroundColor: colors.secondary + '20',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 8
        }}>
          <Text style={{
            fontSize: 12,
            fontWeight: '500',
            color: colors.secondary
          }}>
            Supplier
          </Text>
        </View>
      </View>

      {item.phone && (
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 4
        }}>
          <Ionicons name="call-outline" size={16} color={colors.textSecondary} />
          <Text style={{
            fontSize: 14,
            color: colors.textSecondary,
            marginLeft: 8
          }}>
            {item.phone}
          </Text>
        </View>
      )}

      {item.email && (
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 4
        }}>
          <Ionicons name="mail-outline" size={16} color={colors.textSecondary} />
          <Text style={{
            fontSize: 14,
            color: colors.textSecondary,
            marginLeft: 8
          }}>
            {item.email}
          </Text>
        </View>
      )}

      {item.address && (
        <View style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          marginTop: 4
        }}>
          <Ionicons name="location-outline" size={16} color={colors.textSecondary} style={{ marginTop: 2 }} />
          <Text style={{
            fontSize: 14,
            color: colors.textSecondary,
            marginLeft: 8,
            flex: 1,
            lineHeight: 20
          }}>
            {item.address}
          </Text>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60
    }}>
      <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
      <Text style={{
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginTop: 16,
        marginBottom: 8
      }}>
        {searchQuery ? 'No suppliers found' : 'No suppliers yet'}
      </Text>
      <Text style={{
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: 40
      }}>
        {searchQuery 
          ? 'Try adjusting your search terms' 
          : 'Add your first supplier to get started'
        }
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.statusBarBackground} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{
            fontSize: 16,
            color: colors.textSecondary,
            marginTop: 16
          }}>
            Loading suppliers...
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
          All Suppliers ({filteredSuppliers.length})
        </Text>
      </View>

      {/* Search Bar */}
      <View style={{
        paddingHorizontal: 20,
        marginBottom: 16
      }}>
        <View style={{
          backgroundColor: colors.cardBackground,
          borderRadius: 16,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderWidth: 1,
          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          shadowColor: colors.secondary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}>
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
          <TextInput
            style={{
              flex: 1,
              marginLeft: 12,
              fontSize: 16,
              color: colors.text
            }}
            placeholder="Search suppliers..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredSuppliers}
        renderItem={renderSupplier}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchSuppliers(true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}