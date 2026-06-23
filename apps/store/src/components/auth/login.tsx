import { authClient } from "@apps/store/clients/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trans, useLingui } from "@lingui/react/macro";
import { Button } from "@repo/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type FormData = {
  email: string;
  password: string;
};

const Login = () => {
  const { t } = useLingui();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const formSchema = z.object({
    email: z.email(t`Please enter a valid email address`),
    password: z.string().min(8, t`Password must be at least 8 characters`),
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    const { error } = await authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: () => {
          window.location.href = "/protected";
        },
      },
    );
    if (error) {
      toast.error(error.message ?? JSON.stringify(error));
    }
  };

  return (
    <Form {...form}>
      <form className="flex flex-col gap-y-3" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans>Email</Trans>
              </FormLabel>
              <FormControl>
                <Input className="mt-1" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans>Password</Trans>
              </FormLabel>
              <FormControl>
                <div className="relative flex w-full items-center justify-end">
                  <Input
                    className="mt-1"
                    type={isPasswordVisible ? "text" : "password"}
                    {...field}
                  />
                  <Button
                    className="absolute mr-2 h-7 w-7 rounded-full"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsPasswordVisible(!isPasswordVisible);
                    }}
                    size="icon"
                    tabIndex={-1}
                    type="button"
                    variant="ghost"
                  >
                    {isPasswordVisible ? <Eye /> : <EyeOff />}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="mt-3 h-12" disabled={form.formState.isSubmitting} type="submit">
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <Trans>Logging in...</Trans>
            </>
          ) : (
            <Trans>Login</Trans>
          )}
        </Button>

        <div className="text-center text-muted-foreground text-sm">
          <Trans>Don't have an account? Sign up</Trans>
        </div>
      </form>
    </Form>
  );
};

export default Login;
