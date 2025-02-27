
// import "reflect-metadata";
// import { container } from "tsyringe";
// import { registerDependencies } from "./container";

// console.log("Registering dependencies...");
// registerDependencies();

// console.log("Checking if IAuthController is registered...");
// try {
//   const authController = container.resolve("IAuthController");
//   console.log("IAuthController resolved successfully:", authController !== undefined);
// } catch (error) {
//   console.error("Failed to resolve IAuthController:", error.message);
// }

// console.log("All registered tokens in container:");
// const registrations = (container as any)._registry;
// for (const [token, registration] of Object.entries(registrations)) {
//   console.log(`- ${token}`);
// }