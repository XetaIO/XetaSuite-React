import PageMeta from "@/shared/components/common/PageMeta";
import AuthPageLayout from "./AuthPageLayout";
import SignInForm from "./SignInForm";

export default function SignInPage() {
    return (
        <>
            <PageMeta
                title="Connexion | XetaSuite"
                description="Connectez-vous à votre compte XetaSuite"
            />
            <AuthPageLayout>
                <SignInForm />
            </AuthPageLayout>
        </>
    );
}
