type DepartmentRow = Database['public']['Tables']['departments']['Row'];
type FAQRow = Database['public']['Tables']['faq']['Row'];

type PersonnelInsert = Database['public']['Tables']['personnel']['Insert'];
type PersonnelUpdate = Database['public']['Tables']['personnel']['Update'];
type DepartmentInsert = Database['public']['Tables']['departments']['Insert'];
type DepartmentUpdate = Database['public']['Tables']['departments']['Update'];
type FAQInsert = Database['public']['Tables']['faq']['Insert'];
type FAQUpdate = Database['public']['Tables']['faq']['Update'];
type PermitRow = Database['public']['Tables']['permits']['Row'];
type PermitInsert = Database['public']['Tables']['permits']['Insert'];
type PermitUpdate = Database['public']['Tables']['permits']['Update'];
type CombinedWorkRow = Database['public']['Tables']['combined_work_log']['Row'];
type CombinedWorkInsert = Database['public']['Tables']['combined_work_log']['Insert'];
type CombinedWorkUpdate = Database['public']['Tables']['combined_work_log']['Update'];

export type PermitRowWithRelations = PermitRow & {
  permit_workers?: { worker_id: string }[];
};

import type { Person, Department, FAQItem, Translation } from './ptw-types';
import type { PTWForm, PTWStatus, PTWType, DailyAdmission, CombinedWorkEntry } from './ptw-form-types';
import type { Database, Json } from './database.types';

type PersonnelRow = Database['public']['Tables']['personnel']['Row'];

type PersonnelRecord = PersonnelRow & {
  department?: DepartmentRow | null;
};

type FAQRecord = FAQRow;

const ensureStringArray = (value: Json): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
};

const toJson = (value: unknown): Json => value as Json;

const ensureDailyAdmissions = (value: Json): DailyAdmission[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item !== 'object' || item === null || Array.isArray(item)) {
        return null;
      }
      const record = item as Record<string, Json>;
      const date = typeof record.date === 'string' ? record.date : '';
      const time = typeof record.time === 'string' ? record.time : '';
      const supervisorSignature = typeof record.supervisorSignature === 'string' ? record.supervisorSignature : '';
      const foremanSignature = typeof record.foremanSignature === 'string' ? record.foremanSignature : '';
      const conditions = typeof record.conditions === 'string' ? record.conditions : '';
      const approved = typeof record.approved === 'boolean' ? record.approved : false;
      const teamPresent = ensureStringArray(record.teamPresent ?? []);

      return {
        date,
        time,
        supervisorSignature,
        foremanSignature,
        conditions,
        approved,
        teamPresent,
      } satisfies DailyAdmission;
    })
    .filter((item): item is DailyAdmission => item !== null);
};

const ensureTranslation = (value: Json): Translation => {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const record = value as Record<string, Json>;
    return {
      ru: typeof record.ru === 'string' ? record.ru : '',
      tr: typeof record.tr === 'string' ? record.tr : '',
      en: typeof record.en === 'string' ? record.en : '',
    };
  }

  return { ru: '', tr: '', en: '' };
};

export const mapPersonnelRow = (row: PersonnelRecord): Person => {
  return {
    id: row.id,
    name: row.name,
    position: row.position,
    role: (row.role as Person['role']) || 'worker',
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    departmentId: row.department_id ?? undefined,
    customDuties: ensureStringArray(row.custom_duties),
    customQualifications: ensureStringArray(row.custom_qualifications),
  };
};

export const mapDepartmentRow = (row: DepartmentRow): Department => {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    emoji: row.emoji,
    description: row.description ?? undefined,
  };
};

export const mapFAQRow = (row: FAQRecord): FAQItem => {
  return {
    id: row.id,
    question: ensureTranslation(row.question),
    answer: ensureTranslation(row.answer),
    category: row.category ?? undefined,
    order: row.order_index ?? 0,
  };
};

export const buildPersonnelInsert = (person: Partial<Person>): PersonnelInsert => {
  if (!person.name || !person.position || !person.role) {
    throw new Error('Missing required personnel fields');
  }

  return {
    name: person.name,
    position: person.position,
    role: person.role,
    email: person.email ?? null,
    phone: person.phone ?? null,
    department_id: person.departmentId ?? null,
    custom_duties: person.customDuties ?? [],
    custom_qualifications: person.customQualifications ?? [],
  };
};

export const buildPersonnelUpdate = (person: Partial<Person>): PersonnelUpdate => {
  const payload: PersonnelUpdate = {};

  if (person.name !== undefined) payload.name = person.name;
  if (person.position !== undefined) payload.position = person.position;
  if (person.role !== undefined) payload.role = person.role;
  if (person.email !== undefined) payload.email = person.email ?? null;
  if (person.phone !== undefined) payload.phone = person.phone ?? null;
  if (person.departmentId !== undefined) payload.department_id = person.departmentId ?? null;
  if (person.customDuties !== undefined) payload.custom_duties = person.customDuties;
  if (person.customQualifications !== undefined) payload.custom_qualifications = person.customQualifications;

  return payload;
};

