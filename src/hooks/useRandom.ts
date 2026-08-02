import { useMutation } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getRandom } from '../api/random';
import type { RootStackParamList } from '../navigation/StackNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function useRandom() {
  const navigation = useNavigation<NavigationProp>();

  return useMutation({
    mutationFn: getRandom,
    onSuccess: id => {
      if (!id) {
        return;
      }

      navigation.push('Watch', { id, episode: 1 });
    },
  });
}
