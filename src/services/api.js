import { mockApi } from './mock/index.js';

const STORE_KEY = 'civiclens-mock-api-store';
const DEMO_PASSWORD = 'Demo123!';
const SESSION_DURATION_MS = 15 * 60 * 1000;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const SYNTHETIC_LABEL = 'SYNTHETIC';
const LANGUAGE_CODES = ['en', 'urdu', 'roman_urdu', 'mixed'];
const LOCALITIES = [
  'Model Town',
  'Johar Town',
  'Township',
  'Gulberg',
  'Iqbal Town',
  'Samanabad',
  'Wapda Town',
  'DHA',
];
const LIFECYCLE_STATES = [
  'Submitted',
  'AI Processing',
  'Pending Analysis',
  'Pending Human Review',
  'Assigned',
  'In Progress',
  'Resolution Submitted',
  'Citizen Verification',
  'Resolved',
  'Reopened',
  'Escalated',
  'Closed',
  'Rejected',
  'Invalid',
  'Resolved (Unverified)',
];

const departmentSeeds = [
  {
    id: 'dept-municipal',
    name: 'Municipal Services',
    officerIds: ['demo-officer-municipal'],
    supervisorId: 'demo-supervisor',
  },
  {
    id: 'dept-water',
    name: 'Water and Drainage Services',
    officerIds: ['demo-officer-water'],
    supervisorId: 'demo-supervisor-2',
  },
  {
    id: 'dept-infrastructure',
    name: 'Infrastructure and Utilities',
    officerIds: ['demo-officer'],
    supervisorId: 'demo-supervisor',
  },
  {
    id: 'dept-safety',
    name: 'Traffic and Public Safety',
    officerIds: ['demo-officer-safety'],
    supervisorId: 'demo-supervisor-2',
  },
];

const categorySeeds = [
  { id: 'sanitation', name: 'Sanitation', departmentId: 'dept-municipal' },
  { id: 'garbage', name: 'Garbage', departmentId: 'dept-municipal' },
  { id: 'sewerage', name: 'Sewerage', departmentId: 'dept-water' },
  { id: 'drainage', name: 'Drainage', departmentId: 'dept-water' },
  { id: 'water-supply', name: 'Water supply', departmentId: 'dept-water' },
  { id: 'electricity', name: 'Electricity', departmentId: 'dept-infrastructure' },
  { id: 'street-lighting', name: 'Street lighting', departmentId: 'dept-infrastructure' },
  { id: 'roads', name: 'Roads', departmentId: 'dept-infrastructure' },
  { id: 'traffic', name: 'Traffic', departmentId: 'dept-safety' },
  { id: 'parks', name: 'Parks', departmentId: 'dept-municipal' },
  { id: 'public-safety', name: 'Public safety', departmentId: 'dept-safety' },
  { id: 'other', name: 'Other', departmentId: 'dept-municipal' },
];

