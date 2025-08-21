import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { RegisterFormSchema, type RegisterFormType } from "@/lib/types/Schemas";

export default function RegisterForm() {
  const [registerResponse, setRegisterResponse] = useState("");
  const navigate = useNavigate();

  const form = useForm<RegisterFormType>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });


  const registerAction = async (data: RegisterFormType) => {
    try {
      const response = await fetch(`api/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const res = await response.json();

      if (response.ok) {
        if (res) {
          navigate("/login");
          return "";
        }
      } else {
        if (res.error) {
          return res.error;
        } else {
          return "Something went wrong.";
        }
      }

    } catch (err) {
      console.log(err);
      return "Something went wrong.";
    }
  };

  async function onSubmit(registerForm: RegisterFormType) {
    const resp = await registerAction(registerForm);
    if (resp) {
      setRegisterResponse(resp);
    }
  };



  return (<>

    <Card>
      <CardHeader>
        <CardTitle className="font-bold text-2xl"> SIGN UP </CardTitle>
        <CardDescription>Enter your information to create an account.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>USERNAME</FormLabel>
                  <FormControl>
                    <Input placeholder="USERNAME" {...field} className="w-[60ch]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
            <p className="text-red-300">{registerResponse}</p>
            <div className="flex justify-end">
              <Button type="submit" >REGISTER NOW</Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="text-center justify-center">

        <p>Already have an account?</p>
        <Link to={"/Login"}>
          <span className="underline mx-2 font-bold text-secondary-foreground"> SIGN IN</span>
        </Link>

      </CardFooter>
    </Card>

  </>);
}

