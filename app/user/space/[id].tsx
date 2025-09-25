
import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, ScrollView, Image, Alert, Linking } from 'react-native';
import { commonStyles, colors, buttonStyles } from '../../../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { dataStore } from '../../../data/store';
import { Space } from '../../../types';
import Icon from '../../../components/Icon';

export default function UserSpaceView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [space, setSpace] = useState<Space | null>(null);

  useEffect(() => {
    if (id) {
      const foundSpace = dataStore.getSpaceById(id);
      setSpace(foundSpace);
    }
  }, [id]);

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Failed to open link');
    });
  };

  const handleContactManager = () => {
    if (space?.manager.email) {
      Linking.openURL(`mailto:${space.manager.email}`).catch(() => {
        Alert.alert('Error', 'Failed to open email app');
      });
    }
  };

  const handleCallManager = () => {
    if (space?.manager.phone) {
      Linking.openURL(`tel:${space.manager.phone}`).catch(() => {
        Alert.alert('Error', 'Failed to make phone call');
      });
    }
  };

  if (!space) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.centerContent}>
          <Icon name="alert-circle" size={64} color={colors.error} />
          <Text style={[commonStyles.title, { marginTop: 16 }]}>Space Not Found</Text>
          <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginBottom: 32 }]}>
            The space you're looking for doesn't exist or has been removed.
          </Text>
          <TouchableOpacity
            style={buttonStyles.primary}
            onPress={() => router.back()}
          >
            <Text style={{ color: colors.backgroundAlt, fontSize: 16, fontWeight: '600' }}>
              Go Back
            </Text>
          </TouchableOpacity>
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
          <Text style={commonStyles.subtitle}>Contact Information</Text>
          <View style={commonStyles.card}>
            <View style={commonStyles.spaceBetween}>
              <View style={{ flex: 1 }}>
                <Text style={[commonStyles.text, { fontWeight: '600' }]}>Manager</Text>
                <Text style={commonStyles.text}>{space.manager.name}</Text>
                <Text style={commonStyles.textSecondary}>{space.manager.email}</Text>
                {space.manager.phone && (
                  <Text style={commonStyles.textSecondary}>{space.manager.phone}</Text>
                )}
              </View>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  style={{ padding: 8, marginRight: 8 }}
                  onPress={handleContactManager}
                >
                  <Icon name="mail" size={24} color={colors.primary} />
                </TouchableOpacity>
                {space.manager.phone && (
                  <TouchableOpacity
                    style={{ padding: 8 }}
                    onPress={handleCallManager}
                  >
                    <Icon name="call" size={24} color={colors.primary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {space.academicSupervisor.name && (
            <View style={commonStyles.card}>
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>Academic Supervisor</Text>
              <Text style={commonStyles.text}>{space.academicSupervisor.name}</Text>
              <Text style={commonStyles.textSecondary}>{space.academicSupervisor.email}</Text>
              <Text style={commonStyles.textSecondary}>{space.academicSupervisor.department}</Text>
            </View>
          )}
        </View>

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
            <View style={[commonStyles.card, { borderLeftWidth: 4, borderLeftColor: colors.error }]}>
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
                <Icon name="download" size={20} color={colors.textSecondary} />
              </View>
            ))}
          </View>
        )}

        {space.links.length > 0 && (
          <View style={commonStyles.section}>
            <Text style={commonStyles.subtitle}>Useful Links</Text>
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
                <Icon name="open" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ paddingBottom: 40 }}>
          <TouchableOpacity
            style={buttonStyles.primary}
            onPress={() => router.push('/user')}
          >
            <Text style={{ color: colors.backgroundAlt, fontSize: 16, fontWeight: '600' }}>
              Scan Another QR Code
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
