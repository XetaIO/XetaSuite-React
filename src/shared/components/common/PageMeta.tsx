import { useEffect, type FC, type ReactNode } from "react";
import { Helmet } from "react-helmet-async";

interface PageMetaProps {
    title: string;
    description: string;
}

const PageMeta: FC<PageMetaProps> = ({ title, description }) => {
    // Ensure document title is always updated
    useEffect(() => {
        document.title = title;
    }, [title]);

    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />
        </Helmet>
    );
};

interface AppWrapperProps {
    children: ReactNode;
}

export const AppWrapper: FC<AppWrapperProps> = ({ children }) => (
    <>{children}</>
);

export default PageMeta;
