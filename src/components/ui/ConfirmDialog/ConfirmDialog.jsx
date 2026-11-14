import { useState } from 'react';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import { Button } from '../Button/Button.jsx';
import { Modal } from '../Modal/Modal.jsx';
import { Textarea } from '../Textarea/Textarea.jsx';

export function ConfirmDialog({
  open,
  title,
  body,
  onConfirm,
  onCancel,
  confirmTone = 'primary',
  cancelTone = 'secondary',
  confirmLabel,
  cancelLabel,
  requireReason = false,
  minReasonLength = 10,
  reasonLabel,
}) {
  const { t } = useI18n();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  function confirm() {
    if (requireReason && reason.trim().length < minReasonLength) {
      setError(t('ui.reasonError', { count: minReasonLength }));
      return;
    }
    setError('');
    onConfirm?.(reason.trim());
    setReason('');
  }

  function cancel() {
    setError('');
    setReason('');
    onCancel?.();
  }

  return (
    <Modal
      open={open}
      onClose={cancel}
      title={title}
      description={body}
      className="ui-confirm-dialog"
      footer={
        <>
          <Button variant={cancelTone} onClick={cancel}>
            {cancelLabel || t('common.cancel')}
          </Button>
          <Button variant={confirmTone} onClick={confirm}>
            {confirmLabel || t('common.confirm')}
          </Button>
        </>
      }
    >
      {requireReason ? (
        <Textarea
          label={reasonLabel || t('ui.reasonRequired')}
          value={reason}
          onChange={(event) => {
            setReason(event.target.value);
            if (error) setError('');
          }}
          minLength={minReasonLength}
          required
          error={error}
          hint={t('ui.reasonMinimum', { count: minReasonLength })}
        />
      ) : null}
    </Modal>
  );
}
