import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from "react";
import { Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { supabase } from "../../lib/supabase";
import AutocompleteInput from "./AutocompleteInput";

export default function MedicineCard({
  index,
  medicine,
  onChange,
  onRemove,
  onAddAfter,
  medicinesList,
  canRemove = true,
  showUnit = false,
  currencySymbol = "₹",
  showExpiryAndBatch = false
}) {
  const { colors, isDarkMode } = useTheme();
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Get today's date as minimum selectable date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Parse the expiry date string to Date object for the picker
  const getExpiryDate = () => {
    if (medicine.expiryDate) {
      const date = new Date(medicine.expiryDate);
      return isNaN(date.getTime()) ? today : date;
    }
    return today;
  };

  const handleDateChange = (event, selectedDate) => {
    // Always close the date picker after interaction
    setShowDatePicker(false);
    
    if (selectedDate && event.type !== 'dismissed') {
      const dateString = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      onChange(index, "expiryDate", dateString);
    }
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "Select expiry date";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Select expiry date" : dateString;
  };

  // Fetch and set price when medicine name changes
  useEffect(() => {
    const fetchMedicinePrice = async () => {
      if (!medicine.name) return;
      
      try {
        const { data, error } = await supabase
          .from("tbl_medicines")
          .select("price")
          .eq("name", medicine.name)
          .single();

        if (error) {
          console.log("Medicine not found in database or error:", error.message);
          return;
        }

        if (data?.price !== null && data?.price !== undefined) {
          onChange(index, "price", data.price.toString());
        }
      } catch (error) {
        console.error("Error fetching medicine price:", error);
      }
    };

    fetchMedicinePrice();
  }, [medicine.name, index, onChange]);

  return (
    <View
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
      {/* Header with medicine number and action buttons */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: colors.textSecondary,
          }}
        >
          Medicine #{index + 1}
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {/* Add medicine after this one */}
          <TouchableOpacity
            onPress={() => onAddAfter(index)}
            style={{
              padding: 6,
              borderRadius: 8,
              backgroundColor: "#dcfce7",
            }}
          >
            <Ionicons name="add-outline" size={16} color="#16a34a" />
          </TouchableOpacity>
          
          {/* Remove current medicine */}
          {canRemove && (
            <TouchableOpacity
              onPress={() => onRemove(index)}
              style={{
                padding: 6,
                borderRadius: 8,
                backgroundColor: "#fee2e2",
              }}
            >
              <Ionicons name="trash-outline" size={16} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Medicine Name */}
      <View style={{ marginBottom: 12 }}>
        <Text
          style={{
            fontSize: 12,
            color: colors.textSecondary,
            marginBottom: 4,
          }}
        >
          Medicine Name
        </Text>
        <AutocompleteInput
          items={medicinesList}
          placeholder="Select or enter medicine name"
          value={medicine.name}
          onChangeText={(text) => onChange(index, "name", text)}
          onSelectItem={(item) => onChange(index, "name", item.title)}
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {/* Quantity and Price Row */}
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 12,
              color: colors.textSecondary,
              marginBottom: 4,
            }}
          >
            Quantity
          </Text>
          <TextInput
            placeholder="Qty"
            placeholderTextColor={colors.textSecondary}
            value={medicine.quantity?.toString() || ""}
            onChangeText={(text) => onChange(index, "quantity", text)}
            keyboardType="numeric"
            className="bg-bgLight dark:bg-bgDark text-textLight dark:text-textDark border border-iconLight dark:border-iconDark rounded-md px-3 py-2.5"
          />
          {showUnit && medicine.name && (
            <Text
              style={{
                fontSize: 10,
                color: colors.textSecondary,
                marginTop: 2,
              }}
            >
              Unit: {medicinesList.find(m => m.title === medicine.name)?.unit || 'units'}
            </Text>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 12,
              color: colors.textSecondary,
              marginBottom: 4,
            }}
          >
            Price ({currencySymbol})
          </Text>
          <TextInput
            placeholder="Price"
            placeholderTextColor={colors.textSecondary}
            value={medicine.price?.toString() || ""}
            onChangeText={(text) => onChange(index, "price", text)}
            keyboardType="numeric"
            className="bg-bgLight dark:bg-bgDark text-textLight dark:text-textDark border border-iconLight dark:border-iconDark rounded-md px-3 py-2.5"
          />
        </View>
      </View>

      {/* Expiry Date and Batch Number Row (only show in inventory) */}
      {showExpiryAndBatch && (
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                marginBottom: 4,
              }}
            >
              Expiry Date (Optional)
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="bg-bgLight dark:bg-bgDark border border-iconLight dark:border-iconDark rounded-md px-3 py-2.5 flex-row items-center justify-between"
              accessibilityRole="button"
              accessibilityLabel="Select expiry date"
              accessibilityHint="Opens date picker to select medicine expiry date"
            >
              <Text className="text-textLight dark:text-textDark flex-1">
                {formatDisplayDate(medicine.expiryDate)}
              </Text>
              <Ionicons 
                name="calendar-outline" 
                size={16} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={getExpiryDate()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={today}
                onChange={handleDateChange}
                onTouchCancel={() => setShowDatePicker(false)}
              />
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                marginBottom: 4,
              }}
            >
              Batch Number (Optional)
            </Text>
            <TextInput
              placeholder="Batch/Lot #"
              placeholderTextColor={colors.textSecondary}
              value={medicine.batchNumber || ""}
              onChangeText={(text) => onChange(index, "batchNumber", text)}
              className="bg-bgLight dark:bg-bgDark text-textLight dark:text-textDark border border-iconLight dark:border-iconDark rounded-md px-3 py-2.5"
            />
          </View>
        </View>
      )}

      {/* Subtotal */}
      <View style={{ paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: colors.text,
            textAlign: "right",
          }}
        >
          Subtotal: {currencySymbol}{((Number(medicine.quantity) || 0) * (Number(medicine.price) || 0)).toFixed(2)}
        </Text>
      </View>
    </View>
  );
}





