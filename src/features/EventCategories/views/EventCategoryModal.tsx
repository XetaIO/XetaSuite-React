import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/shared/components/ui/modal/Modal';
import Button from '@/shared/components/ui/button/Button';
import Label from '@/shared/components/form/Label';
import Input from '@/shared/components/form/input/InputField';
import { showSuccess, showError } from '@/shared/utils/toast';
import { EventCategoryManager } from '../services';
import type { EventCategory, EventCategoryFormData } from '../types';
import { Checkbox, TextArea } from '@/shared/components/form';

interface EventCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    category?: EventCategory | null;
    onSave: () => void;
}

// Default colors for quick selection
const DEFAULT_COLORS = [
    '#465fff', // Brand blue
    '#22c55e', // Success green
    '#ef4444', // Error red
    '#f97316', // Warning orange
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#14b8a6', // Teal
    '#64748b', // Slate
];

export function EventCategoryModal({ isOpen, onClose, category, onSave }: EventCategoryModalProps) {
    const { t } = useTranslation();
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    // Form state
    const [formData, setFormData] = useState<EventCategoryFormData>({
        name: '',
        color: '#465fff',
        description: '',
    });

    // Initialize form when category changes
    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name,
                color: category.color,
                description: category.description || '',
            });
        } else {
            setFormData({
                name: '',
                color: '#465fff',
                description: '',
            });
        }
        setErrors({});
    }, [category, isOpen]);

    // Handle input change
    const handleChange = useCallback((field: keyof EventCategoryFormData, value: unknown) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: [] }));
    }, []);

    // Handle save
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setErrors({});

        let result;
        if (category) {
            result = await EventCategoryManager.update(category.id, formData);
        } else {
            result = await EventCategoryManager.create(formData);
        }

        setIsSaving(false);

        if (result.success) {
            showSuccess(t(category ? 'eventCategories.updated' : 'eventCategories.created'));
            onSave();
            onClose();
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

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-lg"
        >
            <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    {category ? t('eventCategories.edit') : t('eventCategories.create')}
                </h2>

                <form onSubmit={handleSave} className="space-y-4">
                    {/* Name */}
                    <div>
                        <Label htmlFor="cat_name">{t('eventCategories.name')} *</Label>
                        <Input
                            id="cat_name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            error={!!errors.name?.length}
                            hint={errors.name?.[0]}
                        />
                    </div>

                    {/* Color picker */}
                    <div>
                        <Label htmlFor="color">{t('eventCategories.color')} *</Label>
                        <div className="space-y-3">
                            {/* Quick select colors */}
                            <div className="flex flex-wrap gap-2">
                                {DEFAULT_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => handleChange('color', color)}
                                        className={`
                                            w-8 h-8 rounded-full border-2 transition-all
                                            ${formData.color === color
                                                ? 'border-gray-900 dark:border-white scale-110'
                                                : 'border-transparent hover:scale-105'}
                                        `}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>

                            {/* Custom color input */}
                            <div className="flex items-center gap-3">
                                <Input
                                    id="color"
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => handleChange('color', e.target.value)}
                                    className="w-12! h-10! p-0! rounded! cursor-pointer border border-neutral-300 dark:border-neutral-600"
                                />
                                <Input
                                    type="text"
                                    value={formData.color}
                                    onChange={(e) => handleChange('color', e.target.value)}
                                    placeholder="#465fff"
                                    className="flex-1"
                                />
                            </div>
                        </div>
                        {errors.color?.[0] && (
                            <p className="mt-1 text-xs text-error-500">{errors.color[0]}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <Label htmlFor="description">{t('eventCategories.description')}</Label>
                        <TextArea
                            id="description"
                            placeholder={t('eventCategories.descriptionPlaceholder')}
                            value={formData.description}
                            onChange={(value) => handleChange('description', value)}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? t('common.saving') : t('common.save')}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