const complaintTextSeeds = [
  {
    categoryId: 'sanitation',
    texts: {
      en: 'Litter has collected along the street and needs a sanitation check.',
      urdu: 'گلی کے کنارے کوڑا جمع ہے، صفائی کے عملے سے معائنہ درکار ہے۔',
      roman_urdu: 'Gali ke kinare kachra jama hai, safai ka jaiza darkar hai.',
      mixed: 'گلی کے کنارے litter جمع ہے، صفائی کا جائزہ درکار ہے۔',
    },
  },
  {
    categoryId: 'garbage',
    texts: {
      en: 'Household waste has been left beside the collection point.',
      urdu: 'گھریلو کوڑا جمع کرنے کی جگہ کے پاس پڑا ہے۔',
      roman_urdu: 'Ghar ka kachra collection point ke paas para hai.',
      mixed: 'گھریلو waste collection point کے پاس پڑا ہے۔',
    },
  },
  {
    categoryId: 'sewerage',
    texts: {
      en: 'A drain has overflowed in the lane and there is a strong smell.',
      urdu: 'گلی میں نالی ابل رہی ہے اور بہت زیادہ بدبو ہے۔',
      roman_urdu: 'Gali mein 3 din se gutter overflow ho raha hai aur smell bohat zyada hai.',
      mixed: 'گلی میں gutter overflow ہو رہا ہے اور smell بہت زیادہ ہے۔',
    },
  },
  {
    categoryId: 'drainage',
    texts: {
      en: 'Rainwater is still standing in the lane after the recent rain.',
      urdu: 'حالیہ بارش کے بعد بھی گلی میں پانی کھڑا ہے۔',
      roman_urdu: 'Haliyaa barish ke baad bhi gali mein pani khara hai.',
      mixed: 'بارش کے بعد lane میں rainwater کھڑا ہے۔',
    },
  },
  {
    categoryId: 'water-supply',
    texts: {
      en: 'Water has not reached our street since this morning.',
      urdu: 'آج صبح سے ہماری گلی میں پانی نہیں آ رہا۔',
      roman_urdu: 'Aaj subah se hamari gali mein pani nahi aa raha.',
      mixed: 'آج صبح سے street میں water supply نہیں آ رہی۔',
    },
  },
  {
    categoryId: 'electricity',
    texts: {
      en: 'A loose electric cable is hanging close to the footpath.',
      urdu: 'فٹ پاتھ کے قریب بجلی کی ڈھیلی تار لٹک رہی ہے۔',
      roman_urdu: 'Footpath ke qareeb bijli ki dheeli taar latak rahi hai.',
      mixed: 'فٹ پاتھ کے پاس electric cable لٹک رہی ہے۔',
    },
  },
  {
    categoryId: 'street-lighting',
    texts: {
      en: 'The streetlight near the corner has not worked for several nights.',
      urdu: 'کونے کے پاس والی اسٹریٹ لائٹ کئی راتوں سے بند ہے۔',
      roman_urdu: 'Konay ke paas street light kai raaton se band hai.',
      mixed: 'کونے کے پاس streetlight کئی راتوں سے بند ہے۔',
    },
  },
  {
    categoryId: 'roads',
    texts: {
      en: 'A damaged part of the road is making it difficult for vehicles to pass.',
      urdu: 'سڑک کا ایک خراب حصہ گاڑیوں کے گزرنے میں رکاوٹ بن رہا ہے۔',
      roman_urdu: 'Sarak ka kharab hissa gariyon ke guzarne mein rukawat hai.',
      mixed: 'سڑک کا damaged حصہ vehicles کے گزرنے میں رکاوٹ ہے۔',
    },
  },
  {
    categoryId: 'traffic',
    texts: {
      en: 'Vehicles are blocking the junction during the evening rush.',
      urdu: 'شام کے رش میں گاڑیاں چوراہے کا راستہ روک رہی ہیں۔',
      roman_urdu: 'Shaam ke rush mein gariyan chowk ka rasta rok rahi hain.',
      mixed: 'شام کے rush میں vehicles چوراہے کا راستہ روک رہی ہیں۔',
    },
  },
  {
    categoryId: 'parks',
    texts: {
      en: 'The public park path needs cleaning and basic maintenance.',
      urdu: 'عوامی پارک کے راستے کی صفائی اور مرمت درکار ہے۔',
      roman_urdu: 'Public park ke raste ki safai aur marammat darkar hai.',
      mixed: 'پارک کے راستے کی cleaning اور مرمت درکار ہے۔',
    },
  },
  {
    categoryId: 'public-safety',
    texts: {
      en: 'The entrance to the alley is difficult to see after dark.',
      urdu: 'اندھیرا ہونے کے بعد گلی کا داخلی راستہ واضح نظر نہیں آتا۔',
      roman_urdu: 'Andhera honay ke baad gali ka entrance saaf nazar nahi aata.',
      mixed: 'اندھیرا ہونے کے بعد alley کا entrance نظر نہیں آتا۔',
    },
  },
  {
    categoryId: 'other',
    texts: {
      en: 'A civic issue on the street needs to be checked by the relevant team.',
      urdu: 'گلی کے ایک شہری مسئلے کا متعلقہ ٹیم سے جائزہ درکار ہے۔',
      roman_urdu: 'Gali ke aik maslay ka mutaliqa team se jaiza darkar hai.',
      mixed: 'گلی کے civic issue کا متعلقہ team سے جائزہ درکار ہے۔',
    },
  },
];

function makeUser({ id, name, email, role, departmentId, departmentIds = [] }, createdAt) {
  return {
    id,
    name,
    email,
    password: DEMO_PASSWORD,
    role,
    departmentId: departmentId ?? null,
    departmentIds: departmentIds.length ? departmentIds : departmentId ? [departmentId] : [],
    verified: true,
    createdAt,
    isSynthetic: true,
    dataLabel: SYNTHETIC_LABEL,
  };
}

