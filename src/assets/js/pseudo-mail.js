const PSEUDO_COORDINATOR_ANNOUNCEMENT_KEY = 'coordinatorPseudoAnnouncements';
const PSEUDO_STUDENT_ANNOUNCEMENT_KEY = 'studentPseudoAnnouncements';
const PSEUDO_COORDINATOR_INBOX_KEY = 'coordinatorPseudoInboxMessages';
const PSEUDO_STUDENT_DELETED_ANNOUNCEMENT_KEY = 'studentDeletedPseudoAnnouncements';

function parsePseudoMailStorage(key) {
  try {
    const rawValue = window.localStorage.getItem(key);
    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    console.error('Unable to parse pseudo mail storage:', error);
    return [];
  }
}

function writePseudoMailStorage(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function createPseudoMailId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function sortPseudoMailByUpdatedAt(items) {
  return [...items].sort((left, right) => {
    const leftTime = new Date(left.updatedAt || left.createdAt || 0).getTime();
    const rightTime = new Date(right.updatedAt || right.createdAt || 0).getTime();
    return rightTime - leftTime;
  });
}

function getDeletedStudentAnnouncementKeys(studentId) {
  return new Set(
    parsePseudoMailStorage(PSEUDO_STUDENT_DELETED_ANNOUNCEMENT_KEY)
      .filter((entry) => entry?.studentId === studentId && entry?.announcementKey)
      .map((entry) => entry.announcementKey)
  );
}

function backfillStudentAnnouncementsForCoordinator(studentId, coordinatorId) {
  const studentAnnouncements = parsePseudoMailStorage(PSEUDO_STUDENT_ANNOUNCEMENT_KEY);

  if (!studentId || !coordinatorId) {
    return studentAnnouncements;
  }

  const coordinatorAnnouncements = parsePseudoMailStorage(PSEUDO_COORDINATOR_ANNOUNCEMENT_KEY)
    .filter((announcement) => announcement.coordinatorId === coordinatorId);
  const deletedAnnouncementKeys = getDeletedStudentAnnouncementKeys(studentId);
  const existingAnnouncementIds = new Set(
    studentAnnouncements
      .filter((announcement) => announcement.studentId === studentId)
      .map((announcement) => announcement.announcementId || announcement.id)
  );
  const nextStudentAnnouncements = coordinatorAnnouncements
    .filter((announcement) => (
      !existingAnnouncementIds.has(announcement.id) &&
      !deletedAnnouncementKeys.has(announcement.id)
    ))
    .map((announcement) => ({
      id: createPseudoMailId('local-student-announcement'),
      announcementId: announcement.id,
      studentId,
      studentEmail: '',
      coordinatorId: announcement.coordinatorId,
      coordinatorName: announcement.coordinatorName || 'Coordinator',
      coordinatorEmail: announcement.coordinatorEmail || '',
      subject: announcement.subject || '',
      message: announcement.message || '',
      read: false,
      createdAt: announcement.createdAt,
      updatedAt: announcement.updatedAt || announcement.createdAt,
      source: announcement.source || 'local'
    }));

  if (!nextStudentAnnouncements.length) {
    return studentAnnouncements;
  }

  const mergedAnnouncements = studentAnnouncements.concat(nextStudentAnnouncements);
  writePseudoMailStorage(PSEUDO_STUDENT_ANNOUNCEMENT_KEY, mergedAnnouncements);
  return mergedAnnouncements;
}

window.pseudoMailStore = {
  sendCoordinatorAnnouncement(payload) {
    const nowIso = new Date().toISOString();
    const coordinatorAnnouncements = parsePseudoMailStorage(PSEUDO_COORDINATOR_ANNOUNCEMENT_KEY);
    const studentAnnouncements = parsePseudoMailStorage(PSEUDO_STUDENT_ANNOUNCEMENT_KEY);

    const announcementId = createPseudoMailId('local-coordinator-announcement');
    const coordinatorAnnouncement = {
      id: announcementId,
      coordinatorId: payload.coordinatorId,
      coordinatorName: payload.coordinatorName || 'Coordinator',
      coordinatorEmail: payload.coordinatorEmail || '',
      subject: payload.subject || '',
      message: payload.message || '',
      recipientCount: payload.students.length,
      recipientIds: payload.students.map((student) => student.uid),
      createdAt: nowIso,
      updatedAt: nowIso,
      source: 'local'
    };

    const nextStudentAnnouncements = payload.students.map((student) => ({
      id: createPseudoMailId('local-student-announcement'),
      announcementId,
      studentId: student.uid,
      studentEmail: student.email || '',
      coordinatorId: payload.coordinatorId,
      coordinatorName: payload.coordinatorName || 'Coordinator',
      coordinatorEmail: payload.coordinatorEmail || '',
      subject: payload.subject || '',
      message: payload.message || '',
      read: false,
      createdAt: nowIso,
      updatedAt: nowIso,
      source: 'local'
    }));

    writePseudoMailStorage(
      PSEUDO_COORDINATOR_ANNOUNCEMENT_KEY,
      coordinatorAnnouncements.concat(coordinatorAnnouncement)
    );
    writePseudoMailStorage(
      PSEUDO_STUDENT_ANNOUNCEMENT_KEY,
      studentAnnouncements.concat(nextStudentAnnouncements)
    );

    return {
      announcement: coordinatorAnnouncement,
      studentAnnouncements: nextStudentAnnouncements
    };
  },

  getCoordinatorAnnouncements(coordinatorId) {
    return sortPseudoMailByUpdatedAt(
      parsePseudoMailStorage(PSEUDO_COORDINATOR_ANNOUNCEMENT_KEY)
        .filter((announcement) => announcement.coordinatorId === coordinatorId)
    );
  },

  getStudentAnnouncements(studentId, coordinatorId = '') {
    return sortPseudoMailByUpdatedAt(
      backfillStudentAnnouncementsForCoordinator(studentId, coordinatorId)
        .filter((announcement) => announcement.studentId === studentId)
    );
  },

  markStudentAnnouncementRead(announcementId) {
    if (!announcementId) {
      return;
    }

    const studentAnnouncements = parsePseudoMailStorage(PSEUDO_STUDENT_ANNOUNCEMENT_KEY);
    const nextAnnouncements = studentAnnouncements.map((announcement) => {
      if (announcement.id !== announcementId) {
        return announcement;
      }

      return {
        ...announcement,
        read: true,
        updatedAt: new Date().toISOString()
      };
    });

    writePseudoMailStorage(PSEUDO_STUDENT_ANNOUNCEMENT_KEY, nextAnnouncements);
  },

  deleteStudentAnnouncement(announcementId) {
    if (!announcementId) {
      return;
    }

    const studentAnnouncements = parsePseudoMailStorage(PSEUDO_STUDENT_ANNOUNCEMENT_KEY);
    const announcementToDelete = studentAnnouncements.find((announcement) => announcement.id === announcementId);
    const announcementKey = announcementToDelete?.announcementId || announcementToDelete?.id || announcementId;
    const studentId = announcementToDelete?.studentId || '';
    const nextAnnouncements = studentAnnouncements
      .filter((announcement) => announcement.id !== announcementId);

    if (studentId && announcementKey) {
      const deletedAnnouncements = parsePseudoMailStorage(PSEUDO_STUDENT_DELETED_ANNOUNCEMENT_KEY);
      const alreadyDeleted = deletedAnnouncements.some((entry) => (
        entry?.studentId === studentId && entry?.announcementKey === announcementKey
      ));

      if (!alreadyDeleted) {
        deletedAnnouncements.push({
          studentId,
          announcementKey,
          deletedAt: new Date().toISOString()
        });
        writePseudoMailStorage(PSEUDO_STUDENT_DELETED_ANNOUNCEMENT_KEY, deletedAnnouncements);
      }
    }

    writePseudoMailStorage(PSEUDO_STUDENT_ANNOUNCEMENT_KEY, nextAnnouncements);
  },

  sendStudentCoordinatorMessage(payload) {
    const nowIso = new Date().toISOString();
    const inboxMessages = parsePseudoMailStorage(PSEUDO_COORDINATOR_INBOX_KEY)
      .filter((message) => !(message.studentId === payload.studentId && message.coordinatorId === payload.coordinatorId));

    const messageRecord = {
      id: createPseudoMailId('local-student-coordinator-message'),
      studentId: payload.studentId,
      studentName: payload.studentName || 'Student',
      studentEmail: payload.studentEmail || '',
      coordinatorId: payload.coordinatorId,
      coordinatorName: payload.coordinatorName || 'Coordinator',
      coordinatorEmail: payload.coordinatorEmail || '',
      subject: payload.subject || '',
      message: payload.message || '',
      createdAt: nowIso,
      updatedAt: nowIso,
      source: 'local'
    };

    writePseudoMailStorage(
      PSEUDO_COORDINATOR_INBOX_KEY,
      inboxMessages.concat(messageRecord)
    );

    return messageRecord;
  },

  getCoordinatorInboxMessages(coordinatorId) {
    return sortPseudoMailByUpdatedAt(
      parsePseudoMailStorage(PSEUDO_COORDINATOR_INBOX_KEY)
        .filter((message) => message.coordinatorId === coordinatorId)
    );
  },

  deleteCoordinatorInboxMessage(messageId) {
    if (!messageId) {
      return;
    }

    const nextMessages = parsePseudoMailStorage(PSEUDO_COORDINATOR_INBOX_KEY)
      .filter((message) => message.id !== messageId);
    writePseudoMailStorage(PSEUDO_COORDINATOR_INBOX_KEY, nextMessages);
  }
};
