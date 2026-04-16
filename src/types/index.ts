export interface Country {
  id: string;
  name: string;
  code: string;
  flag?: string | null;
  region?: string | null;
  continent?: string | null;
}

export interface VisaRule {
  id: string;
  fromCountryId: string;
  toCountryId: string;
  fromCountry: Country;
  toCountry: Country;
  visaType: string;
  processingTime: string;
  processingDays: number;
  price: number | { toNumber(): number };
  currency: string;
  maxStayDays: number;
  validityDays: number;
  entryType: string;
  requirements: any;
  documents: any;
  allowedActivities?: any;
  additionalInfo?: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface VisaRequirement {
  id: string;
  text: string;
  required: boolean;
}

export interface DocumentRequirement {
  id: string;
  name: string;
  description?: string;
  required: boolean;
  allowedTypes: string[];
  maxSize?: number;
}

export interface Application {
  id: string;
  visaRuleId: string;
  visaRule: VisaRule;
  applicationNumber: string;
  status: 'pending' | 'submitted' | 'processing' | 'approved' | 'rejected';
  formData: Record<string, unknown>;
  totalAmount: number | { toNumber(): number };
  currency: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  applicationId: string;
  type: string;
  originalName: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date;
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'select' | 'textarea' | 'file' | 'checkbox' | 'radio';
  placeholder?: string;
  required: boolean;
  options?: { label: string; value: string }[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    message?: string;
  };
}

export interface FormStep {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
}