import { Dimensions, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useTheme } from "../../contexts/ThemeContext";

const screenWidth = Dimensions.get("window").width - 40;

export default function MonthlyChart({ data }) {
  const { colors, isDarkMode } = useTheme();

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.values,
        color: (opacity = 1) => colors.primary,
        strokeWidth: 3,
      },
    ],
  };

  return (
    <View style={{
      marginTop: 24,
      backgroundColor: colors.cardBackground,
      borderRadius: 24,
      padding: 20,
      shadowColor: colors.secondary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
      borderWidth: 1,
      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
    }}>
      <Text style={{
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: colors.text
      }}>
        Monthly Sales Trend
      </Text>
      <LineChart
        data={chartData}
        width={screenWidth - 40}
        height={220}
        yAxisLabel=""
        chartConfig={{
          backgroundColor: colors.cardBackground,
          backgroundGradientFrom: colors.cardBackground,
          backgroundGradientTo: colors.cardBackground,
          color: (opacity = 1) => `rgba(0, 191, 166, ${opacity})`,
          labelColor: (opacity = 1) => isDarkMode 
            ? `rgba(227, 253, 253, ${opacity * 0.8})` 
            : `rgba(10, 46, 54, ${opacity * 0.8})`,
          strokeWidth: 3,
          propsForDots: {
            r: "5",
            strokeWidth: "2",
            stroke: colors.primary,
            fill: colors.primary,
          },
          propsForBackgroundLines: {
            strokeDasharray: "",
            stroke: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            strokeWidth: 1,
          },
          decimalPlaces: 0,
          formatYLabel: (yValue) => `${yValue}`,
          style: {
            borderRadius: 16,
          },
        }}
        bezier
        style={{
          borderRadius: 16,
          backgroundColor: colors.cardBackground,
        }}
        withHorizontalLabels={true}
        withVerticalLabels={true}
        withDots={true}
        withShadow={false}
        withInnerLines={true}
        withOuterLines={false}
      />
    </View>
  );
}