function makeSeedUsers(createdAt) {
  return [
    makeUser(
      {
        id: 'demo-citizen',
        name: 'Demo Citizen',
        email: 'citizen@demo.civiclens.test',
        role: 'citizen',
      },
      createdAt,
    ),
    makeUser(
      {
        id: 'demo-citizen-2',
        name: 'Demo Citizen Two',
        email: 'citizen2@demo.civiclens.test',
        role: 'citizen',
      },
      createdAt,
    ),
    makeUser(
      {
        id: 'demo-citizen-3',
        name: 'Demo Citizen Three',
        email: 'citizen3@demo.civiclens.test',
        role: 'citizen',
      },
      createdAt,
    ),
    makeUser(
      {
        id: 'demo-officer-municipal',
        name: 'Demo Municipal Officer',
        email: 'officer.municipal@demo.civiclens.test',
        role: 'officer',
        departmentId: 'dept-municipal',
      },
      createdAt,
    ),
    makeUser(
      {
        id: 'demo-officer-water',
        name: 'Demo Water Officer',
        email: 'officer.water@demo.civiclens.test',
        role: 'officer',
        departmentId: 'dept-water',
      },
      createdAt,
    ),
    makeUser(
      {
        id: 'demo-officer',
        name: 'Demo Officer',
        email: 'officer@demo.civiclens.test',
        role: 'officer',
        departmentId: 'dept-infrastructure',
      },
      createdAt,
    ),
    makeUser(
      {
        id: 'demo-officer-safety',
        name: 'Demo Safety Officer',
        email: 'officer.safety@demo.civiclens.test',
        role: 'officer',
        departmentId: 'dept-safety',
      },
      createdAt,
    ),
    makeUser(
      {
        id: 'demo-supervisor',
        name: 'Demo Supervisor',
        email: 'supervisor@demo.civiclens.test',
        role: 'supervisor',
        departmentId: 'dept-municipal',
        departmentIds: ['dept-municipal', 'dept-infrastructure'],
      },
      createdAt,
    ),
    makeUser(
      {
        id: 'demo-supervisor-2',
        name: 'Demo Supervisor Two',
        email: 'supervisor2@demo.civiclens.test',
        role: 'supervisor',
        departmentId: 'dept-water',
        departmentIds: ['dept-water', 'dept-safety'],
      },
      createdAt,
    ),
    makeUser(
      {
        id: 'demo-admin',
        name: 'Demo Administrator',
        email: 'admin@demo.civiclens.test',
        role: 'admin',
      },
      createdAt,
    ),
  ];
}

function toIso(value) {
  return new Date(value).toISOString();
}

function createSeedStore() {
  const now = Date.now();
  const createdAt = toIso(now);
  const users = makeSeedUsers(createdAt);
  const departments = departmentSeeds.map((department) => ({
    ...department,
    isSynthetic: true,
    dataLabel: SYNTHETIC_LABEL,
  }));
  const categories = categorySeeds.map((category) => ({
    ...category,
    isSynthetic: true,
    dataLabel: SYNTHETIC_LABEL,
  }));
  const complaints = Array.from({ length: 60 }, (_item, index) => {
    const textSeed = complaintTextSeeds[index % complaintTextSeeds.length];
    const language = LANGUAGE_CODES[Math.floor(index / complaintTextSeeds.length) % LANGUAGE_CODES.length];
    const category = categories.find((item) => item.id === textSeed.categoryId);
    const department = departments.find((item) => item.id === category.departmentId);
    const reporter = users.filter((item) => item.role === 'citizen')[index % 3];
    const status = LIFECYCLE_STATES[index % LIFECYCLE_STATES.length];
    const assigned = ![
      'Submitted',
      'AI Processing',
      'Pending Analysis',
      'Pending Human Review',
    ].includes(status);
    const recordTime = toIso(now - (index + 1) * 60 * 60 * 1000);

    return {
      id: `SYN-${String(index + 1).padStart(4, '0')}`,
      reporterId: reporter.id,
      assignedOfficerId: assigned ? department.officerIds[0] : null,
      departmentId: department.id,
      categoryId: category.id,
      category: category.name,
      language,
      originalText: textSeed.texts[language],
      normalizedText: null,
      status,
      locality: LOCALITIES[index % LOCALITIES.length],
      location: { locality: LOCALITIES[index % LOCALITIES.length], isSynthetic: true },
      comments: [],
      statusHistory: [{ status, changedAt: recordTime, isSynthetic: true }],
      createdAt: recordTime,
      updatedAt: recordTime,
      isSynthetic: true,
      dataLabel: SYNTHETIC_LABEL,
    };
  });
  const notifications = complaints.slice(0, 30).map((complaint, index) => {
    const recipientId =
      index % 2 === 0 ? complaint.reporterId : complaint.assignedOfficerId ?? complaint.reporterId;

    return {
      id: `SYN-NOT-${String(index + 1).padStart(3, '0')}`,
      userId: recipientId,
      complaintId: complaint.id,
      type: 'complaint_status',
      readAt: index % 3 === 0 ? null : toIso(now - (index + 1) * 30 * 60 * 1000),
      createdAt: complaint.updatedAt,
      isSynthetic: true,
      dataLabel: SYNTHETIC_LABEL,
    };
  });

  return {
    version: 1,
    users,
    departments,
    categories,
    complaints,
    notifications,
    verificationCodes: {},
    resetTokens: {},
    activeSession: null,
    counters: { citizen: 3, complaint: 60, comment: 0, notification: 30, session: 0 },
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function validateStore(value) {
  return (
    value?.version === 1 &&
    Array.isArray(value.users) &&
    Array.isArray(value.departments) &&
    Array.isArray(value.categories) &&
    Array.isArray(value.complaints) &&
    Array.isArray(value.notifications) &&
    value.counters &&
    typeof value.counters === 'object'
  );
}

function readStore() {
  if (typeof localStorage === 'undefined') return createSeedStore();
  const stored = localStorage.getItem(STORE_KEY);
  if (!stored) return createSeedStore();
  const parsed = JSON.parse(stored);
  if (!validateStore(parsed)) {
    throw new TypeError('The persisted mock API store has an unsupported shape. Use api.reset().');
  }
  return parsed;
}

function persistStore(value) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORE_KEY, JSON.stringify(value));
  }
}

