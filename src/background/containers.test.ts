import { expect, test } from "@jest/globals";
import { buildContainerDifference } from "./containers";
import { Policy } from "./policy";
import ContextualIdentity = browser.contextualIdentities.ContextualIdentity;

test("To find no changes on empty policies", () => {
  const policy = {
    containers: [],
  };
  const result = buildContainerDifference(policy, []);
  expect(result.toAdd).toHaveLength(0);
  expect(result.toRemove).toHaveLength(0);
  expect(result.toUpdate).toHaveLength(0);
});

test("To add one policy", () => {
  const policy = Policy.parse({
    containers: [
      {
        name: "something",
        icon: "fruit",
        color: "purple",
        sites: ["stuartsmall.com"],
      },
    ],
  });
  const result = buildContainerDifference(policy, []);
  expect(result.toAdd).toHaveLength(1);
  expect(result.toRemove).toHaveLength(0);
  expect(result.toUpdate).toHaveLength(0);
});

test("To remove one policy", () => {
  const policy = Policy.parse({
    containers: [],
  });
  const state: ContextualIdentity[] = [
    {
      name: "to-remove",
      icon: "vacation",
      iconUrl: "sdfsdfsdf",
      color: "sdfsd",
      colorCode: "dd",
      cookieStoreId: "asfadsfasfs",
    },
  ];
  const result = buildContainerDifference(policy, state);
  expect(result.toAdd).toHaveLength(0);
  expect(result.toRemove).toHaveLength(1);
  expect(result.toUpdate).toHaveLength(0);
});

test("To skip over containers managed outside this plugin", () => {
  const policy = Policy.parse({
    containers: [],
    exclude: ["something else"],
  });
  const state: ContextualIdentity[] = [
    {
      name: "something else",
      icon: "vacation",
      iconUrl: "sdfsdfsdf",
      color: "sdfsd",
      colorCode: "dd",
      cookieStoreId: "asfadsfasfs",
    },
  ];
  const result = buildContainerDifference(policy, state);
  expect(result.toAdd).toHaveLength(0);
  expect(result.toRemove).toHaveLength(0);
  expect(result.toUpdate).toHaveLength(0);
});

test("To do nothing on an unchanged policy", () => {
  const policy = Policy.parse({
    containers: [
      {
        name: "To Update",
        icon: "fruit",
        color: "purple",
        sites: ["stuartsmall.com"],
      },
    ],
  });
  const state: ContextualIdentity[] = [
    {
      name: "To Update",
      icon: "fruit",
      iconUrl: "sdfsdfsdf",
      color: "purple",
      colorCode: "dd",
      cookieStoreId: "asfadsfasfs",
    },
  ];
  const result = buildContainerDifference(policy, state);
  expect(result.toAdd).toHaveLength(0);
  expect(result.toRemove).toHaveLength(0);
  expect(result.toUpdate).toHaveLength(0);
});

test("To update a changed policy", () => {
  const policy = Policy.parse({
    containers: [
      {
        name: "To Update",
        icon: "fruit",
        color: "purple",
        sites: ["stuartsmall.com"],
      },
    ],
  });
  const state: ContextualIdentity[] = [
    {
      name: "To Update",
      icon: "chill",
      iconUrl: "sdfsdfsdf",
      color: "purple",
      colorCode: "dd",
      cookieStoreId: "asfadsfasfs",
    },
  ];
  const result = buildContainerDifference(policy, state);
  expect(result.toAdd).toHaveLength(0);
  expect(result.toRemove).toHaveLength(0);
  expect(result.toUpdate).toHaveLength(1);
});
