import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth/useAuth";
import { LoginFormSchema, type LoginFormType } from "@/lib/types/Schemas";

export default function LoginForm() {
  const auth = useAuth();
  const [loginResponse, setLoginResponse] = useState("");

  const form = useForm<LoginFormType>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(loginData: LoginFormType) {
    const resp = await auth?.loginAction(loginData);
    if (resp) {
      setLoginResponse(resp);
    }
  };

  return (<>

    <Card>
      <CardHeader>
        <CardTitle className="font-bold text-2xl"> SIGN IN </CardTitle>
        <CardDescription>Enter your email address and password to login.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>EMAIL</FormLabel>
                  <FormControl>
                    <Input placeholder="EMAIL" {...field} className="w-[60ch]" />
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
                  <FormLabel>PASSWORD</FormLabel>
                  <FormControl>
                    <Input placeholder="Password" {...field} className="w-[60ch]" type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="text-red-300">{loginResponse}</p>
            <div className="flex justify-end">
              <Button type="submit" >LOGIN</Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="text-center justify-center">
        <p>No account? Create it. </p>
        <Link to={"/Register"}>
          <span className="underline mx-2 font-bold text-secondary-foreground"> SIGN UP</span>
        </Link>
      </CardFooter>
    </Card>

  </>);
}

