
import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { dataStore } from '../../data/store';
import { Space } from '../../types';
import Icon from '../../components/Icon';

export default function AdminDashboard() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [deletedSpaces, setDeletedSpaces] = useState<Space[]>([]);
  const currentUser = dataStore.getCurrentUser();

  useEffect(() => {
    console.log('AdminDashboard mounted, current user:', currentUser);
    if (!currentUser || currentUser.role !== 'admin') {
      console.log('User not admin, redirecting to home');
      router.replace('/');
      return;
    }
    loadSpaces();
  }, []);

  // Refresh spaces when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('AdminDashboard focused, reloading spaces');
      loadSpaces();
    }, [])
  );

  const loadSpaces = () => {
    console.log('Loading spaces...');
    const activeSpaces = dataStore.getSpaces();
    const deletedSpacesList = dataStore.getDeletedSpaces();
    
    console.log('Active spaces count:', activeSpaces.length);
    console.log('Deleted spaces count:', deletedSpacesList.length);
    
    setSpaces(activeSpaces);
    setDeletedSpaces(deletedSpacesList);
  };

  const handleDeleteSpace = (spaceId: string) => {
    console.log('Attempting to delete space:', spaceId);
    Alert.alert(
      'Delete Space',
      'Are you sure you want to delete this space? It will be moved to the recycle bin.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            console.log('Deleting space:', spaceId);
            dataStore.deleteSpace(spaceId);
            loadSpaces();
          }
        }
      ]
    );
  };

  const handleRestoreSpace = (spaceId: string) => {
    console.log('Restoring space:', spaceId);
    dataStore.restoreSpace(spaceId);
    loadSpaces();
  };

  const SpaceCard = ({ space, isDeleted = false }: { space: Space; isDeleted?: boolean }) => (
    <View style={commonStyles.card}>
      <View style={commonStyles.spaceBetween}>
        <View style={{ flex: 1 }}>
          <Text style={commonStyles.subtitle}>{space.name}</Text>
          <Text style={commonStyles.textSecondary}>Room: {space.number}</Text>
          <Text style={[commonStyles.textSecondary, { marginTop: 4 }]}>
            Manager: {space.manager.name}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {!isDeleted && (
            <>
              <TouchableOpacity
                style={{ padding: 8, marginRight: 8 }}
                onPress={() => router.push(`/admin/space/${space.id}`)}
              >
                <Icon name="eye" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={{ padding: 8, marginRight: 8 }}
                onPress={() => router.push(`/admin/edit-space/${space.id}`)}
              >
                <Icon name="create" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={{ padding: 8 }}
                onPress={() => handleDeleteSpace(space.id)}
              >
                <Icon name="trash" size={20} color={colors.error} />
              </TouchableOpacity>
            </>
          )}
          {isDeleted && (
            <TouchableOpacity
              style={{ padding: 8 }}
              onPress={() => handleRestoreSpace(space.id)}
            >
              <Icon name="refresh" size={20} color={colors.success} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle}>Admin Dashboard</Text>
      </View>

      <ScrollView style={commonStyles.content}>
        <View style={commonStyles.section}>
          <View style={commonStyles.spaceBetween}>
            <Text style={commonStyles.title}>Active Spaces ({spaces.length})</Text>
            <TouchableOpacity
              style={[buttonStyles.primary, { paddingHorizontal: 16, paddingVertical: 8 }]}
              onPress={() => {
                console.log('Navigating to create space');
                router.push('/admin/create-space');
              }}
            >
              <Text style={{ color: colors.backgroundAlt, fontSize: 14, fontWeight: '600' }}>
                + New Space
              </Text>
            </TouchableOpacity>
          </View>

          {spaces.length === 0 ? (
            <View style={[commonStyles.card, { alignItems: 'center', paddingVertical: 40 }]}>
              <Icon name="business" size={48} color={colors.textSecondary} />
              <Text style={[commonStyles.textSecondary, { marginTop: 16, textAlign: 'center' }]}>
                No spaces created yet. Create your first space to get started.
              </Text>
            </View>
          ) : (
            spaces.map(space => (
              <SpaceCard key={space.id} space={space} />
            ))
          )}
        </View>

        {deletedSpaces.length > 0 && (
          <View style={commonStyles.section}>
            <Text style={commonStyles.title}>Recycle Bin ({deletedSpaces.length})</Text>
            {deletedSpaces.map(space => (
              <SpaceCard key={space.id} space={space} isDeleted={true} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
