import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import MedicineList from "../../components/common/MedicineList";
import StickyFooter from "../../components/common/StickyFooter";
import AddMedicineModal from "../../components/modals/AddMedicineModal";
import { useTheme } from "../../contexts/ThemeContext";
import { supabase } from "../../lib/supabase";

// Custom hook for managing sales data and operations
const useSalesManager = (medicinesList) => {
  const [patientName, setPatientName] = useState("");
  const [saleReason, setSaleReason] = useState("");
  const [medicines, setMedicines] = useState([{ name: "", quantity: 1, price: 0 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAmount = useMemo(
    () => medicines.reduce((sum, m) => sum + (m.quantity || 0) * (m.price || 0), 0),
    [medicines]
  );

  const validateSaleData = () => {
    // Validate patient name
    if (!patientName.trim()) {
      Alert.alert("Error", "Patient name is required");
      return false;
    }

    // Validate medicine entries with enhanced checks
    const invalidEntries = medicines.filter((m, index) => {
      if (!m.name.trim()) return true;
      const quantity = parseInt(m.quantity);
      const price = parseFloat(m.price);
      return isNaN(quantity) || quantity <= 0 || isNaN(price) || price < 0;
    });

    if (invalidEntries.length > 0) {
      Alert.alert(
        "Validation Error", 
        "Please ensure all medicines have:\n• Valid name\n• Quantity greater than 0\n• Price greater than or equal to 0"
      );
      return false;
    }

    // Check if all medicines exist in the medicines list
    const invalidMedicines = medicines.filter(m => 
      !medicinesList.find(med => med.title === m.name.trim())
    );
    if (invalidMedicines.length > 0) {
      Alert.alert("Error", "Some medicines are not found in the database. Please select valid medicines from the dropdown.");
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setPatientName("");
    setSaleReason("");
    setMedicines([{ name: "", quantity: 1, price: 0 }]);
  };

  return {
    patientName,
    setPatientName,
    saleReason,
    setSaleReason,
    medicines,
    setMedicines,
    isSubmitting,
    setIsSubmitting,
    totalAmount,
    validateSaleData,
    resetForm
  };
};

// Stock validation utility
const validateStockAvailability = async (medicines, medicinesList) => {
  try {
    const stockChecks = await Promise.all(
      medicines.map(async (medicine) => {
        const medicineId = medicinesList.find(med => med.title === medicine.name.trim())?.id;
        const requiredQuantity = parseInt(medicine.quantity);

        const { data: stockItems, error } = await supabase
          .from("tbl_stock_items")
          .select(`
            id,
            quantity,
            tbl_stock!inner(created_at)
          `)
          .eq("medicine_id", parseInt(medicineId))
          .gt("quantity", 0)
          .order("tbl_stock(created_at)", { ascending: true });

        if (error) throw error;

        const totalAvailable = stockItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        
        return {
          medicineName: medicine.name,
          required: requiredQuantity,
          available: totalAvailable,
          sufficient: totalAvailable >= requiredQuantity
        };
      })
    );

    const insufficientStock = stockChecks.filter(check => !check.sufficient);
    
    if (insufficientStock.length > 0) {
      const errorMessage = insufficientStock
        .map(item => `• ${item.medicineName}: Need ${item.required}, Available ${item.available}`)
        .join('\n');
      
      return {
        isValid: false,
        message: `Insufficient stock for:\n${errorMessage}`
      };
    }

    return { isValid: true };
  } catch (error) {
    console.error("Error validating stock:", error);
    return {
      isValid: false,
      message: "Failed to validate stock availability. Please try again."
    };
  }
};

// Stock deduction utility using FIFO approach
const deductStockQuantities = async (medicines, medicinesList) => {
  try {
    for (const medicine of medicines) {
      const medicineId = medicinesList.find(med => med.title === medicine.name.trim())?.id;
      let remainingToDeduct = parseInt(medicine.quantity);

      // Get stock items for this medicine ordered by FIFO (oldest first)
      const { data: stockItems, error } = await supabase
        .from("tbl_stock_items")
        .select(`
          id,
          quantity,
          tbl_stock!inner(created_at)
        `)
        .eq("medicine_id", parseInt(medicineId))
        .gt("quantity", 0)
        .order("tbl_stock(created_at)", { ascending: true });

      if (error) throw error;

      // Deduct quantities using FIFO approach
      for (const stockItem of stockItems) {
        if (remainingToDeduct <= 0) break;

        const deductFromThis = Math.min(remainingToDeduct, stockItem.quantity);
        const newQuantity = stockItem.quantity - deductFromThis;

        const { error: updateError } = await supabase
          .from("tbl_stock_items")
          .update({ quantity: newQuantity })
          .eq("id", stockItem.id);

        if (updateError) throw updateError;

        remainingToDeduct -= deductFromThis;
      }

      if (remainingToDeduct > 0) {
        throw new Error(`Could not fully deduct ${medicine.name}. Remaining: ${remainingToDeduct}`);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error deducting stock:", error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Database operations for sales
const createSaleRecord = async (patientName, totalAmount, saleReason) => {
  const { data: sale, error: saleError } = await supabase
    .from("tbl_sales")
    .insert([
      {
        patient_name: patientName.trim(),
        total_amount: totalAmount,
        description: saleReason.trim() || null,
      },
    ])
    .select()
    .single();

  if (saleError) {
    console.error("Sale insert error:", saleError);
    throw new Error(`Failed to create sale: ${saleError.message}`);
  }

  return sale;
};

const createSaleItems = async (saleId, medicines, medicinesList) => {
  const saleItems = medicines.map((m) => {
    const medicineId = medicinesList.find((med) => med.title === m.name.trim())?.id;
    const quantity = parseInt(m.quantity);
    const unitPrice = parseFloat(m.price);

    return {
      sale_id: saleId,
      medicine_id: parseInt(medicineId),
      quantity: quantity,
      unit_price: unitPrice,
    };
  });

  const { error: itemsError } = await supabase
    .from("tbl_sale_items")
    .insert(saleItems);

  if (itemsError) {
    console.error("Sale items insert error:", itemsError);
    
    let errorMessage = "Failed to save sale items";
    if (itemsError.message.includes("quantity_check")) {
      errorMessage = "Quantity must be greater than 0";
    } else if (itemsError.message.includes("unit_price_check")) {
      errorMessage = "Unit price must be greater than or equal to 0";
    } else if (itemsError.message.includes("medicine_id_fkey")) {
      errorMessage = "Invalid medicine selected";
    } else {
      errorMessage += `: ${itemsError.message}`;
    }
    
    throw new Error(errorMessage);
  }
};

// Header component
const SalesHeader = ({ colors, onAddMedicine }) => (
  <View
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
    }}
  >
    <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text }}>
      Sale
    </Text>
    <TouchableOpacity
      onPress={onAddMedicine}
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
      <Ionicons name="medkit" size={18} color="#fff" />
    </TouchableOpacity>
  </View>
);

// Patient name input component
const PatientNameInput = ({ colors, isDarkMode, patientName, setPatientName }) => (
  <View style={{ marginBottom: 16 }}>
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
    }}>
      <TextInput
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          fontSize: 16,
          color: colors.text
        }}
        placeholder="Enter patient name"
        placeholderTextColor={colors.textSecondary}
        value={patientName}
        onChangeText={setPatientName}
      />
    </View>
  </View>
);

