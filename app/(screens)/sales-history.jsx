import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";
import { supabase } from "../../lib/supabase";

export default function SalesHistory() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  const fetchSalesHistory = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const { data, error } = await supabase
        .from("tbl_sales")
        .select(`
          id,
          patient_name,
          total_amount,
          created_at,
          description,
          tbl_sale_items(
            id,
            quantity,
            unit_price,
            subtotal,
            tbl_medicines(name, unit)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setSales(data || []);
    } catch (error) {
      console.error("Error fetching sales history:", error);
      Alert.alert("Error", "Failed to load sales history");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSalesHistory();
  }, []);

  const filteredSales = sales.filter(sale =>
    sale.patient_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openSaleModal = (sale) => {
    setSelectedSale(sale);
    setModalVisible(true);
  };

  const closeSaleModal = () => {
    setModalVisible(false);
    setSelectedSale(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  const renderSaleItem = ({ item: sale }) => {
    return (
      <TouchableOpacity
        onPress={() => openSaleModal(sale)}
        activeOpacity={0.7}
        style={{
          backgroundColor: colors.cardBackground,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          shadowColor: colors.secondary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: colors.text,
              marginBottom: 4
            }}>
              {sale.patient_name}
            </Text>
            <Text style={{
              fontSize: 14,
              color: colors.textSecondary,
              marginBottom: 4
            }}>
              {formatDate(sale.created_at)}
            </Text>
            <Text style={{
              fontSize: 14,
              color: colors.textSecondary
            }}>
              Items: {sale.tbl_sale_items?.length || 0}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: colors.primary,
              marginBottom: 8
            }}>
              {formatCurrency(sale.total_amount)}
            </Text>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={colors.textSecondary} 
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSaleModal = () => {
    if (!selectedSale) return null;

    return (
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeSaleModal}
      >
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          {/* Modal Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 16,
            backgroundColor: colors.cardBackground,
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            shadowColor: colors.secondary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: colors.text
              }}>
                Sale Details
              </Text>
              <Text style={{
                fontSize: 14,
                color: colors.textSecondary,
                marginTop: 2
              }}>
                ID: #{selectedSale.id}
              </Text>
            </View>
            <TouchableOpacity
              onPress={closeSaleModal}
              style={{
                padding: 8,
                borderRadius: 8,
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
              }}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
            {/* Patient Information */}
            <View style={{
              backgroundColor: colors.cardBackground,
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
              shadowColor: colors.secondary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: colors.text,
                marginBottom: 8
              }}>
                Patient Information
              </Text>
              <View style={{ marginBottom: 8 }}>
                <Text style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginBottom: 4
                }}>
                  Patient Name
                </Text>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.text
                }}>
                  {selectedSale.patient_name}
                </Text>
              </View>
              <View>
                <Text style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginBottom: 4
                }}>
                  Sale Date & Time
                </Text>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.text
                }}>
                  {formatDate(selectedSale.created_at)}
                </Text>
              </View>
            </View>

            {/* Description Section */}
            {selectedSale.description && selectedSale.description.trim() && (
              <View style={{
                backgroundColor: colors.cardBackground,
                borderRadius: 16,
                padding: 20,
                marginBottom: 16,
                shadowColor: colors.secondary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: colors.text,
                  marginBottom: 12
                }}>
                  Reason for Sale
                </Text>
                <Text style={{
                  fontSize: 16,
                  color: colors.text,
                  lineHeight: 24,
                  fontStyle: 'italic'
                }}>
                  {selectedSale.description}
                </Text>
              </View>
            )}

            {/* Items Breakdown */}
            <View style={{
              backgroundColor: colors.cardBackground,
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
              shadowColor: colors.secondary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: colors.text,
                marginBottom: 16
              }}>
                Items Sold ({selectedSale.tbl_sale_items?.length || 0})
              </Text>
              {selectedSale.tbl_sale_items?.map((item, index) => (
                <View key={item.id} style={{
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: 12,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
                }}>
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 8
                  }}>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: colors.text,
                      flex: 1
                    }}>
                      {item.tbl_medicines?.name}
                    </Text>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      color: colors.primary
                    }}>
                      {formatCurrency(item.subtotal)}
                    </Text>
                  </View>
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Text style={{
                      fontSize: 14,
                      color: colors.textSecondary
                    }}>
                      Quantity: {item.quantity} {item.tbl_medicines?.unit || 'units'}
                    </Text>
                    <Text style={{
                      fontSize: 14,
                      color: colors.textSecondary
                    }}>
                      Unit Price: {formatCurrency(item.unit_price)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Summary Section */}
            <View style={{
              backgroundColor: colors.primary + '15',
              borderRadius: 16,
              padding: 20,
              borderWidth: 2,
              borderColor: colors.primary + '30'
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: colors.text,
                marginBottom: 16
              }}>
                Sale Summary
              </Text>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12
              }}>
                <Text style={{
                  fontSize: 16,
                  color: colors.text
                }}>
                  Total Items:
                </Text>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.text
                }}>
                  {selectedSale.tbl_sale_items?.length || 0}
                </Text>
              </View>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
              }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: colors.text
                }}>
                  Total Amount:
                </Text>
                <Text style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: colors.primary
                }}>
                  {formatCurrency(selectedSale.total_amount)}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.statusBarBackground} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 16, color: colors.textSecondary }}>Loading sales history...</Text>
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
          Sales History ({filteredSales.length})
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
          shadowColor: colors.secondary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={{
              flex: 1,
              marginLeft: 12,
              fontSize: 16,
              color: colors.text
            }}
            placeholder="Search by patient name..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Sales List */}
      <FlatList
        data={filteredSales}
        renderItem={renderSaleItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchSalesHistory(true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Ionicons name="receipt-outline" size={64} color={colors.textSecondary} />
            <Text style={{
              fontSize: 18,
              color: colors.textSecondary,
              marginTop: 16,
              textAlign: 'center'
            }}>
              {searchQuery ? 'No sales found for this search' : 'No sales history available'}
            </Text>
          </View>
        }
      />
      {renderSaleModal()}
    </SafeAreaView>
  );
}


