import { StyleSheet } from 'react-native';
import { DarkTheme, Theme } from '@react-navigation/native';

export const colors = {
  background: '#1c1c22',
  surface: '#26262e',
  text: '#f2f2f7',
  textMuted: '#a0a0a8',
  border: 'rgba(255, 255, 255, 0.08)',
  accent: '#7B8CFF',
} as const;

/** Caps content width on tablets / large screens; phones stay full-bleed. */
export const layout = {
  maxContentWidth: 960,
} as const;

export function getContentWidth(windowWidth: number) {
  return Math.min(windowWidth, layout.maxContentWidth);
}

export const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.border,
  },
};

export const stackScreenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: colors.background },
} as const;

export const tabScreenOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.accent,
  tabBarInactiveTintColor: colors.textMuted,
  tabBarActiveBackgroundColor: 'transparent',
  tabBarInactiveBackgroundColor: 'transparent',
  tabBarStyle: {
    backgroundColor: colors.background,
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    height: 76,
    paddingTop: 8,
    paddingBottom: 8,
  },
  tabBarLabelStyle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  tabBarIconStyle: {
    marginTop: 2,
  },
  sceneStyle: { backgroundColor: colors.background },
} as const;

export const globalStyles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
  },
});
