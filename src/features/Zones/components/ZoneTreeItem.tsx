import { type FC } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
    FaChevronRight,
    FaChevronDown,
    FaSignsPost,
    FaWrench,
    FaLayerGroup,
} from "react-icons/fa6";
import { Badge } from "@/shared/components/ui";
import { MaterialTreeItem } from "./MaterialTreeItem";
import type { ZoneTreeNode } from "../types";

export interface ZoneTreeItemProps {
    zone: ZoneTreeNode;
    level: number;
    expandedZones: Set<number>;
    onToggle: (zoneId: number) => void;
}

export const ZoneTreeItem: FC<ZoneTreeItemProps> = ({
    zone,
    level,
    expandedZones,
    onToggle,
}) => {
    const { t } = useTranslation();
    const isExpanded = expandedZones.has(zone.id);
    const hasChildren = zone.children && zone.children.length > 0;
    const hasMaterials = zone.allow_material && zone.materials && zone.materials.length > 0;
    const hasExpandableContent = hasChildren || hasMaterials;

    return (
        <div className="select-none">
            <div
                className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${level === 0 ? "bg-gray-50 dark:bg-white/5" : ""
                    }`}
                style={{ paddingLeft: `${level * 24 + 12}px` }}
            >
                {/* Expand/Collapse button */}
                <button
                    type="button"
                    onClick={() => onToggle(zone.id)}
                    className={`flex h-6 w-6 items-center justify-center rounded transition-colors ${hasExpandableContent
                        ? "text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-neutral-700 dark:hover:text-white"
                        : "invisible"
                        }`}
                    disabled={!hasExpandableContent}
                >
                    {isExpanded ? (
                        <FaChevronDown className="h-3 w-3" />
                    ) : (
                        <FaChevronRight className="h-3 w-3" />
                    )}
                </button>

                {/* Zone icon */}
                <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${zone.allow_material
                        ? "bg-success-100 text-success-600 dark:bg-success-500/20 dark:text-success-400"
                        : "bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400"
                        }`}
                >
                    <FaSignsPost className="h-4 w-4" />
                </div>

                {/* Zone name */}
                <Link
                    to={`/zones/${zone.id}`}
                    className="flex-1 font-medium text-gray-800 hover:text-brand-600 dark:text-white/90 dark:hover:text-brand-400"
                >
                    {zone.name}
                </Link>

                {/* Badges */}
                <div className="flex items-center gap-2">
                    {zone.allow_material && (
                        <Badge color="success" size="sm">
                            <FaWrench className="mr-1 h-3 w-3" />
                            {t("zones.tree.allowsMaterials")}
                        </Badge>
                    )}
                    {zone.children_count > 0 && (
                        <Badge variant="light" size="sm">
                            <FaLayerGroup className="mr-1 h-3 w-3" />
                            {zone.children_count} {t("zones.tree.subzones")}
                        </Badge>
                    )}
                    {zone.material_count > 0 && (
                        <Badge color="brand" size="sm">
                            <FaWrench className="mr-1 h-3 w-3" />
                            {zone.material_count}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Expanded content: Children zones and Materials */}
            {isExpanded && hasExpandableContent && (
                <div
                    className="border-l border-gray-200 dark:border-white/5"
                    style={{ marginLeft: `${level * 24 + 24}px` }}
                >
                    {/* Child zones first */}
                    {hasChildren &&
                        zone.children.map((child) => (
                            <ZoneTreeItem
                                key={child.id}
                                zone={child}
                                level={level + 1}
                                expandedZones={expandedZones}
                                onToggle={onToggle}
                            />
                        ))}

                    {/* Materials */}
                    {hasMaterials &&
                        zone.materials.map((material) => (
                            <MaterialTreeItem
                                key={`material-${material.id}`}
                                material={material}
                                level={level + 1}
                            />
                        ))}
                </div>
            )}
        </div>
    );
};
