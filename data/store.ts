
import { Space, User } from '../types';

class DataStore {
  private spaces: Space[] = [];
  private deletedSpaces: Space[] = [];
  private currentUser: User | null = null;

  // User management
  setCurrentUser(user: User) {
    this.currentUser = user;
    console.log('Current user set:', user.name, user.role);
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  // Space management
  addSpace(space: Space) {
    this.spaces.push(space);
    console.log('Space added:', space.name);
  }

  updateSpace(updatedSpace: Space): void;
  updateSpace(spaceId: string, updates: Partial<Space>): void;
  updateSpace(spaceIdOrSpace: string | Space, updates?: Partial<Space>): void {
    if (typeof spaceIdOrSpace === 'string') {
      // Called with spaceId and updates
      const spaceId = spaceIdOrSpace;
      console.log('Attempting to update space:', spaceId);
      
      // First check active spaces
      const activeIndex = this.spaces.findIndex(s => s.id === spaceId);
      if (activeIndex !== -1) {
        this.spaces[activeIndex] = { 
          ...this.spaces[activeIndex], 
          ...updates, 
          updatedAt: new Date().toISOString() 
        };
        console.log('Active space updated:', spaceId);
        return;
      }

      // Then check deleted spaces (in case we're editing a deleted space before restoring)
      const deletedIndex = this.deletedSpaces.findIndex(s => s.id === spaceId);
      if (deletedIndex !== -1) {
        this.deletedSpaces[deletedIndex] = { 
          ...this.deletedSpaces[deletedIndex], 
          ...updates, 
          updatedAt: new Date().toISOString() 
        };
        console.log('Deleted space updated:', spaceId);
        return;
      }

      console.warn('Space not found for update:', spaceId);
    } else {
      // Called with full space object
      const updatedSpace = spaceIdOrSpace;
      console.log('Attempting to update space with full object:', updatedSpace.id);
      
      // First check active spaces
      const activeIndex = this.spaces.findIndex(s => s.id === updatedSpace.id);
      if (activeIndex !== -1) {
        this.spaces[activeIndex] = { 
          ...updatedSpace, 
          updatedAt: new Date().toISOString() 
        };
        console.log('Active space updated:', updatedSpace.id);
        return;
      }

      // Then check deleted spaces
      const deletedIndex = this.deletedSpaces.findIndex(s => s.id === updatedSpace.id);
      if (deletedIndex !== -1) {
        this.deletedSpaces[deletedIndex] = { 
          ...updatedSpace, 
          updatedAt: new Date().toISOString() 
        };
        console.log('Deleted space updated:', updatedSpace.id);
        return;
      }

      console.warn('Space not found for update:', updatedSpace.id);
    }
  }

  deleteSpace(spaceId: string): boolean {
    console.log('Attempting to delete space:', spaceId);
    const spaceIndex = this.spaces.findIndex(s => s.id === spaceId);
    if (spaceIndex !== -1) {
      const space = this.spaces[spaceIndex];
      space.isDeleted = true;
      space.updatedAt = new Date().toISOString();
      this.deletedSpaces.push(space);
      this.spaces.splice(spaceIndex, 1);
      console.log('Space deleted and moved to recycle bin:', spaceId);
      return true;
    } else {
      console.warn('Space not found for deletion:', spaceId);
      return false;
    }
  }

  restoreSpace(spaceId: string): boolean {
    console.log('Attempting to restore space:', spaceId);
    const spaceIndex = this.deletedSpaces.findIndex(s => s.id === spaceId);
    if (spaceIndex !== -1) {
      const space = this.deletedSpaces[spaceIndex];
      space.isDeleted = false;
      space.updatedAt = new Date().toISOString();
      this.spaces.push(space);
      this.deletedSpaces.splice(spaceIndex, 1);
      console.log('Space restored from recycle bin:', spaceId);
      return true;
    } else {
      console.warn('Space not found for restoration:', spaceId);
      return false;
    }
  }

  getSpaces(): Space[] {
    return this.spaces.filter(s => !s.isDeleted);
  }

  getDeletedSpaces(): Space[] {
    return this.deletedSpaces;
  }

  getSpaceById(id: string): Space | null {
    // First check active spaces
    const activeSpace = this.spaces.find(s => s.id === id && !s.isDeleted);
    if (activeSpace) {
      console.log('Found active space:', id);
      return activeSpace;
    }

    // Then check deleted spaces (for editing purposes)
    const deletedSpace = this.deletedSpaces.find(s => s.id === id);
    if (deletedSpace) {
      console.log('Found deleted space:', id);
      return deletedSpace;
    }

    console.warn('Space not found:', id);
    return null;
  }

  // Permanently delete a space (remove from recycle bin)
  permanentlyDeleteSpace(spaceId: string): boolean {
    console.log('Permanently deleting space:', spaceId);
    const spaceIndex = this.deletedSpaces.findIndex(s => s.id === spaceId);
    if (spaceIndex !== -1) {
      this.deletedSpaces.splice(spaceIndex, 1);
      console.log('Space permanently deleted:', spaceId);
      return true;
    } else {
      console.warn('Space not found in recycle bin for permanent deletion:', spaceId);
      return false;
    }
  }

  // Mock data for development
  initializeMockData() {
    // Mock admin user
    this.setCurrentUser({
      id: '1',
      email: 'admin@university.edu',
      name: 'Admin User',
      role: 'admin',
      universityId: 'ADMIN001'
    });

    // Mock spaces
    const mockSpace: Space = {
      id: '1',
      name: 'Computer Lab A',
      number: 'CL-101',
      description: 'Main computer laboratory with 30 workstations',
      photos: ['https://images.unsplash.com/photo-1562774053-701939374585?w=400'],
      manager: {
        name: 'John Smith',
        email: 'j.smith@university.edu',
        phone: '+1-555-0123'
      },
      academicSupervisor: {
        name: 'Dr. Jane Doe',
        email: 'j.doe@university.edu',
        department: 'Computer Science'
      },
      accessRequirements: 'Valid student ID required. Lab hours: 8 AM - 10 PM',
      documentation: [],
      links: [
        {
          id: '1',
          title: 'Lab Schedule',
          url: 'https://university.edu/lab-schedule',
          description: 'Current lab schedule and availability'
        }
      ],
      emergencyProcedures: 'In case of emergency, evacuate immediately and contact security at ext. 911',
      qrCode: JSON.stringify({ spaceId: '1', type: 'space' }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false
    };

    this.addSpace(mockSpace);
  }
}

export const dataStore = new DataStore();