// Sale reason input component
const SaleReasonInput = ({ colors, isDarkMode, saleReason, setSaleReason }) => (
  <View style={{ marginBottom: 16 }}>
    <Text style={{
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8
    }}>
      Reason for Sale
    </Text>
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
    }}>
      <TextInput
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          fontSize: 16,
          color: colors.text,
          minHeight: 80,
          textAlignVertical: 'top'
        }}
        placeholder="Enter reason for sale or additional notes"
        placeholderTextColor={colors.textSecondary}
        value={saleReason}
        onChangeText={setSaleReason}
        multiline
        numberOfLines={3}
      />
    </View>
  </View>
);

const Sales = () => {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [medicinesList, setMedicinesList] = useState([]);
  const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);

  const {
    patientName,
    setPatientName,
    saleReason,
    setSaleReason,
    medicines,
    setMedicines,
    isSubmitting,
    setIsSubmitting,
    totalAmount,
    validateSaleData,
    resetForm
  } = useSalesManager(medicinesList);

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
    fetchMedicines();
  }, []);

  const handleSaveSale = async () => {
    if (!validateSaleData()) return;

    setIsSubmitting(true);
    try {
      // Check stock availability before processing sale
      const stockValidation = await validateStockAvailability(medicines, medicinesList);
      if (!stockValidation.isValid) {
        Alert.alert("Insufficient Stock", stockValidation.message);
        return;
      }

      // Create the main sale record
      const sale = await createSaleRecord(patientName, totalAmount, saleReason);

      // Create sale items
      await createSaleItems(sale.id, medicines, medicinesList);

      // Deduct stock quantities using FIFO approach
      const stockDeductionResult = await deductStockQuantities(medicines, medicinesList);
      if (!stockDeductionResult.success) {
        Alert.alert("Stock Deduction Warning", 
          `Sale completed but stock deduction failed: ${stockDeductionResult.error}\n\nPlease manually adjust stock levels.`);
      }

      Alert.alert("Success", "Sale saved successfully", [
        { 
          text: "OK", 
          onPress: () => {
            resetForm();
            router.push("/(tabs)/overview");
          }
        },
      ]);
    } catch (error) {
      console.error("Error saving sale:", error);
      Alert.alert("Database Error", error.message || "An unexpected error occurred while saving the sale");
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
        keyboardVerticalOffset={insets.top}
      >
        <SalesHeader 
          colors={colors} 
          onAddMedicine={() => setShowAddMedicineModal(true)} 
        />

        <ScrollView 
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <PatientNameInput 
            colors={colors}
            isDarkMode={isDarkMode}
            patientName={patientName}
            setPatientName={setPatientName}
          />

          <SaleReasonInput 
            colors={colors}
            isDarkMode={isDarkMode}
            saleReason={saleReason}
            setSaleReason={setSaleReason}
          />

          <MedicineList
            medicines={medicines}
            setMedicines={setMedicines}
            medicinesList={medicinesList}
            showUnit={true}
            currencySymbol="₹"
          />
        </ScrollView>

        <StickyFooter
          totalAmount={totalAmount}
          onSave={handleSaveSale}
          isLoading={isSubmitting}
          buttonText="Save Sale"
          currencySymbol="₹"
          totalLabel="Total Amount:"
        />
      </KeyboardAvoidingView>

      <AddMedicineModal
        visible={showAddMedicineModal}
        onClose={() => setShowAddMedicineModal(false)}
        onAdded={fetchMedicines}
        medicinesList={medicinesList}
      />
    </SafeAreaView>
  );
};

export default Sales;
