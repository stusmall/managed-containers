import { z } from "zod";

export const Color = z.enum([
  "blue",
  "turquoise",
  "green",
  "yellow",
  "orange",
  "red",
  "pink",
  "purple",
  "toolbar",
]);
export const Icon = z.enum([
  "fingerprint",
  "briefcase",
  "dollar",
  "cart",
  "vacation",
  "gift",
  "food",
  "fruit",
  "pet",
  "tree",
  "chill",
  "circle",
  "fence",
]);

export const ContainerDefinition = z.object({
  name: z.string(),
  icon: Icon,
  color: Color,
  sites: z.array(z.string()),
});
export const Policy = z.object({
  containers: z.optional(z.array(ContainerDefinition)),
  exclude: z.optional(z.array(z.string())),
});

export function containerDefinitionToContextualIdentity(
  input: z.infer<typeof ContainerDefinition>,
) {
  return {
    name: input.name,
    icon: input.icon,
    color: input.color,
  };
}
