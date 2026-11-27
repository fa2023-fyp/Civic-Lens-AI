import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import { Button } from '../ui/Button/Button.jsx';
import { Modal } from '../ui/Modal/Modal.jsx';
import { Select } from '../ui/Select/Select.jsx';
import { Textarea } from '../ui/Textarea/Textarea.jsx';
import './ReassignDialog.css';

export function ReassignDialog({
  open,
  onClose,
  complaints = [],
  officers = [],
  onConfirm,
  loading = false,
}) {
  const { t } = useI18n();
  const [complaintId, setComplaintId] = useState('');
  const [officerId, setOfficerId] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!open) return;
    setComplaintId(complaints[0]?.id ?? '');
    setOfficerId('');
    setReason('');
  }, [open, complaints]);

  const selected = useMemo(
    () => complaints.find((complaint) => complaint.id === complaintId) ?? complaints[0] ?? null,
    [complaints, complaintId],
  );

  const nameById = useMemo(() => {
    const map = new Map();
    for (const officer of officers) map.set(officer.id, officer.name);
    return map;
  }, [officers]);

  const eligibleOfficers = useMemo(
    () => officers.filter((officer) => officer.id !== selected?.assignedOfficerId),
    [officers, selected],
  );

  const history = selected?.assignmentHistory ?? [];

  function resolveName(id) {
    if (!id) return t('reassign.unassigned');
    return nameById.get(id) ?? id;
  }

  function confirm() {
    if (!selected || !officerId) return;
    onConfirm?.({ complaintId: selected.id, officerId, reason: reason.trim() });
  }

  const canConfirm = Boolean(selected) && Boolean(officerId) && eligibleOfficers.length > 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('reassign.title')}
      description={t('reassign.body')}
      className="ui-reassign-dialog"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={confirm} loading={loading} disabled={!canConfirm}>
            {t('reassign.confirm')}
          </Button>
        </>
      }
    >
      <div className="ui-reassign-dialog__fields">
        {complaints.length > 1 ? (
          <Select
            label={t('reassign.complaintLabel')}
            value={complaintId}
            onChange={(event) => setComplaintId(event.target.value)}
            options={complaints.map((complaint) => ({
              value: complaint.id,
              label: complaint.id,
            }))}
          />
        ) : null}

        {eligibleOfficers.length === 0 ? (
          <p className="ui-reassign-dialog__empty">{t('reassign.noOfficers')}</p>
        ) : (
          <Select
            label={t('reassign.officerLabel')}
            placeholder={t('reassign.officerPlaceholder')}
            value={officerId}
            onChange={(event) => setOfficerId(event.target.value)}
            options={eligibleOfficers.map((officer) => ({
              value: officer.id,
              label: officer.name,
            }))}
          />
        )}

        <Textarea
          label={t('reassign.reasonLabel')}
          hint={t('reassign.reasonHint')}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          maxLength={280}
          showCount
        />

        <div className="ui-reassign-dialog__history">
          <h3 className="ui-reassign-dialog__history-title">{t('reassign.historyTitle')}</h3>
          {history.length === 0 ? (
            <p className="ui-reassign-dialog__empty">{t('reassign.historyEmpty')}</p>
          ) : (
            <ul className="ui-reassign-dialog__history-list">
              {history
                .slice()
                .reverse()
                .map((entry, index) => (
                  <li key={`${entry.at}-${index}`} className="ui-reassign-dialog__history-item">
                    <span className="ui-reassign-dialog__history-route">
                      {resolveName(entry.fromOfficerId)} → {resolveName(entry.toOfficerId)}
                    </span>
                    {entry.reason ? (
                      <span className="ui-reassign-dialog__history-reason">{entry.reason}</span>
                    ) : null}
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}