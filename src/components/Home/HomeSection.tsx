import { StyleSheet, Text } from 'react-native';
import { colors } from '../../theme';

type HomeSectionProps<T> = {
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  data: T[] | undefined;
  emptyMessage: string;
  errorMessage: string;
  loading: React.ReactNode;
  children: (data: T[]) => React.ReactNode;
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function HomeSection<T>({
  isLoading,
  isError,
  error,
  data,
  emptyMessage,
  errorMessage,
  loading,
  children,
}: HomeSectionProps<T>) {
  if (isLoading) {
    return <>{loading}</>;
  }

  if (isError) {
    return (
      <Text style={styles.message}>{getErrorMessage(error, errorMessage)}</Text>
    );
  }

  if (!data?.length) {
    return <Text style={styles.message}>{emptyMessage}</Text>;
  }

  return <>{children(data)}</>;
}

const styles = StyleSheet.create({
  message: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
});
