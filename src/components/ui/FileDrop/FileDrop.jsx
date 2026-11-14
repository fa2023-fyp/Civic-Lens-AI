import { useEffect, useId, useRef, useState } from 'react';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import { FormField } from '../FormField/FormField.jsx';
import { Button } from '../Button/Button.jsx';
import { Icon } from '../Icon/Icon.jsx';
import { IconButton } from '../IconButton/IconButton.jsx';
import './FileDrop.css';

const DEFAULT_TYPES = ['image/jpeg', 'image/png'];

export function FileDrop({
  id: suppliedId,
  label,
  hint,
  error,
  files: controlledFiles,
  onFilesChange,
  onTypeError,
  onSizeError,
  acceptTypes = DEFAULT_TYPES,
  maxSizeBytes = 5 * 1024 * 1024,
  maxFiles = 5,
  progressByFile = {},
  className = '',
}) {
  const generatedId = useId();
  const id = suppliedId || generatedId;
  const { t } = useI18n();
  const [internalFiles, setInternalFiles] = useState([]);
  const [validationError, setValidationError] = useState('');
  const [dragging, setDragging] = useState(false);
  const galleryRef = useRef(null);
  const cameraRef = useRef(null);
  const selectedFiles = controlledFiles ?? internalFiles;
  const accepted = Array.isArray(acceptTypes)
    ? acceptTypes
    : acceptTypes.split(',').map((type) => type.trim());
  const acceptValue = accepted.join(',');
  const [previews, setPreviews] = useState({});

  useEffect(() => {
    const next = {};
    for (const file of selectedFiles) {
      if (file.type.startsWith('image/')) next[fileKey(file)] = URL.createObjectURL(file);
    }
    setPreviews(next);
    return () => Object.values(next).forEach((url) => URL.revokeObjectURL(url));
  }, [selectedFiles]);

  function fileKey(file) {
    return `${file.name}-${file.size}-${file.lastModified}`;
  }

  function commit(next) {
    if (controlledFiles === undefined) setInternalFiles(next);
    onFilesChange?.(next);
  }

  function addFiles(fileList) {
    const valid = [];
    let firstError = '';
    for (const file of Array.from(fileList || [])) {
      if (!accepted.includes(file.type)) {
        onTypeError?.(file);
        firstError ||= t('ui.fileTypeError', { name: file.name });
      } else if (file.size > maxSizeBytes) {
        onSizeError?.(file);
        firstError ||= t('ui.fileSizeError', {
          name: file.name,
          size: Math.round(maxSizeBytes / 1024 / 1024),
        });
      } else {
        valid.push(file);
      }
    }
    const remaining = Math.max(0, maxFiles - selectedFiles.length);
    if (valid.length > remaining) firstError ||= t('ui.fileLimitError', { count: maxFiles });
    const next = [...selectedFiles, ...valid.slice(0, remaining)];
    setValidationError(firstError);
    if (valid.length) {
      commit(next);
    }
  }

  function removeFile(fileToRemove) {
    setValidationError('');
    commit(selectedFiles.filter((file) => fileKey(file) !== fileKey(fileToRemove)));
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  }

  const visibleError = error || validationError;

  return (
    <FormField id={`${id}-gallery`} label={label} hint={hint} error={visibleError}>
      {({ descriptionId }) => (
        <div
          className={`ui-file-drop${dragging ? ' is-dragging' : ''}${className ? ` ${className}` : ''}`}
        >
          <div
            className="ui-file-drop__zone"
            onDragEnter={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false);
            }}
            onDrop={handleDrop}
          >
            <Icon name="upload" size={28} />
            <p>{t('ui.fileDropPrompt')}</p>
            <div className="ui-file-drop__actions">
              <Button
                variant="secondary"
                iconStart="image"
                onClick={() => galleryRef.current?.click()}
              >
                {t('ui.chooseGallery')}
              </Button>
              <Button
                variant="secondary"
                iconStart="camera"
                onClick={() => cameraRef.current?.click()}
              >
                {t('ui.openCamera')}
              </Button>
            </div>
            <input
              ref={galleryRef}
              id={`${id}-gallery`}
              className="sr-only"
              type="file"
              accept={acceptValue}
              multiple={maxFiles > 1}
              tabIndex={-1}
              aria-hidden="true"
              aria-describedby={visibleError || hint ? descriptionId : undefined}
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = '';
              }}
            />
            <input
              ref={cameraRef}
              className="sr-only"
              type="file"
              accept={acceptValue}
              capture="environment"
              tabIndex={-1}
              aria-hidden="true"
              aria-describedby={visibleError || hint ? descriptionId : undefined}
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = '';
              }}
            />
          </div>
          {selectedFiles.length ? (
            <ul className="ui-file-drop__list">
              {selectedFiles.map((file) => {
                const progress = Math.max(
                  0,
                  Math.min(100, Number(progressByFile[file.name] ?? 100)),
                );
                const preview = previews[fileKey(file)];
                return (
                  <li className="ui-file-drop__item" key={fileKey(file)}>
                    {preview ? (
                      <img className="ui-file-drop__thumbnail" src={preview} alt="" />
                    ) : (
                      <Icon name="file" size={24} />
                    )}
                    <span className="ui-file-drop__file">
                      <span className="ui-file-drop__name">{file.name}</span>
                      <span
                        className="ui-file-drop__progress"
                        role="progressbar"
                        aria-label={t('ui.uploadProgress', { name: file.name })}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={progress}
                      >
                        <span style={{ transform: `scaleX(${progress / 100})` }} />
                      </span>
                    </span>
                    <IconButton
                      icon="close"
                      aria-label={t('ui.removeFile', { name: file.name })}
                      onClick={() => removeFile(file)}
                    />
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      )}
    </FormField>
  );
}