let store = readStore();
if (typeof localStorage !== 'undefined' && !localStorage.getItem(STORE_KEY)) persistStore(store);

function transact(mutator) {
  const draft = clone(store);
  const result = mutator(draft);
  persistStore(draft);
  store = draft;
  return result === undefined ? undefined : clone(result);
}

function makeError(message, status, code, details = {}) {
  return Object.assign(new Error(message), {
    name: 'MockApiError',
    status,
    statusCode: status,
    code,
    reference: `MOCK-${code}-${Date.now().toString(36).toUpperCase()}`,
    ...details,
  });
}

function simulateLatency() {
  const latency = 300 + Math.floor(Math.random() * 601);
  return new Promise((resolve) => globalThis.setTimeout(resolve, latency));
}

const injectedErrors = new Map();

function normalizeInjectedError(error) {
  if (error instanceof Error) return error;
  if (typeof error === 'string') {
    return makeError(error, 500, 'MOCK_INJECTED_ERROR');
  }
  return makeError(
    error?.message ?? 'An injected mock API error occurred.',
    error?.status ?? error?.statusCode ?? 500,
    error?.code ?? 'MOCK_INJECTED_ERROR',
    error,
  );
}

function enqueueError(operation, error) {
  const queue = injectedErrors.get(operation) ?? [];
  queue.push(normalizeInjectedError(error));
  injectedErrors.set(operation, queue);
}

function consumeInjectedError(operation) {
  const shortName = operation.split('.').pop();
  const key = [operation, shortName, '*'].find((candidate) => injectedErrors.has(candidate));
  if (!key) return;
  const queue = injectedErrors.get(key);
  const error = queue.shift();
  if (queue.length === 0) injectedErrors.delete(key);
  throw error;
}

function delayed(operation, action) {
  return async (...args) => {
    await simulateLatency();
    consumeInjectedError(operation);
    return action(...args);
  };
}

function publicUser(user) {
  if (!user) return null;
  const safeUser = { ...user };
  delete safeUser.password;
  return safeUser;
}

function createSession(draft, user) {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const token = `demo.${encodeURIComponent(user.id)}.${expiresAt}.${++draft.counters.session}`;
  draft.activeSession = { token, userId: user.id, expiresAt };
  return { user: publicUser(user), token, expiresAt };
}

function getActor(options) {
  const requestedToken =
    typeof options === 'string'
      ? options
      : options?.token ?? options?.authToken ?? options?.session?.token ?? null;
  const activeSession = store.activeSession;
  const session =
    requestedToken === null
      ? activeSession
      : activeSession?.token === requestedToken
        ? activeSession
        : null;

  if (!session || session.expiresAt <= Date.now()) {
    throw makeError('Authentication is required for this operation.', 401, 'AUTH_REQUIRED');
  }
  const user = store.users.find((item) => item.id === session.userId);
  if (!user) throw makeError('The authenticated user no longer exists.', 401, 'AUTH_REQUIRED');
  return publicUser(user);
}