export const buildDepartmentInsert = (department: Partial<Department>): DepartmentInsert => {
  if (!department.name || !department.color || !department.emoji) {
    throw new Error('Missing required department fields');
  }

  return {
    name: department.name,
    color: department.color,
    emoji: department.emoji,
    description: department.description ?? null,
  };
};

export const buildDepartmentUpdate = (department: Partial<Department>): DepartmentUpdate => {
  const payload: DepartmentUpdate = {};

  if (department.name !== undefined) payload.name = department.name;
  if (department.color !== undefined) payload.color = department.color;
  if (department.emoji !== undefined) payload.emoji = department.emoji;
  if (department.description !== undefined) payload.description = department.description ?? null;

  return payload;
};

export const buildFAQInsert = (faq: Partial<FAQItem>): FAQInsert => {
  if (!faq.question || !faq.answer) {
    throw new Error('Missing required FAQ fields');
  }

  return {
    question: toJson(faq.question),
    answer: toJson(faq.answer),
    category: faq.category ?? null,
    order_index: faq.order ?? 0,
  };
};

export const buildFAQUpdate = (faq: Partial<FAQItem>): FAQUpdate => {
  const payload: FAQUpdate = {};

  if (faq.question !== undefined) payload.question = toJson(faq.question);
  if (faq.answer !== undefined) payload.answer = toJson(faq.answer);
  if (faq.category !== undefined) payload.category = faq.category ?? null;
  if (faq.order !== undefined) payload.order_index = faq.order;

  return payload;
};

export const mapPermitRow = (row: PermitRowWithRelations): PTWForm => {
  const attachments = ensureStringArray(row.attachments);
  const teamMemberIds = row.permit_workers 
    ? row.permit_workers.map(w => w.worker_id)
    : [];
  const equipment = ensureStringArray(row.equipment);
  const hazards = ensureStringArray(row.hazards);
  const safetyMeasures = ensureStringArray(row.safety_measures);
  const dailyAdmissions = ensureDailyAdmissions(row.daily_admissions);

  return {
    id: row.id,
    number: row.permit_number,
    type: (row.type as PTWType) ?? 'hazardous-factors',
    status: (row.status as PTWStatus) ?? 'draft',
    issuerPersonId: row.issuer_id ?? '',
    supervisorPersonId: row.supervisor_id ?? '',
    foremanPersonId: row.foreman_id ?? row.responsible_person_id ?? '',
    teamMemberIds,
    workDescription: row.description ?? '',
    workLocation: row.location ?? '',
    workScope: row.work_scope ?? '',
    equipment,
    hazards,
    safetyMeasures,
    startDate: row.start_date ?? row.created_at,
    endDate: row.end_date ?? row.start_date ?? row.created_at,
    validUntil: row.valid_until ?? row.end_date ?? row.start_date ?? row.created_at,
    issuedAt: row.issued_at ?? undefined,
    startedAt: row.started_at ?? undefined,
    completedAt: row.completed_at ?? undefined,
    closedAt: row.closed_at ?? undefined,
    dailyAdmissions,
    notes: row.notes ?? '',
    attachments: attachments.length > 0 ? attachments : undefined,
    isCombinedWork: row.is_combined_work ?? false,
    combinedWorkJournalRef: row.combined_work_journal_ref ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by ?? '',
  } satisfies PTWForm;
};

export const buildPermitInsert = (form: Partial<PTWForm>): PermitInsert => {
  if (
    !form.number ||
    !form.type ||
    !form.status ||
    !form.workDescription ||
    !form.workLocation ||
    !form.startDate ||
    !form.endDate ||
    !form.issuerPersonId ||
    !form.supervisorPersonId ||
    !form.foremanPersonId
  ) {
    throw new Error('Missing required permit fields');
  }

  return {
    permit_number: form.number,
    type: form.type,
    status: form.status,
    description: form.workDescription,
    location: form.workLocation,
    work_scope: form.workScope ?? null,
    start_date: form.startDate,
    end_date: form.endDate,
    valid_until: form.validUntil ?? null,
    issuer_id: form.issuerPersonId,
    supervisor_id: form.supervisorPersonId,
    foreman_id: form.foremanPersonId,
    responsible_person_id: form.foremanPersonId,
    equipment: form.equipment ?? [],
    hazards: form.hazards ?? [],
    safety_measures: form.safetyMeasures ?? [],
    daily_admissions: toJson(form.dailyAdmissions ?? []),
    notes: form.notes ?? null,
    attachments: form.attachments ?? [],
    is_combined_work: form.isCombinedWork ?? false,
    combined_work_journal_ref: form.combinedWorkJournalRef ?? null,
    issued_at: form.issuedAt ?? null,
    started_at: form.startedAt ?? null,
    completed_at: form.completedAt ?? null,
    closed_at: form.closedAt ?? null,
    created_by: form.createdBy ?? null,
  } satisfies PermitInsert;
};

