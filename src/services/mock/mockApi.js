export const mockApi = Object.freeze({
  async listComplaints() {
    return { data: [], page: 1, pageSize: 20, total: 0, mode: 'mock' };
  },
  async getComplaint(id) {
    return { data: null, requestedId: id, mode: 'mock' };
  },
  async analyzeComplaint(originalText) {
    return {
      data: {
        language: null,
        languageConfidence: null,
        originalText,
        normalizedText: null,
        category: { label: null, confidence: null, topK: [] },
        urgency: { label: null, confidence: null, reasons: [] },
        department: { label: null, confidence: null, reason: null },
        relatedComplaints: [],
        explanation: null,
        needsHumanReview: null,
        modelVersions: {},
      },
      mode: 'mock',
    };
  },
  async submitComplaint(input) {
    return {
      data: {
        id: null,
        originalText: input.originalText,
        normalizedText: null,
        status: 'mock-pending',
        aiAnalysis: null,
        media: [],
        location: input.location || null,
        createdAt: null,
      },
      mode: 'mock',
    };
  },
  async reviewComplaint(input) {
    return {
      data: {
        complaintId: input.complaintId,
        aiValue: input.aiValue,
        humanValue: input.humanValue,
        reason: input.reason,
        decidedBy: input.decidedBy || null,
        decidedAt: null,
      },
      mode: 'mock',
    };
  },
  async submitResolution(input) {
    return {
      data: {
        complaintId: input.complaintId,
        status: 'Citizen Verification',
        description: input.description,
        actionTaken: input.actionTaken,
        beforeMedia: [],
        afterMedia: [],
        submittedAt: null,
      },
      mode: 'mock',
    };
  },
  async verifyResolution(input) {
    return {
      data: {
        complaintId: input.complaintId,
        accepted: input.accepted,
        rejectionReason: input.rejectionReason || null,
        status: input.accepted ? 'Resolved' : 'Reopened',
        rejectionCount: null,
        escalated: null,
      },
      mode: 'mock',
    };
  },
  async getAuditTrail(complaintId) {
    return { data: [], complaintId, appendOnly: true, mode: 'mock' };
  },
});