function requireRole(user, roles) {
  if (!roles.includes(user.role)) {
    throw makeError('This role cannot perform the requested operation.', 403, 'FORBIDDEN');
  }
}

function actorDepartments(user) {
  return user.departmentIds?.length ? user.departmentIds : [user.departmentId].filter(Boolean);
}

function assertComplaintAccess(complaint, user, { write = false } = {}) {
  let allowed = false;
  if (user.role === 'admin') {
    allowed = !write;
  } else if (user.role === 'citizen') {
    allowed = complaint.reporterId === user.id;
  } else if (user.role === 'officer') {
    allowed = complaint.assignedOfficerId === user.id;
  } else if (user.role === 'supervisor') {
    allowed = actorDepartments(user).includes(complaint.departmentId);
  }
  if (!allowed) {
    throw makeError('You do not have access to this complaint.', 403, 'FORBIDDEN');
  }
}

function findComplaint(id, draft = store) {
  const complaint = draft.complaints.find((item) => item.id === String(id));
  if (!complaint) throw makeError('The complaint could not be found.', 404, 'NOT_FOUND');
  return complaint;
}

function paginate(items, options = {}) {
  const page = Number(options.page ?? 1);
  const pageSize = Number(options.pageSize ?? DEFAULT_PAGE_SIZE);
  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > MAX_PAGE_SIZE
  ) {
    throw makeError('Page and page size must be positive integers.', 400, 'INVALID_PAGINATION');
  }
  const offset = (page - 1) * pageSize;
  return {
    items: clone(items.slice(offset, offset + pageSize)),
    page,
    pageSize,
    total: items.length,
  };
}

function visibleComplaints(user) {
  if (user.role === 'admin') return store.complaints;
  if (user.role === 'citizen') {
    return store.complaints.filter((item) => item.reporterId === user.id);
  }
  if (user.role === 'officer') {
    return store.complaints.filter((item) => item.assignedOfficerId === user.id);
  }
  if (user.role === 'supervisor') {
    const departments = actorDepartments(user);
    return store.complaints.filter((item) => departments.includes(item.departmentId));
  }
  throw makeError('This role cannot list complaints.', 403, 'FORBIDDEN');
}

function filterComplaints(items, filters = {}) {
  const query = String(filters.search ?? filters.query ?? '')
    .trim()
    .toLocaleLowerCase();
  return items.filter((item) => {
    if (filters.status && item.status !== filters.status) return false;
    if (filters.category && item.categoryId !== filters.category) return false;
    if (filters.locality && item.locality !== filters.locality) return false;
    if (filters.departmentId && item.departmentId !== filters.departmentId) return false;
    if (
      query &&
      !`${item.id} ${item.originalText} ${item.category} ${item.locality}`
        .toLocaleLowerCase()
        .includes(query)
    ) {
      return false;
    }
    return true;
  });
}

function inferLanguage(text) {
  const hasUrduScript = /[\u0600-\u06ff]/.test(text);
  const hasLatinScript = /[a-z]/i.test(text);
  if (hasUrduScript && hasLatinScript) return 'mixed';
  if (hasUrduScript) return 'urdu';
  if (/\b(gali|bohat|nahi|pani|hai|karam|darkar)\b/i.test(text)) return 'roman_urdu';
  return 'en';
}

function createComplaintRecord(input = {}, context = input) {
  const actor = getActor(context);
  requireRole(actor, ['citizen']);
  const originalText = String(input.originalText ?? input.text ?? '');
  if (originalText.trim().length < 10 || originalText.length > 2000) {
    throw makeError('Complaint text must contain 10 to 2,000 characters.', 400, 'INVALID_COMPLAINT');
  }
  const requestedCategory =
    input.categoryId ?? input.category?.id ?? input.category ?? 'other';
  const categoryId = String(requestedCategory).trim().toLowerCase().replace(/\s+/g, '-');
  const category = store.categories.find((item) => item.id === categoryId);
  if (!category) throw makeError('The complaint category is not supported.', 400, 'INVALID_CATEGORY');
  const department = store.departments.find((item) => item.id === category.departmentId);
  const location = input.location && typeof input.location === 'object' ? clone(input.location) : null;
  const locality = input.locality ?? location?.locality ?? null;
  const now = new Date().toISOString();

  return transact((draft) => {
    const complaint = {
      id: `CL-MOCK-${String(++draft.counters.complaint).padStart(5, '0')}`,
      reporterId: actor.id,
      assignedOfficerId: null,
      departmentId: department.id,
      categoryId: category.id,
      category: category.name,
      language: LANGUAGE_CODES.includes(input.language) ? input.language : inferLanguage(originalText),
      originalText,
      normalizedText: null,
      status: 'Submitted',
      locality,
      location,
      comments: [],
      statusHistory: [{ status: 'Submitted', changedAt: now, actorId: actor.id }],
      createdAt: now,
      updatedAt: now,
      isSynthetic: false,
    };
    draft.complaints.unshift(complaint);
    return complaint;
  });
}

