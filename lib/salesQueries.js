import { supabase } from "./supabase";

export const fetchSalesAnalytics = async (days = 30, sortBy = "quantity") => {
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - days);

  const { data, error } = await supabase
    .from("tbl_sale_items")
    .select(`
      quantity,
      unit_price,
      subtotal,
      tbl_medicines!inner(id, name, unit),
      tbl_sales!inner(created_at, id)
    `)
    .gte("tbl_sales.created_at", daysAgo.toISOString());

  if (error) throw error;

  // Process and return analytics data
  const medicineStats = {};
  data?.forEach(item => {
    const medicineId = item.tbl_medicines.id;
    const saleId = item.tbl_sales.id;
    
    if (medicineStats[medicineId]) {
      medicineStats[medicineId].totalQuantity += item.quantity;
      medicineStats[medicineId].totalRevenue += item.subtotal;
      medicineStats[medicineId].salesCount += 1;
      medicineStats[medicineId].uniqueSales.add(saleId);
    } else {
      medicineStats[medicineId] = {
        id: medicineId,
        name: item.tbl_medicines.name,
        unit: item.tbl_medicines.unit,
        totalQuantity: item.quantity,
        totalRevenue: item.subtotal,
        salesCount: 1,
        uniqueSales: new Set([saleId]),
        averagePrice: item.unit_price
      };
    }
  });

  return Object.values(medicineStats).map(medicine => ({
    ...medicine,
    frequency: medicine.uniqueSales.size,
    averageQuantity: medicine.totalQuantity / medicine.salesCount,
    uniqueSales: undefined
  }));
};

export const getTopSellingMedicines = async (limit = 5, days = 30) => {
  const analytics = await fetchSalesAnalytics(days);
  return analytics
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, limit);
};