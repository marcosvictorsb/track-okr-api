export interface DeleteObjectiveRequest {
  id: number;
}

export interface DeleteObjectiveResponse {
  success: boolean;
}

export interface IDeleteObjectiveController {
  deleteObjective(request: unknown, response: unknown): Promise<void>;
}
