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

export default function MedicinesList() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMedicines = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const { data, error } = await supabase
        .from("tbl_medicines")
        .select("*")
        .order("name");

      if (error) throw error;
      setMedicines(data || []);
    } catch (error) {
      console.error("Error fetching medicines:", error);
      Alert.alert("Error", "Failed to load medicines");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  // Filter medicines based on search query
  const filteredMedicines = useMemo(() => {
    if (!searchQuery.trim()) {
      return medicines;
    }
    return medicines.filter(medicine =>
      medicine.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [medicines, searchQuery]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  const renderMedicine = ({ item }) => (
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
          backgroundColor: colors.primary + '20',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 8
        }}>
          <Text style={{
            fontSize: 12,
            fontWeight: '500',
            color: colors.primary
          }}>
            {item.unit || 'units'}
          </Text>
        </View>
      </View>
      
      {item.category && (
        <Text style={{
          fontSize: 14,
          color: colors.textSecondary,
          marginBottom: 4
        }}>
          Category: {item.category}
        </Text>
      )}
      
      {item.price && (
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: colors.primary
        }}>
          ₹{parseFloat(item.price).toFixed(2)}
        </Text>
      )}
    </View>
  );

  const renderEmptyState = () => {
    if (searchQuery.trim()) {
      return (
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <Ionicons name="search-outline" size={64} color={colors.textSecondary} />
          <Text style={{
            fontSize: 18,
            color: colors.textSecondary,
            marginTop: 16,
            textAlign: 'center'
          }}>
            No results found
          </Text>
          <Text style={{
            fontSize: 14,
            color: colors.textSecondary,
            marginTop: 8,
            textAlign: 'center'
          }}>
            Try adjusting your search terms
          </Text>
        </View>
      );
    }

    return (
      <View style={{ alignItems: 'center', marginTop: 40 }}>
        <Ionicons name="medical-outline" size={64} color={colors.textSecondary} />
        <Text style={{
          fontSize: 18,
          color: colors.textSecondary,
          marginTop: 16,
          textAlign: 'center'
        }}>
          No medicines found
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.statusBarBackground} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 16, color: colors.textSecondary }}>Loading medicines...</Text>
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
          All Medicines ({filteredMedicines.length})
        </Text>
      </View>

      {/* Search Input */}
      <View style={{
        paddingHorizontal: 20,
        paddingBottom: 16
      }}>
        <View style={{
          backgroundColor: colors.cardBackground,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
          shadowColor: colors.secondary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12
        }}>
          <Ionicons 
            name="search-outline" 
            size={20} 
            color={colors.textSecondary} 
            style={{ marginRight: 12 }}
          />
          <TextInput
            style={{
              flex: 1,
              fontSize: 16,
              color: colors.text
            }}
            placeholder="Search medicines..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={clearSearch}
              style={{
                padding: 4,
                marginLeft: 8
              }}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="close-circle" 
                size={20} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredMedicines}
        renderItem={renderMedicine}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchMedicines(true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}
