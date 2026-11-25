import { useEffect, useState } from 'react';
import { Button } from '../ui/Button/Button.jsx';
import { FormField } from '../ui/FormField/FormField.jsx';
import { Input } from '../ui/Input/Input.jsx';
import { Modal } from '../ui/Modal/Modal.jsx';
import { Select } from '../ui/Select/Select.jsx';
import { Textarea } from '../ui/Textarea/Textarea.jsx';
import { AIBadge } from './AIBadge.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import './OverrideDialog.css';

export function OverrideDialog({
  open,
  field = '',
  aiValue = '',
  initialNewValue = '',
  options = [],
  onConfirm,
  onCancel,
}) {
  const { t } = useI18n();

  const [newValue, setNewValue] = useState(initialNewValue || '');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (open) {
      setNewValue(initialNewValue || (options.length > 0 ? (options[0].value || options[0].label || options[0]) : ''));
      setReason('');
      setError('');
      setShake(false);
    }
  }, [open, initialNewValue, options]);

  function triggerShake() {
    setShake(false);
    window.requestAnimationFrame(() => setShake(true));
  }

  function handleConfirm() {
    const trimmedReason = reason.trim();
    if (trimmedReason.length < 10) {
      setError(t('ai.overrideReasonMinLength', { count: 10 }));
      triggerShake();
      return;
    }

    const finalNewValue = newValue.trim() || aiValue;
    onConfirm?.({
      field,
      aiValue,
      newValue: finalNewValue,
      reason: trimmedReason,
    });
  }

  const selectOptions = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : { value: opt.value || opt.label, label: opt.label || opt.value },
  );

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={t('ai.overrideTitle', { field: field || t('ai.fieldLabel') })}
      className={`override-dialog${shake ? ' anim-shake' : ''}`}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            variant="cta"
            onClick={handleConfirm}
            disabled={reason.trim().length < 10}
          >
            {t('ai.overrideConfirm')}
          </Button>
        </>
      }
    >
      <div className="override-dialog__body">
        <p className="override-dialog__notice">
          {t('ai.overrideNotice')}
        </p>

        <div className="override-dialog__comparison">
          <div className="override-dialog__card override-dialog__card--ai">
            <div className="override-dialog__card-header">
              <AIBadge size="sm" />
              <span className="override-dialog__tag">{t('ai.aiRecommendation')}</span>
            </div>
            <div className="override-dialog__value-display" dir="auto">
              {aiValue}
            </div>
          </div>

          <div className="override-dialog__arrow" aria-hidden="true">
            →
          </div>

          <div className="override-dialog__card override-dialog__card--human">
            <div className="override-dialog__card-header">
              <span className="override-dialog__tag override-dialog__tag--human">
                {t('ai.humanDecision')}
              </span>
            </div>
            {selectOptions.length > 0 ? (
              <Select
                id="overrideNewValueSelect"
                label={t('ai.overrideNewValueLabel', { field: field || t('ai.fieldLabel') })}
                value={newValue}
                onChange={(val) => {
                  setNewValue(val);
                }}
                options={selectOptions}
              />
            ) : (
              <Input
                id="overrideNewValueInput"
                label={t('ai.overrideNewValueLabel', { field: field || t('ai.fieldLabel') })}
                placeholder={t('ai.overrideNewValuePlaceholder')}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
            )}
          </div>
        </div>

        <div className="override-dialog__reason-field">
          <Textarea
            id="overrideReasonTextarea"
            label={t('ai.overrideReasonLabel')}
            placeholder={t('ai.overrideReasonPlaceholder')}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error && e.target.value.trim().length >= 10) {
                setError('');
              }
            }}
            error={error}
            rows={3}
            required
            aria-required="true"
          />
          <div className="override-dialog__reason-counter">
            <span
              className={
                reason.trim().length < 10
                  ? 'override-dialog__count-warn'
                  : 'override-dialog__count-ok'
              }
            >
              {t('ai.overrideReasonCounter', { count: reason.trim().length, min: 10 })}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
