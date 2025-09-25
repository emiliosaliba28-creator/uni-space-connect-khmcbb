
import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, ScrollView, Image, Alert, Linking } from 'react-native';
import { commonStyles, colors, buttonStyles } from '../../../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { dataStore } from '../../../data/store';
import { Space } from '../../../types';
import Icon from '../../../components/Icon';
import QRCode from 'react-native-qrcode-svg';
import * as Sharing from 'expo-sharing';

export default function SpaceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [space, setSpace] = useState<Space | null>(null);

  useEffect(() => {
    if (id) {
      const foundSpace = dataStore.getSpaceById(id);
      setSpace(foundSpace);
    }
  }, [id]);

  const handleShareQR = async () => {
    try {
      // In a real app, you would generate and save the QR code image
      Alert.alert('QR Code', 'QR code sharing functionality would be implemented here');
    } catch (error) {
      console.log('Error sharing QR code:', error);
      Alert.alert('Error', 'Failed to share QR code');
    }
  };

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Failed to open link');
    });
  };

  if (!space) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.centerContent}>
          <Text style={commonStyles.text}>Space not found</Text>
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
        <Text style={commonStyles.headerTitle}>{space.name}</Text>
      </View>

      <ScrollView style={commonStyles.content}>
        <View style={commonStyles.section}>
          <View style={commonStyles.card}>
            <Text style={commonStyles.title}>{space.name}</Text>
            <Text style={[commonStyles.text, { marginBottom: 8 }]}>Room: {space.number}</Text>
            {space.description && (
              <Text style={commonStyles.textSecondary}>{space.description}</Text>
            )}
          </View>
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>QR Code</Text>
          <View style={[commonStyles.card, { alignItems: 'center' }]}>
            <QRCode
              value={space.qrCode}
              size={200}
              backgroundColor={colors.backgroundAlt}
              color={colors.text}
            />
            <Text style={[commonStyles.textSecondary, { marginTop: 16, textAlign: 'center' }]}>
              Print and display this QR code at the space entrance
            </Text>
            <TouchableOpacity
              style={[buttonStyles.secondary, { marginTop: 16 }]}
              onPress={handleShareQR}
            >
              <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>
                Share QR Code
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {space.photos.length > 0 && (
          <View style={commonStyles.section}>
            <Text style={commonStyles.subtitle}>Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {space.photos.map((photo, index) => (
                <Image
                  key={index}
                  source={{ uri: photo }}
                  style={{
                    width: 200,
                    height: 150,
                    borderRadius: 8,
                    marginRight: 12,
                  }}
                />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>Manager</Text>
          <View style={commonStyles.card}>
            <Text style={commonStyles.text}>{space.manager.name}</Text>
            <Text style={commonStyles.textSecondary}>{space.manager.email}</Text>
            {space.manager.phone && (
              <Text style={commonStyles.textSecondary}>{space.manager.phone}</Text>
            )}
          </View>
        </View>

        {space.academicSupervisor.name && (
          <View style={commonStyles.section}>
            <Text style={commonStyles.subtitle}>Academic Supervisor</Text>
            <View style={commonStyles.card}>
              <Text style={commonStyles.text}>{space.academicSupervisor.name}</Text>
              <Text style={commonStyles.textSecondary}>{space.academicSupervisor.email}</Text>
              <Text style={commonStyles.textSecondary}>{space.academicSupervisor.department}</Text>
            </View>
          </View>
        )}

        {space.accessRequirements && (
          <View style={commonStyles.section}>
            <Text style={commonStyles.subtitle}>Access Requirements</Text>
            <View style={commonStyles.card}>
              <Text style={commonStyles.text}>{space.accessRequirements}</Text>
            </View>
          </View>
        )}

        {space.emergencyProcedures && (
          <View style={commonStyles.section}>
            <Text style={commonStyles.subtitle}>Emergency Procedures</Text>
            <View style={commonStyles.card}>
              <Text style={commonStyles.text}>{space.emergencyProcedures}</Text>
            </View>
          </View>
        )}

        {space.documentation.length > 0 && (
          <View style={commonStyles.section}>
            <Text style={commonStyles.subtitle}>Documents</Text>
            {space.documentation.map((doc) => (
              <View key={doc.id} style={[commonStyles.card, { flexDirection: 'row', alignItems: 'center' }]}>
                <Icon name="document" size={24} color={colors.primary} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={commonStyles.text}>{doc.name}</Text>
                  <Text style={commonStyles.textSecondary}>{(doc.size / 1024).toFixed(1)} KB</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {space.links.length > 0 && (
          <View style={commonStyles.section}>
            <Text style={commonStyles.subtitle}>Links</Text>
            {space.links.map((link) => (
              <TouchableOpacity
                key={link.id}
                style={[commonStyles.card, { flexDirection: 'row', alignItems: 'center' }]}
                onPress={() => handleOpenLink(link.url)}
              >
                <Icon name="link" size={24} color={colors.primary} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={commonStyles.text}>{link.title}</Text>
                  <Text style={commonStyles.textSecondary}>{link.url}</Text>
                  {link.description && (
                    <Text style={commonStyles.textSecondary}>{link.description}</Text>
                  )}
                </View>
                <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ paddingBottom: 40 }}>
          <TouchableOpacity
            style={buttonStyles.primary}
            onPress={() => router.push(`/admin/edit-space/${space.id}`)}
          >
            <Text style={{ color: colors.backgroundAlt, fontSize: 16, fontWeight: '600' }}>
              Edit Space
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
