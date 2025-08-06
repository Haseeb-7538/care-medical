import { Ionicons } from "@expo/vector-icons";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import AutocompleteInput from "../common/AutocompleteInput";

export default function MedicineItem({
  index,
  medicine,
  onChange,
  onRemove,
  canRemove,
  medicinesList,
}) {
  return (
    <View className="mb-4 p-4 bg-white dark:bg-secondary rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-sm font-medium text-textLight/80 dark:text-textDark/80">
          Medicine #{index + 1}
        </Text>
        {canRemove && (
          <TouchableOpacity
            onPress={() => onRemove(index)}
            className="p-1 rounded-full bg-red-100 dark:bg-red-900/30"
          >
            <Ionicons name="trash-outline" size={16} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>

      <View className="space-y-3">
        <View className="relative z-20">
          <AutocompleteInput
            items={medicinesList}
            placeholder="Select medicine"
            initialValue={medicine.name}
            onSelectItem={(item) => onChange(index, "name", item.title)}
          />
        </View>

        <View className="flex-row space-x-3">
          <View className="flex-1">
            <Text className="text-xs text-textLight/70 dark:text-textDark/70 mb-1">
              Quantity
            </Text>
            <TextInput
              placeholder="Qty"
              placeholderTextColor="#A1B5C1"
              value={medicine.quantity.toString()}
              onChangeText={(text) => onChange(index, "quantity", text)}
              keyboardType="numeric"
              className="bg-white dark:bg-bgDark rounded-lg px-3 py-2 text-textLight dark:text-textDark border border-gray-200 dark:border-gray-700"
            />
            {medicine.name && (
              <Text className="text-xs text-gray-500 mt-1">
                Unit: {medicinesList.find(m => m.title === medicine.name)?.unit || 'units'}
              </Text>
            )}
          </View>

          <View className="flex-1">
            <Text className="text-xs text-textLight/70 dark:text-textDark/70 mb-1">
              Price
            </Text>
            <View className="flex-row items-center">
              <TextInput
                placeholder="Price"
                placeholderTextColor="#A1B5C1"
                value={medicine.price.toString()}
                onChangeText={(text) => onChange(index, "price", text)}
                keyboardType="numeric"
                className="flex-1 bg-white dark:bg-bgDark rounded-lg px-3 py-2 text-textLight dark:text-textDark border border-gray-200 dark:border-gray-700"
              />
            </View>
          </View>
        </View>

        <View className="pt-2">
          <Text className="text-xs font-medium text-textLight dark:text-textDark">
            Subtotal: ₹{(medicine.quantity * medicine.price).toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
}
