export type UserRole = "visitor" | "user" | "admin" | "organizer";

export type RegistrationStatus = "registered" | "waitlist" | "cancelled";

export type Profile = {
  id: string;
  full_name: string | null;
  role: UserRole;
  organization_id: string | null;
  created_at: string;
};

export type Organization = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
};

export type EventItem = {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  long_description: string;
  start_date: string;
  end_date: string;
  location: string;
  cover_image: string | null;
  is_published: boolean;
  is_main_event: boolean;
  created_by: string;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
};

export type EventWriteInput = {
  title: string;
  slug: string;
  short_description: string;
  long_description: string;
  start_date: string;
  end_date: string;
  location: string;
  cover_image: string | null;
  is_published: boolean;
  is_main_event: boolean;
  organization_id: string | null;
};

export type EventRegistration = {
  id: string;
  user_id: string;
  event_id: string;
  registration_status: RegistrationStatus;
  created_at: string;
};

export type EventRegistrationWithEvent = EventRegistration & {
  events: Pick<EventItem, "id" | "title" | "slug" | "start_date" | "end_date" | "location" | "is_published">;
};
