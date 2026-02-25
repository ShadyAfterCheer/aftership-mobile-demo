import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

const AVATAR_SIZE = 120;

export default function ProfileScreen() {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Option 1: 从相册选图
  const pickFromGallery = async () => {
    
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('权限不足', '请在设置中允许访问相册');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setLoading(true);
      try {
        const processed = await processImage(result.assets[0].uri);
        setAvatar(processed);
      } catch (e) {
        Alert.alert('处理失败', String(e));
      } finally {
        setLoading(false);
      }
    }
  };

  // Option 2: 调用摄像头拍照
  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('权限不足', '请在设置中允许使用相机');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setLoading(true);
      try {
        const processed = await processImage(result.assets[0].uri);
        setAvatar(processed);
      } catch (e) {
        Alert.alert('处理失败', String(e));
      } finally {
        setLoading(false);
      }
    }
  };

  // Step 3: 拿到图片后，用 expo-image-manipulator 做裁剪/压缩
  const processImage = async (uri: string) => {
    const context = ImageManipulator.manipulate(uri);
    context.resize({ width: 400, height: 400 });
    const renderedImage = await context.renderAsync();
    const result = await renderedImage.saveAsync({
      compress: 0.8,
      format: SaveFormat.JPEG,
    });
    return result.uri;
  };

  const showAvatarOptions = () => {
    Alert.alert('更换头像', '请选择头像来源', [
      { text: '拍照', onPress: takePhoto },
      { text: '从相册选择', onPress: pickFromGallery },
      { text: '取消', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>我的</Text>

      <TouchableOpacity onPress={showAvatarOptions} style={styles.avatarWrapper}>
        {!!loading ? (
          <View style={styles.avatarPlaceholder}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>点击设置头像</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.hint}>
        点击头像 → 选择拍照或从相册选取 → 自动裁剪压缩
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 32,
    color: '#1a1a1a',
  },
  avatarWrapper: {
    marginBottom: 20,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarPlaceholder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 13,
    color: '#999',
  },
  hint: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
  },
});
