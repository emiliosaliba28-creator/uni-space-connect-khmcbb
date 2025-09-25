
import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, Alert } from 'react-native';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { dataStore } from '../../data/store';
import { BarCodeScanner } from 'expo-barcode-scanner';
import Icon from '../../components/Icon';

export default function UserDashboard() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const currentUser = dataStore.getCurrentUser();

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'user') {
      router.replace('/');
      return;
    }
    getBarCodeScannerPermissions();
  }, []);

  const getBarCodeScannerPermissions = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    setShowScanner(false);
    
    try {
      const qrData = JSON.parse(data);
      if (qrData.type === 'space' && qrData.spaceId) {
        router.push(`/user/space/${qrData.spaceId}`);
      } else {
        Alert.alert('Invalid QR Code', 'This QR code is not valid for this app.');
      }
    } catch (error) {
      console.log('Error parsing QR code:', error);
      Alert.alert('Invalid QR Code', 'This QR code format is not recognized.');
    }
  };

  const startScanning = () => {
    if (hasPermission === null) {
      Alert.alert('Permission Required', 'Camera permission is required to scan QR codes.');
      return;
    }
    if (hasPermission === false) {
      Alert.alert('No Access', 'No access to camera. Please enable camera permissions in settings.');
      return;
    }
    setScanned(false);
    setShowScanner(true);
  };

  if (showScanner) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.header}>
          <TouchableOpacity onPress={() => setShowScanner(false)}>
            <Icon name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={commonStyles.headerTitle}>Scan QR Code</Text>
        </View>
        
        <View style={{ flex: 1 }}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={{ flex: 1 }}
          />
          
          <View style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 200,
            height: 200,
            marginTop: -100,
            marginLeft: -100,
            borderWidth: 2,
            borderColor: colors.primary,
            borderRadius: 12,
            backgroundColor: 'transparent',
          }} />
          
          <View style={{
            position: 'absolute',
            bottom: 100,
            left: 0,
            right: 0,
            alignItems: 'center',
          }}>
            <Text style={[commonStyles.text, { color: colors.backgroundAlt, textAlign: 'center' }]}>
              Position the QR code within the frame
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle}>Space Scanner</Text>
      </View>

      <View style={commonStyles.centerContent}>
        <Icon name="qr-code-outline" size={120} color={colors.primary} />
        <Text style={commonStyles.title}>Scan QR Code</Text>
        <Text style={[commonStyles.text, { textAlign: 'center', marginBottom: 40 }]}>
          Scan the QR code displayed at any university space to access its information
        </Text>

        <TouchableOpacity
          style={[buttonStyles.primary, { width: '100%', maxWidth: 300 }]}
          onPress={startScanning}
        >
          <Text style={{ color: colors.backgroundAlt, fontSize: 16, fontWeight: '600' }}>
            Start Scanning
          </Text>
        </TouchableOpacity>

        {hasPermission === false && (
          <Text style={[commonStyles.textSecondary, { marginTop: 20, textAlign: 'center' }]}>
            Camera permission is required to scan QR codes. Please enable it in your device settings.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