function listComplaints(options = {}) {
  const actor = getActor(options);
  const filters = filterComplaints(visibleComplaints(actor), options);
  return paginate(filters, options);
}

function getComplaint(id, options = {}) {
  const actor = getActor(options);
  const complaint = findComplaint(id);
  assertComplaintAccess(complaint, actor);
  return clone(complaint);
}

function addComment(id, input = {}, context = input) {
  const actor = getActor(context);
  const commentText = String(input.body ?? input.comment ?? '').trim();
  if (!commentText) throw makeError('A comment is required.', 400, 'INVALID_COMMENT');

  return transact((draft) => {
    const complaint = findComplaint(id, draft);
    assertComplaintAccess(complaint, actor, { write: true });
    const comment = {
      id: `COMMENT-${String(++draft.counters.comment).padStart(5, '0')}`,
      authorId: actor.id,
      authorRole: actor.role,
      body: commentText,
      createdAt: new Date().toISOString(),
      isSynthetic: false,
    };
    complaint.comments.push(comment);
    complaint.updatedAt = comment.createdAt;
    return comment;
  });
}

function updateProgress(id, input = {}, context = input) {
  const actor = getActor(context);
  requireRole(actor, ['officer', 'supervisor']);
  const nextStatus = String(input.status ?? '');
  if (!['Assigned', 'In Progress', 'Escalated'].includes(nextStatus)) {
    throw makeError('The requested progress status is not allowed.', 400, 'INVALID_STATUS');
  }

  return transact((draft) => {
    const complaint = findComplaint(id, draft);
    assertComplaintAccess(complaint, actor, { write: true });
    if (
      ['Resolved', 'Closed', 'Rejected', 'Invalid', 'Resolved (Unverified)'].includes(
        complaint.status,
      )
    ) {
      throw makeError('A completed complaint cannot be updated.', 409, 'INVALID_TRANSITION');
    }
    const now = new Date().toISOString();
    complaint.status = nextStatus;
    complaint.updatedAt = now;
    complaint.statusHistory.push({ status: nextStatus, changedAt: now, actorId: actor.id });
    const notification = {
      id: `NOT-${String(++draft.counters.notification).padStart(5, '0')}`,
      userId: complaint.reporterId,
      complaintId: complaint.id,
      type: 'complaint_status',
      readAt: null,
      createdAt: now,
      isSynthetic: false,
    };
    draft.notifications.unshift(notification);
    return complaint;
  });
}

function acceptComplaint(id, input = {}, context = input) {
  const actor = getActor(context);
  requireRole(actor, ['citizen']);
  if (input.accepted === false) {
    throw makeError('This operation only accepts a proposed resolution.', 400, 'INVALID_DECISION');
  }

  return transact((draft) => {
    const complaint = findComplaint(id, draft);
    assertComplaintAccess(complaint, actor, { write: true });
    if (!['Resolution Submitted', 'Citizen Verification'].includes(complaint.status)) {
      throw makeError('The complaint has no proposed resolution to accept.', 409, 'INVALID_TRANSITION');
    }
    const now = new Date().toISOString();
    complaint.status = 'Resolved';
    complaint.acceptedAt = now;
    complaint.updatedAt = now;
    complaint.statusHistory.push({ status: 'Resolved', changedAt: now, actorId: actor.id });
    return complaint;
  });
}

function listNotifications(options = {}) {
  const actor = getActor(options);
  const items = store.notifications
    .filter((item) => item.userId === actor.id)
    .filter((item) => !options.unreadOnly || item.readAt === null);
  return paginate(items, options);
}

function markNotificationRead(id, options = {}) {
  const actor = getActor(options);
  return transact((draft) => {
    const notification = draft.notifications.find((item) => item.id === String(id));
    if (!notification) throw makeError('The notification could not be found.', 404, 'NOT_FOUND');
    if (notification.userId !== actor.id) {
      throw makeError('You do not have access to this notification.', 403, 'FORBIDDEN');
    }
    notification.readAt ??= new Date().toISOString();
    return notification;
  });
}

