import PageMeta from "@/shared/components/common/PageMeta";
import AuthPageLayout from "./AuthPageLayout";
import ForgotPasswordForm from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
    return (
        <>
            <PageMeta
                title="Mot de passe oublié | XetaSuite"
                description="Réinitialisez votre mot de passe XetaSuite"
            />
            <AuthPageLayout>
                <ForgotPasswordForm />
            </AuthPageLayout>
        </>
    );
}
