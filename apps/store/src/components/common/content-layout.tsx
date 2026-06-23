import { authClient } from "@apps/store/clients/auth-client";
import LanguageToggle from "@apps/store/components/common/language-toggle";
import { APP_NAME } from "@apps/store/constants/app";
import { useTRPC } from "@apps/store/trpc/react";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { ModeToggle } from "@repo/ui/components/mode-toggle";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { BadgeCheck, Bell, ChevronDown, CreditCard, LogIn, LogOut, Sparkles } from "lucide-react";
import { toast } from "sonner";

const ContentLayout = ({ children }: { children: React.ReactNode }) => {
  const { t } = useLingui();
  const trpc = useTRPC();
  const sessionQuery = useQuery(trpc.auth.getSession.queryOptions());

  const logout = useMutation({
    mutationFn: async () => {
      await authClient.signOut();
    },
    onSuccess: () => {
      window.location.href = "/";
    },
  });

  const handleLogout = () => {
    toast.promise(logout.mutateAsync(), {
      loading: t`Logging out...`,
      success: t`Logged out successfully`,
      error: t`Failed to log out. Please try again.`,
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col gap-4 p-2 sm:p-4">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:items-center sm:gap-4 sm:text-left">
            <div className="flex flex-col gap-1">
              <Link to="/">
                <h1 className="font-bold text-xl sm:text-2xl md:text-3xl">{APP_NAME}</h1>
              </Link>
              <p className="hidden text-muted-foreground text-sm sm:block sm:text-base">
                <Trans>Manage your tasks with TanStack Start, tRPC, PostgreSQL & React</Trans>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {sessionQuery.data?.session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="gap-2" variant="outline">
                    <Avatar className="h-5 w-5">
                      <AvatarImage
                        alt={sessionQuery.data.user.name}
                        src={sessionQuery.data.user.image || ""}
                      />
                      <AvatarFallback className="text-xs">
                        {sessionQuery.data.user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline-block">{sessionQuery.data.user.name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          alt={sessionQuery.data.user.name}
                          src={sessionQuery.data.user.image || ""}
                        />
                        <AvatarFallback>
                          {sessionQuery.data.user.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">{sessionQuery.data.user.name}</span>
                        <span className="truncate text-muted-foreground text-xs">
                          {sessionQuery.data.user.email}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link to="/todo">
                        <Sparkles className="mr-2 h-4 w-4" />
                        <Trans>Dashboard</Trans>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <BadgeCheck className="mr-2 h-4 w-4" />
                      <Trans>Account</Trans>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CreditCard className="mr-2 h-4 w-4" />
                      <Trans>Billing</Trans>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Bell className="mr-2 h-4 w-4" />
                      <Trans>Notifications</Trans>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled={logout.isPending} onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <Trans>Log out</Trans>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className="gap-2" variant="outline">
                <Link to="/auth">
                  <LogIn className="h-4 w-4" />
                  <Trans>Login</Trans>
                </Link>
              </Button>
            )}
            <LanguageToggle />
            <ModeToggle />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default ContentLayout;
