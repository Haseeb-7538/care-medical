import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { supabase } from "../../lib/supabase";
import SaveButton from "../common/SaveButton";

const AddSupplierModal = ({ visible, onClose, onAdded }) => {
  const { colors, isDarkMode } = useTheme();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Supplier name is required");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("tbl_suppliers")
        .insert([{ 
          name: name.trim(), 
          phone: phone.trim() || null,
          email: email.trim() || null,
          address: address.trim() || null
        }]);

      if (error) {
        if (error.code === '23505' && error.message.includes('tbl_suppliers_name_key')) {
          Alert.alert("Error", "A supplier with this name already exists");
        } else {
          Alert.alert("Error", "Failed to add supplier: " + error.message);
        }
        return;
      }
      
      Alert.alert("Success", "Supplier added successfully");
      setName("");
      setPhone("");
      setEmail("");
      setAddress("");
      onAdded && onAdded();
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to add supplier");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
    onClose();
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
              Add New Supplier
            </Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Content */}
          <ScrollView 
            style={{ flex: 1 }} 
            contentContainerStyle={{ padding: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Supplier Name Input */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 8
              }}>
                Supplier Name *
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
                  placeholder="Enter supplier name"
                  placeholderTextColor={colors.textSecondary}
                  value={name}
                  onChangeText={setName}
                  autoFocus
                />
              </View>
            </View>

            {/* Contact Number Input */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 8
              }}>
                Contact Number
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
                  placeholder="Enter contact number"
                  placeholderTextColor={colors.textSecondary}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Email Address Input */}
            <View style={{ marginBottom: 32 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 8
              }}>
                Email Address
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
                  placeholder="Enter email address"
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Address Input */}
            <View style={{ marginBottom: 32 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 8
              }}>
                Address
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
                  placeholder="Enter address"
                  placeholderTextColor={colors.textSecondary}
                  value={address}
                  onChangeText={setAddress}
                />
              </View>
            </View>

            <SaveButton
              onPress={handleSave}
              isLoading={loading}
              buttonText="Add Supplier"
              style={{ marginBottom: 20 }}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default AddSupplierModal;
