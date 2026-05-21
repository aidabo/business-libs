/** Contact form inquiry — mirrors estate_inquiries table */
export interface EstateInquiry {
  id: string;
  property_id?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  inquiry_type?: string | null;
  status: 'unread' | 'read' | 'responded' | 'closed';
  referrer_url?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
}

/** Payload for submitting a new inquiry (public) */
export interface EstateInquiryInput {
  name: string;
  email: string;
  phone?: string;
  message: string;
  property_id?: string;
  inquiry_type?: string;
  referrer_url?: string;
}
