import { type FC } from "react";
import { Link } from "react-router";
import { FaWrench } from "react-icons/fa6";
import type { ZoneTreeMaterial } from "../types";

export interface MaterialTreeItemProps {
    material: ZoneTreeMaterial;
    level: number;
}

export const MaterialTreeItem: FC<MaterialTreeItemProps> = ({ material, level }) => {
    return (
        <div
            className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
            style={{ paddingLeft: `${level * 24 + 12}px` }}
        >
            {/* Empty space for alignment */}
            <div className="h-6 w-6" />

            {/* Material icon */}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning-100 text-warning-600 dark:bg-warning-500/20 dark:text-warning-400">
                <FaWrench className="h-4 w-4" />
            </div>

            {/* Material name */}
            <Link
                to={`/materials/${material.id}`}
                className="flex-1 text-gray-700 hover:text-brand-600 dark:text-gray-300 dark:hover:text-brand-400"
            >
                {material.name}
                {material.description && (
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-500">
                        — {material.description}
                    </span>
                )}
            </Link>
        </div>
    );
};