export const buildPermitUpdate = (form: Partial<PTWForm>): PermitUpdate => {
  const payload: PermitUpdate = {};

  if (form.number !== undefined) payload.permit_number = form.number;
  if (form.type !== undefined) payload.type = form.type;
  if (form.status !== undefined) payload.status = form.status;
  if (form.workDescription !== undefined) payload.description = form.workDescription;
  if (form.workLocation !== undefined) payload.location = form.workLocation;
  if (form.workScope !== undefined) payload.work_scope = form.workScope;
  if (form.startDate !== undefined) payload.start_date = form.startDate;
  if (form.endDate !== undefined) payload.end_date = form.endDate;
  if (form.validUntil !== undefined) payload.valid_until = form.validUntil ?? null;
  if (form.issuerPersonId !== undefined) payload.issuer_id = form.issuerPersonId;
  if (form.supervisorPersonId !== undefined) payload.supervisor_id = form.supervisorPersonId;
  if (form.foremanPersonId !== undefined) {
    payload.foreman_id = form.foremanPersonId;
    payload.responsible_person_id = form.foremanPersonId;
  }
  if (form.equipment !== undefined) payload.equipment = form.equipment;
  if (form.hazards !== undefined) payload.hazards = form.hazards;
  if (form.safetyMeasures !== undefined) payload.safety_measures = form.safetyMeasures;
  if (form.dailyAdmissions !== undefined) payload.daily_admissions = toJson(form.dailyAdmissions);
  if (form.notes !== undefined) payload.notes = form.notes ?? null;
  if (form.attachments !== undefined) payload.attachments = form.attachments ?? [];
  if (form.isCombinedWork !== undefined) payload.is_combined_work = form.isCombinedWork;
  if (form.combinedWorkJournalRef !== undefined) payload.combined_work_journal_ref = form.combinedWorkJournalRef ?? null;
  if (form.issuedAt !== undefined) payload.issued_at = form.issuedAt ?? null;
  if (form.startedAt !== undefined) payload.started_at = form.startedAt ?? null;
  if (form.completedAt !== undefined) payload.completed_at = form.completedAt ?? null;
  if (form.closedAt !== undefined) payload.closed_at = form.closedAt ?? null;

  return payload;
};

export const mapCombinedWorkRow = (row: CombinedWorkRow): CombinedWorkEntry => {
  return {
    id: row.id,
    date: row.date,
    location: row.location ?? '',
    ptwNumbers: ensureStringArray(row.ptw_numbers),
    coordinatorPersonId: row.person_id ?? '',
    organizations: ensureStringArray(row.organizations),
    workTypes: ensureStringArray(row.work_types),
    safetyMeasures: ensureStringArray(row.safety_measures),
    notes: row.work_description ?? '',
    createdAt: row.created_at,
  } satisfies CombinedWorkEntry;
};

export const buildCombinedWorkInsert = (entry: Partial<CombinedWorkEntry>): CombinedWorkInsert => {
  if (!entry.date || !entry.location || !entry.coordinatorPersonId) {
    throw new Error('Missing required combined work fields');
  }

  return {
    date: entry.date,
    location: entry.location,
    person_id: entry.coordinatorPersonId,
    ptw_numbers: toJson(entry.ptwNumbers ?? []),
    organizations: toJson(entry.organizations ?? []),
    work_types: toJson(entry.workTypes ?? []),
    safety_measures: toJson(entry.safetyMeasures ?? []),
    work_description: entry.notes ?? '',
    hours: 0,
  } satisfies CombinedWorkInsert;
};

export const buildCombinedWorkUpdate = (entry: Partial<CombinedWorkEntry>): CombinedWorkUpdate => {
  const payload: CombinedWorkUpdate = {};

  if (entry.date !== undefined) payload.date = entry.date;
  if (entry.location !== undefined) payload.location = entry.location;
  if (entry.coordinatorPersonId !== undefined) payload.person_id = entry.coordinatorPersonId;
  if (entry.ptwNumbers !== undefined) payload.ptw_numbers = toJson(entry.ptwNumbers);
  if (entry.organizations !== undefined) payload.organizations = toJson(entry.organizations);
  if (entry.workTypes !== undefined) payload.work_types = toJson(entry.workTypes);
  if (entry.safetyMeasures !== undefined) payload.safety_measures = toJson(entry.safetyMeasures);
  if (entry.notes !== undefined) payload.work_description = entry.notes;

  return payload;
};
