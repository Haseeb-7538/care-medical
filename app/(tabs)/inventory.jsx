import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AutocompleteInput from "../../components/common/AutocompleteInput";
import MedicineList from "../../components/common/MedicineList";
import StickyFooter from "../../components/common/StickyFooter";
import AddSupplierModal from "../../components/modals/AddSupplierModal";
import { useTheme } from "../../contexts/ThemeContext";
import { supabase } from "../../lib/supabase";

function inventory() {
  const { colors, isDarkMode } = useTheme();
  const [supplierName, setSupplierName] = useState("");
  const [medicines, setMedicines] = useState([
    { name: "", quantity: 0, price: 0, expiryDate: "", batchNumber: "" }
  ]);
  const [medicinesList, setMedicinesList] = useState([]);
  const [suppliersList, setSuppliersList] = useState([]);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from("tbl_suppliers")
        .select("id, name")
        .order("name");

      if (error) throw error;

      setSuppliersList(
        data.map((s) => ({
          id: s.id.toString(),
          title: s.name,
        }))
      );
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      Alert.alert("Error", "Failed to load suppliers");
    }
  };

  const fetchMedicines = async () => {
    try {
      const { data, error } = await supabase
        .from("tbl_medicines")
        .select("id, name, unit")
        .order("name");

      if (error) throw error;

      setMedicinesList(
        data.map((m) => ({
          id: m.id.toString(),
          title: m.name,
          unit: m.unit || "units",
        }))
      );
    } catch (error) {
      console.error("Error fetching medicines:", error);
      Alert.alert("Error", "Failed to load medicines");
    }
  };

  useEffect(() => {
    fetchSuppliers();
    fetchMedicines();
  }, []);

  const totalValue = useMemo(
    () =>
      medicines.reduce(
        (sum, m) => sum + (Number(m.quantity) || 0) * (Number(m.price) || 0),
        0
      ),
    [medicines]
  );

  const handleSaveStock = async () => {
    if (!supplierName.trim()) {
      Alert.alert("Error", "Supplier name is required");
      return;
    }
    if (medicines.some((m) => !m.name || m.quantity < 1 || m.price < 0)) {
      Alert.alert("Error", "Please fill all medicine fields correctly");
      return;
    }

    setIsSubmitting(true);
    try {
      // First, find the supplier ID based on the supplier name
      const { data: supplierData, error: supplierError } = await supabase
        .from("tbl_suppliers")
        .select("id")
        .eq("name", supplierName.trim())
        .single();

      if (supplierError || !supplierData) {
        console.error("Supplier lookup error:", supplierError);
        Alert.alert("Error", "Supplier not found. Please select a valid supplier from the dropdown.");
        return;
      }

      // Create stock entry with supplier_id
      const { data: stock, error: stockError } = await supabase
        .from("tbl_stock")
        .insert([
          {
            supplier_id: supplierData.id,
            total_value: totalValue,
          },
        ])
        .select()
        .single();

      if (stockError) {
        console.error("Stock insert error details:", stockError);
        Alert.alert("Insert Error", `Failed to create stock: ${stockError.message}`);
        return;
      }

      // Create stock items with expiry date and batch number
      const stockItems = medicines.map((m) => ({
        stock_id: stock.id,
        medicine_id: medicinesList.find((med) => med.title === m.name)?.id || null,
        quantity: m.quantity,
        unit_price: m.price,
        expiry_date: m.expiryDate && m.expiryDate.trim() ? m.expiryDate.trim() : null,
        batch_number: m.batchNumber && m.batchNumber.trim() ? m.batchNumber.trim() : null,
      }));

      const { error: itemsError } = await supabase
        .from("tbl_stock_items")
        .insert(stockItems);

      if (itemsError) throw itemsError;

      Alert.alert("Success", "Stock saved successfully", [
        { 
          text: "OK", 
          onPress: () => {
            // Reset form fields for next entry
            setSupplierName("");
            setMedicines([{ name: "", quantity: 0, price: 0, expiryDate: "", batchNumber: "" }]);
            setResetKey(prev => prev + 1);
          }
        },
      ]);
    } catch (error) {
      console.error("Error saving stock:", error);
      Alert.alert("Error", "Failed to save stock");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.statusBarBackground} />
      
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 16,
        }}>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text
          }}>
            Stocks
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => setShowAddSupplierModal(true)}
              style={{
                padding: 8,
                borderRadius: 12,
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 4,
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="person-add-outline" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Supplier Name */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 8
            }}>
              Supplier Name
            </Text>
            <AutocompleteInput
              items={suppliersList}
              placeholder="Select or enter supplier name"
              value={supplierName}
              onChangeText={setSupplierName}
              onSelectItem={(item) => {
                setSupplierName(item.title);
              }}
            />
          </View>

          {/* Medicine Items */}
          <MedicineList
            medicines={medicines}
            setMedicines={setMedicines}
            medicinesList={medicinesList}
            showUnit={false}
            currencySymbol="₹"
            showExpiryAndBatch={true}
          />
        </ScrollView>

        <StickyFooter
          totalAmount={totalValue}
          onSave={handleSaveStock}
          isLoading={isSubmitting}
          buttonText="Save Stock"
          currencySymbol="₹"
          totalLabel="Total Value:"
        />
      </KeyboardAvoidingView>

      <AddSupplierModal
        visible={showAddSupplierModal}
        onClose={() => setShowAddSupplierModal(false)}
        onAdded={fetchSuppliers}
      />
    </SafeAreaView>
  );
}

export default inventory;
