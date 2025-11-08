import { plainToInstance } from "class-transformer";
import { AssistanceRequestDTO } from "../dtos/assistance-request.dto";
import { IAssistanceRequestPopulated } from "../interfaces/user.interface";

export const toAssistanceRequestDTO = (
  request: IAssistanceRequestPopulated
): AssistanceRequestDTO => {
  console.log("Mapping request:", request);
  return plainToInstance(AssistanceRequestDTO, {
    ...request,
    id: request._id?.toString?.() ?? "",
    requestedDate: new Date(request.requestedDate).toISOString(),
    user:
      request.user && typeof request.user !== "string"
        ? {
            id: request.user._id?.toString?.() ?? "",
            name: request.user.name,
            email: request.user.email,
            phone: request.user.phone,
          }
        : undefined,

    volunteer:
      request.volunteer && typeof request.volunteer !== "string"
        ? {
            id: request.volunteer._id?.toString?.() ?? "",
            name: request.volunteer.name,
            email: request.volunteer.email,
            phone: request.volunteer.phone,
            profilePicture: request.volunteer.profilePicture,
          }
        : undefined,

    address:
      request.address && typeof request.address !== "string"
        ? {
            street: request.address.street ?? "",
            city: request.address.city ?? "",
            state: request.address.state ?? "",
            zipCode: request.address.zipCode ?? "",
          }
        : undefined,
  });
};

export const toAssistanceRequestListDTO = (
  requests: IAssistanceRequestPopulated[]
) => {
  return requests.map(toAssistanceRequestDTO);
};
