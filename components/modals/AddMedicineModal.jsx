import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AutocompleteInput from "../../components/common/AutocompleteInput";
import { useTheme } from "../../contexts/ThemeContext";
import { supabase } from "../../lib/supabase";

const AddMedicineModal = ({ visible, onClose, onAdded, medicinesList = [] }) => {
  const { colors, isDarkMode } = useTheme();
  const [medicineName, setMedicineName] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0.00");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const medicineCategories = [
    "Anti-Infectives",
    "Pain & Inflammation Relief",
    "Cardiovascular Medicines",
    "Respiratory Medicines",
    "Gastrointestinal Medicines",
    "Endocrine & Metabolic",
    "Dermatology",
    "Neurology & Psychiatry",
    "Ophthalmic & ENT",
    "Emergency & Critical Care",
    "Vaccines & Immunizations",
    "Over-The-Counter (OTC) & First Aid"
  ];

  const handleSave = async () => {
    if (!medicineName.trim()) {
      Alert.alert("Error", "Medicine name is required");
      return;
    }

    const priceValue = parseFloat(price) || 0.00;
    if (priceValue < 0) {
      Alert.alert("Error", "Price cannot be negative");
      return;
    }

    setIsSubmitting(true);
    try {
      // Check if medicine already exists
      const { data: existingMedicine, error: checkError } = await supabase
        .from("tbl_medicines")
        .select("id")
        .eq("name", medicineName.trim())
        .single();

      let isUpdate = false;
      let error;

      if (existingMedicine) {
        // Update existing medicine
        const { error: updateError } = await supabase
          .from("tbl_medicines")
          .update({
            category: category || null,
            unit: unit.trim() || null,
            description: description.trim() || null,
            price: priceValue
          })
          .eq("id", existingMedicine.id);
        
        error = updateError;
        isUpdate = true;
      } else {
        // Insert new medicine
        const { error: insertError } = await supabase
          .from("tbl_medicines")
          .insert([{
            name: medicineName.trim(),
            category: category || null,
            unit: unit.trim() || null,
            description: description.trim() || null,
            price: priceValue
          }]);
        
        error = insertError;
      }

      if (error) {
        Alert.alert("Error", `Failed to ${isUpdate ? 'update' : 'add'} medicine: ` + error.message);
        return;
      }
      
      Alert.alert("Success", `Medicine ${isUpdate ? 'updated' : 'added'} successfully`);
      setMedicineName("");
      setCategory("");
      setUnit("");
      setDescription("");
      setPrice("0.00");
      onAdded && onAdded();
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to save medicine");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setMedicineName("");
    setCategory("");
    setUnit("");
    setDescription("");
    setPrice("0.00");
    setShowCategoryDropdown(false);
    onClose();
  };

  const handleCategorySelect = (selectedCategory) => {
    setCategory(selectedCategory);
    setShowCategoryDropdown(false);
  };

  const handleMedicineSelect = async (item) => {
    setMedicineName(item.title);
    
    // Fetch complete medicine data from database
    try {
      const { data, error } = await supabase
        .from("tbl_medicines")
        .select("category, unit, description, price")
        .eq("name", item.title)
        .single();

      if (error) {
        console.log("Medicine not found in database:", error.message);
        return;
      }

      // Auto-populate form fields with existing data
      if (data) {
        setCategory(data.category || "");
        setUnit(data.unit || "");
        setDescription(data.description || "");
        setPrice(data.price ? data.price.toString() : "0.00");
      }
    } catch (error) {
      console.error("Error fetching medicine data:", error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          {/* Header */}
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
            <TouchableOpacity
              onPress={handleClose}
              style={{
                padding: 8,
                borderRadius: 12,
                backgroundColor: colors.background
              }}
            >
              <Ionicons name="close" size={20} color={colors.icon} />
            </TouchableOpacity>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: colors.text
            }}>
              Save Medicine
            </Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Content */}
          <ScrollView 
            style={{ flex: 1 }} 
            contentContainerStyle={{ padding: 20 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            {/* Medicine Name Input */}
            <View style={{ marginBottom: 20, zIndex: 3000 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 8
              }}>
                Medicine Name *
              </Text>
              <AutocompleteInput
                items={medicinesList}
                placeholder="Enter medicine name"
                value={medicineName}
                onChangeText={setMedicineName}
                onSelectItem={handleMedicineSelect}
              />
            </View>

            {/* Category Dropdown */}
            <View style={{ marginBottom: 20, zIndex: 1000 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 8
              }}>
                Category
              </Text>
              <TouchableOpacity
                onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                style={{
                  backgroundColor: colors.cardBackground,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                  shadowColor: colors.secondary,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Text style={{
                  fontSize: 16,
                  color: category ? colors.text : colors.textSecondary
                }}>
                  {category || "Select category"}
                </Text>
                <Ionicons 
                  name={showCategoryDropdown ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
              
              {showCategoryDropdown && (
                <>
                  {/* Invisible overlay to detect outside taps */}
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: -20,
                      right: -20,
                      bottom: -1000,
                      zIndex: 999
                    }}
                    activeOpacity={1}
                    onPress={() => setShowCategoryDropdown(false)}
                  />
                  
                  {/* Dropdown list */}
                  <View style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: colors.cardBackground,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                    shadowColor: colors.secondary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 8,
                    maxHeight: 200,
                    zIndex: 1001
                  }}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                      {medicineCategories.map((cat, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => handleCategorySelect(cat)}
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            borderBottomWidth: index < medicineCategories.length - 1 ? 1 : 0,
                            borderBottomColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                          }}
                        >
                          <Text style={{
                            fontSize: 16,
                            color: colors.text
                          }}>
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </>
              )}
            </View>

            {/* Unit Input */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 8
              }}>
                Unit
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
                    color: colors.text
                  }}
                  placeholder="e.g., tablets, ml, mg"
                  placeholderTextColor={colors.textSecondary}
                  value={unit}
                  onChangeText={setUnit}
                />
              </View>
            </View>

            {/* Price Input */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 8
              }}>
                Price per Unit
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
                    color: colors.text
                  }}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Description Input */}
            <View style={{ marginBottom: 32 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 8
              }}>
                Description
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
                  placeholder="Enter medicine description (optional)"
                  placeholderTextColor={colors.textSecondary}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSubmitting}
              style={{
                backgroundColor: isSubmitting ? colors.textSecondary : colors.primary,
                paddingVertical: 16,
                borderRadius: 16,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 8,
                opacity: isSubmitting ? 0.7 : 1,
                marginBottom: 20
              }}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={{
                    color: '#fff',
                    fontWeight: '600',
                    fontSize: 16,
                    marginLeft: 8
                  }}>
                    Saving Medicine...
                  </Text>
                </View>
              ) : (
                <Text style={{
                  color: '#fff',
                  fontWeight: '600',
                  textAlign: 'center',
                  fontSize: 16
                }}>
                  Save Medicine
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default AddMedicineModal;
