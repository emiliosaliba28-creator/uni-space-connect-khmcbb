
import React, { useState } from 'react';
import { Text, View, TouchableOpacity, ScrollView, TextInput, Alert, Image } from 'react-native';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { dataStore } from '../../data/store';
import { Space, DocumentFile, Link } from '../../types';
import Icon from '../../components/Icon';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

export default function CreateSpace() {
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
    emergencyProcedures: '',
  });
  
  const [photos, setPhotos] = useState<string[]>([]);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [newLink, setNewLink] = useState({ title: '', url: '', description: '' });
  const [isCreating, setIsCreating] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    console.log(`Input changed - ${field}: ${value}`);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddPhoto = async () => {
    try {
      console.log('Adding photo...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('Photo added:', result.assets[0].uri);
        setPhotos(prev => [...prev, result.assets[0].uri]);
      }
    } catch (error) {
      console.log('Error adding photo:', error);
      Alert.alert('Error', 'Failed to add photo');
    }
  };

  const handleRemovePhoto = (index: number) => {
    console.log('Removing photo at index:', index);
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddDocument = async () => {
    try {
      console.log('Adding document...');
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const doc: DocumentFile = {
          id: Date.now().toString(),
          name: result.assets[0].name,
          uri: result.assets[0].uri,
          type: result.assets[0].mimeType || 'application/octet-stream',
          size: result.assets[0].size || 0,
        };
        console.log('Document added:', doc.name);
        setDocuments(prev => [...prev, doc]);
      }
    } catch (error) {
      console.log('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleRemoveDocument = (id: string) => {
    console.log('Removing document with id:', id);
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const handleAddLink = () => {
    console.log('Adding link:', newLink);
    if (newLink.title && newLink.url) {
      const link: Link = {
        id: Date.now().toString(),
        title: newLink.title,
        url: newLink.url,
        description: newLink.description,
      };
      setLinks(prev => [...prev, link]);
      setNewLink({ title: '', url: '', description: '' });
      console.log('Link added successfully');
    } else {
      Alert.alert('Error', 'Please enter both title and URL');
    }
  };

  const handleRemoveLink = (id: string) => {
    console.log('Removing link with id:', id);
    setLinks(prev => prev.filter(link => link.id !== id));
  };

  const handleSave = async () => {
    console.log('Starting space creation...');
    console.log('Form data:', formData);
    
    if (isCreating) {
      console.log('Already creating space, ignoring duplicate request');
      return;
    }

    // Validate required fields
    if (!formData.name || !formData.number || !formData.managerName || !formData.managerEmail) {
      console.log('Validation failed - missing required fields');
      Alert.alert('Error', 'Please fill in all required fields (Name, Number, Manager Name, Manager Email)');
      return;
    }

    setIsCreating(true);

    try {
      // Generate unique ID for the space
      const spaceId = `space_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('Generated space ID:', spaceId);

      const newSpace: Space = {
        id: spaceId,
        name: formData.name,
        number: formData.number,
        description: formData.description,
        photos,
        manager: {
          name: formData.managerName,
          email: formData.managerEmail,
          phone: formData.managerPhone,
        },
        academicSupervisor: {
          name: formData.supervisorName,
          email: formData.supervisorEmail,
          department: formData.supervisorDepartment,
        },
        accessRequirements: formData.accessRequirements,
        documentation: documents,
        links,
        emergencyProcedures: formData.emergencyProcedures,
        qrCode: JSON.stringify({ spaceId: spaceId, type: 'space' }),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false,
      };

      console.log('Created space object:', {
        id: newSpace.id,
        name: newSpace.name,
        number: newSpace.number,
        managerName: newSpace.manager.name
      });

      // Add space to store
      console.log('Adding space to store...');
      dataStore.addSpace(newSpace);
      
      console.log('Space added successfully, showing success alert');
      Alert.alert(
        'Success', 
        'Space created successfully!', 
        [
          { 
            text: 'OK', 
            onPress: () => {
              console.log('Navigating back to admin dashboard');
              router.back();
            }
          }
        ]
      );
    } catch (error) {
      console.log('Error creating space:', error);
      Alert.alert('Error', 'Failed to create space. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle}>Create New Space</Text>
      </View>

      <ScrollView style={commonStyles.content}>
        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>Basic Information</Text>
          
          <TextInput
            style={commonStyles.input}
            placeholder="Space Name *"
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
          />
          
          <TextInput
            style={commonStyles.input}
            placeholder="Room Number *"
            value={formData.number}
            onChangeText={(value) => handleInputChange('number', value)}
          />
          
          <TextInput
            style={commonStyles.textArea}
            placeholder="Description"
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            multiline
          />
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>Photos</Text>
          
          <TouchableOpacity
            style={[buttonStyles.secondary, { marginBottom: 16 }]}
            onPress={handleAddPhoto}
          >
            <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>
              + Add Photo
            </Text>
          </TouchableOpacity>

          {photos.map((photo, index) => (
            <View key={index} style={[commonStyles.card, { flexDirection: 'row', alignItems: 'center' }]}>
              <Image source={{ uri: photo }} style={{ width: 60, height: 60, borderRadius: 8 }} />
              <Text style={[commonStyles.text, { flex: 1, marginLeft: 12 }]}>Photo {index + 1}</Text>
              <TouchableOpacity onPress={() => handleRemovePhoto(index)}>
                <Icon name="close" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>Manager Information</Text>
          
          <TextInput
            style={commonStyles.input}
            placeholder="Manager Name *"
            value={formData.managerName}
            onChangeText={(value) => handleInputChange('managerName', value)}
          />
          
          <TextInput
            style={commonStyles.input}
            placeholder="Manager Email *"
            value={formData.managerEmail}
            onChangeText={(value) => handleInputChange('managerEmail', value)}
            keyboardType="email-address"
          />
          
          <TextInput
            style={commonStyles.input}
            placeholder="Manager Phone"
            value={formData.managerPhone}
            onChangeText={(value) => handleInputChange('managerPhone', value)}
            keyboardType="phone-pad"
          />
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>Academic Supervisor</Text>
          
          <TextInput
            style={commonStyles.input}
            placeholder="Supervisor Name"
            value={formData.supervisorName}
            onChangeText={(value) => handleInputChange('supervisorName', value)}
          />
          
          <TextInput
            style={commonStyles.input}
            placeholder="Supervisor Email"
            value={formData.supervisorEmail}
            onChangeText={(value) => handleInputChange('supervisorEmail', value)}
            keyboardType="email-address"
          />
          
          <TextInput
            style={commonStyles.input}
            placeholder="Department"
            value={formData.supervisorDepartment}
            onChangeText={(value) => handleInputChange('supervisorDepartment', value)}
          />
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>Access & Safety</Text>
          
          <TextInput
            style={commonStyles.textArea}
            placeholder="Access Requirements"
            value={formData.accessRequirements}
            onChangeText={(value) => handleInputChange('accessRequirements', value)}
            multiline
          />
          
          <TextInput
            style={commonStyles.textArea}
            placeholder="Emergency Procedures"
            value={formData.emergencyProcedures}
            onChangeText={(value) => handleInputChange('emergencyProcedures', value)}
            multiline
          />
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>Documents</Text>
          
          <TouchableOpacity
            style={[buttonStyles.secondary, { marginBottom: 16 }]}
            onPress={handleAddDocument}
          >
            <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>
              + Add Document
            </Text>
          </TouchableOpacity>

          {documents.map((doc) => (
            <View key={doc.id} style={[commonStyles.card, { flexDirection: 'row', alignItems: 'center' }]}>
              <Icon name="document" size={24} color={colors.primary} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={commonStyles.text}>{doc.name}</Text>
                <Text style={commonStyles.textSecondary}>{(doc.size / 1024).toFixed(1)} KB</Text>
              </View>
              <TouchableOpacity onPress={() => handleRemoveDocument(doc.id)}>
                <Icon name="close" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>Links</Text>
          
          <TextInput
            style={commonStyles.input}
            placeholder="Link Title"
            value={newLink.title}
            onChangeText={(value) => setNewLink(prev => ({ ...prev, title: value }))}
          />
          
          <TextInput
            style={commonStyles.input}
            placeholder="URL"
            value={newLink.url}
            onChangeText={(value) => setNewLink(prev => ({ ...prev, url: value }))}
            keyboardType="url"
          />
          
          <TextInput
            style={commonStyles.input}
            placeholder="Description (optional)"
            value={newLink.description}
            onChangeText={(value) => setNewLink(prev => ({ ...prev, description: value }))}
          />
          
          <TouchableOpacity
            style={[buttonStyles.secondary, { marginBottom: 16 }]}
            onPress={handleAddLink}
          >
            <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>
              Add Link
            </Text>
          </TouchableOpacity>

          {links.map((link) => (
            <View key={link.id} style={[commonStyles.card, { flexDirection: 'row', alignItems: 'center' }]}>
              <Icon name="link" size={24} color={colors.primary} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={commonStyles.text}>{link.title}</Text>
                <Text style={commonStyles.textSecondary}>{link.url}</Text>
              </View>
              <TouchableOpacity onPress={() => handleRemoveLink(link.id)}>
                <Icon name="close" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={{ paddingBottom: 40 }}>
          <TouchableOpacity
            style={[
              buttonStyles.primary,
              isCreating && { opacity: 0.6 }
            ]}
            onPress={handleSave}
            disabled={isCreating}
          >
            <Text style={{ color: colors.backgroundAlt, fontSize: 16, fontWeight: '600' }}>
              {isCreating ? 'Creating Space...' : 'Create Space'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
