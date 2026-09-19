import { Tabs } from 'expo-router'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#111827' },
        headerTintColor: '#f9fafb',
        tabBarStyle: { backgroundColor: '#111827', borderTopColor: '#1f2937' },
        tabBarActiveTintColor: '#34d399',
        tabBarInactiveTintColor: '#9ca3af',
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Watchlist', tabBarLabel: 'Watchlist' }} />
      <Tabs.Screen name="signals" options={{ title: 'Signals', tabBarLabel: 'Signals' }} />
    </Tabs>
  )
}
