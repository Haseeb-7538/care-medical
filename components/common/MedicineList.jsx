import { View } from "react-native";
import MedicineCard from "./MedicineCard";

export default function MedicineList({ 
  medicines, 
  setMedicines, 
  medicinesList, 
  showUnit = false, 
  currencySymbol = "₹",
  showExpiryAndBatch = false 
}) {
  const handleAddMedicineRow = (afterIndex) => {
    const newMedicine = { 
      name: "", 
      quantity: 0, 
      price: 0,
      ...(showExpiryAndBatch && { expiryDate: "", batchNumber: "" })
    };
    const updated = [...medicines];
    updated.splice(afterIndex + 1, 0, newMedicine);
    setMedicines(updated);
  };

  const handleRemoveMedicine = (index) => {
    if (medicines.length > 1) {
      const updated = medicines.filter((_, i) => i !== index);
      setMedicines(updated);
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...medicines];
    if (field === "quantity" || field === "price") {
      updated[index][field] = value;
    } else {
      updated[index][field] = value;
    }
    setMedicines(updated);
  };

  return (
    <View>
      {medicines.map((medicine, index) => (
        <MedicineCard
          key={index}
          index={index}
          medicine={medicine}
          onChange={handleChange}
          onRemove={handleRemoveMedicine}
          onAddAfter={handleAddMedicineRow}
          medicinesList={medicinesList}
          canRemove={medicines.length > 1}
          showUnit={showUnit}
          currencySymbol={currencySymbol}
          showExpiryAndBatch={showExpiryAndBatch}
        />
      ))}
    </View>
  );
}

