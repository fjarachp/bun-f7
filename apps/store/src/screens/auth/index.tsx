import Login from "@apps/store/components/auth/login";
import Register from "@apps/store/components/auth/register";
import ContentLayout from "@apps/store/components/common/content-layout";
import { Trans } from "@lingui/react/macro";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";

const AuthScreen = () => {
  return (
    <ContentLayout>
      <div className="flex flex-col gap-4">
        <div className="mb-8 flex items-center justify-center">
          <div className="mr-3 rounded-lg bg-black p-2 text-white">
            <div className="h-6 w-6 rounded-sm bg-white" />
          </div>
          <h1 className="font-semibold text-xl">Acme Inc.</h1>
        </div>

        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle>
              <Trans>Welcome back</Trans>
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              <Trans>Login with your Apple or Google account</Trans>
            </p>
          </CardHeader>
          <CardContent>
            <Tabs className="w-full" defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">
                  <Trans>Login</Trans>
                </TabsTrigger>
                <TabsTrigger value="signup">
                  <Trans>Sign up</Trans>
                </TabsTrigger>
              </TabsList>
              <TabsContent className="mt-6" value="login">
                <Login />
              </TabsContent>
              <TabsContent className="mt-6" value="signup">
                <Register />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-muted-foreground text-sm">
          <Trans>By clicking continue, you agree to our Terms of Service and Privacy Policy.</Trans>
        </div>
      </div>
    </ContentLayout>
  );
};

export default AuthScreen;
