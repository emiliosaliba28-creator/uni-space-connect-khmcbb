
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
    try {
      const activeSpaces = dataStore.getSpaces();
      const deletedSpacesList = dataStore.getDeletedSpaces();
      
      console.log('Active spaces count:', activeSpaces.length);
      console.log('Deleted spaces count:', deletedSpacesList.length);
      
      setSpaces(activeSpaces);
      setDeletedSpaces(deletedSpacesList);
    } catch (error) {
      console.error('Error loading spaces:', error);
      Alert.alert('Error', 'Failed to load spaces. Please try again.');
    }
  };

  const handleDeleteSpace = (spaceId: string) => {
    console.log('Delete button pressed for space:', spaceId);
    
    if (!spaceId) {
      console.error('No space ID provided for deletion');
      Alert.alert('Error', 'Invalid space ID. Cannot delete space.');
      return;
    }
    
    // Find the space to get its name for the confirmation dialog
    const space = spaces.find(s => s.id === spaceId);
    if (!space) {
      console.error('Space not found for deletion:', spaceId);
      Alert.alert('Error', 'Space not found. Cannot delete space.');
      return;
    }
    
    const spaceName = space.name;
    
    Alert.alert(
      'Delete Space',
      `Are you sure you want to delete "${spaceName}"? It will be moved to the recycle bin and can be restored later.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => console.log('Delete cancelled for space:', spaceId)
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            console.log('Confirming delete for space:', spaceId);
            try {
              const success = dataStore.deleteSpace(spaceId);
              if (success) {
                console.log('Space deleted successfully, reloading spaces');
                loadSpaces();
                Alert.alert('Success', `"${spaceName}" has been moved to the recycle bin.`);
              } else {
                console.error('Failed to delete space:', spaceId);
                Alert.alert('Error', 'Failed to delete space. Please try again.');
              }
            } catch (error) {
              console.error('Error deleting space:', error);
              Alert.alert('Error', 'An error occurred while deleting the space. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleRestoreSpace = (spaceId: string) => {
    console.log('Restore button pressed for space:', spaceId);
    
    if (!spaceId) {
      console.error('No space ID provided for restoration');
      Alert.alert('Error', 'Invalid space ID. Cannot restore space.');
      return;
    }
    
    // Find the space to get its name for the confirmation dialog
    const space = deletedSpaces.find(s => s.id === spaceId);
    if (!space) {
      console.error('Space not found for restoration:', spaceId);
      Alert.alert('Error', 'Space not found in recycle bin. Cannot restore space.');
      return;
    }
    
    const spaceName = space.name;
    
    Alert.alert(
      'Restore Space',
      `Are you sure you want to restore "${spaceName}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => console.log('Restore cancelled for space:', spaceId)
        },
        {
          text: 'Restore',
          onPress: () => {
            console.log('Confirming restore for space:', spaceId);
            try {
              const success = dataStore.restoreSpace(spaceId);
              if (success) {
                console.log('Space restored successfully, reloading spaces');
                loadSpaces();
                Alert.alert('Success', `"${spaceName}" has been restored.`);
              } else {
                console.error('Failed to restore space:', spaceId);
                Alert.alert('Error', 'Failed to restore space. Please try again.');
              }
            } catch (error) {
              console.error('Error restoring space:', error);
              Alert.alert('Error', 'An error occurred while restoring the space. Please try again.');
            }
          }
        }
      ]
    );
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
          {isDeleted && (
            <Text style={[commonStyles.textSecondary, { marginTop: 4, color: colors.error }]}>
              Deleted on: {new Date(space.updatedAt).toLocaleDateString()}
            </Text>
          )}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {!isDeleted && (
            <>
              <TouchableOpacity
                style={{ padding: 8, marginRight: 8 }}
                onPress={() => {
                  console.log('Navigating to space view:', space.id);
                  router.push(`/admin/space/${space.id}`);
                }}
              >
                <Icon name="eye" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={{ padding: 8, marginRight: 8 }}
                onPress={() => {
                  console.log('Navigating to edit space:', space.id);
                  router.push(`/admin/edit-space/${space.id}`);
                }}
              >
                <Icon name="create" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={{ padding: 8 }}
                onPress={() => {
                  console.log('Delete button onPress triggered for space:', space.id);
                  handleDeleteSpace(space.id);
                }}
                activeOpacity={0.7}
              >
                <Icon name="trash" size={20} color={colors.error} />
              </TouchableOpacity>
            </>
          )}
          {isDeleted && (
            <TouchableOpacity
              style={{ padding: 8 }}
              onPress={() => {
                console.log('Restore button onPress triggered for space:', space.id);
                handleRestoreSpace(space.id);
              }}
              activeOpacity={0.7}
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
            <Text style={[commonStyles.textSecondary, { marginBottom: 16 }]}>
              Deleted spaces can be restored from here.
            </Text>
            {deletedSpaces.map(space => (
              <SpaceCard key={space.id} space={space} isDeleted={true} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
