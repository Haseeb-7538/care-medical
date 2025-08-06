import { Text, View } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";

export default function Footer({
  paddingVertical = 32,
  paddingBottom = 0,
  fontSize = 12,
  style = {},
  ...props
}) {
  const { colors } = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <View style={{
      alignItems: 'center',
      paddingVertical,
      paddingBottom,
      ...style
    }} {...props}>
      <Text style={{
        fontSize,
        color: colors.textSecondary,
        textAlign: 'center'
      }}>
        Care Medical & Pharma Clinic v1.0.0{'\n'}
        © {currentYear} All rights reserved
      </Text>
    </View>
  );
}
