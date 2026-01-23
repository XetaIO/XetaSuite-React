import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/shared/components/ui/modal/Modal';
import Button from '@/shared/components/ui/button/Button';
import { SearchableDropdown, type PinnedItem } from '@/shared/components/ui';
import Label from '@/shared/components/form/Label';
import Input from '@/shared/components/form/input/InputField';
import { showSuccess, showError } from '@/shared/utils/toast';
import { CalendarEventManager } from '../services/CalendarManager';
import type { CalendarEvent, CalendarEventFormData, AvailableEventCategory } from '../types';
import { Checkbox, TextArea } from '@/shared/components/form';

interface CalendarEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: CalendarEvent | null;
    initialDateInfo: { start: Date; end: Date; allDay: boolean } | null;
    onSave: () => void;
}

export function CalendarEventModal({
    isOpen,
    onClose,
    event,
    initialDateInfo,
    onSave,
}: CalendarEventModalProps) {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [categories, setCategories] = useState<AvailableEventCategory[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    // Original category for pinned item (when editing)
    const [originalCategory, setOriginalCategory] = useState<AvailableEventCategory | null>(null);

    // Form state
    const [formData, setFormData] = useState<CalendarEventFormData>({
        title: '',
        description: '',
        event_category_id: undefined,
        color: '',
        start_at: '',
        end_at: '',
        all_day: false
    });

    // Load categories
    const loadCategories = useCallback(async (search?: string) => {
        setIsLoadingCategories(true);
        const result = await CalendarEventManager.getAvailableEventCategories(search);
        if (result.success && result.data) {
            setCategories(result.data);
        }
        setIsLoadingCategories(false);
    }, []);

    // Fetch categories when modal opens
    useEffect(() => {
        if (isOpen) {
            loadCategories();
        }
    }, [isOpen, loadCategories]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setOriginalCategory(null);
        }
    }, [isOpen]);

    // Initialize form data
    useEffect(() => {
        if (event) {
            setFormData({
                title: event.title,
                description: event.description || '',
                event_category_id: event.category?.id || undefined,
                color: event.color || '',
                start_at: formatDateTimeLocal(event.start_at),
                end_at: event.end_at ? formatDateTimeLocal(event.end_at) : '',
                all_day: event.all_day,
            });
            // Save original category for pinned item
            if (event.category) {
                setOriginalCategory({
                    id: event.category.id,
                    name: event.category.name,
                    color: event.category.color,
                });
            }
        } else if (initialDateInfo) {
            setFormData({
                title: '',
                description: '',
                event_category_id: undefined,
                color: '',
                start_at: formatDateTimeLocal(initialDateInfo.start.toISOString()),
                end_at: formatDateTimeLocal(initialDateInfo.end.toISOString()),
                all_day: initialDateInfo.allDay,
            });
        } else {
            // Default to current time
            const now = new Date();
            const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
            setFormData({
                title: '',
                description: '',
                event_category_id: undefined,
                color: '',
                start_at: formatDateTimeLocal(now.toISOString()),
                end_at: formatDateTimeLocal(oneHourLater.toISOString()),
                all_day: false,
            });
        }
        setErrors({});
    }, [event, initialDateInfo, isOpen]);

    // Format date for datetime-local input
    function formatDateTimeLocal(isoString: string): string {
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    // Handle input change
    const handleChange = useCallback((field: keyof CalendarEventFormData, value: unknown) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: [] }));
    }, []);

    // Handle submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        const data = {
            ...formData,
            // Send null instead of empty string to clear the color in backend
            color: formData.color || null,
            start_at: new Date(formData.start_at).toISOString(),
            end_at: formData.end_at ? new Date(formData.end_at).toISOString() : undefined,
        };

        let result;
        if (event) {
            result = await CalendarEventManager.update(event.id, data);
        } else {
            result = await CalendarEventManager.create(data);
        }

        setIsLoading(false);

        if (result.success) {
            showSuccess(t(event ? 'calendar.events.updated' : 'calendar.events.created'));
            onSave();
        } else {
            if (result.validationErrors) {
                const errorsMap: Record<string, string[]> = {};
                Object.entries(result.validationErrors).forEach(([key, value]) => {
                    errorsMap[key] = [value];
                });
                setErrors(errorsMap);
            }
            showError(result.error || t('common.error'));
        }
    };

    // Handle delete
    const handleDelete = async () => {
        if (!event) return;

        if (!window.confirm(t('calendar.events.confirmDelete'))) {
            return;
        }

        setIsDeleting(true);
        const result = await CalendarEventManager.delete(event.id);
        setIsDeleting(false);

        if (result.success) {
            showSuccess(t('calendar.events.deleted'));
            onSave();
        } else {
            showError(result.error || t('common.error'));
        }
    };

    // Handle category search
    const handleCategorySearch = useCallback(async (search: string) => {
        await loadCategories(search || undefined);
    }, [loadCategories]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-lg"
        >
            <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    {event ? t('calendar.events.edit') : t('calendar.events.create')}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                        <Label htmlFor="title">{t('calendar.events.titleLabel')} *</Label>
                        <Input
                            id="title"
                            type="text"
                            placeholder={t('calendar.events.titlePlaceholder')}
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            error={!!errors.title?.length}
                            hint={errors.title?.[0]}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <Label htmlFor="description">{t('calendar.events.description')}</Label>
                        <TextArea
                            id="description"
                            placeholder={t('calendar.events.descriptionPlaceholder')}
                            value={formData.description}
                            onChange={(value) => handleChange('description', value)}
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <Label htmlFor="category">{t('calendar.events.category')}</Label>
                        <SearchableDropdown
                            value={formData.event_category_id ?? null}
                            onChange={(value) => handleChange('event_category_id', value ?? undefined)}
                            options={categories}
                            placeholder={t('calendar.categories.none')}
                            searchPlaceholder={t('calendar.categories.search')}
                            noSelectionText={t('calendar.categories.none')}
                            noResultsText={t('common.noResults')}
                            loadingText={t('common.loading')}
                            nullable
                            isLoading={isLoadingCategories}
                            onSearch={handleCategorySearch}
                            pinnedItem={originalCategory ? {
                                id: originalCategory.id,
                                name: originalCategory.name,
                                label: t('calendar.categories.current'),
                            } as PinnedItem : undefined}
                            renderOption={(opt) => (
                                <div className="flex items-center gap-2">
                                    <span
                                        className="w-3 h-3 rounded-full shrink-0"
                                        style={{ backgroundColor: opt.color }}
                                    />
                                    <span className="text-gray-800 dark:text-white/90">{opt.name}</span>
                                </div>
                            )}
                            className="mt-1.5"
                        />
                    </div>

                    {/* Custom color */}
                    <div>
                        <Label htmlFor="color">{t('calendar.events.customColor')}</Label>
                        <div className="flex items-center gap-3">
                            <Input
                                id="color"
                                type="color"
                                value={formData.color || '#465fff'}
                                onChange={(e) => handleChange('color', e.target.value)}
                                className="w-12! h-10! p-0! rounded! cursor-pointer border border-neutral-300 dark:border-neutral-600"
                            />
                            <Input
                                type="text"
                                value={formData.color ?? ''}
                                onChange={(e) => handleChange('color', e.target.value)}
                                placeholder="#465fff"
                                className="flex-1"
                            />
                            {formData.color && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleChange('color', '')}
                                >
                                    {t('common.clear')}
                                </Button>
                            )}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            {t('calendar.events.colorHint')}
                        </p>
                    </div>

                    {/* All day toggle */}
                    <div className="flex items-center gap-3">
                        <Checkbox
                            id="all_day"
                            checked={formData.all_day}
                            onChange={(checked) => handleChange('all_day', checked)}
                        />
                        <Label htmlFor="all_day" className="mb-0 cursor-pointer">
                            {t('calendar.allDay')}
                        </Label>
                    </div>

                    {/* Start date/time */}
                    <div>
                        <Label htmlFor="start_at">{t('calendar.events.startDate')} *</Label>
                        <Input
                            id="start_at"
                            type={formData.all_day ? 'date' : 'datetime-local'}
                            value={formData.all_day ? formData.start_at.split('T')[0] : formData.start_at}
                            onChange={(e) => {
                                const value = formData.all_day
                                    ? `${e.target.value}T00:00`
                                    : e.target.value;
                                handleChange('start_at', value);
                            }}
                            error={!!errors.start_at?.length}
                            hint={errors.start_at?.[0]}
                        />
                    </div>

                    {/* End date/time */}
                    <div>
                        <Label htmlFor="end_at">{t('calendar.events.endDate')}</Label>
                        <Input
                            id="end_at"
                            type={formData.all_day ? 'date' : 'datetime-local'}
                            value={formData.all_day ? formData.end_at?.split('T')[0] || '' : formData.end_at || ''}
                            onChange={(e) => {
                                const value = e.target.value
                                    ? formData.all_day
                                        ? `${e.target.value}T23:59`
                                        : e.target.value
                                    : '';
                                handleChange('end_at', value);
                            }}
                            error={!!errors.end_at?.length}
                            hint={errors.end_at?.[0]}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div>
                            {event && (
                                <Button
                                    type="button"
                                    variant="danger"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? t('common.deleting') : t('common.delete')}
                                </Button>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <Button type="button" variant="outline" onClick={onClose}>
                                {t('common.cancel')}
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? t('common.saving') : t('common.save')}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
