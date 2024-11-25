import { setupPolicyListener } from "./policyListener";
import { setupRequestListener } from "./requestListener";
import { ContainerRouter } from "./containerRouter";

const containerRouter = new ContainerRouter();

setupPolicyListener(containerRouter);
setupRequestListener(containerRouter);
