import { Observable, firstValueFrom } from "rxjs";
import { GrpcResponse, GrpcPaginatedResponse } from "../types/grpc.types";
import { getErrorMessage } from "./error.util";

export type AnyGrpcResponse<T> = GrpcResponse<T> | GrpcPaginatedResponse<T>;

export async function getGrpcResponse<T extends AnyGrpcResponse<any>>(observable: Observable<T>) {
  return firstValueFrom(observable);
}

export async function getGrpcDataOrThrow<T>(
  observable: Observable<GrpcResponse<T>>,
  fallbackMessage: string,
) {
  try {
    const result = await getGrpcResponse(observable);

    if (!result?.success) {
      throw new Error(result?.message || fallbackMessage);
    }

    return (result.data ?? null) as T;
  } catch (error) {
    throw new Error(getErrorMessage(error, fallbackMessage));
  }
}

export async function getGrpcResultOrThrow<T extends AnyGrpcResponse<any>>(
  observable: Observable<T>,
  fallbackMessage: string,
) {
  try {
    const result = await getGrpcResponse(observable);

    if (!result?.success) {
      throw new Error(result?.message || fallbackMessage);
    }

    return result;
  } catch (error) {
    throw new Error(getErrorMessage(error, fallbackMessage));
  }
}