function createAuthApi() {
  const login = delayed('auth.login', (credentials = {}) => {
    const email = String(credentials.email ?? '').trim().toLocaleLowerCase();
    const user = store.users.find(
      (item) => item.email.toLocaleLowerCase() === email && item.password === credentials.password,
    );
    if (!user) throw makeError('Invalid demo credentials.', 401, 'AUTH_INVALID_CREDENTIALS');
    return transact((draft) => createSession(draft, draft.users.find((item) => item.id === user.id)));
  });

  const register = delayed('auth.register', (input = {}) => {
    const email = String(input.email ?? '').trim().toLocaleLowerCase();
    const name = String(input.name ?? '').trim();
    const password = String(input.password ?? '');
    if (!email || !name || password.length < 8) {
      throw makeError('Name, email, and a password of at least 8 characters are required.', 400, 'AUTH_INVALID_REGISTRATION');
    }
    if (store.users.some((item) => item.email.toLocaleLowerCase() === email)) {
      throw makeError('An account already uses this email.', 409, 'AUTH_EMAIL_EXISTS');
    }
    return transact((draft) => {
      const user = makeUser(
        {
          id: `registered-citizen-${++draft.counters.citizen}`,
          name,
          email,
          role: 'citizen',
        },
        new Date().toISOString(),
      );
      user.password = password;
      user.verified = false;
      draft.users.push(user);
      draft.verificationCodes[email] = {
        code: '246810',
        expiresAt: toIso(Date.now() + 10 * 60 * 1000),
      };
      return { ...createSession(draft, user), verificationRequired: true };
    });
  });

  const verifyCode = delayed('auth.verifyCode', (input = {}) => {
    const email = String(input.email ?? '').trim().toLocaleLowerCase();
    const record = store.verificationCodes[email];
    if (!record || record.expiresAt <= new Date().toISOString() || record.code !== String(input.code ?? '')) {
      throw makeError('The verification code is invalid or expired.', 400, 'AUTH_INVALID_CODE');
    }
    return transact((draft) => {
      const user = draft.users.find((item) => item.email.toLocaleLowerCase() === email);
      if (!user) throw makeError('The account could not be found.', 404, 'NOT_FOUND');
      user.verified = true;
      delete draft.verificationCodes[email];
      return { verified: true, user: publicUser(user) };
    });
  });

  const resend = delayed('auth.resend', (input = {}) => {
    const email = String(input.email ?? '').trim().toLocaleLowerCase();
    const exists = store.users.some((item) => item.email.toLocaleLowerCase() === email);
    if (!exists) return { sent: true };
    const expiresAt = toIso(Date.now() + 10 * 60 * 1000);
    transact((draft) => {
      draft.verificationCodes[email] = { code: '246810', expiresAt };
    });
    return { sent: true, demoCode: '246810', expiresAt };
  });

  const logout = delayed('auth.logout', (token) => {
    if (!token || store.activeSession?.token === token) {
      transact((draft) => {
        draft.activeSession = null;
      });
    }
    return { loggedOut: true };
  });

  const refresh = delayed('auth.refresh', (session) => {
    if (
      !session?.token ||
      !session.user?.id ||
      !Number.isFinite(session.expiresAt) ||
      session.expiresAt <= Date.now()
    ) {
      throw makeError('The demo session has expired.', 401, 'AUTH_SESSION_EXPIRED');
    }
    if (!store.activeSession || store.activeSession.token !== session.token) {
      throw makeError('The demo session has expired.', 401, 'AUTH_SESSION_EXPIRED');
    }
    const user = store.users.find((item) => item.id === session.user.id);
    if (!user) throw makeError('The demo session has expired.', 401, 'AUTH_SESSION_EXPIRED');
    return transact((draft) => createSession(draft, draft.users.find((item) => item.id === user.id)));
  });

  const forgot = delayed('auth.forgot', (input = {}) => {
    const email = String(input.email ?? '').trim().toLocaleLowerCase();
    const user = store.users.find((item) => item.email.toLocaleLowerCase() === email);
    if (!user) return { accepted: true };
    const resetToken = `reset.${encodeURIComponent(user.id)}.${Date.now()}`;
    const expiresAt = toIso(Date.now() + 30 * 60 * 1000);
    transact((draft) => {
      draft.resetTokens[resetToken] = { userId: user.id, expiresAt };
    });
    return { accepted: true, resetToken, expiresAt };
  });

  const reset = delayed('auth.reset', (input = {}) => {
    const resetToken = String(input.token ?? '');
    const password = String(input.password ?? '');
    const tokenRecord = store.resetTokens[resetToken];
    if (!tokenRecord || tokenRecord.expiresAt <= new Date().toISOString()) {
      throw makeError('The password reset token is invalid or expired.', 400, 'AUTH_INVALID_RESET_TOKEN');
    }
    if (password.length < 8) {
      throw makeError('Password must contain at least 8 characters.', 400, 'AUTH_INVALID_PASSWORD');
    }
    return transact((draft) => {
      const user = draft.users.find((item) => item.id === tokenRecord.userId);
      if (!user) throw makeError('The account could not be found.', 404, 'NOT_FOUND');
      user.password = password;
      delete draft.resetTokens[resetToken];
      return { reset: true };
    });
  });

  return Object.freeze({ login, register, verifyCode, resend, logout, refresh, forgot, reset });
}

