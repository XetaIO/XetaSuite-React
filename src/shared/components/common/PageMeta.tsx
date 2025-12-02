import type { FC, ReactNode } from "react";
import { Helmet } from "react-helmet-async";

interface PageMetaProps {
    title: string;
    description: string;
}

const PageMeta: FC<PageMetaProps> = ({ title, description }) => (
    <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
    </Helmet>
);

interface AppWrapperProps {
    children: ReactNode;
}

export const AppWrapper: FC<AppWrapperProps> = ({ children }) => (
    <>{children}</>
);

export default PageMeta;
