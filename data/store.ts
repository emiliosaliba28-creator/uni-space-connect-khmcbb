
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

  updateSpace(spaceId: string, updates: Partial<Space>) {
    const index = this.spaces.findIndex(s => s.id === spaceId);
    if (index !== -1) {
      this.spaces[index] = { ...this.spaces[index], ...updates, updatedAt: new Date().toISOString() };
      console.log('Space updated:', spaceId);
    }
  }

  deleteSpace(spaceId: string) {
    const spaceIndex = this.spaces.findIndex(s => s.id === spaceId);
    if (spaceIndex !== -1) {
      const space = this.spaces[spaceIndex];
      space.isDeleted = true;
      space.updatedAt = new Date().toISOString();
      this.deletedSpaces.push(space);
      this.spaces.splice(spaceIndex, 1);
      console.log('Space deleted:', spaceId);
    }
  }

  restoreSpace(spaceId: string) {
    const spaceIndex = this.deletedSpaces.findIndex(s => s.id === spaceId);
    if (spaceIndex !== -1) {
      const space = this.deletedSpaces[spaceIndex];
      space.isDeleted = false;
      space.updatedAt = new Date().toISOString();
      this.spaces.push(space);
      this.deletedSpaces.splice(spaceIndex, 1);
      console.log('Space restored:', spaceId);
    }
  }

  getSpaces(): Space[] {
    return this.spaces.filter(s => !s.isDeleted);
  }

  getDeletedSpaces(): Space[] {
    return this.deletedSpaces;
  }

  getSpaceById(id: string): Space | null {
    return this.spaces.find(s => s.id === id && !s.isDeleted) || null;
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
