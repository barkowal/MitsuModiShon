import { z } from "zod";

export const LoginFormSchema = z.object({
  email: z.email({ message: "Wrong email address." })
    .min(2, { message: "Email must be at least 2 characters.", })
    .max(50, { message: "Email can't be longer than 50 characters." }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters.", })
});

export type LoginFormType = z.infer<typeof LoginFormSchema>;


export const RegisterFormSchema = z.object({
  username: z.string()
    .min(2, { message: "Username must be at least 2 characters.", })
    .max(50, { message: "Username can't be longer than 50 characters." }),
  email: z.email({ message: "Wrong email address." })
    .min(2, { message: "Email must be at least 2 characters.", })
    .max(50, { message: "Email can't be longer than 50 characters." }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters.", })
});

export type RegisterFormType = z.infer<typeof RegisterFormSchema>;
