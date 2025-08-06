import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ExpiryAlerts from "../../components/overview/ExpiryAlerts";
import MonthlyChart from "../../components/overview/MonthlyChart";
import StatCard from "../../components/overview/StatCard";
import StockValueSummary from "../../components/overview/StockValueSummary";
import TopSellingMedicines from "../../components/overview/TopSellingMedicines";
import { useTheme } from "../../contexts/ThemeContext";
import { supabase } from "../../lib/supabase";

export default function Overview() {
  const router = useRouter();
  const { colors } = useTheme();
  const [totalMedicines, setTotalMedicines] = useState("...");
  const [totalSuppliers, setTotalSuppliers] = useState("...");
  const [totalStock, setTotalStock] = useState("...");
  const [lowStock, setLowStock] = useState("...");
  const [totalSales, setTotalSales] = useState("...");
  const [revenue, setRevenue] = useState("...");
  const [refreshing, setRefreshing] = useState(false);
  const [monthlyData, setMonthlyData] = useState({
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    values: [0, 0, 0, 0, 0, 0],
  });

  const fetchMedicinesCount = async () => {
    try {
      const { count, error } = await supabase
        .from("tbl_medicines")
        .select("*", { count: "exact", head: true });
      
      if (error) throw error;
      setTotalMedicines(count?.toString() || "0");
    } catch (error) {
      console.error("Error fetching medicines count:", error);
      setTotalMedicines("Error");
    }
  };

  const fetchSuppliersCount = async () => {
    try {
      const { count, error } = await supabase
        .from("tbl_suppliers")
        .select("*", { count: "exact", head: true });
      
      if (error) throw error;
      setTotalSuppliers(count?.toString() || "0");
    } catch (error) {
      console.error("Error fetching suppliers count:", error);
      setTotalSuppliers("Error");
    }
  };

  const fetchTotalStock = async () => {
    try {
      const { data, error } = await supabase
        .from("tbl_stock_items")
        .select("quantity");
      
      if (error) throw error;
      
      const totalQuantity = data?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
      
      // Format large numbers
      const formatStock = (amount) => {
        if (amount >= 1000000) {
          return `${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
          return `${(amount / 1000).toFixed(1)}K`;
        } else {
          return amount.toString();
        }
      };
      
      setTotalStock(formatStock(totalQuantity));
    } catch (error) {
      console.error("Error fetching total stock:", error);
      setTotalStock("Error");
    }
  };

  const fetchLowStockCount = async () => {
    try {
      const { data, error } = await supabase
        .from("tbl_stock_items")
        .select("medicine_id, quantity")
        .lt("quantity", 10);
      
      if (error) throw error;
      
      // Group by medicine_id and sum quantities to avoid counting same medicine multiple times
      const medicineQuantities = {};
      data?.forEach(item => {
        if (medicineQuantities[item.medicine_id]) {
          medicineQuantities[item.medicine_id] += item.quantity;
        } else {
          medicineQuantities[item.medicine_id] = item.quantity;
        }
      });
      
      // Count unique medicines with total quantity < 10
      const lowStockCount = Object.values(medicineQuantities).filter(qty => qty < 10).length;
      setLowStock(lowStockCount.toString());
    } catch (error) {
      console.error("Error fetching low stock count:", error);
      setLowStock("Error");
    }
  };

  const fetchSalesData = async () => {
    try {
      // Fetch total sales count
      const { count, error: countError } = await supabase
        .from("tbl_sales")
        .select("*", { count: "exact", head: true });
      
      if (countError) throw countError;
      setTotalSales(count?.toString() || "0");

      // Fetch total revenue using subtotal from sale items for accuracy
      const { data: revenueData, error: revenueError } = await supabase
        .from("tbl_sale_items")
        .select("subtotal");
      
      if (revenueError) throw revenueError;
      
      const totalRevenue = revenueData?.reduce((sum, item) => sum + (item.subtotal || 0), 0) || 0;
      
      // Format revenue (convert to K format if > 1000)
      const formatRevenue = (amount) => {
        if (amount >= 100000) {
          return `₹${(amount / 100000).toFixed(1)}L`;
        } else if (amount >= 1000) {
          return `₹${(amount / 1000).toFixed(1)}K`;
        } else {
          return `₹${amount.toFixed(0)}`;
        }
      };
      
      setRevenue(formatRevenue(totalRevenue));
    } catch (error) {
      console.error("Error fetching sales data:", error);
      setTotalSales("Error");
      setRevenue("Error");
    }
  };

  const fetchMonthlyChartData = async () => {
    try {
      // Fetch sales data with sale items for more accurate revenue calculation
      const { data, error } = await supabase
        .from("tbl_sale_items")
        .select(`
          subtotal,
          tbl_sales!inner(created_at)
        `)
        .gte("tbl_sales.created_at", new Date(new Date().getFullYear(), 0, 1).toISOString());
      
      if (error) throw error;
      
      // Initialize monthly data
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthlyRevenue = new Array(12).fill(0);
      
      // Group sales by month using subtotal from sale items for accurate calculation
      data?.forEach(item => {
        const month = new Date(item.tbl_sales.created_at).getMonth();
        monthlyRevenue[month] += item.subtotal || 0;
      });
      
      // Get current month to show relevant data
      const currentMonth = new Date().getMonth();
      const relevantMonths = currentMonth >= 5 ? 
        months.slice(currentMonth - 5, currentMonth + 1) :
        months.slice(0, 6);
      const relevantValues = currentMonth >= 5 ?
        monthlyRevenue.slice(currentMonth - 5, currentMonth + 1) :
        monthlyRevenue.slice(0, 6);
      
      setMonthlyData({
        labels: relevantMonths,
        values: relevantValues,
      });
    } catch (error) {
      console.error("Error fetching monthly chart data:", error);
      // Keep default data on error
    }
  };

  const fetchAllData = async () => {
    await Promise.all([
      fetchMedicinesCount(),
      fetchSuppliersCount(),
      fetchTotalStock(),
      fetchLowStockCount(),
      fetchSalesData(),
      fetchMonthlyChartData(),
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchAllData();
      // Force refresh of child components by updating a refresh key
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Add refresh key state for child components
  const [refreshKey, setRefreshKey] = useState(0);

  const stats = [
    { 
      title: "Total Items", 
      value: totalMedicines, 
      icon: "cube", 
      color: colors.primary,
      onPress: () => router.push("/(screens)/medicines")
    },
    { 
      title: "Total Suppliers", 
      value: totalSuppliers, 
      icon: "people-outline", 
      color: colors.secondary,
      onPress: () => router.push("/(screens)/suppliers")
    },
    { 
      title: "Total Stock", 
      value: totalStock, 
      icon: "layers", 
      color: "#06b6d4",
      onPress: () => router.push("/(screens)/stock-overview")
    },
    { 
      title: "Low Stock", 
      value: lowStock, 
      icon: "alert-circle", 
      color: "#f59e0b",
      onPress: () => router.push("/(screens)/low-stock")
    },
    { 
      title: "Total Sales", 
      value: totalSales, 
      icon: "cart", 
      color: "#10b981",
      onPress: () => router.push("/(screens)/sales-history")
    },
    { title: "Revenue", value: revenue, icon: "cash", color: "#8b5cf6" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.statusBarBackground} />
      
      {/* Header */}
      <View style={{
        paddingHorizontal: 20,
        paddingVertical: 16,
      }}>
        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: colors.text
        }}>
          Overview
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }}
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Stat Cards */}
        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          marginBottom: 16
        }}>
          {stats.map((stat, index) => (
            <View key={index} style={{ width: "48%", marginBottom: 12 }}>
              <StatCard {...stat} />
            </View>
          ))}
        </View>

        {/* Stock Value Summary */}
        <StockValueSummary key={`stock-${refreshKey}`} />

        {/* Expiry Alerts */}
        <ExpiryAlerts key={`expiry-${refreshKey}`} />

        {/* Top Selling Medicines */}
        <TopSellingMedicines key={`top-selling-${refreshKey}`} />

        {/* Monthly Chart */}
        <MonthlyChart data={monthlyData} />
      </ScrollView>
    </SafeAreaView>
  );
}
