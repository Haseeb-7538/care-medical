import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

export default function AutocompleteInput({
  items = [],
  placeholder = "Select an option",
  onSelectItem,
  initialValue = "",
  value,
  onChangeText,
}) {
  const [query, setQuery] = useState(value || initialValue);

  // Update query when controlled value changes
  useEffect(() => {
    if (value !== undefined) {
      setQuery(value);
    }
  }, [value]);

  useEffect(() => {
    if (value === undefined) {
      setQuery(initialValue);
    }
  }, [initialValue, value]);

  const [filteredItems, setFilteredItems] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (Array.isArray(items)) {
      setFilteredItems(items);
    } else {
      setFilteredItems([]);
    }
  }, [items]);

  const handleSearch = (text) => {
    setQuery(text);
    onChangeText?.(text);
    
    if (!Array.isArray(items)) {
      setFilteredItems([]);
      setShowSuggestions(false);
      return;
    }

    if (!text || text.trim() === "") {
      setFilteredItems(items.slice(0, 5));
      setShowSuggestions(true);
    } else {
      const filtered = items.filter((item) => {
        if (!item || typeof item.title !== 'string') return false;
        return item.title.toLowerCase().includes(text.toLowerCase().trim());
      });
      setFilteredItems(filtered);
      setShowSuggestions(filtered.length > 0);
    }
  };

  const handleSelectItem = (item) => {
    if (!item || !item.title) return;
    setQuery(item.title);
    setShowSuggestions(false);
    onChangeText?.(item.title);
    onSelectItem?.(item);
  };

  return (
    <View className="relative z-50">
      <TextInput
        placeholder={placeholder}
        className="bg-bgLight dark:bg-bgDark text-textLight dark:text-textDark border border-iconLight dark:border-iconDark rounded-md px-3 py-2.5"
        value={query}
        onChangeText={handleSearch}
        onFocus={() => {
          if (Array.isArray(items) && items.length > 0) {
            setShowSuggestions(true);
          }
        }}
        onBlur={() => {
          setTimeout(() => setShowSuggestions(false), 200);
        }}
        placeholderTextColor="#A1B5C1"
      />
      
      {showSuggestions && filteredItems.length > 0 && (
        <View className="absolute top-full left-0 right-0 bg-bgLight dark:bg-bgDark border border-iconLight dark:border-iconDark rounded-md mt-0.5 max-h-48 z-[9999] shadow-card">
          {filteredItems.slice(0, 5).map((item, index) => (
            <View key={item.id || index}>
              <Pressable
                onPress={() => handleSelectItem(item)}
                className="px-3 py-2.5"
                android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
              >
                <Text className="text-textLight dark:text-textDark text-base">
                  {item.title}
                </Text>
              </Pressable>
              {index < Math.min(filteredItems.length, 5) - 1 && (
                <View className="h-px bg-iconLight dark:bg-iconDark mx-3" />
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
