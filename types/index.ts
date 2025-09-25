
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  universityId: string;
}

export interface Space {
  id: string;
  name: string;
  number: string;
  description?: string;
  photos: string[];
  manager: {
    name: string;
    email: string;
    phone?: string;
  };
  academicSupervisor: {
    name: string;
    email: string;
    department: string;
  };
  accessRequirements: string;
  documentation: DocumentFile[];
  links: Link[];
  emergencyProcedures: string;
  qrCode: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface DocumentFile {
  id: string;
  name: string;
  uri: string;
  type: string;
  size: number;
}

export interface Link {
  id: string;
  title: string;
  url: string;
  description?: string;
}

export interface QRCodeData {
  spaceId: string;
  type: 'space';
}