function resetStore() {
  const previousSession = store.activeSession;
  const nextStore = createSeedStore();
  if (
    previousSession &&
    previousSession.expiresAt > Date.now() &&
    nextStore.users.some((user) => user.id === previousSession.userId)
  ) {
    nextStore.activeSession = previousSession;
  }
  persistStore(nextStore);
  store = nextStore;
  injectedErrors.clear();
  return {
    reset: true,
    dataLabel: SYNTHETIC_LABEL,
    complaints: store.complaints.length,
    users: store.users.length,
  };
}

function deepFreeze(value) {
  Object.values(value).forEach((item) => {
    if (item && typeof item === 'object' && !Object.isFrozen(item)) deepFreeze(item);
  });
  return Object.freeze(value);
}

const seededStore = createSeedStore();
const referenceData = deepFreeze({
  dataLabel: SYNTHETIC_LABEL,
  departments: clone(seededStore.departments),
  categories: clone(seededStore.categories),
  localities: [...LOCALITIES],
  lifecycleStates: [...LIFECYCLE_STATES],
  languages: [...LANGUAGE_CODES],
});
const demoUsers = Object.freeze(
  seededStore.users.map((user) => Object.freeze({
    email: user.email,
    password: user.password,
    ...publicUser(user),
  })),
);

const auth = createAuthApi();
const complaints = Object.freeze({
  create: delayed('complaints.create', createComplaintRecord),
  list: delayed('complaints.list', listComplaints),
  get: delayed('complaints.get', getComplaint),
  addComment: delayed('complaints.addComment', addComment),
  updateProgress: delayed('complaints.updateProgress', updateProgress),
  accept: delayed('complaints.accept', acceptComplaint),
});
const notifications = Object.freeze({
  list: delayed('notifications.list', listNotifications),
  markRead: delayed('notifications.markRead', markNotificationRead),
});

const submitComplaint = delayed('submitComplaint', (input, context) => ({
  data: createComplaintRecord(input, context),
  mode: 'mock',
}));
const reset = delayed('reset', resetStore);

function injectError(operation, error) {
  if (typeof operation !== 'string' || !operation.trim()) {
    return Promise.reject(new TypeError('An API operation name is required.'));
  }
  enqueueError(operation, error ?? makeError('An injected mock API error occurred.', 500, 'MOCK_INJECTED_ERROR'));
  return simulateLatency().then(() => ({ injected: true, operation }));
}

export const apiConfig = Object.freeze({ mockEnabled: true, apiBaseUrl: '' });
export const api = Object.freeze({
  auth,
  complaints,
  notifications,
  demoUsers,
  referenceData,
  injectError,
  reset,
  login: auth.login,
  register: auth.register,
  logout: auth.logout,
  refresh: auth.refresh,
  listComplaints: complaints.list,
  getComplaint: complaints.get,
  submitComplaint,
  analyzeComplaint: delayed('analyzeComplaint', (originalText) => mockApi.analyzeComplaint(originalText)),
  reviewComplaint: delayed('reviewComplaint', (input) => mockApi.reviewComplaint(input)),
  submitResolution: delayed('submitResolution', (input) => mockApi.submitResolution(input)),
  verifyResolution: delayed('verifyResolution', (input) => mockApi.verifyResolution(input)),
  getAuditTrail: delayed('getAuditTrail', (complaintId) => mockApi.getAuditTrail(complaintId)),
});
