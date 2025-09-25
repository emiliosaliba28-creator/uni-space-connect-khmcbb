
import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, Alert } from 'react-native';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { dataStore } from '../data/store';
import Icon from '../components/Icon';

export default function MainScreen() {
  const [currentUser, setCurrentUser] = useState(dataStore.getCurrentUser());

  useEffect(() => {
    // Initialize mock data for development
    if (!currentUser) {
      dataStore.initializeMockData();
      setCurrentUser(dataStore.getCurrentUser());
    }
  }, []);

  const handleLogin = () => {
    // For now, we'll simulate login
    Alert.alert(
      'Login Type',
      'Select your login type:',
      [
        {
          text: 'Admin Login',
          onPress: () => {
            dataStore.setCurrentUser({
              id: '1',
              email: 'admin@university.edu',
              name: 'Admin User',
              role: 'admin',
              universityId: 'ADMIN001'
            });
            setCurrentUser(dataStore.getCurrentUser());
            router.push('/admin');
          }
        },
        {
          text: 'User Login',
          onPress: () => {
            dataStore.setCurrentUser({
              id: '2',
              email: 'student@university.edu',
              name: 'Student User',
              role: 'user',
              universityId: 'STU001'
            });
            setCurrentUser(dataStore.getCurrentUser());
            router.push('/user');
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const handleLogout = () => {
    dataStore.setCurrentUser({
      id: '',
      email: '',
      name: '',
      role: 'user',
      universityId: ''
    });
    setCurrentUser(null);
  };

  if (currentUser && currentUser.id) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.centerContent}>
          <Icon name="school" size={80} color={colors.primary} />
          <Text style={commonStyles.title}>University Space Manager</Text>
          <Text style={commonStyles.text}>Welcome back, {currentUser.name}!</Text>
          <Text style={[commonStyles.textSecondary, { marginBottom: 40 }]}>
            Role: {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
          </Text>

          <View style={{ width: '100%', maxWidth: 300 }}>
            <TouchableOpacity
              style={[buttonStyles.primary, { marginBottom: 16 }]}
              onPress={() => router.push(currentUser.role === 'admin' ? '/admin' : '/user')}
            >
              <Text style={{ color: colors.backgroundAlt, fontSize: 16, fontWeight: '600' }}>
                {currentUser.role === 'admin' ? 'Admin Dashboard' : 'Scan QR Code'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={buttonStyles.secondary}
              onPress={handleLogout}
            >
              <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.centerContent}>
        <Icon name="school" size={80} color={colors.primary} />
        <Text style={commonStyles.title}>University Space Manager</Text>
        <Text style={[commonStyles.text, { textAlign: 'center', marginBottom: 40 }]}>
          Manage and access university spaces with QR codes
        </Text>

        <TouchableOpacity
          style={[buttonStyles.primary, { width: '100%', maxWidth: 300 }]}
          onPress={handleLogin}
        >
          <Text style={{ color: colors.backgroundAlt, fontSize: 16, fontWeight: '600' }}>
            University Login
          </Text>
        </TouchableOpacity>

        <Text style={[commonStyles.textSecondary, { marginTop: 20, textAlign: 'center' }]}>
          Use your university credentials to access the system
        </Text>
      </View>
    </SafeAreaView>
  );
}
