import { z } from "zod";

export const LoginFormSchema = z.object({
  email: z.email({ message: "LoginFormEmailError" })
    .min(2, { message: "LoginFormEmailMin2CharactersError", })
    .max(50, { message: "LoginFormEmailMax50CharactersError" }),
  password: z.string()
    .min(8, { message: "LoginFormPasswordMin8CharacterError", })
});

export type LoginFormType = z.infer<typeof LoginFormSchema>;


export const RegisterFormSchema = z.object({
  username: z.string()
    .min(2, { message: "LoginFormUsernameMin2CharactersError", })
    .max(50, { message: "LoginFormUsernameMax50CharactersError" }),
  email: z.email({ message: "LoginFormEmailError" })
    .min(2, { message: "LoginFormEmailMin2CharactersError", })
    .max(50, { message: "LoginFormEmailMax50CharactersError" }),
  password: z.string()
    .min(8, { message: "LoginFormPasswordMin8CharacterError", })
});

export type RegisterFormType = z.infer<typeof RegisterFormSchema>;
