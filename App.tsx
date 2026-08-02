import { useEffect } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { UpdateRequiredModal } from './src/components/UpdateRequiredModal';
import { ScreenContainer } from './src/components/ui/ScreenContainer';
import { useAppUpdateCheck } from './src/hooks/useAppUpdateCheck';
import { useReminderNotificationNavigation } from './src/hooks/useReminderNotificationNavigation';
import { queryClient } from './src/lib/queryClient';
import { navigationRef } from './src/navigation/navigationRef';
import { StackNavigator } from './src/navigation/StackNavigator';
import { colors, navigationTheme } from './src/theme';

function ReminderNavigationBootstrap() {
  useReminderNotificationNavigation();
  return null;
}

function AppUpdateBootstrap() {
  const { update, visible, dismiss } = useAppUpdateCheck();

  if (!update) {
    return null;
  }

  return (
    <UpdateRequiredModal
      visible={visible}
      update={update}
      onDismiss={dismiss}
    />
  );
}

function AppNavigation() {
  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme}>
      <ReminderNavigationBootstrap />
      <AppUpdateBootstrap />
      <StatusBar backgroundColor="transparent" translucent />
      <View style={styles.root}>
        <ScreenContainer>
          <StackNavigator />
        </ScreenContainer>
      </View>
      <Toast />
    </NavigationContainer>
  );
}

export default function App() {
  useEffect(() => {
    SystemNavigationBar.setNavigationColor(colors.background, 'light');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AppNavigation />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
