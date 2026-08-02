import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import type { IoniconsIconName } from '@react-native-vector-icons/ionicons/static';
import { Pressable } from 'react-native';
import { withOfflineGate } from '../components/ui/OfflineGate';
import { CategoryScreen } from '../screens/CategoryScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ScheduleScreen } from '../screens/ScheduleScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { tabScreenOptions } from '../theme';

export type TabParamList = {
  Home: undefined;
  Category: { tabId?: string } | undefined;
  Schedule: undefined;
  Search: undefined;
};

const TAB_ICONS: Record<
  keyof TabParamList,
  { active: IoniconsIconName; inactive: IoniconsIconName }
> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Category: { active: 'grid', inactive: 'grid-outline' },
  Schedule: { active: 'calendar', inactive: 'calendar-outline' },
  Search: { active: 'search', inactive: 'search-outline' },
};

function TabBarButton({
  android_ripple: _androidRipple,
  pressOpacity: _pressOpacity,
  pressColor: _pressColor,
  hoverEffect: _hoverEffect,
  ref: _ref,
  ...props
}: BottomTabBarButtonProps) {
  return <Pressable {...props} />;
}

const Tab = createBottomTabNavigator<TabParamList>();

const HomeTab = withOfflineGate(HomeScreen);
const CategoryTab = withOfflineGate(CategoryScreen);
const ScheduleTab = withOfflineGate(ScheduleScreen);
const SearchTab = withOfflineGate(SearchScreen);

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        ...tabScreenOptions,
        tabBarButton: TabBarButton,
        animation: 'shift',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeTab}
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? TAB_ICONS.Home.active : TAB_ICONS.Home.inactive}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Category"
        component={CategoryTab}
        options={{
          title: 'Category',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={
                focused
                  ? TAB_ICONS.Category.active
                  : TAB_ICONS.Category.inactive
              }
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduleTab}
        options={{
          title: 'Schedule',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={
                focused
                  ? TAB_ICONS.Schedule.active
                  : TAB_ICONS.Schedule.inactive
              }
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchTab}
        options={{
          title: 'Search',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={
                focused ? TAB_ICONS.Search.active : TAB_ICONS.Search.inactive
              }
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
