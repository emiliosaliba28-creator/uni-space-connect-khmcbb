
import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, ScrollView, TextInput, Alert, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles, colors, buttonStyles } from '../../../styles/commonStyles';
import Icon from '../../../components/Icon';
import { dataStore } from '../../../data/store';
import { Space, DocumentFile, Link } from '../../../types';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

export default function EditSpace() {
  const { id } = useLocalSearchParams();
  const spaceId = Array.isArray(id) ? id[0] : id;
  
  const [loading, setLoading] = useState(false);
  const [space, setSpace] = useState<Space | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    description: '',
    managerName: '',
    managerEmail: '',
    managerPhone: '',
    supervisorName: '',
    supervisorEmail: '',
    supervisorDepartment: '',
    accessRequirements: '',
    emergencyProcedures: ''
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [links, setLinks] = useState<Link[]>([]);

  useEffect(() => {
    console.log('EditSpace mounted with ID:', spaceId);
    if (!spaceId) {
      console.log('No space ID provided, redirecting back');
      router.back();
      return;
    }

    const currentUser = dataStore.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      console.log('User not admin, redirecting to home');
      router.replace('/');
      return;
    }

    loadSpace();
  }, [spaceId]);

  const loadSpace = () => {
    console.log('Loading space for editing:', spaceId);
    const spaceData = dataStore.getSpaceById(spaceId as string);
    
    if (!spaceData) {
      console.log('Space not found:', spaceId);
      Alert.alert('Error', 'Space not found', [
        { text: 'OK', onPress: () => router.back() }
      ]);
      return;
    }

    console.log('Space loaded:', spaceData.name);
    setSpace(spaceData);
    setFormData({
      name: spaceData.name,
      number: spaceData.number,
      description: spaceData.description || '',
      managerName: spaceData.manager.name,
      managerEmail: spaceData.manager.email,
      managerPhone: spaceData.manager.phone || '',
      supervisorName: spaceData.academicSupervisor.name,
      supervisorEmail: spaceData.academicSupervisor.email,
      supervisorDepartment: spaceData.academicSupervisor.department,
      accessRequirements: spaceData.accessRequirements,
      emergencyProcedures: spaceData.emergencyProcedures
    });
    setPhotos(spaceData.photos);
    setDocuments(spaceData.documentation);
    setLinks(spaceData.links);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('Photo selected:', result.assets[0].uri);
        setPhotos(prev => [...prev, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleRemovePhoto = (index: number) => {
    console.log('Removing photo at index:', index);
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const doc = result.assets[0];
        console.log('Document selected:', doc.name);
        const newDoc: DocumentFile = {
          id: Date.now().toString(),
          name: doc.name,
          uri: doc.uri,
          type: doc.mimeType || 'application/octet-stream',
          size: doc.size || 0
        };
        setDocuments(prev => [...prev, newDoc]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleRemoveDocument = (id: string) => {
    console.log('Removing document:', id);
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const handleAddLink = () => {
    const newLink: Link = {
      id: Date.now().toString(),
      title: 'New Link',
      url: 'https://',
      description: ''
    };
    console.log('Adding new link');
    setLinks(prev => [...prev, newLink]);
  };

  const handleRemoveLink = (id: string) => {
    console.log('Removing link:', id);
    setLinks(prev => prev.filter(link => link.id !== id));
  };

  const handleUpdateLink = (id: string, field: string, value: string) => {
    setLinks(prev => prev.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ));
  };

  const handleSave = async () => {
    console.log('Attempting to update space...');
    
    // Validation
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Space name is required');
      return;
    }
    if (!formData.number.trim()) {
      Alert.alert('Error', 'Room number is required');
      return;
    }
    if (!formData.managerName.trim()) {
      Alert.alert('Error', 'Manager name is required');
      return;
    }
    if (!formData.managerEmail.trim()) {
      Alert.alert('Error', 'Manager email is required');
      return;
    }
    if (!formData.supervisorName.trim()) {
      Alert.alert('Error', 'Academic supervisor name is required');
      return;
    }
    if (!formData.supervisorEmail.trim()) {
      Alert.alert('Error', 'Academic supervisor email is required');
      return;
    }
    if (!formData.supervisorDepartment.trim()) {
      Alert.alert('Error', 'Academic supervisor department is required');
      return;
    }
    if (!formData.accessRequirements.trim()) {
      Alert.alert('Error', 'Access requirements are required');
      return;
    }
    if (!formData.emergencyProcedures.trim()) {
      Alert.alert('Error', 'Emergency procedures are required');
      return;
    }

    setLoading(true);

    try {
      const updatedSpace: Partial<Space> = {
        name: formData.name.trim(),
        number: formData.number.trim(),
        description: formData.description.trim(),
        photos,
        manager: {
          name: formData.managerName.trim(),
          email: formData.managerEmail.trim(),
          phone: formData.managerPhone.trim()
        },
        academicSupervisor: {
          name: formData.supervisorName.trim(),
          email: formData.supervisorEmail.trim(),
          department: formData.supervisorDepartment.trim()
        },
        accessRequirements: formData.accessRequirements.trim(),
        documentation: documents,
        links,
        emergencyProcedures: formData.emergencyProcedures.trim()
      };

      console.log('Updating space with data:', updatedSpace);
      dataStore.updateSpace(spaceId as string, updatedSpace);
      
      console.log('Space updated successfully');
      Alert.alert('Success', 'Space updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error updating space:', error);
      Alert.alert('Error', 'Failed to update space. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!space) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={commonStyles.text}>Loading...</Text>
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
        <Text style={commonStyles.headerTitle}>Edit Space</Text>
      </View>

      <ScrollView style={commonStyles.content}>
        <View style={commonStyles.section}>
          <Text style={commonStyles.title}>Basic Information</Text>
          
          <View style={commonStyles.inputGroup}>
            <Text style={commonStyles.label}>Space Name *</Text>
            <TextInput
              style={commonStyles.input}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Enter space name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={commonStyles.inputGroup}>
            <Text style={commonStyles.label}>Room Number *</Text>
            <TextInput
              style={commonStyles.input}
              value={formData.number}
              onChangeText={(value) => handleInputChange('number', value)}
              placeholder="Enter room number"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={commonStyles.inputGroup}>
            <Text style={commonStyles.label}>Description</Text>
            <TextInput
              style={[commonStyles.input, { height: 80, textAlignVertical: 'top' }]}
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              placeholder="Enter space description"
              placeholderTextColor={colors.textSecondary}
              multiline
            />
          </View>
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.title}>Photos</Text>
          <TouchableOpacity
            style={[buttonStyles.secondary, { marginBottom: 16 }]}
            onPress={handleAddPhoto}
          >
            <Icon name="camera" size={20} color={colors.primary} />
            <Text style={[buttonStyles.secondaryText, { marginLeft: 8 }]}>Add Photo</Text>
          </TouchableOpacity>

          {photos.map((photo, index) => (
            <View key={index} style={[commonStyles.card, { marginBottom: 8 }]}>
              <View style={commonStyles.spaceBetween}>
                <Image source={{ uri: photo }} style={{ width: 60, height: 60, borderRadius: 8 }} />
                <TouchableOpacity
                  style={{ padding: 8 }}
                  onPress={() => handleRemovePhoto(index)}
                >
                  <Icon name="trash" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.title}>Manager Information</Text>
          
          <View style={commonStyles.inputGroup}>
            <Text style={commonStyles.label}>Manager Name *</Text>
            <TextInput
              style={commonStyles.input}
              value={formData.managerName}
              onChangeText={(value) => handleInputChange('managerName', value)}
              placeholder="Enter manager name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={commonStyles.inputGroup}>
            <Text style={commonStyles.label}>Manager Email *</Text>
            <TextInput
              style={commonStyles.input}
              value={formData.managerEmail}
              onChangeText={(value) => handleInputChange('managerEmail', value)}
              placeholder="Enter manager email"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={commonStyles.inputGroup}>
            <Text style={commonStyles.label}>Manager Phone</Text>
            <TextInput
              style={commonStyles.input}
              value={formData.managerPhone}
              onChangeText={(value) => handleInputChange('managerPhone', value)}
              placeholder="Enter manager phone"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.title}>Academic Supervisor</Text>
          
          <View style={commonStyles.inputGroup}>
            <Text style={commonStyles.label}>Supervisor Name *</Text>
            <TextInput
              style={commonStyles.input}
              value={formData.supervisorName}
              onChangeText={(value) => handleInputChange('supervisorName', value)}
              placeholder="Enter supervisor name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={commonStyles.inputGroup}>
            <Text style={commonStyles.label}>Supervisor Email *</Text>
            <TextInput
              style={commonStyles.input}
              value={formData.supervisorEmail}
              onChangeText={(value) => handleInputChange('supervisorEmail', value)}
              placeholder="Enter supervisor email"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={commonStyles.inputGroup}>
            <Text style={commonStyles.label}>Department *</Text>
            <TextInput
              style={commonStyles.input}
              value={formData.supervisorDepartment}
              onChangeText={(value) => handleInputChange('supervisorDepartment', value)}
              placeholder="Enter department"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.title}>Access Requirements</Text>
          <TextInput
            style={[commonStyles.input, { height: 80, textAlignVertical: 'top' }]}
            value={formData.accessRequirements}
            onChangeText={(value) => handleInputChange('accessRequirements', value)}
            placeholder="Enter access requirements"
            placeholderTextColor={colors.textSecondary}
            multiline
          />
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.title}>Documents</Text>
          <TouchableOpacity
            style={[buttonStyles.secondary, { marginBottom: 16 }]}
            onPress={handleAddDocument}
          >
            <Icon name="document" size={20} color={colors.primary} />
            <Text style={[buttonStyles.secondaryText, { marginLeft: 8 }]}>Add Document</Text>
          </TouchableOpacity>

          {documents.map((doc) => (
            <View key={doc.id} style={[commonStyles.card, { marginBottom: 8 }]}>
              <View style={commonStyles.spaceBetween}>
                <View style={{ flex: 1 }}>
                  <Text style={commonStyles.text}>{doc.name}</Text>
                  <Text style={commonStyles.textSecondary}>
                    {(doc.size / 1024 / 1024).toFixed(2)} MB
                  </Text>
                </View>
                <TouchableOpacity
                  style={{ padding: 8 }}
                  onPress={() => handleRemoveDocument(doc.id)}
                >
                  <Icon name="trash" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.title}>Links</Text>
          <TouchableOpacity
            style={[buttonStyles.secondary, { marginBottom: 16 }]}
            onPress={handleAddLink}
          >
            <Icon name="link" size={20} color={colors.primary} />
            <Text style={[buttonStyles.secondaryText, { marginLeft: 8 }]}>Add Link</Text>
          </TouchableOpacity>

          {links.map((link) => (
            <View key={link.id} style={[commonStyles.card, { marginBottom: 16 }]}>
              <View style={commonStyles.inputGroup}>
                <Text style={commonStyles.label}>Title</Text>
                <TextInput
                  style={commonStyles.input}
                  value={link.title}
                  onChangeText={(value) => handleUpdateLink(link.id, 'title', value)}
                  placeholder="Enter link title"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              <View style={commonStyles.inputGroup}>
                <Text style={commonStyles.label}>URL</Text>
                <TextInput
                  style={commonStyles.input}
                  value={link.url}
                  onChangeText={(value) => handleUpdateLink(link.id, 'url', value)}
                  placeholder="Enter URL"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>
              <View style={commonStyles.inputGroup}>
                <Text style={commonStyles.label}>Description</Text>
                <TextInput
                  style={commonStyles.input}
                  value={link.description || ''}
                  onChangeText={(value) => handleUpdateLink(link.id, 'description', value)}
                  placeholder="Enter description"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              <TouchableOpacity
                style={[buttonStyles.secondary, { backgroundColor: colors.error + '20' }]}
                onPress={() => handleRemoveLink(link.id)}
              >
                <Icon name="trash" size={16} color={colors.error} />
                <Text style={[buttonStyles.secondaryText, { color: colors.error, marginLeft: 8 }]}>
                  Remove Link
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.title}>Emergency Procedures</Text>
          <TextInput
            style={[commonStyles.input, { height: 100, textAlignVertical: 'top' }]}
            value={formData.emergencyProcedures}
            onChangeText={(value) => handleInputChange('emergencyProcedures', value)}
            placeholder="Enter emergency procedures"
            placeholderTextColor={colors.textSecondary}
            multiline
          />
        </View>

        <View style={[commonStyles.section, { paddingBottom: 40 }]}>
          <TouchableOpacity
            style={[buttonStyles.primary, { opacity: loading ? 0.7 : 1 }]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={buttonStyles.primaryText}>
              {loading ? 'Updating Space...' : 'Update Space'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
