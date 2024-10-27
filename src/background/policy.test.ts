import { expect, test } from "@jest/globals";
import { Policy } from "./policy";
import { ZodError } from "zod";
test("To parse the bare minimum", () => {
  const json = {
    containers: [],
  };
  const policyResult = Policy.parse(json);
  expect(policyResult).not.toBeNull();
});

test("To fail to parse an invalid policy", () => {
  const json = {
    containers: [{}],
  };
  expect(() => Policy.parse(json)).toThrow(ZodError);
});

test("To fail to parse an unknown color", () => {
  const json = {
    containers: [
      {
        name: "soemthing",
        icon: "fruit",
        color: "madeup",
        sites: ["stuartsmall.com"],
      },
    ],
  };
  expect(() => Policy.parse(json)).not.toBeNull();
});

test("To parse a real looking config", () => {
  const json = {
    containers: [
      {
        name: "soemthing",
        icon: "fruit",
        color: "purplse",
        sites: ["stuartsmall.com"],
      },
    ],
  };
  expect(() => Policy.parse(json)).toThrow(ZodError);
});
